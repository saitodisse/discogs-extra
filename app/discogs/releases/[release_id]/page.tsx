import { Client } from 'disconnect'
import { NextPage } from 'next'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface Artist {
  name: string
  id: number
  anv?: string
  join?: string
  role?: string
  tracks?: string
  resource_url?: string
}

interface Release {
  id: number
  title: string
  artists: Array<{
    name: string
    id: number
    anv?: string
    join?: string
    role?: string
    tracks?: string
    resource_url?: string
  }>
  labels: Array<{
    name: string
    id: number
    catno: string
  }>
  year?: number
  country?: string
  genres?: string[]
  styles?: string[]
  formats?: Array<{
    name: string
    qty: number
    descriptions?: string[]
  }>
  images?: Array<{
    uri: string
    height: number
    width: number
  }>
  videos?: Array<{
    uri: string
    title: string
    description: string
  }>
  notes?: string
  extraartists?: Artist[]
  tracklist: Array<{
    position: string
    title: string
    duration: string
    artists?: Artist[]
    extraartists?: Artist[]
  }>
  uri: string
  identifiers?: Array<{
    type: string
    value: string
  }>
}

export default async function ReleasePage({ params }: { params: Promise<{ release_id: string }> }) {
  const { release_id } = await params
  if (!process.env.DISCOGS_CONSUMER_KEY || !process.env.DISCOGS_CONSUMER_SECRET) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Error</h1>
        <p>Missing required API credentials. Please check your environment variables.</p>
      </div>
    )
  }

  const client = new Client({
    method: 'discogs',
    consumerKey: process.env.DISCOGS_CONSUMER_KEY,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  })

  try {
    const release = await client.database().getRelease(parseInt(release_id))

    console.log('Release data:', release)

    return (
      <div className="container mx-auto px-4">
        <Breadcrumb className="my-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/discogs">discogs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/discogs/releases/${release?.id}`}>
                {release?.artists?.[0]?.name} - {release?.title}
                <span className="font-mono"> ({release?.id})</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
                  release.labels.map((label, index) => (
                    <div key={label.id}>
                      <Link
                        href={`/discogs/labels/${label.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {label.name}
                      </Link>
                      {label.catno && (
                        <span className="ml-2 text-muted-foreground">(Cat# {label.catno})</span>
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
                  <div className="grid gap-2">
                    {release.extraartists.map((artist, index) => (
                      <div key={index} className="flex items-baseline">
                        <span className="min-w-[120px] font-medium">{artist.role}:</span>
                        <Link
                          href={`/discogs/artists/${artist.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {artist.name}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Tracklist */}
              {release.tracklist && release.tracklist.length > 0 && (
                <div className="mb-6">
                  <h2 className="mb-2 text-xl font-semibold">Tracklist</h2>
                  <div className="grid gap-4">
                    {release.tracklist.map((track, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <span className="mr-2 text-muted-foreground">{track.position}.</span>
                            {track.title}
                          </div>
                          {track.duration && (
                            <span className="text-muted-foreground">{track.duration}</span>
                          )}
                        </div>
                        {track.extraartists && track.extraartists.length > 0 && (
                          <div className="ml-6 space-y-1 text-sm">
                            {track.extraartists.map((artist, artistIndex) => (
                              <div key={artistIndex} className="text-muted-foreground">
                                {artist.role}:{' '}
                                <Link
                                  href={`/discogs/artists/${artist.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {artist.name}
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                        {track.artists && track.artists.length > 0 && (
                          <div className="ml-6 space-y-1 text-sm">
                            {track.artists.map((artist, artistIndex) => {
                              return (
                                <div key={artistIndex} className="text-muted-foreground">
                                  <a
                                    href={`/discogs/artists/${artist.id}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {artist.name}
                                    {artist.anv && ` (as ${artist.anv})`}
                                    {artist.role && ` (${artist.role})`}
                                    {artist.tracks && ` (tracks: ${artist.tracks})`}
                                  </a>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Artists Section */}
              {release.artists && release.artists.length > 1 && (
                <div className="mb-6">
                  <h2 className="mb-2 text-xl font-semibold">Artists</h2>
                  <div className="grid gap-2">
                    {release.artists &&
                      release.artists.map((artist, index) => {
                        let joinString = ''
                        if (artist.join) {
                          joinString = ` (${artist.join})`
                        }
                        if (artist.role) {
                          joinString = ` (${artist.role})`
                        }
                        if (artist.tracks) {
                          joinString = ` (tracks: ${artist.tracks})`
                        }
                        if (artist.anv) {
                          joinString = ` (as ${artist.anv})`
                        }
                        if (artist.resource_url) {
                          joinString = ` (resource: ${artist.resource_url})`
                        }
                        if (artist.id === 0) {
                          return (
                            <div key={index} className="flex items-baseline">
                              <Link
                                href={`/discogs/artists/${artist.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {artist.name}
                              </Link>
                              {artist.anv && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                  (as {artist.anv})
                                </span>
                              )}
                              {artist.join &&
                                index < ((release.artists && release.artists?.length - 1) || 0) && (
                                  <span className="mx-2 text-muted-foreground">{artist.join}</span>
                                )}
                              {artist.tracks && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                  tracks: {artist.tracks}
                                </span>
                              )}
                            </div>
                          )
                        }
                      })}
                  </div>
                </div>
              )}

              {release.identifiers && release.identifiers.length > 0 && (
                <div className="mb-6">
                  <h2 className="mb-2 text-xl font-semibold">Identifiers</h2>
                  <div className="grid gap-2">
                    {release.identifiers.map((id, index) => (
                      <div key={index}>
                        <span className="font-medium">{id.type}:</span>{' '}
                        <span className="text-muted-foreground">{id.value}</span>
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
      </div>
    )
  } catch (error) {
    console.error('Error fetching release:', error)
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Error</h1>
        <p>There was an error fetching the release information. Please try again later.</p>
        <Link href="/discogs" className="text-blue-600 hover:underline">
          Back to search
        </Link>
      </div>
    )
  }
}
