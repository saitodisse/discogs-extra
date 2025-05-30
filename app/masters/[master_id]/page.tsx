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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Track } from 'disconnect'
import { TrackItem } from '../components/TrackItem'

export default async function MasterPage({ params }: { params: Promise<{ master_id: string }> }) {
  const { master_id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div className="container mx-auto p-4">You must be signed in to view this page.</div>
  }
  const releaseResult = await supabase
    .from('releases')
    .select('*')
    .eq('master_id', master_id)
    .single()
  const master: ReleaseDb = releaseResult.data

  let main_tracks: Track[] = []
  let extra_tracks: Track[] = []

  if (master?.tracklist_json) {
    main_tracks = master?.tracklist_json.filter((track) => !track.extra_track)
    extra_tracks = master?.tracklist_json.filter((track) => track.extra_track)
  }

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
              {master?.artists_name?.join(', ')} - {master?.title} ({master?.master_id})
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mt-6 w-full">
        <div className="grid gap-6 p-6 md:grid-cols-[300px_1fr]">
          {/* Release Cover */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {master.images_json && master.images_json?.[0] ? (
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

            <div className="mb-4 flex items-baseline">
              <span className="text-sm text-primary">Master ID: {master.master_id}</span>
              {master.releases_ids && master.releases_ids.length > 0 && (
                <span
                  className="ml-4 text-sm text-muted-foreground"
                  title={master.releases_ids.join(', ')}
                >
                  ({master.releases_ids.length} releases)
                </span>
              )}
              <Link
                href={`/masters/${master.master_id}/json`}
                className="ml-4 text-xs text-primary/60 underline hover:text-primary/90"
              >
                JSON
              </Link>
            </div>

            <a
              href={master.master_id ? `/discogs/masters/${master.master_id}` : '#'}
              className="pr-4 text-sm text-primary underline"
            >
              discogs (internal)
              <ExternalLink className="ml-1 inline" size={14} />
            </a>

            <a
              href={master.master_id ? `https://www.discogs.com/master/${master.master_id}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline"
            >
              discogs
              <ExternalLink className="ml-1 inline" size={14} />
            </a>

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
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">Main Tracklist</h2>
              <div className="divide-y divide-muted">
                {main_tracks?.map((track, index) => (
                  <TrackItem key={index} track={track} className="py-2" />
                ))}
              </div>
            </div>

            {/* extra tracks */}
            {extra_tracks.length > 0 && (
              <div className="mb-6">
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <h2 className="mb-2 text-xl font-semibold">Extra Tracks</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="divide-y divide-muted">
                        {extra_tracks?.map((track, index) => (
                          <TrackItem key={index} track={track} />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
