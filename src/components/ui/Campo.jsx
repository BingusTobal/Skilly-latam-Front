import Icon from '../Icon'

const BASE =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink placeholder:text-ink-3/70 transition focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10 disabled:bg-canvas disabled:text-ink-3'

export function Label({ children, requerido = false, className = '', ...props }) {
  return (
    <label
      className={`mb-1.5 block text-[0.8125rem] font-semibold text-ink-2 ${className}`}
      {...props}
    >
      {children}
      {requerido && <span className="ml-1 text-danger">*</span>}
    </label>
  )
}

export function Ayuda({ children, className = '' }) {
  if (!children) return null
  return (
    <p className={`mt-1.5 text-[0.75rem] leading-relaxed text-ink-3 ${className}`}>
      {children}
    </p>
  )
}

export function ErrorCampo({ children, className = '' }) {
  if (!children) return null
  return (
    <p className={`mt-1.5 text-[0.75rem] font-semibold text-danger ${className}`}>
      {children}
    </p>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`${BASE} ${className}`} {...props} />
}

export function Textarea({ className = '', rows = 4, ...props }) {
  return <textarea rows={rows} className={`${BASE} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <div className="relative">
      <select className={`${BASE} appearance-none pr-10 ${className}`} {...props}>
        {children}
      </select>
      <Icon
        nombre="chevron"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
      />
    </div>
  )
}

export default function Campo({
  etiqueta,
  htmlFor,
  ayuda,
  error,
  requerido = false,
  className = '',
  children,
}) {
  return (
    <div className={className}>
      {etiqueta && (
        <Label htmlFor={htmlFor} requerido={requerido}>
          {etiqueta}
        </Label>
      )}
      {children}
      {error ? <ErrorCampo>{error}</ErrorCampo> : <Ayuda>{ayuda}</Ayuda>}
    </div>
  )
}
