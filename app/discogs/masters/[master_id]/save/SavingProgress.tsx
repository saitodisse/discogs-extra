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
import { ReleaseDb } from '../../../../../types/ReleaseDb'

interface SavingProgressProps {
  master: MasterRelease
}

export function SavingProgress({ master }: SavingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [debugMessages, setDebugMessages] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const addDebugMessage = (message: string) => {
    // padding the message to ensure consistent formatting
    const minutes = new Date().getMinutes().toString().padStart(2, '0')
    const seconds = new Date().getSeconds().toString().padStart(2, '0')
    const milliseconds = new Date().getMilliseconds().toString().padStart(3, '0')
    setDebugMessages((prev) => [...prev, `${minutes}:${seconds}.${milliseconds} - ${message}`])

    // scroll to bottom of textarea after 200ms delay
    setTimeout(() => {
      const textarea = document.querySelector('textarea')
      if (textarea) {
        textarea.scrollTo({
          top: textarea.scrollHeight,
          behavior: 'smooth',
        })
      }
    }, 200)
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
      addDebugMessage(`starting save process for ${master.id}...`)
      setProgress(10)

      addDebugMessage(`[masterDb] check or create if master exists on database...`)
      // masterDb: get or create new entry
      let masterDb = await db_getReleaseByMasterId(master)
      await debug_saveJsonToTmp({
        data: masterDb,
        filename: `masterDb_${masterDb.id}.json`,
        lastPath: master.id.toString(),
      })

      addDebugMessage(`[discogs] fetching all releases from master ${master.id}...`)
      const releasesFromMaster = await discogs_getAllReleasesByMasterId(master.id)
      addDebugMessage(
        `[discogs] found ${releasesFromMaster.versions.length} releases for master ${master.id}`
      )
      setProgress(20)

      let FULL_PROGRESS = 60
      let eachReleaseProgress = 0
      if (releasesFromMaster.versions.length > 0) {
        eachReleaseProgress = FULL_PROGRESS / releasesFromMaster.versions.length
      }

      addDebugMessage(`each release will contribute ${eachReleaseProgress.toFixed(2)}% to progress`)
      for (const releaseVersionItem of releasesFromMaster.versions) {
        if (releaseVersionItem) {
          const releaseData: Release = await discogs_getReleaseById(releaseVersionItem.id)
          addDebugMessage(`[${releaseVersionItem.id}] fetched release (*)`)

          await debug_saveJsonToTmp({
            data: releaseData,
            filename: `release_${releaseVersionItem.id}.json`,
            lastPath: master.id.toString(),
          })

          // Merge release data
          addDebugMessage(`[${releaseVersionItem.id}] mergeTracksData`)
          masterDb = await mergeTracksData(masterDb, releaseData)

          // Merge extra artists
          addDebugMessage(`[${releaseVersionItem.id}] mergeExtraArtistsData`)
          masterDb = await mergeExtraArtistsData(masterDb, [releaseData])

          addDebugMessage(`[${releaseVersionItem.id}] merged release data for ${releaseData.id}`)
          setProgress((prev) => prev + eachReleaseProgress)

          // sleep for 600ms to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 600))
        }
      }
      setProgress(80)

      // Save to database
      addDebugMessage(`saving merged data to database...`)

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
        addDebugMessage(result.message || 'master saved successfully')
        addDebugMessage('all data merged and saved successfully!')
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
            className="h-64 w-[70vw] flex-1 font-mono text-muted-foreground"
            style={{ fontSize: '12px' }}
            placeholder="Debug messages will appear here..."
            readOnly
          />
        </div>
      </div>
    </div>
  )
}
