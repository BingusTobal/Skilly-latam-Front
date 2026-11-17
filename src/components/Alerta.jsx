import Icon from './Icon'

const TIPOS = {
  error: {
    icono: 'alert-circle',
    caja: 'border-danger/20 bg-danger-soft text-danger',
  },
  exito: {
    icono: 'check-circle',
    caja: 'border-ok/20 bg-ok-soft text-ok',
  },
  info: {
    icono: 'info',
    caja: 'border-info/20 bg-info-soft text-info',
  },
  advertencia: {
    icono: 'alert-triangle',
    caja: 'border-warn/25 bg-warn-soft text-warn',
  },
}

export default function Alerta({
  tipo = 'error',
  titulo,
  children,
  className = '',
}) {
  if (!children) return null
  const config = TIPOS[tipo] || TIPOS.error

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[0.8125rem] leading-relaxed ${config.caja} ${className}`}
      role="alert"
    >
      <Icon
        nombre={config.icono}
        className="mt-0.5 h-4 w-4 shrink-0"
        strokeWidth={2}
      />
      <div className="min-w-0">
        {titulo && <p className="mb-0.5 font-bold">{titulo}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}
