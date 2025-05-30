'use server'

import { createClient } from '@/utils/supabase/server'
import { ReleaseDb } from '@/types/ReleaseDb'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  const { master, is_first_save = false } = body as {
    master?: ReleaseDb
    is_first_save?: boolean
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'User must be authenticated to save a master' },
      { status: 401 }
    )
  }

  if (!master) {
    return NextResponse.json({ error: 'Master release data is required' }, { status: 400 })
  }

  // add is_on_master field to each track
  if (master.tracklist_json && is_first_save) {
    master.tracklist_json = master.tracklist_json.map((track) => ({
      ...track,
      is_on_master: true,
      extra_track: false,
    }))
  }

  const { error } = await supabase.from('releases').upsert(master, { onConflict: 'id' })

  if (error) {
    console.error(error.code + ' ' + error.message)
    return NextResponse.json(
      {
        error: 'Failed to save master release: ' + error.message,
        status: 'error',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    message: 'Master saved successfully!',
    status: 'success',
  })
}
