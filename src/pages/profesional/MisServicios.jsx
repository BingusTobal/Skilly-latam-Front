import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { enviarARevision, misServicios } from '../../api/catalogo'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import StatusBadge from '../../components/StatusBadge'
import {
  Boton,
  BotonEnlace,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
} from '../../components/ui'
import { formatearCLP } from '../../lib/formato'

function SkeletonServicio() {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-center gap-3.5">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-3.5 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  )
}

export default function MisServicios() {
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(null)

  function cargar() {
    setCargando(true)
    misServicios()
      .then((data) => setServicios(data.results || []))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  async function publicar(id) {
    setError('')
    setEnviando(id)
    try {
      await enviarARevision(id)
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(null)
    }
  }

  return (
    <div>
      <PageHeader
        etiqueta="Panel profesional"
        titulo="Mis servicios"
        descripcion="Publica y gestiona los servicios que ofreces. Cada envío pasa por revisión de Skilly antes de aparecer en el catálogo."
        acciones={
          <BotonEnlace to="/profesional/servicios/nuevo">
            <Icon nombre="plus" className="h-4 w-4" />
            Publicar servicio
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
            <SkeletonServicio key={indice} />
          ))}
        </div>
      ) : servicios.length === 0 ? (
        <EmptyState
          icono="layout"
          titulo="Aún no has publicado servicios"
          accion={
            <BotonEnlace to="/profesional/servicios/nuevo">
              <Icon nombre="plus" className="h-4 w-4" />
              Crear mi primer servicio
            </BotonEnlace>
          }
        >
          Crea tu primer servicio para que las organizaciones puedan encontrarte en el
          catálogo.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {servicios.map((servicio) => {
            const puedePublicar =
              servicio.estado === 'borrador' || servicio.estado === 'devuelto'
            return (
              <li key={servicio.id}>
                <Card className="transition hover:border-brand-blue/30 hover:shadow-float">
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-violet-soft text-brand-violet">
                        <Icon nombre="layout" className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <Link
                          to={`/profesional/servicios/${servicio.id}/editar`}
                          className="truncate text-[0.9375rem] font-bold text-ink no-underline transition hover:text-brand-blue-deep"
                        >
                          {servicio.titulo}
                        </Link>
                        <p className="mt-1 text-[0.8125rem] text-ink-3">
                          {servicio.categoria?.nombre || 'Sin categoría'}
                        </p>
                        {servicio.comentarios_admin && (
                          <p className="mt-2 rounded-lg bg-warn-soft px-2.5 py-1.5 text-[0.75rem] font-semibold leading-relaxed text-warn">
                            {servicio.comentarios_admin}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:shrink-0 sm:justify-end">
                      <span className="text-[0.9375rem] font-extrabold text-ink">
                        {formatearCLP(servicio.precio)}
                      </span>
                      <StatusBadge estado={servicio.estado} />
                      {puedePublicar && (
                        <Boton
                          tamano="sm"
                          variante="suave"
                          cargando={enviando === servicio.id}
                          onClick={() => publicar(servicio.id)}
                        >
                          Enviar a revisión
                        </Boton>
                      )}
                      <BotonEnlace
                        to={`/profesional/servicios/${servicio.id}/editar`}
                        tamano="sm"
                        variante="secundario"
                      >
                        <Icon nombre="edit" className="h-4 w-4" />
                        Editar
                      </BotonEnlace>
                    </div>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
