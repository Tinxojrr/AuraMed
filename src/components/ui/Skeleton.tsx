import './Skeleton.css'

export function Skeleton({ width = '100%', height = '16px', radius = '6px', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
    />
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-header">
        <Skeleton width="60px" height="20px" radius="99px" />
        <Skeleton width="80px" height="12px" />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '70%' : '100%'} height="12px" />
      ))}
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="skeleton-stat">
      <Skeleton width="44px" height="44px" radius="10px" />
      <div className="skeleton-stat-info">
        <Skeleton width="48px" height="28px" radius="4px" />
        <Skeleton width="80px" height="12px" />
      </div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="skeleton-chart">
      <Skeleton width="140px" height="14px" className="skeleton-chart-title" />
      <div className="skeleton-bars">
        {[80, 55, 90, 40, 70, 60].map((h, i) => (
          <div key={i} className="skeleton-bar-wrap">
            <Skeleton width="100%" height={`${h}px`} radius="4px 4px 0 0" />
          </div>
        ))}
      </div>
    </div>
  )
}
