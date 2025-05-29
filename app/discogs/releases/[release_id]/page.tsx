import { Client } from 'disconnect'
import Link from 'next/link'
import { BreadcrumbDiscogs } from '../../BreadcrumbDiscogs'
import { ReleaseClient } from './ReleaseClient'

export default async function ReleasePage({ params }: { params: Promise<{ release_id: string }> }) {
  const { release_id } = await params

  if (!process.env.DISCOGS_CONSUMER_KEY || !process.env.DISCOGS_CONSUMER_SECRET) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Error</h1>
        <p>Missing required API credentials. Please check your environment variables.</p>
      </div>
    )
  }

  const client = new Client({
    method: 'discogs',
    consumerKey: process.env.DISCOGS_CONSUMER_KEY,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  })

  try {
    const release = await client.database().getRelease(parseInt(release_id))

    return (
      <div className="container mx-auto px-4">
        <BreadcrumbDiscogs
          entity={{
            type: 'release',
            data: release,
          }}
        />

        <ReleaseClient release={release} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching release:', error)
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Error</h1>
        <p>There was an error fetching the release information. Please try again later.</p>
        <Link href="/discogs" className="text-blue-600 hover:underline">
          Back to search
        </Link>
      </div>
    )
  }
}
