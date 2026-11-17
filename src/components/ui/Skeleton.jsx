export function Skeleton({ className = '' }) {
  return (
    <span
      className={`block animate-pulse rounded-xl bg-canvas ${className}`}
      aria-hidden="true"
    />
  )
}

export function SkeletonTarjeta({ className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-[20px] border border-line bg-white shadow-card ${className}`}
      aria-hidden="true"
    >
      <Skeleton className="h-[138px] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  )
}

export function Cargando({ children = 'Cargando…', className = '' }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 py-10 text-[0.875rem] font-semibold text-ink-3 ${className}`}
      role="status"
    >
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-brand-blue border-t-transparent"
        aria-hidden="true"
      />
      {children}
    </div>
  )
}

export default Skeleton
