'use client'
import { useState, useRef } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { insertLog } from '@/app/actions/insertLog'
import type { Staff, Manual } from '@/types'

interface Props {
  staffs: Staff[]
  onSearchComplete?: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  'レジ・会計':  'rgba(201,145,58,0.7)',
  '仕込み・調理': 'rgba(120,105,50,0.8)',
  '提供・接客':  'rgba(120,50,50,0.8)',
  'ドリンク':    'rgba(42,74,106,0.85)',
  'その他':      'rgba(74,74,74,0.8)',
}

export default function ManualSearch({ staffs, onSearchComplete }: Props) {
  const [selectedStaff, setSelectedStaff] = useState('')
  const [keyword,       setKeyword]       = useState('')
  const [results,       setResults]       = useState<Manual[]>([])
  const [searched,      setSearched]      = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [openId,        setOpenId]        = useState<string | null>(null)

  // 二重送信防止フラグ（useRefで管理 → レンダーに影響しない）
  const isSubmitting = useRef(false)

  const canSearch = selectedStaff !== '' && keyword.trim() !== ''

  const handleSearch = async () => {
    // 既に処理中なら無視
    if (!canSearch || isSubmitting.current) return
    isSubmitting.current = true
    setLoading(true)
    setSearched(true)
    setOpenId(null)

    try {
      // ① マニュアル検索
      const { data: manualData, error: manualError } = await supabase
        .from('manuals')
        .select('*')
        .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%,category.ilike.%${keyword}%`)
        .order('created_at', { ascending: false })

      if (manualError) console.error('[ManualSearch] manuals error:', manualError)
      const found = manualData ?? []
      setResults(found)
      console.log('[ManualSearch] results:', found.length)

      // ② logsにinsert（1回だけ）
      const category = found[0]?.category ?? 'その他'
      const result = await insertLog(selectedStaff, keyword.trim(), category)

      if (!result.success) {
        console.error('[ManualSearch] insertLog failed:', result.error)
      } else {
        console.log('[ManualSearch] insertLog success:', result.id)
        window.dispatchEvent(new Event('kogi-search-done'))
        onSearchComplete?.()
      }
    } finally {
      setLoading(false)
      // 1秒後に再送信可能にする（連打防止）
      setTimeout(() => { isSubmitting.current = false }, 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div style={{
      background: 'rgba(18,16,12,0.85)',
      border: '1px solid rgba(212,168,67,0.18)',
      borderRadius: '24px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      overflow: 'hidden',
    }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexShrink: 0 }}>
        <Search size={15} color="#d4a843" strokeWidth={1.5} />
        <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', background: 'linear-gradient(135deg,#d4a843,#f5d376)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          マニュアル検索
        </span>
      </div>

      <div style={{ marginBottom: '16px', flexShrink: 0 }}>
        <label style={{ display: 'block', fontSize: '11px', marginBottom: '8px', color: 'rgba(240,232,216,0.55)', fontWeight: 500 }}>
          スタッフ名
        </label>
        <div style={{ position: 'relative' }}>
          <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
            <option value="">― 選択 ―</option>
            {staffs.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
              <path d="M1 1L6 6L11 1" stroke="#d4a843" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexShrink: 0 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} color="rgba(240,232,216,0.3)" strokeWidth={1.5}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="キーワードを入力"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!canSearch || loading}
          style={{
            padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
            fontFamily: 'Noto Sans JP, sans-serif', flexShrink: 0,
            cursor: (canSearch && !loading) ? 'pointer' : 'not-allowed',
            background: (canSearch && !loading) ? 'linear-gradient(135deg,#c9913a,#d4a843,#b8842e)' : 'rgba(212,168,67,0.12)',
            color: (canSearch && !loading) ? '#0d0b07' : 'rgba(240,232,216,0.3)',
            border: (canSearch && !loading) ? 'none' : '1px solid rgba(212,168,67,0.15)',
            boxShadow: (canSearch && !loading) ? '0 0 16px rgba(212,168,67,0.2)' : 'none',
          }}>
          {loading ? '検索中...' : '検索'}
        </button>
      </div>

      {!searched && (
        <p style={{ fontSize: '12px', color: '#d4a843', flexShrink: 0 }}>キーワードを入力して検索してください</p>
      )}
      {searched && !loading && results.length === 0 && (
        <p style={{ fontSize: '12px', color: 'rgba(240,232,216,0.3)', flexShrink: 0 }}>該当するマニュアルが見つかりませんでした</p>
      )}

      {results.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {results.map(manual => {
            const isOpen = openId === manual.id
            return (
              <div key={manual.id} style={{
                marginBottom: '8px', borderRadius: '12px',
                border: `1px solid ${isOpen ? 'rgba(212,168,67,0.35)' : 'rgba(212,168,67,0.12)'}`,
                background: isOpen ? 'rgba(212,168,67,0.06)' : 'rgba(255,255,255,0.03)',
              }}>
                <button onClick={() => setOpenId(isOpen ? null : manual.id)} style={{
                  width: '100%', textAlign: 'left', padding: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '8px', background: 'none', border: 'none', cursor: 'pointer',
                }}>
                  <span style={{ color: '#f0e8d8', fontSize: '13px', fontWeight: 500, lineHeight: 1.4, flex: 1, fontFamily: 'Noto Sans JP, sans-serif' }}>
                    {manual.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '6px',
                      background: CATEGORY_COLORS[manual.category] ?? 'rgba(74,74,74,0.8)', color: '#f0e8d8',
                    }}>{manual.category}</span>
                    {isOpen ? <ChevronUp size={14} color="#d4a843" strokeWidth={2}/> : <ChevronDown size={14} color="#d4a843" strokeWidth={2}/>}
                  </div>
                </button>
                {isOpen && (
                  <div style={{ padding: '12px 14px 14px', borderTop: '1px solid rgba(212,168,67,0.15)' }}>
                    <p style={{ color: 'rgba(240,232,216,0.75)', fontSize: '12px', lineHeight: 1.9, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'Noto Sans JP, sans-serif' }}>
                      {manual.content}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
