export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{ background: 'rgba(212,168,67,0.06)' }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-6"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
      <Skeleton className="h-3 w-28 mb-6"/>
      <Skeleton className="h-12 w-36 mb-3"/>
      <Skeleton className="h-2 w-20 mb-6"/>
      <Skeleton className="h-14 w-full"/>
    </div>
  )
}
