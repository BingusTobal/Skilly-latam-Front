import Icon from '../Icon'

export default function Stepper({ pasos = [], actual = 0, className = '' }) {
  if (!pasos.length) return null

  return (
    <ol className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {pasos.map((paso, indice) => {
        const etiqueta = typeof paso === 'string' ? paso : paso.etiqueta
        const completado = indice < actual
        const activo = indice === actual
        return (
          <li key={etiqueta} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.75rem] font-bold transition ${
                  completado
                    ? 'bg-brand-mint text-navy-950'
                    : activo
                      ? 'bg-brand-blue text-white shadow-[0_0_0_5px_rgba(43,100,240,0.14)]'
                      : 'bg-canvas text-ink-3'
                }`}
                aria-current={activo ? 'step' : undefined}
              >
                {completado ? (
                  <Icon nombre="check" className="h-4 w-4" strokeWidth={2.6} />
                ) : (
                  indice + 1
                )}
              </span>
              <span
                className={`hidden truncate text-[0.8125rem] font-semibold sm:block ${
                  activo ? 'text-ink' : 'text-ink-3'
                }`}
              >
                {etiqueta}
              </span>
            </div>
            {indice < pasos.length - 1 && (
              <span
                className={`h-px min-w-3 flex-1 ${
                  completado ? 'bg-brand-mint' : 'bg-line'
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
