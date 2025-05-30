'use client'

import { useQueryState, parseAsInteger } from 'nuqs'
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
import type { MasterVersionsResponse } from 'disconnect'
import type { BadgeProps } from '@/components/ui/badge' // Assuming BadgeProps are available or define variants manually

// Define a more specific type for the master object
interface MasterInfo {
  title: string
  // Add other properties of master if known and used
}

// Alias for the release version type for brevity
type ReleaseVersion = MasterVersionsResponse['versions'][0]

interface ReleasesClientProps {
  masterId: string
  master: MasterInfo
  releases?: MasterVersionsResponse
  error?: string | null
  initialView?: 'list' | 'grid'
  initialPage?: number
}

// Remove duplicate implementation and export only once
// Remove all duplicate/old code and keep only the correct implementation below

// --- Helper Components ---

const NoImagePlaceholder = ({ className }: { className?: string }) => (
  <div
    className={className || 'flex h-full w-full items-center justify-center text-muted-foreground'}
  >
    No Image
  </div>
)

type LabelElementType = string | { name: string; [key: string]: any }

interface DisplayLabelsProps {
  labelValue?: LabelElementType[]
  className?: string
  badgeVariant?: BadgeProps['variant']
}

const DisplayLabels: React.FC<DisplayLabelsProps> = ({
  labelValue,
  className = 'mb-1 flex flex-wrap gap-1',
  badgeVariant = 'outline',
}) => {
  if (!labelValue || !Array.isArray(labelValue) || labelValue.length === 0) {
    return <>-</>
  }

  const labelNames = labelValue
    .map((label) => (typeof label === 'string' ? label : label?.name))
    .filter((name): name is string => Boolean(name))

  if (labelNames.length === 0) {
    return <>-</>
  }

  return (
    <div className={className}>
      {labelNames.map((name, index) => (
        <Badge key={index} variant={badgeVariant}>
          {name}
        </Badge>
      ))}
    </div>
  )
}

interface DisplayFormatsProps {
  formatValue?: string | string[]
  className?: string
  badgeVariant?: BadgeProps['variant']
}

const DisplayFormats: React.FC<DisplayFormatsProps> = ({
  formatValue,
  className = 'flex flex-wrap gap-1',
  badgeVariant = 'secondary',
}) => {
  if (!formatValue) return <>-</>

  let formatsArray: string[]
  if (Array.isArray(formatValue)) {
    formatsArray = formatValue.map((f) => f.trim()).filter((f) => f)
  } else {
    formatsArray = formatValue
      .split(/,\s*/)
      .map((f) => f.trim())
      .filter((f) => f)
  }

  if (formatsArray.length === 0) return <>-</>

  return (
    <div className={className}>
      {formatsArray.map((format, index) => (
        <Badge key={index} variant={badgeVariant}>
          {format}
        </Badge>
      ))}
    </div>
  )
}

interface ReleaseGridItemProps {
  release: ReleaseVersion
}

const ReleaseGridItem: React.FC<ReleaseGridItemProps> = ({ release }) => (
  <Card key={release.id} className="flex flex-col items-center p-4">
    {release.thumb && release.thumb.length > 0 ? (
      <div className="mb-2 aspect-square w-full overflow-hidden rounded-md bg-muted">
        <Image
          src={release.thumb}
          alt={release.title}
          width={96}
          height={96}
          className="mb-2 rounded-md object-cover" // mb-2 here might be redundant if parent has it
        />
      </div>
    ) : (
      <div className="mb-2 aspect-square w-full overflow-hidden rounded-md bg-muted">
        <NoImagePlaceholder />
      </div>
    )}
    <div className="mb-1 text-center font-semibold">
      <Link href={`/discogs/releases/${release.id}`} className="text-blue-600 hover:underline">
        {release.title}
      </Link>
    </div>
    <div className="mb-1 text-xs text-gray-500">{release.released || '-'}</div>
    <div className="mb-1 text-xs text-gray-500">{release.country || '-'}</div>
    <DisplayLabels labelValue={Array.isArray(release.label) ? release.label : [release.label]} />
    <div className="mb-1 text-xs">{release.catno || '-'}</div>
    <DisplayFormats formatValue={release.format} />
  </Card>
)

interface ReleaseListItemProps {
  release: ReleaseVersion
}

const ReleaseListItem: React.FC<ReleaseListItemProps> = ({ release }) => (
  <TableRow key={release.id}>
    <TableCell className="w-[100px]">
      {release.thumb && release.thumb.length > 0 ? (
        <Image
          src={release.thumb}
          alt={release.title}
          width={64}
          height={64}
          className="rounded-md object-cover"
        />
      ) : (
        <div className="flex h-[64px] w-[64px] items-center justify-center rounded-md bg-muted text-muted-foreground">
          <NoImagePlaceholder />
        </div>
      )}
    </TableCell>
    <TableCell>
      <Link href={`/discogs/releases/${release.id}`} className="text-blue-600 hover:underline">
        {release.title}
      </Link>
    </TableCell>
    <TableCell>{release.released || '-'}</TableCell>
    <TableCell>{release.country || '-'}</TableCell>
    <TableCell>
      <DisplayLabels labelValue={Array.isArray(release.label) ? release.label : [release.label]} />
    </TableCell>
    <TableCell>{release.catno || '-'}</TableCell>
    <TableCell>
      <DisplayFormats formatValue={release.format} className="flex flex-wrap gap-2" />
    </TableCell>
  </TableRow>
)

// --- Main Component ---

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
    <div className="container mx-auto pt-4">
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
        <div className="grid grid-cols-4 gap-6 sm:grid-cols-6 md:grid-cols-6">
          {releases.versions.map((release: ReleaseVersion) => (
            <ReleaseGridItem key={release.id} release={release} />
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
              {releases.versions.map((release: ReleaseVersion) => (
                <ReleaseListItem key={release.id} release={release} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
