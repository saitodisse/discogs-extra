// /masters/[master_id]/json
import { ReleaseDb } from '@/types/ReleaseDb'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ master_id: string }> }
) {
  const { master_id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div className="container mx-auto p-4">You must be signed in to view this page.</div>
  }
  const releaseResult = await supabase
    .from('releases')
    .select('*')
    .eq('master_id', master_id)
    .single()
  const master: ReleaseDb = releaseResult.data

  return Response.json(master, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
