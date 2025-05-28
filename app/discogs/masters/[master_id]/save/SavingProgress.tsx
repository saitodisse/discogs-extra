'use client'

import { useState } from 'react'
import { MasterRelease, Release } from 'disconnect'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  discogs_getAllReleasesByMasterId,
  db_getReleaseByMasterId,
  debug_saveJsonToTmp,
  db_saveMasterAction,
  mergeExtraArtistsData,
  mergeTracksData,
  discogs_getReleaseById,
} from './actions'
import { v4 as uuid } from 'uuid'
import { ReleaseDb } from './ReleaseDb'

interface SavingProgressProps {
  master: MasterRelease
}

export function SavingProgress({ master }: SavingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [debugMessages, setDebugMessages] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const addDebugMessage = (message: string) => {
    setDebugMessages((prev) => [
      ...prev,
      `${new Date().getMinutes()}:${new Date().getSeconds()}.${new Date().getMilliseconds()} - ${message}`,
    ])
  }

  const handleSave = async () => {
    let releaseIdDb = uuid()

    await debug_saveJsonToTmp({
      data: master,
      filename: `master_${master.id}.json`,
      lastPath: master.id.toString(),
    })

    try {
      setIsSaving(true)
      setProgress(0)
      setDebugMessages([])

      // Initialize
      addDebugMessage('Starting save process...')
      setProgress(10)

      addDebugMessage(`[masterDb] Check or Create if master exists on database...`)
      // masterDb: get or create new entry
      let masterDb = await db_getReleaseByMasterId(master)
      await debug_saveJsonToTmp({
        data: masterDb,
        filename: `masterDb_${masterDb.id}.json`,
        lastPath: master.id.toString(),
      })

      addDebugMessage('Fetching all releases from master...')
      const releasesFromMaster = await discogs_getAllReleasesByMasterId(master.id)

      setProgress(20)

      let FULL_PROGRESS = 60
      let eachReleaseProgress = 0
      if (releasesFromMaster.versions.length > 0) {
        eachReleaseProgress = FULL_PROGRESS / releasesFromMaster.versions.length
      }

      for (const releaseVersionItem of releasesFromMaster.versions) {
        if (releaseVersionItem) {
          addDebugMessage(`Processing release ${releaseVersionItem.id}...`)
          const releaseData: Release = await discogs_getReleaseById(releaseVersionItem.id)
          addDebugMessage(`Fetched release data for ${releaseVersionItem.id}`)

          await debug_saveJsonToTmp({
            data: releaseData,
            filename: `release_${releaseVersionItem.id}.json`,
            lastPath: master.id.toString(),
          })

          addDebugMessage(`Found release data for ${releaseData.id}, starting merge process...`)

          // Merge release data
          addDebugMessage('Merging release data...')
          masterDb = await mergeTracksData(masterDb, releaseData)

          // Merge extra artists
          addDebugMessage('Merging extra artists data...')
          masterDb = await mergeExtraArtistsData(masterDb, [releaseData])

          addDebugMessage(`Merged release data for ${releaseData.id}`)
          setProgress((prev) => prev + eachReleaseProgress)

          // sleep for 600ms to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 600))
        }
      }
      setProgress(80)

      // Save to database
      addDebugMessage('\nSaving merged data to database...')

      await debug_saveJsonToTmp({
        data: masterDb,
        filename: `merged_${releaseIdDb}.json`,
        lastPath: master.id.toString(),
      })

      const result = await db_saveMasterAction({ releaseIdDb, master: masterDb })
      setProgress(90)

      // Complete
      if (result.error) {
        addDebugMessage(`Error: ${result.error}`)
      } else {
        addDebugMessage(result.message || 'Master saved successfully')
        addDebugMessage('All data merged and saved successfully!')
      }
      setProgress(100)
    } catch (error) {
      addDebugMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-1">
        <div className="grid gap-6 p-6 md:grid-cols-[100px_1fr]">
          {/* Album Cover */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {master.images && master.images[0] ? (
              <img
                src={master.images[0].uri}
                alt={master.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
        </div>

        <h1 className="mb-2 mt-6 text-lg">
          <span className="font-thin">Master: </span>
          <span className="mr-6 font-mono font-thin">{master?.id}</span>
          <span className="font-semibold">
            {master?.artists?.[0]?.name} - {master?.title}
          </span>
        </h1>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <Progress value={progress} className="w-full" />

        <div className="flex gap-4">
          <Button className="w-32" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Master'}
          </Button>

          <Textarea
            value={debugMessages.join('\n')}
            className="h-64 w-[70vw] flex-1 font-mono text-[10px]"
            readOnly
          />
        </div>
      </div>
    </div>
  )
}
