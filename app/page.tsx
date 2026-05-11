'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, type Staff, type Manual } from '@/lib/supabase'
import {
  User,
  Search,
  ChevronDown,
  FileText,
  AlignLeft,
  AlignJustify,
  Lock,
  Star,
  Inbox,
  Shield,
  Loader2,
  Brain,
} from 'lucide-react'

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-9 h-9 rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-4/5" />
      </div>
    </div>
  )
}

// ─── Manual Result Card ───────────────────────────────────────────────────────
function ManualCard({ manual, index }: { manual: Manual; index: number }) {
  return (
    <div
      className="glass-card result-card-glow rounded-3xl overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(180,130,30,0.3) 0%, rgba(212,168,67,0.15) 100%)',
                border: '1px solid rgba(212,168,67,0.25)',
              }}>
              <FileText size={16} style={{ color: '#D4A843' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[15px] leading-tight truncate"
                style={{ color: '#F5F0E8' }}>
                {manual.title}
              </h3>
              {manual.category && (
                <div className="mt-1.5">
                  <span className="gold-badge text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {manual.category}
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Star */}
          <button className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'rgba(212,168,67,0.4)' }}
            aria-label="お気に入り">
            <Star size={16} />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="gold-divider mx-5" />

      {/* Content */}
      <div className="px-5 py-4 space-y-4">
        {/* Body */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlignLeft size={12} style={{ color: '#D4A843' }} />
            <span className="text-[11px] font-semibold tracking-wider uppercase"
              style={{ color: '#D4A843' }}>
              本文
            </span>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(245,240,232,0.8)' }}>
            {manual.content}
          </p>
        </div>

        {/* Memo */}
        {manual.memo && (
          <>
            <div className="gold-divider" />
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlignJustify size={12} style={{ color: '#D4A843' }} />
                <span className="text-[11px] font-semibold tracking-wider uppercase"
                  style={{ color: '#D4A843' }}>
                  補足メモ
                </span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(245,240,232,0.7)' }}>
                {manual.memo}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="glass-card rounded-3xl px-5 py-10 flex flex-col items-center justify-center animate-fade-in">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'rgba(212,168,67,0.06)',
          border: '1px solid rgba(212,168,67,0.12)',
        }}>
        <Inbox size={22} style={{ color: 'rgba(212,168,67,0.4)' }} />
      </div>
      <p className="text-[15px] font-medium mb-1.5" style={{ color: 'rgba(245,240,232,0.7)' }}>
        該当マニュアルが見つかりませんでした
      </p>
      <p className="text-[12px] text-center" style={{ color: 'rgba(245,240,232,0.35)' }}>
        キーワードを変えて検索してみてください。
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [staffs, setStaffs] = useState<Staff[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [manuals, setManuals] = useState<Manual[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [staffLoading, setStaffLoading] = useState(true)

  // Fetch active staffs
  useEffect(() => {
    async function fetchStaffs() {
      setStaffLoading(true)
      const { data, error } = await supabase
        .from('staffs')
        .select('id, name, is_active, created_at')
        .eq('is_active', true)
        .order('name')

      if (!error && data) {
        setStaffs(data as Staff[])
      }
      setStaffLoading(false)
    }
    fetchStaffs()
  }, [])

  // Search manuals
  const handleSearch = useCallback(async () => {
    if (!selectedStaff || !query.trim()) return

    setLoading(true)
    setSearched(false)

    try {
      const { data, error } = await supabase
        .from('manuals')
        .select('*')
        .or(`title.ilike.%${query.trim()}%,content.ilike.%${query.trim()}%`)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setManuals(data as Manual[])
      } else {
        setManuals([])
      }

      setSearched(true)

      // Log the search
      const staffObj = staffs.find(s => s.id === selectedStaff)
      if (staffObj) {
        const firstResult = data?.[0] as Manual | undefined
        await supabase.from('logs').insert({
          staff_name: staffObj.name,
          question: query.trim(),
          category: firstResult?.category ?? null,
          answer: firstResult?.content ?? null,
        })
      }
    } catch {
      setManuals([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }, [selectedStaff, query, staffs])

  // Enter key support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && selectedStaff && query.trim()) {
      handleSearch()
    }
  }

  const isSearchable = !!selectedStaff && !!query.trim()

  return (
    <div className="relative min-h-screen">

      {/* ── Background ───────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0">
        {/* Photo bg using CSS gradient to simulate Korean izakaya atmosphere */}
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(80, 50, 10, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 60%, rgba(60, 35, 8, 0.35) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, rgba(40, 25, 5, 0.3) 0%, transparent 60%),
              linear-gradient(180deg, #1a0f04 0%, #0f0804 30%, #0a0603 60%, #080503 100%)
            `,
          }}
        />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
          }}
        />
        {/* Warm light spots */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #D4A843 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #F0C060 0%, transparent 70%)' }} />
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-[430px] min-h-screen px-4 pb-24 pt-safe">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="pt-14 pb-8 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(180,130,30,0.3) 0%, rgba(212,168,67,0.15) 100%)',
                border: '1px solid rgba(212,168,67,0.3)',
                boxShadow: '0 0 20px rgba(212,168,67,0.1)',
              }}>
              <Brain size={18} style={{ color: '#D4A843' }} />
            </div>
            <span className="text-[15px] font-semibold tracking-widest"
              style={{
                background: 'linear-gradient(135deg, #C89830 0%, #D4A843 50%, #F0C060 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              KOGI Brain
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[26px] font-bold tracking-tight mb-2"
            style={{ color: '#F5F0E8' }}>
            店舗マニュアル検索
          </h1>

          {/* Subtitle */}
          <p className="text-[13px] font-light tracking-widest"
            style={{ color: '#D4A843' }}>
            わからないことをすぐ確認
          </p>
        </div>

        {/* ── Section 1: Staff Select ─────────────────────────────── */}
        <div className="glass-card rounded-3xl p-5 mb-4">
          {/* Section label */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(212,168,67,0.1)',
                border: '1px solid rgba(212,168,67,0.2)',
              }}>
              <User size={13} style={{ color: '#D4A843' }} />
            </div>
            <span className="text-[13px] font-semibold" style={{ color: 'rgba(245,240,232,0.9)' }}>
              あなたの名前を選択
            </span>
          </div>

          {/* Select box */}
          <div className="relative">
            <select
              className="custom-select w-full rounded-2xl px-4 py-3.5 text-[14px] pr-10 transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(212,168,67,0.2)',
                color: selectedStaff ? '#F5F0E8' : 'rgba(245,240,232,0.35)',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
              value={selectedStaff}
              onChange={e => setSelectedStaff(e.target.value)}
              disabled={staffLoading}
            >
              <option value="" disabled style={{ background: '#1a0f04', color: 'rgba(245,240,232,0.4)' }}>
                {staffLoading ? '読み込み中...' : 'スタッフ名を選択してください'}
              </option>
              {staffs.map(staff => (
                <option key={staff.id} value={staff.id}
                  style={{ background: '#1a0f04', color: '#F5F0E8' }}>
                  {staff.name}
                </option>
              ))}
            </select>
            {/* Chevron */}
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
              {staffLoading
                ? <Loader2 size={14} style={{ color: 'rgba(212,168,67,0.5)' }} className="animate-spin" />
                : <ChevronDown size={14} style={{ color: 'rgba(212,168,67,0.6)' }} />
              }
            </div>
          </div>

          {/* Helper text */}
          <p className="mt-3 text-[11px] text-center" style={{ color: 'rgba(245,240,232,0.3)' }}>
            名前を選択すると検索できます
          </p>
        </div>

        {/* ── Section 2: Search ──────────────────────────────────── */}
        <div className="glass-card rounded-3xl p-5 mb-4">
          {/* Section label */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(212,168,67,0.1)',
                border: '1px solid rgba(212,168,67,0.2)',
              }}>
              <Search size={13} style={{ color: '#D4A843' }} />
            </div>
            <span className="text-[13px] font-semibold" style={{ color: 'rgba(245,240,232,0.9)' }}>
              マニュアルを検索
            </span>
          </div>

          {/* Search input */}
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(212,168,67,0.4)' }}
            />
            <input
              type="text"
              className="gold-input w-full rounded-2xl pl-9 pr-4 py-3.5 text-[14px] transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(212,168,67,0.18)',
                color: '#F5F0E8',
              }}
              placeholder="例：レジ締め、チヂミ、ドリンク提供ルール"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!selectedStaff}
            />
          </div>

          {/* Search button */}
          <button
            className="gold-button w-full rounded-2xl py-4 flex items-center justify-center gap-2 text-[14px] font-semibold tracking-wide transition-all"
            style={{
              color: isSearchable ? '#1a0f04' : 'rgba(180,130,30,0.4)',
            }}
            onClick={handleSearch}
            disabled={!isSearchable || loading}
          >
            {loading
              ? <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>検索中...</span>
                </>
              : <>
                  <Search size={15} />
                  <span>検索する</span>
                </>
            }
          </button>

          {/* Lock hint */}
          {!selectedStaff && (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <Lock size={10} style={{ color: 'rgba(245,240,232,0.25)' }} />
              <p className="text-[11px]" style={{ color: 'rgba(245,240,232,0.25)' }}>
                名前を選択すると検索できます
              </p>
            </div>
          )}
        </div>

        {/* ── Section 3: Results ────────────────────────────────────── */}
        {(loading || searched) && (
          <div className="glass-card rounded-3xl p-5">
            {/* Section label */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(212,168,67,0.1)',
                  border: '1px solid rgba(212,168,67,0.2)',
                }}>
                <FileText size={13} style={{ color: '#D4A843' }} />
              </div>
              <span className="text-[13px] font-semibold" style={{ color: 'rgba(245,240,232,0.9)' }}>
                検索結果
              </span>
              {searched && !loading && manuals.length > 0 && (
                <span className="ml-auto text-[11px]" style={{ color: 'rgba(212,168,67,0.5)' }}>
                  {manuals.length}件
                </span>
              )}
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div className="space-y-3">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            )}

            {/* Results */}
            {!loading && searched && manuals.length > 0 && (
              <div className="space-y-3">
                {manuals.map((manual, i) => (
                  <ManualCard key={manual.id} manual={manual} index={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && searched && manuals.length === 0 && (
              <EmptyState />
            )}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-center gap-1.5">
          <Shield size={10} style={{ color: 'rgba(212,168,67,0.25)' }} />
          <p className="text-[10px] tracking-wide" style={{ color: 'rgba(245,240,232,0.2)' }}>
            検索内容は改善のため記録されます
          </p>
        </div>

      </div>
    </div>
  )
}
