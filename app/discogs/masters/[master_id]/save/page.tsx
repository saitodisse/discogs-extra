import { Client } from 'disconnect'
import { SavingProgress } from './SavingProgress'
import { BreadcrumbDiscogs } from '@/app/discogs/BreadcrumbDiscogs'

export default async function SaveMasterPage({
  params,
}: {
  params: Promise<{ master_id: string }>
}) {
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

  const master = await client.database().getMaster(parseInt(master_id))

  // const releasesFromMaster = await client
  //   .database()
  //   .getMasterVersions(parseInt(master_id), { page: 1, per_page: 25 })

  return (
    <div className="container mx-auto p-4">
      <BreadcrumbDiscogs
        entity={{
          type: 'master',
          data: master,
        }}
      />
      <SavingProgress master={master} />
    </div>
  )
}
