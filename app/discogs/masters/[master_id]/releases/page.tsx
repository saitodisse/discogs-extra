import { Client } from 'disconnect'
import { ReleasesClient } from './ReleasesClient'
import 'server-only'
import { BreadcrumbDiscogs } from '@/app/discogs/BreadcrumbDiscogs'

interface PageProps {
  params: Promise<{ master_id: string }>
  searchParams: Promise<{ [key: string]: string }>
}

async function getDiscogsData(masterId: string, page: number) {
  if (!process.env.DISCOGS_CONSUMER_KEY || !process.env.DISCOGS_CONSUMER_SECRET) {
    return {
      error: 'Missing required API credentials. Please check your environment variables.',
      master: null,
      releases: null,
    }
  }
  try {
    const client = new Client({
      method: 'discogs',
      consumerKey: process.env.DISCOGS_CONSUMER_KEY,
      consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
    })
    const [master, releases] = await Promise.all([
      client.database().getMaster(parseInt(masterId)),
      client.database().getMasterVersions(parseInt(masterId), { page: page ?? 1, per_page: 25 }),
    ])
    return { master, releases, error: null }
  } catch (e) {
    return {
      error: 'There was an error fetching the releases information. Please try again later.',
      master: null,
      releases: null,
    }
  }
}

export default async function ReleasesPage({ params, searchParams }: PageProps) {
  const { master_id: masterId } = await params
  const { page: pageStr, view: viewParam } = await searchParams
  const page = pageStr ? parseInt(pageStr) : 1
  const view = viewParam === 'grid' ? 'grid' : 'list'
  const { master, releases, error } = await getDiscogsData(masterId, page)

  // convert releases to the expected format
  if (releases && releases.versions) {
    releases.versions = releases.versions.map((version: any) => ({
      ...version,
      thumb: version.thumb || '',
      format: version.format || [],
      label: version.label || [],
      year: version.year ? parseInt(version.year) : undefined,
    }))
  }

  return (
    <>
      {' '}
      {master && (
        <BreadcrumbDiscogs
          entity={{
            type: 'master',
            data: master,
          }}
          showReleases={true}
        />
      )}
      <ReleasesClient
        masterId={masterId}
        master={master!}
        releases={releases ?? undefined}
        error={error}
        initialView={view}
        initialPage={page}
      />
    </>
  )
}
