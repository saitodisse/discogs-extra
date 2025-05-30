import { SearchInput } from '@/components/SearchInput'
import { Client, DatabaseSearchResponse } from 'disconnect'
import Link from 'next/link'
import { SearchClient } from './SearchClient'

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ query: string }>
  searchParams: Promise<{
    page?: string
    type?: 'release' | 'master' | 'artist' | 'label'
    view?: 'list' | 'grid'
  }>
}) {
  const { query } = await params
  const { page: pageStr = '1', type = 'release', view } = await searchParams
  const page = parseInt(pageStr)
  const perPage = type === 'master' ? 100 : 24 // Masters typically have fewer results

  if (!process.env.DISCOGS_CONSUMER_KEY || !process.env.DISCOGS_CONSUMER_SECRET) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Error</h1>
        <p>Missing required API credentials. Please check your environment variables.</p>
      </div>
    )
  }

  let searchResults: DatabaseSearchResponse
  try {
    const client = new Client({
      method: 'discogs',
      consumerKey: process.env.DISCOGS_CONSUMER_KEY,
      consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
    })

    searchResults = await client.database().search(query, {
      type,
      page,
      per_page: perPage,
      sort: 'year',
      sort_order: 'asc',
    })
  } catch (error) {
    console.error('Error searching Discogs:', error)
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Search Error</h1>
        <p>There was an error performing your search. Please try again later.</p>
      </div>
    )
  }

  if (searchResults.pagination.items <= 0) {
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

      <div className="flex items-baseline space-x-2 text-sm">
        <h1 className="mb-6 mt-8 italic">
          Search Results for "{decodeURIComponent(query)}" ({searchResults.pagination.items} items)
        </h1>
        <Link
          href={`/discogs/search/${encodeURIComponent(query)}/json?page=${pageStr}${
            type ? `&type=${type}` : ''
          }`}
          className="text-sm hover:underline"
        >
          JSON
        </Link>
      </div>

      <SearchClient
        results={searchResults.results}
        type={type}
        initialView={view as 'list' | 'grid'}
      />

      {searchResults.pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/discogs/search/${encodeURIComponent(query)}?page=${
                page - 1
              }${type ? `&type=${type}` : ''}${view ? `&view=${view}` : ''}`}
              className="rounded border px-4 py-2 text-accent-foreground hover:bg-accent"
            >
              Previous
            </Link>
          )}
          {page < searchResults.pagination.pages && (
            <Link
              href={`/discogs/search/${encodeURIComponent(query)}?page=${
                page + 1
              }${type ? `&type=${type}` : ''}${view ? `&view=${view}` : ''}`}
              className="rounded border px-4 py-2 text-accent-foreground hover:bg-accent"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
