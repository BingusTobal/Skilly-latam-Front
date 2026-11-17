import Icon from '../Icon'
import {
  BotonEnlace,
  Card,
  CardBody,
  CardHeader,
  Cargando as CargandoBase,
  PageHeader,
} from '../ui'
import { formatearCLP } from '../../lib/formato'

const TONOS = {
  base: 'bg-brand-blue-soft text-brand-blue-deep',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  alert: 'bg-danger-soft text-danger',
}

const ICONOS = {
  base: 'chart',
  ok: 'check-circle',
  warn: 'alert-triangle',
  alert: 'alert-circle',
}

export function Kpi({
  etiqueta,
  valor,
  tono = 'base',
  icono,
  className = '',
}) {
  const estilo = TONOS[tono] || TONOS.base
  return (
    <div
      className={`rounded-2xl border border-line bg-white px-4 py-3.5 shadow-card ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-3">
            {etiqueta}
          </p>
          <p className="mt-1.5 truncate text-[1.4rem] font-extrabold leading-none tracking-[-0.03em] text-ink">
            {valor}
          </p>
        </div>
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${estilo}`}
        >
          <Icon
            nombre={icono || ICONOS[tono] || ICONOS.base}
            className="h-[18px] w-[18px]"
            strokeWidth={2}
          />
        </span>
      </div>
    </div>
  )
}

export function Panel({
  titulo,
  accion,
  icono,
  children,
  className = '',
}) {
  return (
    <Card className={className}>
      {(titulo || accion) && (
        <CardHeader>
          <div className="flex min-w-0 items-center gap-3">
            {icono && (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-canvas text-ink-3">
                <Icon nombre={icono} className="h-[18px] w-[18px]" />
              </span>
            )}
            {titulo && (
              <h2 className="text-[0.9375rem] font-bold text-ink">{titulo}</h2>
            )}
          </div>
          {accion}
        </CardHeader>
      )}
      <CardBody>{children}</CardBody>
    </Card>
  )
}

export function Barras({
  datos,
  formatear = formatearCLP,
  vacio = 'Sin datos.',
}) {
  if (!datos?.length) {
    return (
      <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[0.8125rem] text-ink-3">
        {vacio}
      </p>
    )
  }
  const maximo = Math.max(...datos.map((d) => Number(d.valor) || 0), 1)
  return (
    <div className="space-y-3">
      {datos.map((dato) => (
        <div
          key={dato.etiqueta}
          className="flex items-center gap-3 text-[0.75rem]"
        >
          <span className="w-[112px] shrink-0 truncate font-semibold text-ink-2">
            {dato.etiqueta}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-violet"
              style={{
                width: `${Math.max(
                  ((Number(dato.valor) || 0) / maximo) * 100,
                  dato.valor ? 4 : 0,
                )}%`,
              }}
            />
          </div>
          <span className="w-[78px] shrink-0 text-right font-bold tabular-nums text-ink">
            {formatear(dato.valor)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function Encabezado({ titulo, sesion, descripcion, acciones }) {
  return (
    <PageHeader
      etiqueta="Administración"
      titulo={titulo}
      descripcion={descripcion}
      acciones={
        acciones ||
        (sesion ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[0.75rem] font-semibold text-ink-3">
            <Icon nombre="user-check" className="h-3.5 w-3.5" />
            {sesion}
          </span>
        ) : undefined)
      }
    />
  )
}

export function Volver({ to, children }) {
  return (
    <BotonEnlace
      to={to}
      variante="fantasma"
      tamano="sm"
      className="-ml-2 mb-3"
    >
      <Icon nombre="arrow-left" className="h-4 w-4" />
      {children}
    </BotonEnlace>
  )
}

export function Etiqueta({ children, tono = 'base' }) {
  const estilo = TONOS[tono] || TONOS.base
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold ${estilo}`}
    >
      {children}
    </span>
  )
}

export function Estado({ children, tono = 'neutro', clase }) {
  const tonos = {
    neutro: 'bg-canvas text-ink-3',
    ok: 'bg-ok-soft text-ok',
    warn: 'bg-warn-soft text-warn',
    alert: 'bg-danger-soft text-danger',
    info: 'bg-info-soft text-info',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold leading-none ${
        clase || tonos[tono] || tonos.neutro
      }`}
    >
      {children}
    </span>
  )
}

export function Cargando({ children = 'Cargando…' }) {
  return <CargandoBase className="py-12">{children}</CargandoBase>
}

export function Vacio({ children = 'No hay registros para mostrar.' }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-canvas/50 px-4 py-8 text-center text-[0.8125rem] text-ink-3">
      {children}
    </div>
  )
}
