'use client'

import { useState } from 'react'
import { MasterRelease, Release } from 'disconnect'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  discogs_getAllReleasesByMasterId,
  getReleaseByMasterId,
  saveJsonToTmp,
  saveMasterAction,
} from './actions'
import { v4 as uuid } from 'uuid'

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

    try {
      setIsSaving(true)
      setProgress(0)
      setDebugMessages([])

      // Initialize
      addDebugMessage('Starting save process...')

      console.log('DEBUG: Master Release:', master)

      setProgress(20)

      addDebugMessage(`Check if master exists on database...`)
      const masterDb = await getReleaseByMasterId(master.id)
      if (masterDb) {
        console.log('DEBUG: masterDb:', masterDb)
        // will update the existing master
        addDebugMessage(`Master with ID ${master.id} already exists in the database.`)
        releaseIdDb = masterDb.id // Use existing ID (uuid) from the database
      }
      setProgress(40)
      setProgress(60) // Get all releases from master
      addDebugMessage('Fetching all releases from master...')
      const releasesFromMaster = await discogs_getAllReleasesByMasterId(master.id)

      console.log('DEBUG: releasesFromMaster:', releasesFromMaster)

      for (const releaseVersionItem of releasesFromMaster.versions) {
        if (releaseVersionItem) {
          console.log('DEBUG: releaseVersionItem:', releaseVersionItem)

          // get json from resource_url
          addDebugMessage(`Processing release ${releaseVersionItem.id}...`)
          const releaseData: Release = await fetch(releaseVersionItem.resource_url).then((res) =>
            res.json()
          )

          console.log('DEBUG: releaseData:', releaseData)
          addDebugMessage(`Fetched release data for ${releaseVersionItem.id}`)

          // save to C:\Users\saito\_git\discogs-extra\app\discogs\masters\[master_id]\save\tmp
          await saveJsonToTmp({
            data: releaseData,
            filename: `release_${releaseVersionItem.id}.json`,
          })

          // Merge data
          // addDebugMessage(`Found existing release data for master ${master.id}`)
          // addDebugMessage('Starting data merge process...')

          // // Log merge details
          // if (release.tracklist_json) {
          //   addDebugMessage(
          //     `Merging ${master.tracklist.length} tracks with ${release.tracklist_json.length} existing tracks...`
          //   )
          // }
          // if (release.images_json) {
          //   addDebugMessage(
          //     `Merging ${master.images?.length || 0} images with ${release.images_json.length} existing images...`
          //   )
          // }
          // if (release.videos_json) {
          //   addDebugMessage(
          //     `Merging ${master.videos?.length || 0} videos with ${release.videos_json.length} existing videos...`
          //   )
          // }
        }
      }
      setProgress(70)

      // Save to database
      addDebugMessage('Saving merged data to database...')
      const result = await saveMasterAction({ releaseIdDb, master })
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
            className="h-64 flex-1 font-mono text-xs"
            readOnly
          />
        </div>
      </div>
    </div>
  )
}
