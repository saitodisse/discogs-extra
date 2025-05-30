'use server'

import { Client } from 'disconnect'
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams
  const masterId = searchParams.get('masterId')

  if (!masterId) {
    return NextResponse.json({ error: 'Master ID is required' }, { status: 400 })
  }

  const client = new Client({
    method: 'discogs',
    consumerKey: process.env.DISCOGS_CONSUMER_KEY,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  })

  try {
    const master = await client.database().getMaster(parseInt(masterId))
    return NextResponse.json(master)
  } catch (error) {
    console.error('Error fetching master:', error)
    return NextResponse.json({ error: 'Failed to fetch master from Discogs' }, { status: 500 })
  }
}
