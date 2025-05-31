import { createClient } from '@/utils/supabase/server'
import { MastersClient } from './MastersClient'
import type { ReleaseDb } from '@/types/ReleaseDb'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface PageProps {
  params: Promise<{ master_id: string }>
  searchParams: Promise<{ [key: string]: string }>
}

export default async function MastersPage({ params, searchParams }: PageProps) {
  const { page: pageStr, view: viewParam } = await searchParams
  const page = pageStr ? parseInt(pageStr) : 1
  const view = viewParam === 'grid' ? 'grid' : 'list'

  // Get the masters releases from supabase
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div className="container mx-auto p-4">You must be signed in to view this page.</div>
  }

  const releasesResult = await supabase.from('releases').select('*')
  const releases: ReleaseDb[] = releasesResult.data || []

  return (
    <div className="container mx-auto">
      <div className="text-muted-foreground">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Masters</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <MastersClient releases={releases} initialView={view} />
    </div>
  )
}
