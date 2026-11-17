export function Chip({
  children,
  activo = false,
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      aria-pressed={props.role === 'tab' ? undefined : activo}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-semibold transition ${
        activo
          ? 'border-brand-blue bg-brand-blue text-white'
          : 'border-line bg-white text-ink-2 hover:border-ink-3 hover:text-ink'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Chip
