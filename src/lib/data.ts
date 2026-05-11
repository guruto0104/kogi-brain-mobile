import { supabase } from './supabase'
import type { Log, Staff, Manual, StaffUsage, CategoryUsage } from '@/types'

// 今日の開始時刻（JST 0:00 を UTC に変換）
function getTodayStart(): string {
  const now = new Date()
  const jstOffset = 9 * 60 * 60 * 1000
  const jstNow = new Date(now.getTime() + jstOffset)
  const jstMidnight = new Date(
    Date.UTC(jstNow.getUTCFullYear(), jstNow.getUTCMonth(), jstNow.getUTCDate())
  )
  return new Date(jstMidnight.getTime() - jstOffset).toISOString()
}

export async function getTodayLogs(): Promise<Log[]> {
  const todayStart = getTodayStart()
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .gte('created_at', todayStart)
    .order('created_at', { ascending: false })
  if (error) { console.error('getTodayLogs error:', error); return [] }
  return data ?? []
}

export async function getRecentLogs(limit = 8): Promise<Log[]> {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('getRecentLogs error:', error); return [] }
  return data ?? []
}

export async function getStaffUsage(): Promise<StaffUsage[]> {
  const todayStart = getTodayStart()
  const { data, error } = await supabase
    .from('logs')
    .select('staff_name')
    .gte('created_at', todayStart)
  if (error) { console.error('getStaffUsage error:', error); return [] }

  const countMap: Record<string, number> = {}
  for (const row of data ?? []) {
    countMap[row.staff_name] = (countMap[row.staff_name] ?? 0) + 1
  }
  return Object.entries(countMap)
    .map(([staff_name, count]) => ({ staff_name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

export async function getCategoryUsage(): Promise<CategoryUsage[]> {
  const todayStart = getTodayStart()
  const { data, error } = await supabase
    .from('logs')
    .select('category')
    .gte('created_at', todayStart)
  if (error) { console.error('getCategoryUsage error:', error); return [] }

  const countMap: Record<string, number> = {}
  for (const row of data ?? []) {
    const cat = row.category ?? 'その他'
    countMap[cat] = (countMap[cat] ?? 0) + 1
  }
  const total = Object.values(countMap).reduce((a, b) => a + b, 0)
  return Object.entries(countMap)
    .map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export async function getHourlyData(): Promise<{ hour: number; count: number }[]> {
  const todayStart = getTodayStart()
  const { data, error } = await supabase
    .from('logs')
    .select('created_at')
    .gte('created_at', todayStart)
  if (error) { console.error('getHourlyData error:', error); return [] }

  const hourMap: Record<number, number> = {}
  for (let h = 8; h <= 23; h++) hourMap[h] = 0

  for (const row of data ?? []) {
    const utcDate = new Date(row.created_at)
    const jstHour = (utcDate.getUTCHours() + 9) % 24
    if (jstHour >= 8) {
      hourMap[jstHour] = (hourMap[jstHour] ?? 0) + 1
    }
  }

  return Object.entries(hourMap)
    .map(([hour, count]) => ({ hour: Number(hour), count }))
    .sort((a, b) => a.hour - b.hour)
}

export async function getActiveStaffs(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from('staffs')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) { console.error('getActiveStaffs error:', error); return [] }
  return data ?? []
}

export async function searchManuals(keyword: string): Promise<Manual[]> {
  const { data, error } = await supabase
    .from('manuals')
    .select('*')
    .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)
    .order('created_at', { ascending: false })
  if (error) { console.error('searchManuals error:', error); return [] }
  return data ?? []
}
