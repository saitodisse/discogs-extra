import { SearchInput } from '@/components/SearchInput'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Client } from 'disconnect'
import { NextPage } from 'next'
import Link from 'next/link'

interface SearchResult {
  id: number
  title: string
  type: 'release' | 'master' | 'artist' | 'label'
  thumb?: string
  cover_image?: string
  year?: number
  format?: string[]
  label?: string[]
  genre?: string[]
  style?: string[]
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ query: string }>
  searchParams: Promise<{
    page?: string
    type?: 'release' | 'master' | 'artist' | 'label'
  }>
}) {
  const { query } = await params
  const { page: pageStr = '1', type = 'release' } = await searchParams
  const page = parseInt(pageStr)
  const perPage = 24

  if (!process.env.DISCOGS_CONSUMER_KEY || !process.env.DISCOGS_CONSUMER_SECRET) {
    console.error('Missing required Discogs API credentials')
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Error</h1>
        <p>Missing required API credentials. Please check your environment variables.</p>
      </div>
    )
  }

  let searchResults: SearchResult[] = []
  let pagination = { pages: 1, items: 0 }

  try {
    const client = new Client({
      method: 'discogs',
      consumerKey: process.env.DISCOGS_CONSUMER_KEY!,
      consumerSecret: process.env.DISCOGS_CONSUMER_SECRET!,
    })

    const searchResponse = await client.database().search(query, {
      type,
      page,
      per_page: perPage,
    })

    console.log(searchResponse)

    searchResults = searchResponse.results as SearchResult[]
    pagination = {
      pages: searchResponse.pagination?.pages || 1,
      items: searchResponse.pagination?.items || 0,
    }
  } catch (error) {
    console.error('Error searching Discogs:', error)
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Search Error</h1>
        <p>There was an error performing your search. Please try again later.</p>
      </div>
    )
  }

  if (searchResults.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">
          No results found for "{decodeURIComponent(query)}"
        </h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <SearchInput initialQuery={decodeURIComponent(query)} initialType={type} />

      <h1 className="mb-6 mt-8 italic">
        Search Results for "{decodeURIComponent(query)}" ({pagination.items} items)
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {searchResults.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={getUrl(item)}
            className="block overflow-hidden rounded-lg bg-card text-card-foreground shadow-md transition-shadow hover:shadow-lg"
          >
            {' '}
            <div className="relative aspect-square bg-muted">
              {item.thumb || item.cover_image ? (
                <img
                  src={item.thumb || item.cover_image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="mb-1 line-clamp-2 text-xs">{item.title}</h2>
              <div className="text-sm text-muted-foreground">
                {item.year && <Badge>{item.year}</Badge>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/discogs/search/${encodeURIComponent(query)}?page=${page - 1}${type ? `&type=${type}` : ''}`}
              className="rounded border px-4 py-2 text-accent-foreground hover:bg-accent"
            >
              Previous
            </Link>
          )}
          {page < pagination.pages && (
            <Link
              href={`/discogs/search/${encodeURIComponent(query)}?page=${page + 1}${type ? `&type=${type}` : ''}`}
              className="rounded border px-4 py-2 text-accent-foreground hover:bg-accent"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )

  function getUrl(item: SearchResult): string | import('url').UrlObject {
    if (item.type === 'artist') {
      return `/discogs/artists/${item.id}`
    }
    if (item.type === 'label') {
      return `/discogs/labels/${item.id}`
    }
    if (item.type === 'master') {
      return `/discogs/masters/${item.id}`
    }
    // Default to release if no type matches
    return `/discogs/releases/${item.id}`
  }
}
