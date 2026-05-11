import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  console.log('[analytics] GET called')

  // ── Supabase接続 ──────────────────────────────────────────
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[analytics] env vars missing', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey })
    return NextResponse.json({ error: 'env vars missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // ── 今日の範囲（UTC当日 00:00:00 〜 翌日 00:00:00）────────
  // サーバーはUTCで動作。SupabaseもUTC保存。
  // JST 2026-05-11 = UTC 2026-05-10 15:00 〜 2026-05-11 15:00
  // → シンプルにUTC当日 or 前後24hで取る
  const now = new Date()
  // UTC今日の 00:00:00
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  // UTC明日の 00:00:00
  const tomorrowUTC = new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000)

  console.log('[analytics] today range:', todayUTC.toISOString(), '〜', tomorrowUTC.toISOString())

  // ── 今日のログ全件取得 ────────────────────────────────────
  const { data: todayLogs, error: todayError } = await supabase
    .from('logs')
    .select('id, staff_name, question, category, created_at')
    .gte('created_at', todayUTC.toISOString())
    .lt('created_at', tomorrowUTC.toISOString())
    .order('created_at', { ascending: false })

  if (todayError) {
    console.error('[analytics] todayLogs error:', todayError)
    return NextResponse.json({ error: todayError.message }, { status: 500 })
  }

  console.log('[analytics] todayLogs count:', todayLogs?.length ?? 0)

  const logs = todayLogs ?? []

  // ── 今日の質問数 ──────────────────────────────────────────
  const todayCount = logs.length
  console.log('[analytics] todayCount:', todayCount)

  // ── スタッフ別件数（上位5名）─────────────────────────────
  const staffMap: Record<string, number> = {}
  for (const row of logs) {
    const name = row.staff_name ?? '不明'
    staffMap[name] = (staffMap[name] ?? 0) + 1
  }
  const staffCounts = Object.entries(staffMap)
    .map(([staff_name, count]) => ({ staff_name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  console.log('[analytics] staffCounts:', staffCounts)

  // ── カテゴリ別件数 ────────────────────────────────────────
  const categoryMap: Record<string, number> = {}
  for (const row of logs) {
    const cat = row.category ?? 'その他'
    categoryMap[cat] = (categoryMap[cat] ?? 0) + 1
  }
  const total = Object.values(categoryMap).reduce((a, b) => a + b, 0)
  const categoryCounts = Object.entries(categoryMap)
    .map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)
  console.log('[analytics] categoryCounts:', categoryCounts)

  // ── 時間別件数（折れ線グラフ用・JST時間）────────────────
  const hourMap: Record<number, number> = {}
  for (let h = 8; h <= 23; h++) hourMap[h] = 0
  for (const row of logs) {
    const utcDate = new Date(row.created_at)
    const jstHour = (utcDate.getUTCHours() + 9) % 24
    hourMap[jstHour] = (hourMap[jstHour] ?? 0) + 1
  }
  const hourlyData = Object.entries(hourMap)
    .map(([hour, count]) => ({ hour: Number(hour), count }))
    .sort((a, b) => a.hour - b.hour)

  // ── 最新ログ8件（全期間）─────────────────────────────────
  const { data: recentData, error: recentError } = await supabase
    .from('logs')
    .select('id, staff_name, question, category, created_at')
    .order('created_at', { ascending: false })
    .limit(8)

  if (recentError) {
    console.error('[analytics] recentLogs error:', recentError)
  }
  const recentLogs = recentData ?? []
  console.log('[analytics] recentLogs count:', recentLogs.length)

  return NextResponse.json(
    { todayCount, staffCounts, categoryCounts, hourlyData, recentLogs },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  )
}
