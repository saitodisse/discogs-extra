'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { Release, Track } from 'disconnect'

interface ReleaseClientProps {
  release: Release
}

function TrackExtraArtist({ track }: { track: Track }) {
  return track?.extraartists?.map((extra_artist) => (
    <div key={extra_artist.id} className="ml-2 text-sm text-muted-foreground">
      <Link href={`/discogs/artists/${extra_artist.id}`} className="text-blue-600 hover:underline">
        {extra_artist.name}
      </Link>
      {extra_artist.role && <span className="ml-1">({extra_artist.role})</span>}
      {extra_artist.anv && <span className="ml-1">– {extra_artist.anv}</span>}
      {extra_artist.join && <span className="ml-1">– {extra_artist.join}</span>}
    </div>
  ))
}

export function ReleaseClient({ release }: ReleaseClientProps) {
  return (
    <Card className="w-full">
      <div className="grid gap-6 p-6 md:grid-cols-[300px_1fr]">
        {/* Release Cover */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {release.images && release.images[0] ? (
            <img
              src={release.images[0].uri}
              alt={release.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        {/* Release Info */}
        <div>
          <h1 className="mb-2 text-3xl font-bold">{release.title}</h1>

          {release.uri && (
            <div className="mb-4 font-thin">
              <a
                href={release.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline"
              >
                discogs
                <ExternalLink className="ml-1 inline" size={14} />
              </a>
            </div>
          )}

          <div className="mb-4">
            {release.artists &&
              release.artists.map((artist, index) => (
                <Link
                  key={artist.id}
                  href={`/discogs/artists/${artist.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {artist.name}
                  {release.artists && index < release.artists.length - 1 ? ', ' : ''}
                </Link>
              ))}
          </div>

          <div className="mb-4">
            {release.labels &&
              release.labels.map((label) => (
                <div key={label.id}>
                  <Link
                    href={`/discogs/labels/${label.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {label.name}
                  </Link>
                  {label.catno && (
                    <span className="ml-2 text-muted-foreground">– {label.catno}</span>
                  )}
                </div>
              ))}
          </div>

          <div className="mb-4 flex gap-2">
            {release.year && <Badge>{release.year}</Badge>}
            {release.country && <Badge variant="outline">{release.country}</Badge>}
          </div>

          {release.formats && (
            <div className="mb-4">
              {release.formats.map((format, index) => (
                <Badge key={index} variant="secondary" className="mr-2">
                  {format.qty}× {format.name}
                  {format.descriptions && format.descriptions.length > 0 && (
                    <span className="ml-1">({format.descriptions.join(', ')})</span>
                  )}
                </Badge>
              ))}
            </div>
          )}

          <div className="mb-6">
            {release.genres && (
              <div className="mb-2 flex flex-wrap gap-2">
                {release.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
            {release.styles && (
              <div className="flex flex-wrap gap-2">
                {release.styles.map((style) => (
                  <Badge key={style} variant="outline">
                    {style}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tracklist Section */}
          {release.tracklist && release.tracklist.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">Tracklist</h2>
              <div className="grid gap-2">
                {release.tracklist.map((track, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="mr-2 text-muted-foreground">{track.position}.</span>
                        {track.title}
                      </div>
                      {track.artists && track.artists.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {' '}
                          by {track.artists.map((a) => a.name).join(', ')}
                        </span>
                      )}
                      {track.extraartists && track.extraartists.length > 0 && (
                        <TrackExtraArtist track={track} />
                      )}
                    </div>
                    {track.duration && (
                      <span className="text-muted-foreground">{track.duration}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {release.notes && (
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">Notes</h2>
              <p className="whitespace-pre-line">{release.notes}</p>
            </div>
          )}

          {/* Credits Section */}
          {release.extraartists && release.extraartists.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">Credits</h2>
              <div className="grid gap-1 text-sm">
                {release.extraartists.map((artist, index) => (
                  <div key={index} className="flex flex-col">
                    {artist.role && <span className="font-light">{artist.role}: </span>}

                    <div className="flex text-sm">
                      <Link
                        href={`/discogs/artists/${artist.id}`}
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        {artist.name}
                      </Link>

                      {artist.tracks && artist.tracks.length > 0 && (
                        <div className="ml-2 font-thin text-muted-foreground">
                          track: {artist.tracks}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {release.identifiers && release.identifiers.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">Identifiers</h2>
              <div className="grid gap-2">
                {release.identifiers.map((identifier, index) => (
                  <div key={index}>
                    <span className="font-medium">{identifier.type}: </span>
                    {identifier.value}
                  </div>
                ))}
              </div>
            </div>
          )}

          {release.videos && release.videos.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">Videos</h2>
              <div className="grid gap-4">
                {release.videos.map((video, index) => (
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
        </div>
      </div>
    </Card>
  )
}
