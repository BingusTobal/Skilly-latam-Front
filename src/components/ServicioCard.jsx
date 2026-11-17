import { Link } from 'react-router-dom'

import {
  descripcionCategoria,
  estiloCategoria,
  iconoFormato,
  iniciales,
} from '../lib/categorias'
import { FORMATOS, formatearCLP } from '../lib/formato'
import Icon from './Icon'

function Portada({ estilo, categoria, compacta = false, mostrarSello = true }) {
  return (
    <div
      className={`svc-cover relative grid shrink-0 place-items-center overflow-hidden ${
        compacta ? 'h-[104px]' : 'h-[138px]'
      }`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${estilo.c1}, ${estilo.c2})`,
      }}
    >
      <span className="absolute left-3.5 top-3.5 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[0.75rem] font-bold text-ink">
        {categoria.nombre || 'Servicio'}
      </span>
      {mostrarSello && (
        <span
          className="absolute right-3.5 top-3.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/20 text-white"
          role="img"
          aria-label="Servicio revisado por Skilly"
          title="Servicio revisado por Skilly"
        >
          <Icon nombre="shield" className="h-4 w-4" strokeWidth={2.2} />
        </span>
      )}
      <Icon
        nombre={estilo.icono}
        className={`relative z-10 text-white transition duration-200 group-hover:-rotate-6 group-hover:scale-110 ${
          compacta ? 'h-9 w-9' : 'h-12 w-12'
        }`}
        strokeWidth={1.5}
      />
    </div>
  )
}

function Metas({ servicio }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.8125rem] font-semibold text-ink-3">
      {servicio.formato && (
        <li className="inline-flex items-center gap-1.5">
          <Icon nombre={iconoFormato(servicio.formato)} className="h-4 w-4" />
          {FORMATOS[servicio.formato] || servicio.formato}
        </li>
      )}
      {servicio.duracion_estimada && (
        <li className="inline-flex items-center gap-1.5">
          <Icon nombre="clock" className="h-4 w-4" />
          {servicio.duracion_estimada}
        </li>
      )}
    </ul>
  )
}

function Cta({ servicio, compacta = false }) {
  return (
    <Link
      to={`/servicios/${servicio.id}`}
      className={`inline-flex items-center justify-center font-bold text-brand-blue-deep no-underline transition hover:bg-[#d6e3ff] ${
        compacta
          ? 'rounded-[10px] bg-brand-blue-soft px-3 py-2 text-[0.8125rem]'
          : 'rounded-xl bg-brand-blue-soft px-4 py-2.5 text-[0.9rem]'
      }`}
    >
      Ver servicio
    </Link>
  )
}

function ServicioGrid({ servicio, indice, compacta, mostrarSello, acciones, revelar }) {
  const categoria = servicio.categoria || {}
  const estilo = estiloCategoria(categoria.slug)
  const nombre = servicio.profesional_nombre || ''

  return (
    <article
      {...(revelar ? { 'data-reveal': true, style: { '--i': indice } } : {})}
      className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-white shadow-card transition duration-200 hover:-translate-y-1.5 hover:shadow-deep"
    >
      <Portada
        estilo={estilo}
        categoria={categoria}
        compacta={compacta}
        mostrarSello={mostrarSello}
      />

      <div className={`flex flex-1 flex-col ${compacta ? 'gap-2.5 p-4' : 'gap-3 p-5'}`}>
        <h3
          className={`line-clamp-2 font-bold leading-[1.3] tracking-[-0.02em] ${
            compacta ? 'text-[0.9375rem]' : 'text-[1.1875rem]'
          }`}
        >
          <Link
            to={`/servicios/${servicio.id}`}
            className="text-inherit no-underline transition hover:text-brand-blue"
          >
            {servicio.titulo}
          </Link>
        </h3>

        {nombre && (
          <p className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink-2">
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.65rem] font-extrabold text-white"
              style={{
                backgroundImage: `linear-gradient(135deg, ${estilo.c1}, ${estilo.c2})`,
              }}
              aria-hidden="true"
            >
              {iniciales(nombre)}
            </span>
            <span className="truncate">{nombre}</span>
          </p>
        )}

        <Metas servicio={servicio} />

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-line pt-4">
          <p>
            <span
              className={`block font-extrabold leading-none tracking-[-0.03em] text-ink ${
                compacta ? 'text-[1.25rem]' : 'text-[1.5rem]'
              }`}
            >
              {formatearCLP(servicio.precio)}
            </span>
            <span className="mt-1 block text-[0.75rem] font-semibold text-ink-3">
              CLP · precio fijo
            </span>
          </p>
          {acciones || <Cta servicio={servicio} compacta={compacta} />}
        </div>
      </div>
    </article>
  )
}

function ServicioFila({ servicio, acciones, mostrarSello, indice, revelar }) {
  const categoria = servicio.categoria || {}
  const estilo = estiloCategoria(categoria.slug)

  return (
    <article
      {...(revelar ? { 'data-reveal': true, style: { '--i': indice } } : {})}
      className="group flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-card transition hover:border-ink-3/40 hover:shadow-float sm:flex-nowrap sm:gap-4"
    >
      <div
        className="svc-cover relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl sm:h-16 sm:w-16"
        style={{
          backgroundImage: `linear-gradient(135deg, ${estilo.c1}, ${estilo.c2})`,
        }}
      >
        {mostrarSello && (
          <span className="absolute inset-x-0 bottom-0 bg-navy-950/25 py-0.5 text-center text-[0.5rem] font-bold uppercase tracking-wide text-white">
            Revisado
          </span>
        )}
        <Icon nombre={estilo.icono} className="h-6 w-6 text-white" strokeWidth={1.6} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-3">
          {categoria.nombre || 'Servicio'}
        </p>
        <h3 className="truncate text-[0.9375rem] font-bold leading-snug">
          <Link
            to={`/servicios/${servicio.id}`}
            className="text-inherit no-underline transition hover:text-brand-blue"
          >
            {servicio.titulo}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[0.75rem] text-ink-3">
          {servicio.descripcion_corta || descripcionCategoria(categoria.slug)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <p className="text-[0.9375rem] font-extrabold text-ink">
            {formatearCLP(servicio.precio)}
          </p>
          <p className="text-[0.6875rem] font-semibold text-ink-3">
            {FORMATOS[servicio.formato] || servicio.formato}
          </p>
        </div>
        {acciones}
      </div>
    </article>
  )
}

export default function ServicioCard({
  servicio,
  variante = 'grid',
  indice = 0,
  compacta = false,
  mostrarSello = true,
  acciones = null,
  revelar = false,
}) {
  if (variante === 'fila') {
    return (
      <ServicioFila
        servicio={servicio}
        acciones={acciones}
        mostrarSello={mostrarSello}
        indice={indice}
        revelar={revelar}
      />
    )
  }

  return (
    <ServicioGrid
      servicio={servicio}
      indice={indice}
      compacta={compacta || variante === 'compacta'}
      mostrarSello={mostrarSello}
      acciones={acciones}
      revelar={revelar}
    />
  )
}
