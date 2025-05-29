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
import {
  DatabaseSearchResponse,
  DatabaseSearchMasterItem,
  DatabaseSearchReleaseItem,
  DatabaseSearchArtistItem,
} from 'disconnect'

// Helper Components
const NoImagePlaceholder = ({ className }: { className?: string }) => (
  <div
    className={className || 'flex h-full w-full items-center justify-center text-muted-foreground'}
  >
    No Image
  </div>
)

// Grid Items
const MasterGridItem = ({ result }: { result: DatabaseSearchMasterItem }) => (
  <Card className="flex flex-col space-y-3 p-4">
    <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
      {result.thumb ? (
        <Image
          src={result.thumb}
          alt={result.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <NoImagePlaceholder />
      )}
    </div>

    <div className="space-y-2">
      <div className="text-sm">
        {/* show title max two lines */}
        <Link
          href={`/discogs/masters/${result.id}`}
          className="line-clamp-3 hover:text-primary *:hover:underline"
        >
          {result.title}
        </Link>
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        {result.year ? (
          <div className="flex items-center space-x-1">
            <Badge>{result.year}</Badge>
          </div>
        ) : null}
      </div>
    </div>
  </Card>
)

const ReleaseGridItem = ({ result }: { result: DatabaseSearchReleaseItem }) => (
  <Card className="flex flex-col space-y-3 p-4">
    <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
      {result.thumb ? (
        <Image
          src={result.thumb}
          alt={result.title}
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
        <Link href={`/discogs/releases/${result.id}`} className="hover:text-primary">
          {result.title}
        </Link>
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        <div>Year: {result.year || '-'}</div>
        <div>Format: {result.format?.join(', ') || '-'}</div>
        <div>Country: {result.country || '-'}</div>
      </div>
    </div>
  </Card>
)

// List Items
const MasterListItem = ({ result }: { result: DatabaseSearchMasterItem }) => (
  <TableRow>
    <TableCell className="w-[100px]">
      {result.thumb ? (
        <Image
          src={result.thumb}
          alt={result.title}
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
      <Link href={`/discogs/masters/${result.id}`} className="text-blue-600 hover:underline">
        {result.title}
      </Link>
    </TableCell>
    <TableCell>{result.year || '-'}</TableCell>
    <TableCell>
      {result.genre?.map((g, i) => (
        <Badge key={i} variant="outline" className="mr-1">
          {g}
        </Badge>
      ))}
    </TableCell>
    <TableCell>
      {result.style?.map((s, i) => (
        <Badge key={i} variant="secondary" className="mr-1">
          {s}
        </Badge>
      ))}
    </TableCell>
  </TableRow>
)

const ReleaseListItem = ({ result }: { result: DatabaseSearchReleaseItem }) => (
  <TableRow>
    <TableCell className="w-[100px]">
      {result.thumb ? (
        <Image
          src={result.thumb}
          alt={result.title}
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
      <Link href={`/discogs/releases/${result.id}`} className="text-blue-600 hover:underline">
        {result.title}
      </Link>
    </TableCell>
    <TableCell>{result.year || '-'}</TableCell>
    <TableCell>{result.country || '-'}</TableCell>
    <TableCell>
      {result.format?.map((f, i) => (
        <Badge key={i} variant="secondary" className="mr-1">
          {f}
        </Badge>
      ))}
    </TableCell>
  </TableRow>
)

interface SearchClientProps {
  results: DatabaseSearchResponse['results']
  type: 'release' | 'master' | 'artist' | 'label'
  initialView?: 'list' | 'grid'
}

export function SearchClient({ results, type, initialView = 'list' }: SearchClientProps) {
  const [view, setView] = useQueryState('view', { defaultValue: initialView })

  if (!results.length) {
    return <div className="text-muted-foreground">No results found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Toggle
          aria-label="Toggle view"
          pressed={view === 'grid'}
          onPressedChange={(pressed) => setView(pressed ? 'grid' : 'list')}
        >
          {view === 'grid' ? <ListIcon className="h-4 w-4" /> : <GridIcon className="h-4 w-4" />}
        </Toggle>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {type === 'master' &&
            results.map((result) => (
              <MasterGridItem key={result.id} result={result as DatabaseSearchMasterItem} />
            ))}
          {type === 'release' &&
            results.map((result) => (
              <ReleaseGridItem key={result.id} result={result as DatabaseSearchReleaseItem} />
            ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Year</TableHead>
                {type === 'master' ? (
                  <>
                    <TableHead>Genre</TableHead>
                    <TableHead>Style</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Country</TableHead>
                    <TableHead>Format</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {type === 'master' &&
                results.map((result) => (
                  <MasterListItem key={result.id} result={result as DatabaseSearchMasterItem} />
                ))}
              {type === 'release' &&
                results.map((result) => (
                  <ReleaseListItem key={result.id} result={result as DatabaseSearchReleaseItem} />
                ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
