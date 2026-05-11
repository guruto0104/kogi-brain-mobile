import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  console.log('[staffs] GET called')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[staffs] env vars missing')
    return NextResponse.json([], { status: 200 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase
    .from('staffs')
    .select('id, name, is_active, created_at')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('[staffs] error:', error)
    return NextResponse.json([], { status: 200 })
  }

  console.log('[staffs] count:', data?.length ?? 0, data?.map(s => s.name))
  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 'no-store' },
  })
}
