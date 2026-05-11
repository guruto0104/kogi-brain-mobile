'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import TodayCountCard from '@/components/TodayCountCard'
import StaffUsageCard from '@/components/StaffUsageCard'
import CategoryCard from '@/components/CategoryCard'
import ManualSearch from '@/components/ManualSearch'
import RecentLogsCard from '@/components/RecentLogsCard'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import type { StaffUsage, CategoryUsage, Staff } from '@/types'

/**
 * JST の「今日 00:00:00」を UTC の ISO 文字列で返す
 *
 * 現在時刻が JST 2026-05-11 02:36 の場合:
 *   → JST 今日の開始 = 2026-05-11 00:00 JST
 *   → UTC に変換    = 2026-05-10 15:00 UTC
 *   → この値以降のデータが「今日」
 */
function getJSTTodayStartUTC(): string {
  const now = new Date()
  // UTC時刻にJSTオフセット(+9h)を足してJSTの「今」を得る
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  // JSTの年月日だけ取り出して「JST 00:00:00」を作る
  const jstMidnight = new Date(Date.UTC(
    jstNow.getUTCFullYear(),
    jstNow.getUTCMonth(),
    jstNow.getUTCDate(),
    0, 0, 0, 0
  ))
  // JST 00:00 → UTC は -9h
  const utcStart = new Date(jstMidnight.getTime() - 9 * 60 * 60 * 1000)
  console.log('[getJSTTodayStartUTC]', {
    jstNow: jstNow.toISOString(),
    jstMidnight: jstMidnight.toISOString(),
    utcStart: utcStart.toISOString(),
  })
  return utcStart.toISOString()
}

export default function HomePage() {
  const [todayCount,     setTodayCount]     = useState(0)
  const [staffCounts,    setStaffCounts]    = useState<StaffUsage[]>([])
  const [categoryCounts, setCategoryCounts] = useState<CategoryUsage[]>([])
  const [hourlyData,     setHourlyData]     = useState<{ hour: number; count: number }[]>([])
  const [staffs,         setStaffs]         = useState<Staff[]>([])
  const [loading,        setLoading]        = useState(true)

  const fetchTodayStats = useCallback(async () => {
    const todayStartUTC = getJSTTodayStartUTC()

    const { data, error } = await supabase
      .from('logs')
      .select('staff_name, category, created_at')
      .gte('created_at', todayStartUTC)

    if (error) { console.error('[fetchTodayStats] error:', error); return }
    const logs = data ?? []
    console.log('[fetchTodayStats] today count:', logs.length)
    setTodayCount(logs.length)

    // スタッフ別
    const staffMap: Record<string, number> = {}
    for (const r of logs) {
      const n = r.staff_name ?? '不明'
      staffMap[n] = (staffMap[n] ?? 0) + 1
    }
    setStaffCounts(
      Object.entries(staffMap)
        .map(([staff_name, count]) => ({ staff_name, count }))
        .sort((a, b) => b.count - a.count).slice(0, 5)
    )

    // カテゴリ別
    const catMap: Record<string, number> = {}
    for (const r of logs) {
      const c = r.category ?? 'その他'
      catMap[c] = (catMap[c] ?? 0) + 1
    }
    const total = Object.values(catMap).reduce((a, b) => a + b, 0)
    setCategoryCounts(
      Object.entries(catMap)
        .map(([category, count]) => ({
          category, count,
          percentage: total > 0 ? Math.round(count / total * 1000) / 10 : 0
        }))
        .sort((a, b) => b.count - a.count)
    )

    // 時間別（JST換算 0〜23時）
    const hourMap: Record<number, number> = {}
    for (let h = 0; h <= 23; h++) hourMap[h] = 0
    for (const r of logs) {
      const jstH = (new Date(r.created_at).getUTCHours() + 9) % 24
      hourMap[jstH] = (hourMap[jstH] ?? 0) + 1
    }
    setHourlyData(
      Object.entries(hourMap)
        .map(([h, c]) => ({ hour: Number(h), count: c }))
        .sort((a, b) => a.hour - b.hour)
    )
  }, [])

  const fetchStaffs = useCallback(async () => {
    const { data, error } = await supabase
      .from('staffs').select('id, name, is_active, created_at')
      .eq('is_active', true).order('name')
    if (error) { console.error('[fetchStaffs] error:', error); return }
    setStaffs(data ?? [])
  }, [])

  const fetchTodayStatsRef = useRef(fetchTodayStats)
  useEffect(() => { fetchTodayStatsRef.current = fetchTodayStats }, [fetchTodayStats])

  const handleSearchComplete = useCallback(() => {
    fetchTodayStatsRef.current()
    setTimeout(() => fetchTodayStatsRef.current(), 1000)
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchTodayStats(), fetchStaffs()])
      setLoading(false)
    }
    init()
    const timer = setInterval(() => fetchTodayStatsRef.current(), 30_000)
    return () => clearInterval(timer)
  }, [fetchTodayStats, fetchStaffs])

  const staffTotal = staffCounts.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, #d4a843 0%, transparent 70%)', opacity: 0.03 }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, #d4a843 0%, transparent 70%)', opacity: 0.025 }} />
      </div>
      <div className="relative flex w-full" style={{ zIndex: 1 }}>
        <Sidebar />
        {loading ? (
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <CardSkeleton /><CardSkeleton /><CardSkeleton />
            </div>
            <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1.6fr' }}>
              <CardSkeleton /><CardSkeleton />
            </div>
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <TodayCountCard count={todayCount}     hourlyData={hourlyData} />
              <StaffUsageCard data={staffCounts}     total={staffTotal} />
              <CategoryCard   data={categoryCounts} />
            </div>
            <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1.6fr' }}>
              <ManualSearch staffs={staffs} onSearchComplete={handleSearchComplete} />
              <RecentLogsCard />
            </div>
          </main>
        )}
      </div>
    </div>
  )
}
