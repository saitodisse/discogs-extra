import { Client } from 'disconnect'
import { NextRequest, NextResponse } from 'next/server'

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

  const master = await client.database().getMaster(parseInt(master_id))

  return NextResponse.json(master, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
