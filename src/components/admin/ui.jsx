import { Link } from 'react-router-dom'

import { formatearCLP } from '../../lib/formato'

const TONOS = {
  base: 'border-line bg-sky text-navy',
  warn: 'border-line bg-sand text-brand-amber',
  alert: 'border-line bg-[#fbdcdc] text-brand-red',
  ok: 'border-line bg-mint text-brand-green',
}

export function Kpi({ etiqueta, valor, tono = 'base', className = '' }) {
  return (
    <div className={`flex-1 border px-3.5 py-3.5 text-center ${TONOS[tono]} ${className}`}>
      <b className="block text-[18px] leading-tight">{valor}</b>
      <span className="text-[11px] text-gray-600">{etiqueta}</span>
    </div>
  )
}

export function Panel({ titulo, accion, children, className = '' }) {
  return (
    <section className={`flex-1 border border-line px-4 py-4 ${className}`}>
      {(titulo || accion) && (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          {titulo && <h2 className="text-[14px] font-bold">{titulo}</h2>}
          {accion}
        </div>
      )}
      {children}
    </section>
  )
}

export function Barras({ datos, formatear = formatearCLP, vacio = 'Sin datos.' }) {
  if (!datos?.length) {
    return <p className="text-[12px] text-gray-500">{vacio}</p>
  }
  const maximo = Math.max(...datos.map((d) => Number(d.valor) || 0), 1)
  return (
    <div>
      {datos.map((dato) => (
        <div
          key={dato.etiqueta}
          className="mb-2.5 flex items-center gap-2.5 text-[11.5px]"
        >
          <span className="w-[120px] shrink-0 truncate text-gray-600">
            {dato.etiqueta}
          </span>
          <div className="h-3.5 flex-1 bg-[#eeeeee]">
            <div
              className="h-full bg-navy"
              style={{
                width: `${Math.max(
                  (Number(dato.valor) || 0) / maximo * 100,
                  dato.valor ? 3 : 0,
                )}%`,
              }}
            />
          </div>
          <span className="w-[76px] shrink-0 text-right text-gray-500">
            {formatear(dato.valor)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function Encabezado({ titulo, sesion }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h1 className="text-[19px] font-bold">{titulo}</h1>
      {sesion && <span className="text-[12px] text-gray-500">Sesión: {sesion}</span>}
    </div>
  )
}

export function Volver({ to, children }) {
  return (
    <Link
      to={to}
      className="mb-4 inline-block text-[12px] font-bold text-navy no-underline hover:underline"
    >
      ← {children}
    </Link>
  )
}

export function Etiqueta({ children, tono = 'base' }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[10.5px] font-bold ${
        TONOS[tono] || TONOS.base
      }`}
    >
      {children}
    </span>
  )
}

export function Estado({ children, clase = 'bg-gray-100 text-gray-600' }) {
  return (
    <span className={`inline-block px-2.5 py-1 text-[11px] font-bold ${clase}`}>
      {children}
    </span>
  )
}

export function Cargando({ children = 'Cargando…' }) {
  return <p className="text-[13px] text-gray-500">{children}</p>
}

export function Vacio({ children = 'No hay registros para mostrar.' }) {
  return <p className="text-[13px] text-gray-500">{children}</p>
}
