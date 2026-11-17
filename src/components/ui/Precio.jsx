import { formatearCLP } from '../../lib/formato'

export default function Precio({
  valor,
  nota = 'CLP · precio fijo',
  tamano = 'md',
  className = '',
}) {
  const tamanos = {
    sm: 'text-[1.125rem]',
    md: 'text-[1.5rem]',
    lg: 'text-[2rem]',
  }
  return (
    <p className={className}>
      <span
        className={`block font-extrabold leading-none tracking-[-0.03em] text-ink ${
          tamanos[tamano] || tamanos.md
        }`}
      >
        {formatearCLP(valor)}
      </span>
      {nota && (
        <span className="mt-1 block text-[0.75rem] font-semibold text-ink-3">
          {nota}
        </span>
      )}
    </p>
  )
}
