import { Client, DatabaseSearchMasterItem } from 'disconnect'
import { BreadcrumbDiscogs } from '../../BreadcrumbDiscogs'
import { ArtistClient } from './ArtistClient'

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: Promise<{ artist_id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { artist_id } = await params
  const searchParamsLocal = await searchParams
  const page = searchParamsLocal.page ? parseInt(searchParamsLocal.page) : 1

  if (!process.env.DISCOGS_CONSUMER_KEY || !process.env.DISCOGS_CONSUMER_SECRET) {
    console.error('Missing required Discogs API credentials')
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Error</h1>
        <p>Missing required API credentials. Please check your environment variables.</p>
      </div>
    )
  }

  const client = new Client({
    method: 'discogs',
    consumerKey: process.env.DISCOGS_CONSUMER_KEY!,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET!,
  })

  const artist = await client.database().getArtist(artist_id)

  const searchResponse = await client.database().search(artist.name, {
    artist: artist.name,
    type: 'master',
    page,
    per_page: 300, // Fetching all masters for the artist
    sort: 'year',
    sort_order: 'asc',
  })

  console.log('Search response:', searchResponse)

  return (
    <div className="container mx-auto px-4">
      <BreadcrumbDiscogs
        entity={{
          type: 'artist',
          data: artist,
        }}
      />

      <ArtistClient
        artistId={artist_id}
        artist={artist}
        mastersSearchResults={searchResponse.results as DatabaseSearchMasterItem[]}
      />
    </div>
  )
}
