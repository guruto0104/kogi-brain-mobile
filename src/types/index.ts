export interface Staff {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export interface Manual {
  id: string
  title: string
  content: string
  category: string
  created_at: string
}

export interface Log {
  id: string
  staff_name: string
  question: string
  category: string
  created_at: string
}

export interface StaffUsage {
  staff_name: string
  count: number
}

export interface CategoryUsage {
  category: string
  count: number
  percentage: number
}

export type Category = 'レジ・会計' | '仕込み・調理' | '提供・接客' | 'ドリンク' | 'その他'

export const CATEGORY_COLORS: Record<string, string> = {
  'レジ・会計': '#c9913a',
  '仕込み・調理': '#8b7a3a',
  '提供・接客': '#7a3a3a',
  'ドリンク': '#3a5a7a',
  'その他': '#4a4a4a',
}

export const CATEGORY_DOT_COLORS: Record<string, string> = {
  'レジ・会計': '#d4a843',
  '仕込み・調理': '#f5d376',
  '提供・接客': '#c0392b',
  'ドリンク': '#2980b9',
  'その他': '#7f8c8d',
}
