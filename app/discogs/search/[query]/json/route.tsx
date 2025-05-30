import { Client } from 'disconnect'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ query: string }>
  }
): Promise<NextResponse> {
  const { query } = await params

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  type SearchType = 'release' | 'master' | 'artist' | 'label'
  const searchType: SearchType =
    (request.nextUrl.searchParams.get('type') as SearchType) || 'release'

  const searchParams = request.nextUrl.searchParams
  const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1
  const perPage = searchType === 'master' ? 100 : 24 // Masters typically have fewer results

  const client = new Client({
    method: 'discogs',
    consumerKey: process.env.DISCOGS_CONSUMER_KEY,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  })

  const searchResults = await client.database().search(query, {
    type: searchType,
    page,
    per_page: perPage,
    sort: 'year',
    sort_order: 'asc',
  })

  return NextResponse.json(searchResults, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
