'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { MasterRelease, Release } from 'disconnect'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { mergeExtraArtistsData, mergeTracksData } from '@/lib/merge-utils'
import { useCallback } from 'react'

interface BatchSavingMasterPageClientProps {
  initialMasterIds: string[]
}

export function BatchSavingMasterPageClient({
  initialMasterIds,
}: BatchSavingMasterPageClientProps) {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [debugMessages, setDebugMessages] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentMasterId, setCurrentMasterId] = useState<string | null>(null)

  const addDebugMessage = useCallback((message: string) => {
    const minutes = new Date().getMinutes().toString().padStart(2, '0')
    const seconds = new Date().getSeconds().toString().padStart(2, '0')
    const milliseconds = new Date().getMilliseconds().toString().padStart(3, '0')
    setDebugMessages((prev) => [...prev, `${minutes}:${seconds}.${milliseconds} - ${message}`])

    setTimeout(() => {
      const textarea = document.querySelector('textarea')
      if (textarea) {
        textarea.scrollTo({
          top: textarea.scrollHeight,
          behavior: 'smooth',
        })
      }
    }, 100)
  }, [])

  const processMaster = async (masterId: string) => {
    try {
      setCurrentMasterId(masterId)
      addDebugMessage(`[${masterId}] Starting process...`)

      // Fetch master data from discogs
      const masterResponse = await fetch(`/api/discogs/getMasterById?masterId=${masterId}`)
      if (!masterResponse.ok) throw new Error('Failed to fetch master')
      const master: MasterRelease = await masterResponse.json()
      addDebugMessage(`[${masterId}] Master data fetched from Discogs`)

      // Check if master exists in database
      const responseDb = await fetch('/api/db/getReleaseByMasterId', {
        method: 'POST',
        body: JSON.stringify({ master }),
      })
      const { data: initialMasterDb, is_first_save } = await responseDb.json()

      let masterDb = initialMasterDb
      if (!masterDb) {
        addDebugMessage(`[${masterId}] Not found in database, creating new entry...`)
        const saveResponse = await fetch('/api/db/saveMasterAction', {
          method: 'POST',
          body: JSON.stringify({ master, is_first_save }),
        })
        const saveResult = await saveResponse.json()
        if (!saveResponse.ok) throw new Error(saveResult.error)
      } else {
        addDebugMessage(`[${masterId}] Found in database, updating...`)
      }

      // Fetch all releases
      addDebugMessage(`[${masterId}] Fetching all releases...`)
      const releasesResponse = await fetch(
        `/api/discogs/getAllReleasesByMasterId?masterId=${masterId}`
      )
      if (!releasesResponse.ok) throw new Error('Failed to fetch releases')
      const releasesFromMaster = await releasesResponse.json()
      addDebugMessage(`[${masterId}] Found ${releasesFromMaster.versions.length} releases`)

      // Process each release
      for (const releaseVersionItem of releasesFromMaster.versions) {
        if (releaseVersionItem) {
          const releaseResponse = await fetch(
            `/api/discogs/getReleaseById?releaseId=${releaseVersionItem.id}`
          )
          if (!releaseResponse.ok) throw new Error('Failed to fetch release')
          const releaseData: Release = await releaseResponse.json()
          addDebugMessage(`[${masterId}][${releaseVersionItem.id}] Release fetched`)

          // Merge data
          const mergedTracks = await mergeTracksData(masterDb, releaseData)
          masterDb = { ...masterDb, ...mergedTracks }

          const mergedArtists = await mergeExtraArtistsData(masterDb, [releaseData])
          masterDb = { ...masterDb, ...mergedArtists }

          addDebugMessage(`[${masterId}][${releaseVersionItem.id}] Data merged`)

          // Rate limiting delay
          await new Promise((resolve) => setTimeout(resolve, 450))
        }
      }

      // Save final merged data
      addDebugMessage(`[${masterId}] Saving merged data...`)
      const resultResponse = await fetch('/api/db/saveMasterAction', {
        method: 'POST',
        body: JSON.stringify({ master: masterDb, is_first_save: false }),
      })
      if (!resultResponse.ok) {
        const error = await resultResponse.json()
        throw new Error(error.message)
      }

      addDebugMessage(`[${masterId}] Saved successfully!`)
      return true
    } catch (error) {
      addDebugMessage(
        `[${masterId}] Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      )
      return false
    }
  }

  const handleStartBatch = async () => {
    if (isRunning) return
    setIsRunning(true)
    setProgress(0)
    setDebugMessages([])

    const totalMasters = initialMasterIds.length
    let completedCount = 0

    for (const masterId of initialMasterIds) {
      const success = await processMaster(masterId)
      completedCount += 1
      setProgress((completedCount / totalMasters) * 100)
    }

    setIsRunning(false)
    setCurrentMasterId(null)
    addDebugMessage('Batch processing completed!')
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-bold">Batch Saving Masters</h1>
        <div className="text-sm text-muted-foreground">
          {initialMasterIds.length} masters selected for processing
        </div>
        {currentMasterId && (
          <div className="mt-2 text-sm">Currently processing: Master {currentMasterId}</div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Progress value={progress} className="w-full" />

        <div className="flex space-x-4">
          <Button onClick={handleStartBatch} disabled={isRunning || initialMasterIds.length === 0}>
            {isRunning ? 'Processing...' : 'Start Batch Processing'}
          </Button>
        </div>

        <Textarea
          value={debugMessages.join('\n')}
          rows={10}
          className="h-[600px] w-[70vw] flex-1 font-mono text-muted-foreground"
          style={{ fontSize: '12px' }}
          placeholder="Processing logs will appear here..."
          readOnly
        />
      </div>
    </div>
  )
}
