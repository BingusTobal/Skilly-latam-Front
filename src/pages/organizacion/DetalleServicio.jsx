import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { obtenerServicio } from '../../api/catalogo'
import ServicioCard, { ICONOS } from '../../components/ServicioCard'
import { FORMATOS, formatearCLP } from '../../lib/formato'

export default function DetalleServicio() {
  const { id } = useParams()
  const [servicio, setServicio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [noEncontrado, setNoEncontrado] = useState(false)

  useEffect(() => {
    let activo = true
    setCargando(true)
    obtenerServicio(id)
      .then((data) => {
        if (activo) setServicio(data)
      })
      .catch(() => {
        if (activo) setNoEncontrado(true)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [id])

  if (cargando) {
    return <p className="p-8 text-center text-sm text-gray-500">Cargando servicio…</p>
  }
  if (noEncontrado || !servicio) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-600">Este servicio no está disponible.</p>
        <Link to="/catalogo" className="mt-3 inline-block text-[13px] underline">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-5">
      <Link to="/catalogo" className="text-[13px] text-gray-600 no-underline">
        &larr; Volver al catálogo
      </Link>
      <p className="mb-5 mt-1 text-[12px] text-gray-500">
        Servicios &gt; {servicio.categoria?.nombre} &gt; {servicio.titulo}
      </p>

      <div className="mb-6 flex items-center gap-5">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-black bg-sky text-4xl">
          {ICONOS[servicio.categoria?.slug] || '🛠️'}
        </div>
        <div>
          <span className="text-[11px] text-gray-500">{servicio.categoria?.nombre}</span>
          <h1 className="text-[21px] font-bold leading-snug">{servicio.titulo}</h1>
          <p className="text-[12.5px] text-gray-500">{servicio.descripcion_corta}</p>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1">
          <section className="mb-6">
            <h2 className="mb-3 border-b border-line pb-1.5 text-[14px] font-bold">
              ¿Qué incluye este servicio?
            </h2>
            {servicio.descripcion_larga && (
              <p className="mb-3 whitespace-pre-line text-[13px] text-gray-600">
                {servicio.descripcion_larga}
              </p>
            )}
            <ul className="space-y-1.5 text-[13px]">
              {(servicio.entregables || []).map((entregable) => (
                <li key={entregable.id} className="flex gap-2">
                  <span className="font-bold text-brand-green">✓</span>
                  <span>{entregable.nombre}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 border-b border-line pb-1.5 text-[14px] font-bold">
              Otros servicios de {servicio.categoria?.nombre}
            </h2>
            {servicio.sugerencias?.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {servicio.sugerencias.map((s) => (
                  <ServicioCard key={s.id} servicio={s} />
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-gray-500">
                No hay otros servicios de esta categoría por ahora.
              </p>
            )}
          </section>
        </div>

        <aside className="w-full shrink-0 md:w-64">
          <div className="sticky top-5 border border-black p-4">
            <div className="mb-2 text-[22px] font-bold text-brand-red">
              {formatearCLP(servicio.precio)}
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1.5 text-[12px]">
              <span>Duración estimada</span>
              <span>{servicio.duracion_estimada || 'A convenir'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-1.5 text-[12px]">
              <span>Modalidad</span>
              <span>{FORMATOS[servicio.formato]}</span>
            </div>
            {servicio.ubicacion && (
              <div className="flex justify-between border-b border-gray-100 py-1.5 text-[12px]">
                <span>Ubicación</span>
                <span>{servicio.ubicacion}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 text-[12px]">
              <span>Profesional</span>
              <span>{servicio.profesional_nombre}</span>
            </div>
            <button
              type="button"
              disabled
              title="La reserva se habilita en el próximo sprint"
              className="mt-3 w-full cursor-not-allowed bg-black py-3 text-[13px] text-white opacity-60"
            >
              Reservar este servicio
            </button>
            <p className="mt-2 text-[11px] leading-snug text-gray-500">
              La reserva y el pago en custodia se habilitan en el siguiente sprint.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}