import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type Staff = {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export type Manual = {
  id: string
  title: string
  content: string
  memo?: string | null
  category?: string | null
  tags?: string[] | null
  created_at: string
  updated_at: string
}

export type Log = {
  id: string
  staff_name: string
  question: string
  answer?: string | null
  category?: string | null
  created_at: string
}
