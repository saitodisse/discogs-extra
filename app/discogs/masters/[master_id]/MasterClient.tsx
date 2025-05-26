'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'

interface Artist {
  name: string
  id: number
}

interface Artist {
  id: number
  name: string
  anv?: string
  join?: string
  resource_url?: string
}

interface Video {
  uri: string
  title: string
  description?: string
  duration?: number
  embed?: boolean
}

interface Track {
  position: string
  type_?: string
  title: string
  duration: string
  extraartists?: Artist[]
}

interface Master {
  id: number
  title: string
  main_release?: number
  main_release_url?: string
  resource_url?: string
  artists: Artist[]
  genres?: string[]
  styles?: string[]
  year?: number | string
  images?: Array<{
    uri: string
    height: number
    width: number
    resource_url?: string
  }>
  videos?: Video[]
  tracklist: Track[]
  uri: string
  versions_url?: string
  description?: string
  notes?: string
  data_quality?: string
}

interface MasterClientProps {
  master: Master
}

export function MasterClient({ master }: MasterClientProps) {
  return (
    <div>
      <h1 className="mb-2 mt-6 text-lg">
        <span className="font-thin">Master: </span>
        <span className="mr-6 font-mono font-thin">{master?.id}</span>
        <span className="font-semibold">
          {master?.artists?.[0]?.name} - {master?.title}
        </span>
      </h1>

      <Card className="w-full">
        <div className="grid gap-6 p-6 md:grid-cols-[300px_1fr]">
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

          {/* Album Info */}
          <div>
            <h1 className="mb-2 text-3xl font-bold">{master.title}</h1>
            <div className="mb-4">
              {master.artists &&
                master.artists.map((artist, index) => (
                  <Link
                    key={artist.id}
                    href={`/discogs/artists/${artist.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {artist.name}
                    {index < master.artists.length - 1 ? ', ' : ''}
                  </Link>
                ))}
            </div>

            <div className="mb-6 flex items-center gap-4 font-thin">
              {master.uri && (
                <a
                  href={master.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline"
                >
                  discogs
                  <ExternalLink className="ml-1 inline" size={14} />
                </a>
              )}
              <Link
                href={`/discogs/masters/${master.id}/releases`}
                className="text-sm text-primary underline"
              >
                view all releases
              </Link>
            </div>

            {master.year && (
              <div className="mb-4">
                <Badge>{master.year}</Badge>
              </div>
            )}

            <div className="mb-6">
              {master.genres && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {master.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
              {master.styles && (
                <div className="flex flex-wrap gap-2">
                  {master.styles.map((style) => (
                    <Badge key={style} variant="outline">
                      {style}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {master.tracklist && master.tracklist.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold">Tracklist</h2>
                <div className="grid gap-2">
                  {master.tracklist.map((track, index) => (
                    <div key={index} className="flex justify-between">
                      <div>
                        <span className="mr-2 text-muted-foreground">{track.position}.</span>
                        {track.title}
                      </div>
                      {track.duration && (
                        <span className="text-muted-foreground">{track.duration}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {master.videos && master.videos.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold">Videos</h2>
                <div className="grid gap-4">
                  {master.videos.map((video, index) => (
                    <a
                      key={index}
                      href={video.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {video.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <a
                href={master.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on Discogs
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
