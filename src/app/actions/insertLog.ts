'use server'

import { createClient } from '@supabase/supabase-js'

export async function insertLog(
  staff_name: string,
  question: string,
  category: string
): Promise<{ success: boolean; error?: string }> {

  if (!staff_name || !question) {
    return { success: false, error: '必須項目が不足しています' }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // created_atはDBのDEFAULT(now() AT TIME ZONE 'Asia/Tokyo')に任せる
  const { error } = await supabase
    .from('logs')
    .insert({ staff_name, question, category: category || 'その他' })

  if (error) {
    console.error('[insertLog] FAILED:', error.message)
    return { success: false, error: error.message }
  }

  console.log('[insertLog] SUCCESS:', { staff_name, question, category })
  return { success: true }
}
