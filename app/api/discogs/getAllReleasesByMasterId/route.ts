'use server'

import { Client } from 'disconnect'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const masterId = searchParams.get('masterId')

  if (!masterId) {
    return Response.json({ error: 'Master ID is required' }, { status: 400 })
  }

  const client = new Client({
    method: 'discogs',
    consumerKey: process.env.DISCOGS_CONSUMER_KEY,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  })

  try {
    const releases = await client
      .database()
      .getMasterVersions(parseInt(masterId), { page: 1, per_page: 10 })
    return Response.json(releases)
  } catch (error) {
    console.error('Error fetching releases:', error)
    return Response.json({ error: 'Failed to fetch releases from Discogs' }, { status: 500 })
  }
}
