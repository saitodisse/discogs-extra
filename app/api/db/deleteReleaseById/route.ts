'use server'

import { createClient } from '@/utils/supabase/server'
import { NextRequest } from 'next/server'

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const releaseId = searchParams.get('releaseId')

  if (!releaseId) {
    return Response.json({ error: 'Release ID is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from('releases').delete().eq('id', releaseId)

  if (error) {
    console.error(error.code + ' ' + error.message)
    return Response.json({ error: 'Error deleting release: ' + error.message }, { status: 500 })
  }

  return Response.json({ message: 'Release deleted successfully' })
}
