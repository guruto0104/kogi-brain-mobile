'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { CategoryUsage } from '@/types'

interface Props {
  data: CategoryUsage[]
}

const CHART_COLORS = ['#d4a843', '#8b7a3a', '#7a3a3a', '#2a4a6a', '#4a4a4a']
const DOT_COLORS  = ['#d4a843', '#c9b86e', '#c0392b', '#2980b9', '#7f8c8d']

export default function CategoryCard({ data }: Props) {
  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col relative overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium tracking-widest gold-text">よく質問されるカテゴリ</span>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>データなし</p>
        </div>
      ) : (
        <div className="flex items-center gap-4 flex-1">
          {/* Donut chart */}
          <div className="w-28 h-28 shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={54}
                  dataKey="count"
                  strokeWidth={0}
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,8,4,0.95)',
                    border: '1px solid rgba(212,168,67,0.2)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#d4a843'
                  }}
                  formatter={(val: number, _: string, entry: { payload: CategoryUsage }) => [
                    `${val}件 (${entry.payload.percentage}%)`,
                    entry.payload.category
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center hole overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.03) 0%, transparent 70%)' }}/>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {data.map((item, i) => (
              <div key={item.category} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: DOT_COLORS[i % DOT_COLORS.length], boxShadow: `0 0 4px ${DOT_COLORS[i % DOT_COLORS.length]}` }}/>
                  <span className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                    {item.category}
                  </span>
                </div>
                <span className="text-[11px] shrink-0 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {item.count}件 ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
