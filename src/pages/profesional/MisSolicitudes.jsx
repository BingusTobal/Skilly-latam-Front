import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { misSolicitudes } from '../../api/reservas'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import StatusBadge from '../../components/StatusBadge'
import {
  Card,
  Chip,
  EmptyState,
  PageHeader,
  Skeleton,
} from '../../components/ui'
import {
  ESTADOS_RESERVA,
  formatearCLP,
  formatearFecha,
  formatearHora,
} from '../../lib/formato'

const FILTROS = [
  { valor: '', etiqueta: 'Todas' },
  { valor: 'pendiente_aceptacion', etiqueta: 'Por responder' },
  { valor: 'en_curso', etiqueta: 'En curso' },
  { valor: 'entregado_por_confirmar', etiqueta: 'Por confirmar' },
  { valor: 'finalizada', etiqueta: 'Finalizadas' },
]

function SkeletonSolicitud() {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-center gap-3.5">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3.5 w-40" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
  )
}

export default function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [filtro, setFiltro] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(() => {
    setCargando(true)
    misSolicitudes(filtro ? { estado: filtro } : {})
      .then((data) => setSolicitudes(data.results || []))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [filtro])

  useEffect(cargar, [cargar])

  return (
    <div>
      <PageHeader
        etiqueta="Panel profesional"
        titulo="Solicitudes"
        descripcion="Responde a tiempo las solicitudes de las organizaciones y coordina la entrega de cada servicio."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTROS.map((opcion) => (
          <Chip
            key={opcion.valor}
            activo={filtro === opcion.valor}
            onClick={() => setFiltro(opcion.valor)}
          >
            {opcion.etiqueta}
          </Chip>
        ))}
      </div>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      {cargando ? (
        <div className="space-y-3">
          {[0, 1, 2].map((indice) => (
            <SkeletonSolicitud key={indice} />
          ))}
        </div>
      ) : solicitudes.length === 0 ? (
        <EmptyState icono="message" titulo="No hay solicitudes en este estado">
          Cuando una organización reserve uno de tus servicios, aparecerá aquí para
          que la aceptes o rechaces.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {solicitudes.map((solicitud) => (
            <li key={solicitud.id}>
              <Card className="transition hover:border-brand-blue/30 hover:shadow-float">
                <Link
                  to={`/profesional/solicitudes/${solicitud.id}`}
                  className="group flex flex-col gap-4 p-4 no-underline sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="flex min-w-0 items-start gap-3.5">
                    <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-mint-soft text-brand-mint-deep">
                      <Icon nombre="calendar" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[0.9375rem] font-bold text-ink transition group-hover:text-brand-blue-deep">
                        {solicitud.servicio.titulo}
                      </p>
                      <p className="mt-1 text-[0.8125rem] text-ink-3">
                        {solicitud.organizacion_nombre || solicitud.contacto_nombre} ·{' '}
                        {formatearFecha(solicitud.fecha)} ·{' '}
                        {formatearHora(solicitud.hora_inicio)}–
                        {formatearHora(solicitud.hora_fin)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-[0.9375rem] font-extrabold text-ink">
                        {formatearCLP(solicitud.monto_neto)}
                      </p>
                      <p className="text-[0.6875rem] font-semibold text-ink-3">
                        Monto neto
                      </p>
                    </div>
                    <StatusBadge estado={solicitud.estado} mapa={ESTADOS_RESERVA} />
                    <Icon
                      nombre="arrow-right"
                      className="hidden h-4 w-4 text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-brand-blue sm:block"
                    />
                  </div>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
