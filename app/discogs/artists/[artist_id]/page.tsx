import { Client } from 'disconnect'
import type { Release } from 'disconnect'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { release } from 'os'
import { BreadcrumbDiscogs } from '../../BreadcrumbDiscogs'

interface ReleaseWithThumb extends Omit<Release, 'thumb' | 'format' | 'label'> {
  thumb?: string
  format?: string[]
  label?: string[]
  year?: number
}

export default async function ArtistPage({ params }: { params: Promise<{ artist_id: string }> }) {
  const { artist_id } = await params

  if (!process.env.DISCOGS_CONSUMER_KEY || !process.env.DISCOGS_CONSUMER_SECRET) {
    console.error('Missing required Discogs API credentials')
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Error</h1>
        <p>Missing required API credentials. Please check your environment variables.</p>
      </div>
    )
  }

  try {
    const client = new Client({
      method: 'discogs',
      consumerKey: process.env.DISCOGS_CONSUMER_KEY!,
      consumerSecret: process.env.DISCOGS_CONSUMER_SECRET!,
    })

    // Get artist details
    const artist = await client.database().getArtist(artist_id)

    // Get artist's releases
    const releasesResponse = await client.database().getArtistReleases(artist_id, {
      per_page: 50,
      sort: 'year',
      sort_order: 'desc',
    })

    const releases = (releasesResponse.results || []) as ReleaseWithThumb[]

    return (
      <div className="container mx-auto px-4">
        <BreadcrumbDiscogs
          entity={{
            type: 'artist',
            data: artist,
          }}
        />

        <div className="mb-8 flex flex-col gap-8 md:flex-row">
          {artist.images && artist.images.length > 0 && (
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={artist.images[0].uri || artist.images[0].resource_url}
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
                  {artist.urls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold">Discography</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {releases.map((release) => (
            <Link
              key={release.id}
              href={`/discogs/artists/${artist_id}/${release.id}`}
              className="block"
            >
              <Card className="h-full transition-colors hover:bg-accent/50">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{release.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 aspect-square overflow-hidden rounded-md bg-muted">
                    {release.thumb ? (
                      <Image
                        src={release.thumb}
                        alt={release.title}
                        width={300}
                        height={300}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {release.year && <div>Year: {release.year}</div>}
                    {release.format && <div>Format: {release.format.join(', ')}</div>}
                    {release.label && <div>Label: {release.label.slice(0, 2).join(', ')}</div>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching artist:', error)
    notFound()
  }
}
