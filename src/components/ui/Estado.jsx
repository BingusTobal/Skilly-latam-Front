const TONOS = {
  neutro: 'bg-canvas text-ink-3',
  info: 'bg-info-soft text-info',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  peligro: 'bg-danger-soft text-danger',
}

const PUNTOS = {
  neutro: 'bg-ink-3',
  info: 'bg-info',
  ok: 'bg-ok',
  warn: 'bg-warn',
  peligro: 'bg-danger',
}

export default function Estado({
  children,
  tono = 'neutro',
  punto = true,
  clase = '',
  className = '',
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold leading-none ${
        clase || TONOS[tono] || TONOS.neutro
      } ${className}`}
    >
      {punto && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${PUNTOS[tono] || PUNTOS.neutro}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
