'use client'
import { Users } from 'lucide-react'
import type { StaffUsage } from '@/types'

interface Props {
  data: StaffUsage[]
  total: number
}

const RANK_COLORS = ['#d4a843', '#b0b0b0', '#cd7f32', 'rgba(240,232,216,0.4)', 'rgba(240,232,216,0.3)']

export default function StaffUsageCard({ data, total }: Props) {
  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col relative overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Users size={15} style={{ color: '#d4a843' }} strokeWidth={1.5}/>
        <span className="text-xs font-medium tracking-widest gold-text">スタッフ別利用数</span>
      </div>

      {/* Ranking list */}
      <div className="flex flex-col gap-3 flex-1">
        {data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>データなし</p>
          </div>
        ) : (
          data.map((item, i) => {
            const pct = total > 0 ? (item.count / total) * 100 : 0
            return (
              <div key={item.staff_name} className="flex items-center gap-3">
                {/* Rank badge */}
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                  style={{
                    background: i === 0
                      ? 'linear-gradient(135deg, #d4a843, #f5d376)'
                      : 'rgba(255,255,255,0.06)',
                    color: i === 0 ? '#0d0b07' : RANK_COLORS[i],
                    border: i !== 0 ? `1px solid ${RANK_COLORS[i]}` : 'none'
                  }}>
                  {i + 1}
                </div>

                {/* Name */}
                <span className="text-[13px] font-medium w-14 shrink-0" style={{ color: 'var(--text-primary)' }}>
                  {item.staff_name}
                </span>

                {/* Bar */}
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: i === 0
                        ? 'linear-gradient(90deg, #c9913a, #f5d376)'
                        : `linear-gradient(90deg, ${RANK_COLORS[i]}99, ${RANK_COLORS[i]})`
                    }}
                  />
                </div>

                {/* Count */}
                <span className="text-[13px] font-medium w-10 text-right shrink-0"
                  style={{ color: i === 0 ? '#d4a843' : 'var(--text-secondary)' }}>
                  {item.count}件
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
