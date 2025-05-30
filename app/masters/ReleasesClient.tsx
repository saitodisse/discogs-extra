'use client'

import { useQueryState } from 'nuqs'
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
import Link from 'next/link'
import Image from 'next/image'
import type { ReleaseDb } from '@/types/ReleaseDb'

const NoImagePlaceholder = () => (
  <div className="flex h-[100px] w-[100px] items-center justify-center rounded bg-muted text-muted-foreground">
    No Image
  </div>
)

const DisplayGenres = ({ genres, styles }: { genres?: string[]; styles?: string[] }) => {
  const allTags = [...(genres || []), ...(styles || [])]
  if (!allTags.length) return null

  return (
    <div className="flex flex-wrap gap-1">
      {allTags.map((tag, index) => (
        <Badge key={index} variant="outline">
          {tag}
        </Badge>
      ))}
    </div>
  )
}

const DisplayFormats = ({ formats }: { formats: any[] }) => {
  if (!formats?.length) return null

  return (
    <div className="flex flex-wrap gap-1">
      {formats.map((format, index) => (
        <Badge key={index} variant="secondary">
          {format.name} {format.qty && `(${format.qty})`}
        </Badge>
      ))}
    </div>
  )
}

interface ReleaseCardProps {
  release: ReleaseDb
}

const ReleaseCard = ({ release }: ReleaseCardProps) => {
  const thumbnail = release.images_json?.[0]?.uri

  return (
    <Card className="flex flex-col space-y-3 p-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={release.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <NoImagePlaceholder />
        )}
      </div>

      <div className="space-y-2">
        <div className="text-lg font-semibold">
          <Link href={`/masters/${release.id}`} className="hover:text-primary">
            {release.title}
          </Link>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <div>Artists: {release.artists_name.join(', ')}</div>
          <div>Year: {release.year_of_release || '-'}</div>
          <div>Country: {release.country || '-'}</div>
        </div>

        {release.formats_json && <DisplayFormats formats={release.formats_json} />}

        <DisplayGenres genres={release.genres} styles={release.styles} />
      </div>
    </Card>
  )
}

interface ReleaseListItemProps {
  release: ReleaseDb
}

const ReleaseListItem = ({ release }: ReleaseListItemProps) => {
  const thumbnail = release.images_json?.[0]?.uri

  return (
    <TableRow>
      <TableCell className="w-[100px]">
        {thumbnail ? (
          <Link href={`/masters/${release.master_id}`} className="hover:text-primary">
            <Image
              src={thumbnail}
              alt={release.title}
              width={64}
              height={64}
              className="rounded-md object-cover"
            />
          </Link>
        ) : (
          <NoImagePlaceholder />
        )}
      </TableCell>
      <TableCell>
        <Link href={`/masters/${release.master_id}`} className="hover:text-primary">
          {release.title}
        </Link>
        <div className="text-sm text-muted-foreground">{release.artists_name.join(', ')}</div>
      </TableCell>
      <TableCell>{release.year_of_release || '-'}</TableCell>
      <TableCell>{release.country || '-'}</TableCell>
      <TableCell>
        {release.formats_json && <DisplayFormats formats={release.formats_json} />}
      </TableCell>
      <TableCell>
        <DisplayGenres genres={release.genres} styles={release.styles} />
      </TableCell>
    </TableRow>
  )
}

interface ReleasesClientProps {
  releases: ReleaseDb[]
  initialView?: 'list' | 'grid'
}

export function ReleasesClient({ releases, initialView = 'list' }: ReleasesClientProps) {
  const [view, setView] = useQueryState('view', { defaultValue: initialView })

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Releases</h1>
        <Toggle
          aria-label="Toggle view"
          pressed={view === 'grid'}
          onPressedChange={(pressed) => setView(pressed ? 'grid' : 'list')}
        >
          {view === 'grid' ? <ListIcon className="h-4 w-4" /> : <GridIcon className="h-4 w-4" />}
        </Toggle>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {releases.map((release) => (
            <ReleaseCard key={release.id} release={release} />
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Formats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.map((release) => (
                <ReleaseListItem key={release.id} release={release} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
