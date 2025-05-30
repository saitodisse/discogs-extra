'use server'

import { Client } from 'disconnect'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const releaseId = searchParams.get('releaseId')

  if (!releaseId) {
    return Response.json({ error: 'Release ID is required' }, { status: 400 })
  }

  const client = new Client({
    method: 'discogs',
    consumerKey: process.env.DISCOGS_CONSUMER_KEY,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  })

  try {
    const release = await client.database().getRelease(parseInt(releaseId))
    return Response.json(release)
  } catch (error) {
    console.error('Error fetching release:', error)
    return Response.json({ error: 'Failed to fetch release from Discogs' }, { status: 500 })
  }
}
