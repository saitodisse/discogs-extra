'use server'

import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const releaseId = searchParams.get('releaseId')

  if (!releaseId) {
    return NextResponse.json({ error: 'Release ID is required' }, { status: 400 })
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Failed to create Supabase client' }, { status: 500 })
  }

  // Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'User must be authenticated to save a master' },
      { status: 401 }
    )
  }

  // check if owner_id matches the user id
  const { data: release, error: fetchError } = await supabase
    .from('releases')
    .select('owner_id')
    .eq('id', releaseId)
    .single()

  if (fetchError) {
    console.error(fetchError.code + ' ' + fetchError.message)
    return NextResponse.json(
      { error: 'Error fetching release: ' + fetchError.message },
      { status: 500 }
    )
  }

  if (release.owner_id !== user.id) {
    return NextResponse.json({ error: 'User is not the owner of this release' }, { status: 403 })
  }

  const { error } = await supabase.from('releases').delete().eq('id', releaseId)

  if (error) {
    console.error(error.code + ' ' + error.message)
    return NextResponse.json({ error: 'Error deleting release: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Release deleted successfully' })
}
