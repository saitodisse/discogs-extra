import { Client } from 'disconnect'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { BreadcrumbDiscogs } from '@/app/discogs/BreadcrumbDiscogs'

interface Master {
  id: number
  title: string
  artists: Array<{
    name: string
    id: number
  }>
  genres?: string[]
  styles?: string[]
  year?: number
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
  data_quality?: string
  tracklist: Array<{
    position: string
    title: string
    duration: string
  }>
  uri: string
  description?: string
  notes?: string
}

export default async function MasterPage({ params }: { params: Promise<{ master_id: string }> }) {
  const { master_id } = await params
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

  const master = await client.database().getMaster(parseInt(master_id))

  console.log('Master:', master)

  return (
    <div className="container mx-auto p-4">
      <BreadcrumbDiscogs
        entity={{
          type: 'master',
          data: master,
        }}
      />

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
                href={`/discogs/masters/${master_id}/releases`}
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

            {/* {master.notes && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Notes</h2>
                  <p className="whitespace-pre-line">{master.notes}</p>
                </div>
              )} */}

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
