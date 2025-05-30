import { BatchSavingMasterPageClient } from './BatchSavingMasterPageClient'

export default async function BatchSavingMasterPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids } = await searchParams

  return <BatchSavingMasterPageClient initialMasterIds={ids?.split(',') || []} />
}
