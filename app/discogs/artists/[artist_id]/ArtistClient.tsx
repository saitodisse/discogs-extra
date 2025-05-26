'use client'

import { useQueryState, parseAsInteger } from 'nuqs'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { Artist, ArtistReleasesResponse } from 'disconnect'
import { ReleaseItem } from '@/components/ReleaseItem'
// Using our own Artist interface instead of the one from disconnect

interface ArtistClientProps {
  artistId: string
  artist: Artist
  releases: ArtistReleasesResponse
  initialPage?: number
}

export function ArtistClient({ artistId, artist, releases, initialPage = 1 }: ArtistClientProps) {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(initialPage))
  const totalPages = releases.pagination.pages || 1

  return (
    <div>
      <div className="mb-8 flex flex-col gap-8 md:flex-row">
        {artist.images && artist.images.length > 0 && (
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={artist.images[0].uri || artist.images[0].resource_url || ''}
                alt={artist.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{artist.name}</h1>

          {artist.uri && (
            <div className="mb-4 font-thin">
              <a
                href={artist.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline"
              >
                discogs
                <ExternalLink className="ml-1 inline" size={14} />
              </a>
            </div>
          )}

          {artist.profile && (
            <div className="prose mb-6 max-w-none">
              <p className="whitespace-pre-line">{artist.profile}</p>
            </div>
          )}

          {artist.urls && artist.urls.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Links</h2>
              <div className="flex flex-wrap gap-2">
                {artist.urls.map((url, index) =>
                  url && url.trim() !== '' ? (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {new URL(url).hostname}
                    </a>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-6 text-2xl font-bold">Discography</h2>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {releases.releases.map((release, index) => (
          <ReleaseItem
            key={`${release.id}_${index}`}
            id={release.id}
            title={release.title}
            thumb={release.thumb}
            year={release.year}
            format={release.format}
            label={release.label}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center">
          <nav className="flex items-center gap-6" aria-label="pagination">
            <Link
              href={`/discogs/artists/${artistId}?page=${page > 1 ? page - 1 : 1}`}
              className={`flex h-10 w-10 items-center justify-center rounded-md border transition-colors hover:bg-accent ${
                page <= 1 ? 'pointer-events-none opacity-50' : ''
              }`}
              aria-disabled={page <= 1}
            >
              ←
            </Link>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Link
              href={`/discogs/artists/${artistId}?page=${page < totalPages ? page + 1 : totalPages}`}
              className={`flex h-10 w-10 items-center justify-center rounded-md border transition-colors hover:bg-accent ${
                page >= totalPages ? 'pointer-events-none opacity-50' : ''
              }`}
              aria-disabled={page >= totalPages}
            >
              →
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
