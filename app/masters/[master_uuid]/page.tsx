import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { createClient } from '@/utils/supabase/server'
import { ReleaseDb } from '@/types/ReleaseDb'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function MasterPage({ params }: { params: Promise<{ master_uuid: string }> }) {
  const { master_uuid } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div className="container mx-auto p-4">You must be signed in to view this page.</div>
  }
  const releaseResult = await supabase.from('releases').select('*').eq('id', master_uuid).single()
  const master: ReleaseDb = releaseResult.data

  console.log('Master Data:', master)

  return (
    <div className="min-w-5xl mx-auto w-full max-w-5xl p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/masters">Masters</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {master?.artists_name?.join(', ')} - {master?.title} ({master.master_id})
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mt-6 w-full">
        <div className="grid gap-6 p-6 md:grid-cols-[300px_1fr]">
          {/* Release Cover */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {master.images_json && master.images_json[0] ? (
              <img
                src={master.images_json[0].uri}
                alt={master.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          {/* Master Info */}
          <div>
            <h1 className="mb-2 text-3xl font-bold">{master.title}</h1>

            <div className="mb-4 flex">
              <span className="text-sm text-primary">Master ID: {master.master_id}</span>
              {master.releases_ids && master.releases_ids.length > 0 && (
                <span className="ml-4 text-sm text-muted-foreground">
                  ({master.releases_ids.length} releases)
                </span>
              )}
            </div>

            <div className="mb-4">
              {master.artists_name.map((artist, index) => (
                <Link
                  key={index}
                  href={`/discogs/artists/${master.artists_id[index]}`}
                  className="text-blue-600 hover:underline"
                >
                  {artist}
                  {index < master.artists_name.length - 1 ? ', ' : ''}
                </Link>
              ))}
            </div>

            <div className="mb-4 flex gap-2">
              {master.year_of_release && <Badge>{master.year_of_release}</Badge>}
              {master.country && <Badge variant="outline">{master.country}</Badge>}
              {master.status && <Badge variant="secondary">{master.status}</Badge>}
            </div>

            {master.formats_json && (
              <div className="mb-4">
                {Object.entries(master.formats_json).map(([format, details], index) => (
                  <Badge key={index} variant="secondary" className="mr-2">
                    {format}
                  </Badge>
                ))}
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

            {/* Tracklist Section */}
            {master.tracklist_json && master.tracklist_json.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold">Tracklist</h2>
                <div className="divide-y divide-muted">
                  {master.tracklist_json.map((track, index) => {
                    // Find extra artists for this track
                    const trackExtraArtists = master.extraartists_json?.filter((artist) =>
                      artist.roles.some((role) => role.tracks?.includes(track.position))
                    )

                    return (
                      <div key={index} className="py-2">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-grow flex-col">
                            <div className="flex items-center">
                              <span className="mr-2 w-8 font-mono text-muted-foreground">
                                {track.position}
                              </span>
                              <span className="font-medium">{track.title}</span>
                              {track.duration && (
                                <span className="ml-2 text-muted-foreground">
                                  ({track.duration})
                                </span>
                              )}
                            </div>
                            {/* Track Extra Artists */}
                            {trackExtraArtists && trackExtraArtists.length > 0 && (
                              <div className="ml-10 text-sm text-muted-foreground">
                                {trackExtraArtists.map((artist, artistIndex) => (
                                  <div key={artistIndex} className="flex items-center gap-1">
                                    {artist.roles
                                      .filter((role) => role.tracks?.includes(track.position))
                                      .map((role, roleIndex) => (
                                        <div key={roleIndex} className="flex items-center">
                                          <span className="text-muted-foreground">
                                            {role.role}:
                                          </span>
                                          <Link
                                            href={`/discogs/artists/${artist.id}`}
                                            className="ml-1 text-blue-600 hover:underline"
                                          >
                                            {artist.name}
                                          </Link>
                                          {artist.anv && (
                                            <span className="ml-1 text-muted-foreground">
                                              ({artist.anv})
                                            </span>
                                          )}
                                          {roleIndex < artist.roles.length - 1 && ', '}
                                        </div>
                                      ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {master.notes && (
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold">Notes</h2>
                <p className="whitespace-pre-line">{master.notes}</p>
              </div>
            )}

            {/* Extra Artists Section */}
            {master.extraartists_json && master.extraartists_json.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold">Credits</h2>
                <div className="grid gap-4">
                  {/* Group artists by role */}
                  {Array.from(
                    new Set(
                      master.extraartists_json.flatMap((artist) =>
                        artist.roles.map((role) => role.role)
                      )
                    )
                  )
                    .sort()
                    .map((role) => {
                      const artistsWithRole = master.extraartists_json.filter((artist) =>
                        artist.roles.some((r) => r.role === role)
                      )

                      return (
                        <div key={role} className="space-y-1">
                          <h3 className="font-medium text-muted-foreground">{role}</h3>
                          <div className="ml-4 space-y-1">
                            {artistsWithRole.map((artist, index) => (
                              <div key={index} className="flex flex-wrap items-center gap-x-1">
                                <Link
                                  href={`/discogs/artists/${artist.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {artist.name}
                                </Link>
                                {artist.anv && (
                                  <span className="text-sm text-muted-foreground">
                                    ({artist.anv})
                                  </span>
                                )}
                                {artist.roles
                                  .filter((r) => r.role === role && r.tracks)
                                  .map((r) => r.tracks)
                                  .filter(Boolean)
                                  .map((tracks, trackIndex) => (
                                    <span
                                      key={trackIndex}
                                      className="text-sm text-muted-foreground"
                                    >
                                      - track{tracks?.includes(',') ? 's' : ''}: {tracks}
                                    </span>
                                  ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {master.identifiers_json && Object.keys(master.identifiers_json).length > 0 && (
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold">Identifiers</h2>
                <div className="grid gap-2">
                  {Object.entries(master.identifiers_json).map(([key, value], index) => (
                    <div key={index}>
                      <span className="font-medium">{key}: </span>
                      {String(value)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {master.videos_json && master.videos_json.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold">Videos</h2>
                <div className="grid gap-4">
                  {master.videos_json.map((video, index) => (
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
}
