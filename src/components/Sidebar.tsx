'use client'
import { Home } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="flex flex-col h-screen w-[220px] shrink-0 border-r relative"
      style={{ borderColor: 'var(--border-gold)', background: 'rgba(8,7,4,0.95)' }}>
      
      {/* Top: Logo area */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        {/* Pig Icon SVG */}
        <div className="mb-3 relative">
          <div className="w-14 h-14 rounded-full flex items-center justify-center relative"
            style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.25)' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Pig face */}
              <circle cx="18" cy="19" r="13" fill="none" stroke="#d4a843" strokeWidth="1.5"/>
              {/* Eyes */}
              <circle cx="13.5" cy="17" r="1.5" fill="#d4a843"/>
              <circle cx="22.5" cy="17" r="1.5" fill="#d4a843"/>
              {/* Nose */}
              <ellipse cx="18" cy="21.5" rx="4" ry="2.5" fill="none" stroke="#d4a843" strokeWidth="1.3"/>
              <circle cx="16" cy="21.5" r="0.8" fill="#d4a843"/>
              <circle cx="20" cy="21.5" r="0.8" fill="#d4a843"/>
              {/* Ears */}
              <ellipse cx="8" cy="12" rx="3.5" ry="4" fill="none" stroke="#d4a843" strokeWidth="1.3"/>
              <ellipse cx="28" cy="12" rx="3.5" ry="4" fill="none" stroke="#d4a843" strokeWidth="1.3"/>
              {/* Star accent */}
              <path d="M18 4 L18.5 5.5 L20 5.5 L18.8 6.3 L19.3 7.8 L18 7 L16.7 7.8 L17.2 6.3 L16 5.5 L17.5 5.5 Z" fill="#d4a843"/>
            </svg>
          </div>
          {/* Soft glow behind pig */}
          <div className="absolute inset-0 rounded-full blur-xl opacity-20"
            style={{ background: 'radial-gradient(circle, #d4a843 0%, transparent 70%)' }}/>
        </div>

        <h1 className="text-[15px] font-bold tracking-widest gold-text">KOGI BRAIN</h1>
        <p className="text-[9px] mt-1 tracking-wider" style={{ color: 'var(--text-muted)' }}>
          マニュアル検索システム
        </p>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px" style={{ background: 'var(--border-gold)' }}/>

      {/* Nav */}
      <nav className="px-3 pt-5">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(212,168,67,0.18) 0%, rgba(212,168,67,0.08) 100%)',
            border: '1px solid rgba(212,168,67,0.3)',
            color: '#d4a843',
            boxShadow: '0 0 12px rgba(212,168,67,0.08)'
          }}>
          <Home size={15} strokeWidth={1.8}/>
          <span>ホーム</span>
        </button>
      </nav>

      {/* Spacer */}
      <div className="flex-1"/>

      {/* Footer */}
      <div className="px-4 py-5 text-center">
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>© KOGI BRAIN</p>
      </div>
    </aside>
  )
}
