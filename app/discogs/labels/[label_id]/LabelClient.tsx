'use client'

import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface Label {
  id: number
  name: string
  profile?: string
  contact_info?: string
  uri: string
  resource_url?: string
  releases_url?: string
  images?: Array<{
    uri: string
    height: number
    width: number
    resource_url?: string
  }>
  data_quality?: string
  urls?: string[]
  sublabels?: Array<{
    id: number
    name: string
    resource_url?: string
  }>
  parent_label?: {
    id: number
    name: string
    resource_url?: string
  }
}

interface LabelClientProps {
  label: Label
}

export function LabelClient({ label }: LabelClientProps) {
  return (
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
  )
}
