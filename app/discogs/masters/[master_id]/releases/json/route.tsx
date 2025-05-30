import { Client } from 'disconnect'
import { NextRequest, NextResponse } from 'next/server'
import { getDiscogsData } from '../page'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ master_id: string }> }
): Promise<NextResponse> {
  const { master_id } = await params // Await context.params to access the slug

  const client = new Client({
    method: 'discogs',
    consumerKey: process.env.DISCOGS_CONSUMER_KEY,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  })

  const releaseVersions = await client
    .database()
    .getMasterVersions(parseInt(master_id), { page: 1, per_page: 500 })

  return NextResponse.json({ releases: releaseVersions })
}
