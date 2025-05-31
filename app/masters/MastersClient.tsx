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
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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
          <Link href={`/masters/${release.master_id}`} className="hover:text-primary">
            <Image
              src={thumbnail}
              alt={release.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
        ) : (
          <NoImagePlaceholder />
        )}
      </div>

      <div className="space-y-2">
        <div className="text-lg font-semibold">
          <Link href={`/masters/${release.master_id}`} className="hover:text-primary">
            {release.title}
          </Link>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          {release.artists_name?.map((artist, index) => (
            <span key={index}>
              <Link
                href={`/discogs/artists/${release.artists_id[index]}`}
                className="underline hover:text-primary"
              >
                {artist}
              </Link>
              {index < release.artists_name.length - 1 && ', '}
            </span>
          ))}
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

interface DeleteConfirmationProps {
  releaseId: string
  title: string
}

const DeleteConfirmation = ({ releaseId, title }: DeleteConfirmationProps) => {
  const handleDelete = async () => {
    try {
      const result = await fetch(`/api/db/deleteReleaseById?releaseId=${releaseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!result.ok) {
        const error = await result.json()
        console.error('Error deleting release:', error)
        toast.error('Failed to delete release', {
          description: 'An error occurred while trying to delete the release.',
        })
        return
      }

      toast.success('Release deleted', {
        description: `Successfully deleted "${title}".`,
      })

      window.location.reload()
    } catch (error) {
      console.error('Error deleting release:', error)
      toast.error('Failed to delete release', {
        description: 'An error occurred while trying to delete the release.',
      })
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="bg-red-500 bg-opacity-50 py-1 text-xs hover:bg-red-600">
          delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this release?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete &quot;{title}&quot;. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
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
        {release.artists_id?.map((id) => (
          <Link key={id} href={`/discogs/artists/${id}`} className="hover:text-primary">
            {release.artists_name.join(', ')}
          </Link>
        ))}
      </TableCell>
      <TableCell>
        <Link href={`/masters/${release.master_id}`} className="hover:text-primary">
          {release.title}
        </Link>
      </TableCell>
      <TableCell>{release.year_of_release || '-'}</TableCell>
      <TableCell>
        <DeleteConfirmation releaseId={release.id} title={release.title} />
      </TableCell>
    </TableRow>
  )
}

interface ReleasesClientProps {
  releases: ReleaseDb[]
  initialView?: 'list' | 'grid'
}

export function MastersClient({ releases, initialView = 'list' }: ReleasesClientProps) {
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
                <TableHead>img</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Actions</TableHead>
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
