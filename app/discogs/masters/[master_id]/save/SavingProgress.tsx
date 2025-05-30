'use client'

import { useState } from 'react'
import { MasterRelease, Release } from 'disconnect'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { mergeExtraArtistsData, mergeTracksData } from '@/lib/merge-utils'
import { v4 as uuid } from 'uuid'
import { debug_saveJsonToTmp } from './actions'

interface SavingProgressProps {
  master: MasterRelease
}

export function SavingProgress({ master }: SavingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [debugMessages, setDebugMessages] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

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
      filename: `master_${master?.id}.json`,
      lastPath: master.id.toString(),
    })

    try {
      setIsRunning(true)
      setProgress(0)
      setDebugMessages([])

      // Initialize
      addDebugMessage(`starting save process for ${master.id}...`)
      setProgress(10)

      addDebugMessage(`[masterDb] check or create if master exists on database...`)
      // masterDb: get or create new entry
      const responseDb = await fetch('/api/db/getReleaseByMasterId', {
        method: 'POST',
        body: JSON.stringify({ master }),
      })
      const { data: initialMasterDb, is_first_save } = await responseDb.json()

      let masterDb = initialMasterDb
      if (!masterDb) {
        addDebugMessage(`Master with ID: ${master.id} not found in database, creating new entry...`)
        const saveResponse = await fetch('/api/db/saveMasterAction', {
          method: 'POST',
          body: JSON.stringify({ master: masterDb, is_first_save }),
        })
        const saveResult = await saveResponse.json()
        if (!saveResponse.ok) throw new Error(saveResult.error)
        setProgress(15)
      } else {
        await debug_saveJsonToTmp({
          data: masterDb,
          filename: `masterDb_${masterDb?.id}.json`,
          lastPath: master.id.toString(),
        })
        addDebugMessage(`Master with ID: ${master.id} found in database, updating...`)
      }

      addDebugMessage(`[discogs] fetching all releases from master ${master.id}...`)
      const releasesResponse = await fetch(
        `/api/discogs/getAllReleasesByMasterId?masterId=${master.id}`
      )
      if (!releasesResponse.ok) throw new Error('Failed to fetch releases')
      const releasesFromMaster = await releasesResponse.json()
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
          const releaseResponse = await fetch(
            `/api/discogs/getReleaseById?releaseId=${releaseVersionItem.id}`
          )
          if (!releaseResponse.ok) throw new Error('Failed to fetch release')
          const releaseData: Release = await releaseResponse.json()
          addDebugMessage(`[${releaseVersionItem.id}] fetched release (*)`)

          await debug_saveJsonToTmp({
            data: releaseData,
            filename: `release_${releaseVersionItem.id}.json`,
            lastPath: master.id.toString(),
          })

          // Merge release data
          addDebugMessage(`[${releaseVersionItem.id}] mergeTracksData`)
          const mergedTracks = await mergeTracksData(masterDb, releaseData)
          masterDb = { ...masterDb, ...mergedTracks }

          // Merge extra artists
          addDebugMessage(`[${releaseVersionItem.id}] mergeExtraArtistsData`)
          const mergedArtists = await mergeExtraArtistsData(masterDb, [releaseData])
          masterDb = { ...masterDb, ...mergedArtists }

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

      const resultResponse = await fetch('/api/db/saveMasterAction', {
        method: 'POST',
        body: JSON.stringify({ master: masterDb, is_first_save: false }),
      })
      if (!resultResponse.ok) {
        const error = await resultResponse.json()
        throw new Error(error.message)
      }
      const result = await resultResponse.json()
      setProgress(90)

      // Complete
      if (result.error) {
        console.error(result.error)
        addDebugMessage(`[db_saveMasterAction] Error: ${result.error}`)
      } else {
        addDebugMessage(result.message || 'master saved successfully')
        addDebugMessage('all data merged and saved successfully!')
      }
      setProgress(100)
    } catch (error) {
      console.error(error)
      addDebugMessage(
        `[general] Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      )
    } finally {
      setIsRunning(false)
    }
  }

  const handleDelete = async () => {
    if (!master.id) {
      addDebugMessage('No master ID provided for deletion.')
      return
    }

    setIsRunning(true)
    setProgress(0)
    setDebugMessages([])

    try {
      addDebugMessage(`Deleting master with ID: ${master.id}...`)

      addDebugMessage(`Getting master with ID: ${master.id}...`)
      const masterResponse = await fetch('/api/db/getReleaseByMasterId', {
        method: 'POST',
        body: JSON.stringify({ master }),
      })
      const { data: masterDb } = await masterResponse.json()
      if (!masterDb) {
        addDebugMessage(`Master with ID: ${master.id} not found in database.`)
        return
      }

      const deleteResponse = await fetch(`/api/db/deleteReleaseById?releaseId=${masterDb.id}`, {
        method: 'DELETE',
      })
      if (!deleteResponse.ok) {
        const error = await deleteResponse.json()
        throw new Error(error.message)
      }
      setProgress(50)

      addDebugMessage(`Master with ID: ${masterDb.id} deleted successfully.`)
      setProgress(100)
    } catch (error) {
      addDebugMessage(
        `Error deleting master: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-1">
        <div className="grid gap-6 md:grid-cols-[150px_1fr]">
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

        <div className="mb-2 mt-6 flex flex-col text-lg">
          <span className="font-thin">Master: {master?.id}</span>
          <span className="mr-6 font-mono font-thin"></span>
          <span className="font-semibold">
            {master?.artists?.[0]?.name} - {master?.title}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <Progress value={progress} className="w-full" />

        <div className="flex flex-col gap-4">
          <div className="flex space-x-4">
            <Button className="w-32" onClick={handleSave} disabled={isRunning}>
              {isRunning ? '...' : 'Save Master'}
            </Button>

            <Button className="w-32" onClick={handleDelete} disabled={isRunning}>
              {isRunning ? '...' : 'Delete Master'}
            </Button>
          </div>

          <Textarea
            value={debugMessages.join('\n')}
            rows={10}
            className="h-[600px] w-[70vw] flex-1 font-mono text-muted-foreground"
            style={{ fontSize: '12px', height: '400px' }}
            placeholder="Debug messages will appear here..."
            readOnly
          />
        </div>
      </div>
    </div>
  )
}
