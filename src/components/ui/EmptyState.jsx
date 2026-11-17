import Icon from '../Icon'

export default function EmptyState({
  icono = 'search',
  titulo = 'No encontramos resultados',
  children,
  accion,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[20px] border border-dashed border-line bg-canvas/60 px-6 py-12 text-center ${className}`}
    >
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white text-ink-3 shadow-card">
        <Icon nombre={icono} className="h-6 w-6" />
      </span>
      <h2 className="text-[1.0625rem] font-bold text-ink">{titulo}</h2>
      {children && (
        <p className="mt-2 max-w-md text-[0.875rem] leading-relaxed text-ink-3">
          {children}
        </p>
      )}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  )
}
