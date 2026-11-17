import { Link } from 'react-router-dom'

const VARIANTES = {
  primario:
    'bg-brand-blue text-white shadow-[0_10px_24px_-12px_rgba(43,100,240,0.65)] hover:bg-brand-blue-deep',
  secundario:
    'border border-line bg-white text-ink hover:border-ink-3 hover:bg-canvas',
  suave: 'bg-brand-blue-soft text-brand-blue-deep hover:bg-[#d6e3ff]',
  fantasma: 'text-ink-2 hover:bg-canvas hover:text-ink',
  peligro: 'bg-danger text-white hover:bg-[#961a12]',
  claro: 'border border-white/20 bg-white/15 text-white hover:bg-white/25',
}

const TAMANOS = {
  sm: 'gap-1.5 rounded-[10px] px-3.5 py-2 text-[0.8125rem]',
  md: 'gap-2 rounded-xl px-5 py-2.5 text-[0.9rem]',
  lg: 'gap-2 rounded-xl px-6 py-3 text-[0.95rem]',
}

function clasesBoton(variante, tamano, className) {
  return [
    'inline-flex items-center justify-center font-bold no-underline transition',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTES[variante] || VARIANTES.primario,
    TAMANOS[tamano] || TAMANOS.md,
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export default function Boton({
  children,
  variante = 'primario',
  tamano = 'md',
  className = '',
  cargando = false,
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={clasesBoton(variante, tamano, className)}
      {...props}
    >
      {cargando && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}

export function BotonEnlace({
  to,
  href,
  children,
  variante = 'primario',
  tamano = 'md',
  className = '',
  ...props
}) {
  const clases = clasesBoton(variante, tamano, className)
  if (to) {
    return (
      <Link to={to} className={clases} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={clases} {...props}>
      {children}
    </a>
  )
}
