import { Client } from 'disconnect'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ master_id: string }> }
) {
  const { master_id } = await params // Await context.params to access the slug

  const client = new Client({
    method: 'discogs',
    consumerKey: process.env.DISCOGS_CONSUMER_KEY,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  })

  const release = await client.database().getRelease(parseInt(master_id))

  return Response.json(release, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
