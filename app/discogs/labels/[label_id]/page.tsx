import { Client } from 'disconnect'
import Link from 'next/link'
import { BreadcrumbDiscogs } from '../../BreadcrumbDiscogs'
import { LabelClient } from './LabelClient'

export default async function LabelPage({ params }: { params: Promise<{ label_id: string }> }) {
  const { label_id } = await params

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
    const label = await client.database().getLabel(parseInt(label_id))

    return (
      <div className="container mx-auto p-4">
        <BreadcrumbDiscogs
          entity={{
            type: 'label',
            data: label,
          }}
        />
        <LabelClient label={label} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching label:', error)
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Error</h1>
        <p>There was an error fetching the label information. Please try again later.</p>
        <Link href="/discogs" className="text-blue-600 hover:underline">
          Back to search
        </Link>
      </div>
    )
  }
}
