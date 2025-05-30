// /masters/[master_id]/json
import { ReleaseDb } from '@/types/ReleaseDb'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ master_id: string }> }
): Promise<NextResponse> {
  const { master_id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const releaseResult = await supabase
    .from('releases')
    .select('*')
    .eq('master_id', master_id)
    .single()
  const master: ReleaseDb = releaseResult.data

  return NextResponse.json(master, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
