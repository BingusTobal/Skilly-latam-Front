import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { misReservas } from '../../api/reservas'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import StatusBadge from '../../components/StatusBadge'
import {
  BotonEnlace,
  Card,
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

function SkeletonReserva() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  )
}

export default function MisReservas() {
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    misReservas()
      .then((data) => activo && setReservas(data.results || []))
      .catch((err) => activo && setError(mensajeDeError(err)))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [])

  return (
    <div>
      <PageHeader
        etiqueta="Organización"
        titulo="Mis reservas"
        descripcion="Revisa el estado de tus servicios, confirma entregas y gestiona tus pagos."
        migas={[{ texto: 'Inicio', to: '/' }, { texto: 'Mis reservas' }]}
        acciones={
          <BotonEnlace to="/catalogo" variante="secundario">
            <Icon nombre="search" className="h-4 w-4" />
            Explorar catálogo
          </BotonEnlace>
        }
      />

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      {cargando ? (
        <div className="space-y-3">
          {[0, 1, 2].map((indice) => (
            <SkeletonReserva key={indice} />
          ))}
        </div>
      ) : reservas.length === 0 ? (
        <EmptyState
          icono="calendar"
          titulo="Aún no tienes reservas"
          accion={
            <BotonEnlace to="/catalogo">
              <Icon nombre="search" className="h-4 w-4" />
              Explorar el catálogo
            </BotonEnlace>
          }
        >
          Cuando contrates un servicio, verás aquí su estado, las fechas y el pago
          protegido hasta la entrega.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {reservas.map((reserva) => (
            <li key={reserva.id}>
              <Card className="transition hover:border-brand-blue/30 hover:shadow-float">
                <Link
                  to={`/reserva/${reserva.id}`}
                  className="group flex flex-col gap-4 p-4 no-underline sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="flex min-w-0 items-start gap-3.5">
                    <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue-deep">
                      <Icon nombre="calendar" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[0.9375rem] font-bold text-ink transition group-hover:text-brand-blue-deep">
                        {reserva.servicio.titulo}
                      </p>
                      <p className="mt-1 text-[0.8125rem] text-ink-3">
                        {formatearFecha(reserva.fecha)} ·{' '}
                        {formatearHora(reserva.hora_inicio)}–
                        {formatearHora(reserva.hora_fin)}
                        {reserva.profesional_nombre
                          ? ` · ${reserva.profesional_nombre}`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                    <span className="text-[0.9375rem] font-extrabold text-ink">
                      {formatearCLP(reserva.precio_acordado)}
                    </span>
                    <StatusBadge estado={reserva.estado} mapa={ESTADOS_RESERVA} />
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
