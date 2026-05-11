import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const body = await request.json()
  const { staff_name, question, category } = body

  console.log('[/api/logs] POST received:', { staff_name, question, category })

  if (!staff_name || !question) {
    return NextResponse.json({ error: 'staff_name と question は必須' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('logs')
    .insert({ staff_name, question, category: category ?? 'その他' })
    .select()
    .single()

  if (error) {
    console.error('[/api/logs] insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[/api/logs] insert success:', data)
  return NextResponse.json(data, { status: 201 })
}
