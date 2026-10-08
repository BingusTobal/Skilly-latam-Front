export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold ${className}`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <polygon points="12,2 22,20 2,20" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      Skilly Latam
    </span>
  )
}