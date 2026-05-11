'use client'

import { useEffect, useState, useCallback } from 'react'
import { LayoutList } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// ── 型 ───────────────────────────────────────────────────
interface Log {
  id: string
  staff_name: string
  question: string
  category: string
  created_at: string
}

// ── カテゴリbadge色 ───────────────────────────────────────
const BADGE: Record<string, { bg: string; color: string }> = {
  'レジ・会計':  { bg: '#b8860b',              color: '#fff8e1' },
  '仕込み・調理': { bg: '#8b4513',              color: '#fff3e0' },
  '提供・接客':  { bg: '#8b1a1a',              color: '#ffeaea' },
  'ドリンク':    { bg: '#1a3a6b',              color: '#e3f2fd' },
  'その他':      { bg: '#3a3a3a',              color: '#f5f5f5' },
}

// ── JST表示（DBはtimestamp without timezoneでJST値保存）──
function toHHmm(str: string): string {
  // "2026-05-11 14:30:00" → "14:30"
  const t = str.replace('T', ' ')
  const parts = t.split(' ')
  if (parts.length < 2) return '--:--'
  const timePart = parts[1].slice(0, 5)
  return timePart
}

// ── Supabaseクライアント（シングルトン）──────────────────
function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ── コンポーネント ────────────────────────────────────────
export default function RecentLogsCard() {
  const [logs,    setLogs]    = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      const supabase = getClient()
      const { data, error } = await supabase
        .from('logs')
        .select('id, staff_name, question, category, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('[RecentLogsCard] error:', error.message)
        return
      }
      console.log('[RecentLogsCard] fetched:', data?.length, 'rows')
      setLogs(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // 初回取得
    fetchLogs()

    // 5秒ごとにポーリング
    const timer = setInterval(fetchLogs, 5_000)
    return () => clearInterval(timer)
  }, [fetchLogs])

  // ManualSearchからinsert完了イベントを受け取り即時更新
  useEffect(() => {
    const onDone = () => {
      console.log('[RecentLogsCard] kogi-search-done → reload')
      setTimeout(fetchLogs, 500)
    }
    window.addEventListener('kogi-search-done', onDone)
    return () => window.removeEventListener('kogi-search-done', onDone)
  }, [fetchLogs])

  return (
    <div
      className="glass-card rounded-3xl p-6 flex flex-col relative overflow-hidden h-full"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)' }}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-5" style={{ flexShrink: 0 }}>
        <LayoutList size={15} style={{ color: '#d4a843' }} strokeWidth={1.5} />
        <span className="text-xs font-medium tracking-widest gold-text">最新ログ</span>
      </div>

      {/* テーブルヘッダー */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '52px 72px 96px 1fr',
        gap: '12px',
        paddingBottom: '10px',
        marginBottom: '4px',
        borderBottom: '1px solid rgba(212,168,67,0.12)',
        flexShrink: 0,
      }}>
        {['時間', 'スタッフ名', 'カテゴリ', '質問内容'].map(h => (
          <span key={h} style={{ fontSize: '10px', fontWeight: 500, color: 'rgba(240,232,216,0.3)', letterSpacing: '0.05em' }}>
            {h}
          </span>
        ))}
      </div>

      {/* ── ローディング ── */}
      {loading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: '16px', borderRadius: '6px', background: 'rgba(212,168,67,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }}/>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && logs.length === 0 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '12px', color: 'rgba(240,232,216,0.3)' }}>まだログがありません</p>
        </div>
      )}

      {/* ── ログ行 ── */}
      {!loading && logs.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
          {logs.map((log, i) => {
            const badge = BADGE[log.category] ?? BADGE['その他']
            return (
              <div
                key={log.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '52px 72px 96px 1fr',
                  gap: '12px',
                  padding: '11px 0',
                  alignItems: 'center',
                  borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  minWidth: '400px', // スマホ横スクロール対応
                }}
              >
                {/* 時間 */}
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(240,232,216,0.6)', letterSpacing: '0.05em' }}>
                  {toHHmm(log.created_at)}
                </span>

                {/* スタッフ名 */}
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#f0e8d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.staff_name}
                </span>

                {/* カテゴリbadge */}
                <div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: '6px',
                    background: badge.bg,
                    color: badge.color,
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.03em',
                    boxShadow: `0 0 8px ${badge.bg}66`,
                  }}>
                    {log.category}
                  </span>
                </div>

                {/* 質問内容 */}
                <span style={{ fontSize: '12px', color: 'rgba(240,232,216,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.question}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
