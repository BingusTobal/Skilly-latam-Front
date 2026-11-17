import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { obtenerServicio } from '../../api/catalogo'
import Icon from '../../components/Icon'
import ServicioCard from '../../components/ServicioCard'
import {
  Avatar,
  BotonEnlace,
  Card,
  EmptyState,
  Estado,
  Migas,
  Precio,
  Skeleton,
} from '../../components/ui'
import {
  descripcionCategoria,
  estiloCategoria,
  iconoFormato,
} from '../../lib/categorias'
import { FORMATOS } from '../../lib/formato'

function Metas({ servicio }) {
  const items = [
    {
      icono: iconoFormato(servicio.formato),
      etiqueta: FORMATOS[servicio.formato] || servicio.formato,
    },
    {
      icono: 'clock',
      etiqueta: servicio.duracion_estimada || 'Duración a convenir',
    },
  ]
  if (servicio.ubicacion) {
    items.push({ icono: 'pin', etiqueta: servicio.ubicacion })
  }

  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.875rem] font-semibold text-ink-2">
      {items.map((item) => (
        <li key={item.etiqueta} className="inline-flex items-center gap-1.5">
          <Icon nombre={item.icono} className="h-4 w-4 text-ink-3" />
          {item.etiqueta}
        </li>
      ))}
    </ul>
  )
}

