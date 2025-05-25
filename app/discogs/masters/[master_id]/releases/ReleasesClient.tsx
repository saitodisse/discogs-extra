'use client'

import { useQueryState, parseAsInteger } from 'nuqs'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { GridIcon, ListIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { MasterVersionsResponse } from 'disconnect'

interface DiscogsVersion {
  id: number
  title: string
  major_formats: string[]
  format: string[]
  label: string[] | Array<{ name: string }>
  released: string
  status: string
  thumb: string
  country: string
  year?: number
  catno?: string
}

interface DiscogsResponse {
  pagination: {
    page: number
    pages: number
    items: number
    per_page: number
  }
  versions: DiscogsVersion[]
}

interface ReleasesClientProps {
  masterId: string
  master: any
  releases?: MasterVersionsResponse
  error?: string | null
  initialView?: 'list' | 'grid'
  initialPage?: number
}

// Remove duplicate implementation and export only once

// Remove all duplicate/old code and keep only the correct implementation below

export function ReleasesClient({
  masterId,
  master,
  releases,
  error,
  initialView = 'list',
  initialPage = 1,
}: ReleasesClientProps) {
  const [view, setView] = useQueryState('view', { defaultValue: initialView })
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(initialPage))

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Error</h1>
        <p>{error}</p>
        <Link
          href={masterId ? `/discogs/masters/${masterId}` : '#'}
          className="text-blue-600 hover:underline"
        >
          Back to Master
        </Link>
      </div>
    )
  }

  if (!master || !releases) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{master.title} - Releases</h1>
          <Link href={`/discogs/masters/${masterId}`} className="text-blue-600 hover:underline">
            ← Back to Master
          </Link>
        </div>
        <Toggle
          aria-label="Toggle view"
          pressed={view === 'grid'}
          onPressedChange={(pressed) => setView(pressed ? 'grid' : 'list')}
        >
          {view === 'grid' ? <ListIcon className="h-4 w-4" /> : <GridIcon className="h-4 w-4" />}
        </Toggle>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {releases.versions.map((release: MasterVersionsResponse['versions'][0]) => (
            <Card key={release.id} className="flex flex-col items-center p-4">
              {release.thumb ? (
                <div className="mb-2 aspect-square w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src={release.thumb}
                    alt={release.title}
                    width={96}
                    height={96}
                    className="mb-2 rounded-md object-cover"
                  />
                </div>
              ) : (
                <div className="mb-2 aspect-square w-full overflow-hidden rounded-md bg-muted">
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                </div>
              )}
              <div className="mb-1 text-center font-semibold">
                <Link
                  href={`/discogs/releases/${release.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {release.title}
                </Link>
              </div>
              <div className="mb-1 text-xs text-gray-500">{release.released || '-'}</div>
              <div className="mb-1 text-xs text-gray-500">{release.country || '-'}</div>
              <div className="mb-1 flex flex-wrap gap-1">
                {release.label && Array.isArray(release.label)
                  ? release.label.map((label: any, index: number) => (
                      <Badge key={index} variant="outline">
                        {typeof label === 'string' ? label : label.name || ''}
                      </Badge>
                    ))
                  : '-'}
              </div>
              <div className="mb-1 text-xs">{release.catno || '-'}</div>
              <div className="flex flex-wrap gap-1">
                {release.format
                  ? (Array.isArray(release.format) ? release.format : [release.format]).map(
                      (format: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {format}
                        </Badge>
                      )
                    )
                  : '-'}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>img</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Catalog #</TableHead>
                <TableHead>Format</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.versions.map((release: MasterVersionsResponse['versions'][0]) => (
                <TableRow key={release.id}>
                  <TableCell className="w-[100px]">
                    <Image
                      src={release.thumb}
                      alt={release.title}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/discogs/releases/${release.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {release.title}
                    </Link>
                  </TableCell>
                  <TableCell>{release.released || '-'}</TableCell>
                  <TableCell>{release.country || '-'}</TableCell>
                  <TableCell>
                    {release.label ? (
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(release.label) &&
                          release.label.map((label: any, index: number) => (
                            <Badge key={index} variant="outline">
                              {typeof label === 'string' ? label : label.name || ''}
                            </Badge>
                          ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{release.catno || '-'}</TableCell>
                  <TableCell>
                    {release.format ? (
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(release.format) ? release.format : [release.format]).map(
                          (format: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {format}
                            </Badge>
                          )
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
