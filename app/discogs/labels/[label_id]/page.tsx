import { Client } from 'disconnect'
import { NextPage } from 'next'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface Label {
  id: number
  name: string
  profile?: string
  contact_info?: string
  uri: string
  releases_url: string
  images?: Array<{
    uri: string
    height: number
    width: number
  }>
  urls?: string[]
}

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
        <Card className="w-full">
          <div className="grid gap-6 p-6 md:grid-cols-[300px_1fr]">
            {/* Label Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {label.images && label.images[0] ? (
                <img
                  src={label.images[0].uri}
                  alt={label.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>

            {/* Label Info */}
            <div>
              <h1 className="mb-4 text-3xl font-bold">{label.name}</h1>

              {label.profile && (
                <div className="mb-6">
                  <h2 className="mb-2 text-xl font-semibold">About</h2>
                  <p className="whitespace-pre-line">{label.profile}</p>
                </div>
              )}

              {label.contact_info && (
                <div className="mb-6">
                  <h2 className="mb-2 text-xl font-semibold">Contact Information</h2>
                  <p className="whitespace-pre-line">{label.contact_info}</p>
                </div>
              )}

              {label.urls && label.urls.length > 0 && (
                <div className="mb-6">
                  <h2 className="mb-2 text-xl font-semibold">Links</h2>
                  <div className="flex flex-wrap gap-2">
                    {label.urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {new URL(url).hostname}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <a
                  href={label.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Discogs
                </a>
              </div>
            </div>
          </div>
        </Card>
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
