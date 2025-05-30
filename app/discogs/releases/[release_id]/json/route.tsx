import { Client } from 'disconnect'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ release_id: string }> }
): Promise<NextResponse> {
  const { release_id } = await params // Await context.params to access the slug

  const client = new Client({
    method: 'discogs',
    consumerKey: process.env.DISCOGS_CONSUMER_KEY,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  })

  const release = await client.database().getRelease(parseInt(release_id))

  return NextResponse.json(release, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
