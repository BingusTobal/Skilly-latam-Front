import { useId } from 'react'

export default function Logo({ className = '', claro = false, compacto = false }) {
  const gradienteId = `logo-${useId().replace(/:/g, '')}`

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className={`${compacto ? 'h-5 w-5' : 'h-8 w-8'} shrink-0`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradienteId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2B64F0" />
            <stop offset="1" stopColor="#19B394" />
          </linearGradient>
        </defs>
        <path
          d="M16 3.5 29.5 27h-27z"
          fill="none"
          stroke={claro ? '#7FA2FF' : `url(#${gradienteId})`}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M16 12.5 22 23H10z" fill="#19B394" />
      </svg>
      <span
        className={`${compacto ? 'text-[14px]' : 'text-[1.375rem]'} font-extrabold leading-none tracking-[-0.03em] ${
          claro ? 'text-white' : 'text-navy-900'
        }`}
      >
        Skilly
        <span className={claro ? 'font-medium text-[#9db3d6]' : 'font-medium text-ink-3'}>
          latam
        </span>
      </span>
    </span>
  )
}
