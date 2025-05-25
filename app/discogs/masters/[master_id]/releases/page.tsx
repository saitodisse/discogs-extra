import { Client } from 'disconnect'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface PageProps {
  params: Promise<{
    master_id: string
  }>
}

interface DiscogsVersion {
  id: number
  title: string
  major_formats: string[]
  format: string[]
  label: string[] | Array<{ name: string }>
  released: string
  status: string
  thumb: string
  country: string
  year?: number
  catno?: string
}

interface DiscogsResponse {
  pagination: {
    page: number
    pages: number
    items: number
    per_page: number
  }
  versions: DiscogsVersion[]
}

export default async function ReleasesPage({ params }: PageProps) {
  const { master_id } = await params
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
    const master = await client.database().getMaster(parseInt(master_id))
    const releases = await client.database().getMasterVersions(parseInt(master_id))

    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{master.title} - Releases</h1>
          <Link href={`/discogs/masters/${master_id}`} className="text-blue-600 hover:underline">
            ← Back to Master
          </Link>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Catalog #</TableHead>
                <TableHead>Format</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {' '}
              {(releases as unknown as DiscogsResponse).versions.map((release: DiscogsVersion) => (
                <TableRow key={release.id}>
                  <TableCell>
                    <Link
                      href={`/discogs/releases/${release.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {release.title}
                    </Link>
                  </TableCell>
                  <TableCell>{release.year || '-'}</TableCell>
                  <TableCell>{release.country || '-'}</TableCell>{' '}
                  <TableCell>
                    {release.label ? (
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(release.label) &&
                          release.label.map((label: any, index: number) => (
                            <Badge key={index} variant="outline">
                              {typeof label === 'string' ? label : label.name || ''}
                            </Badge>
                          ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{release.catno || '-'}</TableCell>
                  <TableCell>
                    {release.format ? (
                      <div className="flex flex-wrap gap-1">
                        {release.format.map((format: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error fetching releases:', error)
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Error</h1>
        <p>There was an error fetching the releases information. Please try again later.</p>
        <Link href={`/discogs/masters/${master_id}`} className="text-blue-600 hover:underline">
          Back to Master
        </Link>
      </div>
    )
  }
}
