import { Link } from 'react-router-dom'

import Icon from '../Icon'

export function Migas({ items = [], className = '' }) {
  if (!items.length) return null
  return (
    <nav aria-label="Migas de pan" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.75rem] font-semibold text-ink-3">
        {items.map((item, indice) => {
          const ultimo = indice === items.length - 1
          return (
            <li key={`${item.texto}-${indice}`} className="flex items-center gap-1.5">
              {item.to && !ultimo ? (
                <Link
                  to={item.to}
                  className="text-ink-3 no-underline transition hover:text-brand-blue"
                >
                  {item.texto}
                </Link>
              ) : (
                <span className={ultimo ? 'text-ink-2' : undefined}>{item.texto}</span>
              )}
              {!ultimo && (
                <Icon
                  nombre="chevron"
                  className="h-3.5 w-3.5 -rotate-90 text-ink-3/70"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default function PageHeader({
  etiqueta,
  titulo,
  descripcion,
  acciones,
  migas,
  className = '',
}) {
  return (
    <header className={`mb-6 sm:mb-8 ${className}`}>
      {migas?.length > 0 && <Migas items={migas} className="mb-3" />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {etiqueta && (
            <p className="mb-2 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-brand-blue">
              {etiqueta}
            </p>
          )}
          <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[2.125rem]">
            {titulo}
          </h1>
          {descripcion && (
            <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-3">
              {descripcion}
            </p>
          )}
        </div>
        {acciones && <div className="flex flex-wrap items-center gap-3">{acciones}</div>}
      </div>
    </header>
  )
}
