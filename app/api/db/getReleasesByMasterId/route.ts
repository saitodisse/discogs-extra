'use server'

import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams
  const masterId = searchParams.get('masterId')

  if (!masterId) {
    return NextResponse.json({ error: 'Master ID is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .eq('master_id', parseInt(masterId))
    .single()

  if (error) {
    console.error(error.code + ' ' + error.message)
    return NextResponse.json({ error: 'Error fetching release' }, { status: 500 })
  }

  return NextResponse.json(data)
}