function CargandoDetalle() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-52" />
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="h-[220px] w-full rounded-[24px]" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-[320px] w-full rounded-[20px]" />
      </div>
    </div>
  )
}

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

  if (cargando) return <CargandoDetalle />

  if (noEncontrado || !servicio) {
    return (
      <EmptyState
        icono="alert-circle"
        titulo="Este servicio no está disponible"
        accion={
          <BotonEnlace to="/catalogo" variante="secundario">
            Volver al catálogo
          </BotonEnlace>
        }
      >
        Puede que haya sido dado de baja o que el enlace esté incompleto.
      </EmptyState>
    )
  }

  const categoria = servicio.categoria || {}
  const estilo = estiloCategoria(categoria.slug)
  const profesional = servicio.profesional_publico
  const nombreProfesional =
    profesional?.nombre_completo || servicio.profesional_nombre || 'Profesional Skilly'

  return (
    <div>
      <Migas
        className="mb-5"
        items={[
          { texto: 'Inicio', to: '/' },
          { texto: 'Catálogo', to: '/catalogo' },
          { texto: categoria.nombre || 'Servicios', to: '/catalogo' },
          { texto: servicio.titulo },
        ]}
      />

      <div className="mb-6 grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="svc-cover relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[22px] shadow-float sm:h-28 sm:w-28"
            style={{
              backgroundImage: `linear-gradient(135deg, ${estilo.c1}, ${estilo.c2})`,
            }}
          >
            <Icon nombre={estilo.icono} className="h-11 w-11 text-white" strokeWidth={1.5} />
            <span
              className="absolute bottom-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-white/20 text-white"
              role="img"
              aria-label="Servicio revisado por Skilly"
              title="Servicio revisado por Skilly"
            >
              <Icon nombre="shield" className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Estado tono="info">{categoria.nombre || 'Servicio'}</Estado>
              <Estado tono="ok">Revisado por Skilly</Estado>
            </div>
            <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[2.125rem]">
              {servicio.titulo}
            </h1>
            {servicio.descripcion_corta && (
              <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-3">
                {servicio.descripcion_corta}
              </p>
            )}
            <div className="mt-4">
              <Metas servicio={servicio} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          <Card>
            <div className="border-b border-line px-5 py-4 sm:px-6">
              <h2 className="flex items-center gap-2 text-[1.0625rem] font-bold text-ink">
                <Icon nombre="check-circle" className="h-5 w-5 text-brand-mint-deep" />
                ¿Qué incluye este servicio?
              </h2>
            </div>
            <div className="px-5 py-5 sm:px-6">
              {servicio.descripcion_larga && (
                <p className="mb-5 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-2">
                  {servicio.descripcion_larga}
                </p>
              )}
              {servicio.entregables?.length ? (
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {servicio.entregables.map((entregable) => (
                    <li
                      key={entregable.id}
                      className="flex items-start gap-2.5 rounded-xl bg-canvas px-3.5 py-3 text-[0.875rem] font-semibold text-ink-2"
                    >
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ok-soft text-ok">
                        <Icon nombre="check" className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {entregable.nombre}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[0.875rem] text-ink-3">
                  El profesional detallará los entregables al coordinar el servicio.
                </p>
              )}
            </div>
          </Card>

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-brand-blue">
                  También te puede servir
                </p>
                <h2 className="mt-1 text-[1.25rem] font-extrabold tracking-[-0.02em] text-ink">
                  Otros servicios de {categoria.nombre || 'la misma categoría'}
                </h2>
              </div>
              <BotonEnlace
                to="/catalogo"
                variante="fantasma"
                tamano="sm"
                className="hidden sm:inline-flex"
              >
                Ver catálogo
                <Icon nombre="arrow-right" className="h-4 w-4" />
              </BotonEnlace>
            </div>
            {servicio.sugerencias?.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {servicio.sugerencias.slice(0, 4).map((s) => (
                  <ServicioCard key={s.id} servicio={s} compacta />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-canvas/60 px-5 py-8 text-center text-[0.875rem] text-ink-3">
                No hay otros servicios de esta categoría por ahora.
              </div>
            )}
          </section>
        </div>

        <aside className="w-full shrink-0 lg:w-[320px]">
          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden">
              <div className="bg-canvas px-5 py-5">
                <Precio valor={servicio.precio} tamano="lg" />
                <p className="mt-3 flex items-center gap-1.5 text-[0.75rem] font-semibold text-ink-3">
                  <Icon nombre="shield" className="h-4 w-4 text-brand-mint-deep" />
                  Pago retenido hasta confirmar la entrega
                </p>
              </div>

              <div className="space-y-2.5 px-5 py-4 text-[0.875rem]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-3">Modalidad</span>
                  <span className="font-semibold text-ink">
                    {FORMATOS[servicio.formato] || servicio.formato}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink-3">Duración</span>
                  <span className="text-right font-semibold text-ink">
                    {servicio.duracion_estimada || 'A convenir'}
                  </span>
                </div>
                {servicio.ubicacion && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-ink-3">Ubicación</span>
                    <span className="text-right font-semibold text-ink">
                      {servicio.ubicacion}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-line px-5 py-4">
                <p className="mb-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink-3">
                  Servicio ejecutado por
                </p>
                <div className="flex items-center gap-3">
                  <Avatar nombre={nombreProfesional} foto={profesional?.foto} />
                  <div className="min-w-0">
                    <p className="truncate text-[0.875rem] font-bold text-ink">
                      {nombreProfesional}
                    </p>
                    {profesional?.ciudad && (
                      <p className="flex items-center gap-1 truncate text-[0.75rem] text-ink-3">
                        <Icon nombre="pin" className="h-3 w-3" />
                        {profesional.ciudad}
                      </p>
                    )}
                  </div>
                </div>
                {profesional?.bio && (
                  <p className="mt-2.5 line-clamp-4 whitespace-pre-line text-[0.75rem] leading-relaxed text-ink-3">
                    {profesional.bio}
                  </p>
                )}
                {profesional?.linkedin_url && (
                  <a
                    href={profesional.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-brand-blue-deep no-underline hover:underline"
                  >
                    Ver perfil de LinkedIn
                    <Icon nombre="external" className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="border-t border-line px-5 pb-5 pt-4">
                <BotonEnlace
                  to={`/servicios/${servicio.id}/programar`}
                  tamano="lg"
                  className="w-full"
                >
                  Reservar este servicio
                </BotonEnlace>
                <p className="mt-2.5 text-[0.75rem] leading-relaxed text-ink-3">
                  Elige fecha y hora según la disponibilidad del profesional. También
                  puedes reservar sin crear una cuenta.
                </p>
              </div>
            </Card>

            <p className="mt-3 px-1 text-center text-[0.75rem] text-ink-3">
              ¿Dudas sobre este servicio?{' '}
              <span className="font-semibold text-ink-2">
                {descripcionCategoria(categoria.slug)}
              </span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
