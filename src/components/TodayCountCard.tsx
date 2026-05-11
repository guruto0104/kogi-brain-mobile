'use client'
import { MessageSquare } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  count: number
  hourlyData: { hour: number; count: number }[]
}

export default function TodayCountCard({ count, hourlyData }: Props) {
  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden"
      style={{ minHeight: '180px', boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium tracking-widest gold-text">今日の質問数</span>
      </div>

      {/* Main content row */}
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(212,168,67,0.1)',
            border: '1px solid rgba(212,168,67,0.2)',
            boxShadow: '0 0 16px rgba(212,168,67,0.08)'
          }}>
          <MessageSquare size={20} style={{ color: '#d4a843' }} strokeWidth={1.5}/>
        </div>

        {/* Count */}
        <div className="flex items-baseline gap-1">
          <span className="font-bold leading-none gold-text" style={{ fontSize: '52px', letterSpacing: '-2px' }}>
            {count.toLocaleString()}
          </span>
          <span className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>件</span>
        </div>
      </div>

      <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>本日の質問件数</p>

      {/* Mini area chart */}
      <div className="mt-3 h-14 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyData} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4a843" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#d4a843" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{ background: 'rgba(10,8,4,0.95)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '8px', fontSize: '11px', color: '#d4a843' }}
              formatter={(val: number) => [`${val}件`, '']}
              labelFormatter={(h: number) => `${h}時`}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#d4a843"
              strokeWidth={2}
              fill="url(#goldGrad)"
              dot={false}
              activeDot={{ r: 3, fill: '#f5d376', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Subtle corner glow */}
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,168,67,0.06) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }}/>
    </div>
  )
}
