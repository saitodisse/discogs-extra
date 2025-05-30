'use server'

import { createClient } from '@/utils/supabase/server'
import { MasterRelease } from 'disconnect'
import { v4 as uuid } from 'uuid'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  const { master } = body as { master: MasterRelease }

  if (!master) {
    return NextResponse.json({ error: 'Master release data is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .eq('master_id', master.id)
    .single()

  if (error && error?.code !== 'PGRST116') {
    return NextResponse.json(
      {
        error:
          'Error fetching release by master ID:' +
          JSON.stringify(error) +
          ' data: ' +
          JSON.stringify(data),
      },
      { status: 500 }
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'User must be authenticated to save a master' },
      { status: 401 }
    )
  }

  let is_first_save = false
  if (!data) {
    // set is_on_master to true for all tracks
    master.tracklist = master.tracklist.map((track) => ({
      ...track,
      is_on_master: true,
      extra_track: false,
    }))

    return NextResponse.json({
      data: {
        id: uuid(),
        owner_id: user.id,
        owner_email: user.email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        master_id: master.id,
        releases_ids: master?.main_release ? [master.main_release] : [],
        artists_id: master.artists.map((artist) => artist.id),
        artists_name: master.artists.map((artist) => artist.name),
        title: master.title,
        data_quality: master.data_quality,
        year_of_release: master.year,
        companies_json: [],
        extraartists_json: [],
        formats_json: [],
        genres: master.genres || [],
        styles: master.styles || [],
        identifiers_json: [],
        images_json: master.images || [],
        series_json: [],
        videos_json: master.videos || [],
        tracklist_json: master.tracklist || [],
      },
      is_first_save: true,
    })
  }

  return NextResponse.json({
    is_first_save,
    data,
  })
}
