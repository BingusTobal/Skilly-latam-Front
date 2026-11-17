import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { listarCategorias, listarServicios } from '../../api/catalogo'
import Icon from '../../components/Icon'
import ServicioCard from '../../components/ServicioCard'
import {
  DESCRIPCIONES,
  estiloCategoria,
} from '../../lib/categorias'
import { FORMATOS, formatearCLP, montoNeto } from '../../lib/formato'
import useReveal from '../../lib/useReveal'
import './home.css'

const CONTENEDOR = 'mx-auto w-full max-w-[1180px] px-5 sm:px-8'

const PASOS = [
  {
    titulo: 'Elige un servicio',
    texto:
      'Compara precio, duración y modalidad. El precio es fijo: sin sorpresas.',
  },
  {
    titulo: 'Reserva y autoriza el pago',
    texto:
      'Escoge fecha y hora. Tu tarjeta solo se autoriza, todavía no se cobra. Puedes reservar sin crear cuenta.',
  },
  {
    titulo: 'El profesional acepta',
    texto:
      'Recién cuando acepta, el pago queda retenido por Skilly. Si no acepta, no pagas nada.',
  },
  {
    titulo: 'Confirma la entrega',
    texto:
      'Revisa el trabajo y confirma. Ahí se libera el pago al profesional.',
  },
]

const BENEFICIOS = [
  {
    titulo: 'Pago protegido',
    texto: 'Se retiene hasta que confirmas la entrega.',
    icono: 'shield',
    clase: 'bg-brand-mint-soft text-brand-mint-deep',
  },
  {
    titulo: 'Servicios revisados',
    texto: 'Cada publicación pasa por revisión antes de estar en el catálogo.',
    icono: 'user-check',
    clase: 'bg-brand-blue-soft text-brand-blue',
  },
  {
    titulo: 'Reserva sin cuenta',
    texto: 'Agenda en minutos, sin registrarte.',
    icono: 'calendar',
    clase: 'bg-brand-violet-soft text-brand-violet',
  },
  {
    titulo: 'Soporte ante problemas',
    texto: 'Reporta antes de confirmar y el pago sigue retenido.',
    icono: 'message',
    clase: 'bg-brand-coral-soft text-brand-coral-deep',
  },
]

const POPULARES = [
  { texto: 'Desarrollo web', consulta: 'desarrollo web' },
  { texto: 'Diseño UX/UI', consulta: 'diseño UX' },
  { texto: 'Marketing digital', consulta: 'marketing digital' },
  { texto: 'Auditoría financiera', consulta: 'auditoría' },
  { texto: 'Bienestar laboral', consulta: 'bienestar' },
]

const PREGUNTAS = [
  {
    pregunta: '¿Necesito una cuenta para reservar?',
    respuesta:
      'No. Puedes reservar con tus datos de contacto, sin crear una contraseña. Si ya tienes cuenta, inicia sesión y tus datos se completan solos.',
  },
  {
    pregunta: '¿Cuándo se me cobra?',
    respuesta:
      'Al reservar, tu tarjeta solo se autoriza. El cobro ocurre cuando el profesional acepta tu solicitud. Si la rechaza o no responde a tiempo, no se cobra nada.',
  },
  {
    pregunta: '¿Puedo cancelar una reserva?',
    respuesta:
      'Sí. Con 24 horas o más de anticipación recuperas el 100 %; con menos de 24 horas, el 90 %. Una vez iniciado el servicio ya no hay cancelación, pero puedes reportar un problema.',
  },
  {
    pregunta: '¿Qué pasa si el trabajo no cumple lo acordado?',
    respuesta:
      'Antes de confirmar la entrega, usa “Reportar un problema”. El pago permanece retenido mientras Skilly revisa el caso.',
  },
  {
    pregunta: '¿Cómo me convierto en profesional?',
    respuesta:
      'Postulas desde la plataforma. Un administrador revisa tu perfil y tus certificados; tu LinkedIn se valida automáticamente. Una vez aprobado, puedes publicar tus servicios.',
  },
]

function Eyebrow({ texto, claro = false }) {
  return (
    <p
      className={`inline-flex items-center gap-1 text-[0.8125rem] font-bold lowercase tracking-[0.08em] ${
        claro ? 'text-[#b8cdff]' : 'text-brand-blue'
      }`}
    >
      <span className="font-extrabold text-brand-mint">/</span>
      {texto}
    </p>
  )
}

function SectionHead({ etiqueta, titulo, descripcion, accion }) {
  return (
    <header
      data-reveal
      className={`reveal mb-10 flex flex-col gap-3 ${
        accion
          ? 'md:flex-row md:items-end md:justify-between md:gap-6'
          : ''
      }`}
    >
      <div className="flex max-w-[640px] flex-col gap-3">
        <Eyebrow texto={etiqueta} />
        <h2 className="text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold leading-[1.12] tracking-[-0.028em]">
          {titulo}
        </h2>
        {descripcion && (
          <p className="max-w-[56ch] text-[1.0625rem] leading-relaxed text-ink-3">
            {descripcion}
          </p>
        )}
      </div>
      {accion}
    </header>
  )
}

function EnlaceCatalogo({ children }) {
  return (
    <Link
      to="/catalogo"
      className="inline-flex shrink-0 items-center gap-2 font-bold text-brand-blue no-underline transition hover:gap-3"
    >
      {children}
      <Icon nombre="arrow" className="h-4 w-4" strokeWidth={2.2} />
    </Link>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [destacados, setDestacados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setCategorias([]))
    listarServicios({ page_size: 6 })
      .then((data) => setDestacados(data.results || []))
      .catch(() => setDestacados([]))
      .finally(() => setCargando(false))
  }, [])

  useReveal([categorias.length, destacados.length, cargando])

  function buscar(evento) {
    evento.preventDefault()
    const params = new URLSearchParams()
    if (busqueda.trim()) params.set('q', busqueda.trim())
    if (categoria) params.set('categoria', categoria)
    const query = params.toString()
    navigate(`/catalogo${query ? `?${query}` : ''}`)
  }

  const principal = destacados[0]
  const estiloHero = estiloCategoria(principal?.categoria?.slug)
  const categoriaHero = principal?.categoria?.nombre || 'Servicios profesionales'
  const tituloHero =
    principal?.titulo || 'Talento experto para tu próximo proyecto'
  const formatoHero = principal
    ? FORMATOS[principal.formato] || principal.formato
    : 'Remoto · Presencial'
  const duracionHero = principal?.duracion_estimada || 'A tu medida'
  const precioHero = principal ? formatearCLP(principal.precio) : 'Precio fijo'
  const unidadHero = principal ? 'CLP · precio fijo' : 'Precio publicado'
  const detalleHero = principal ? `/servicios/${principal.id}` : '/catalogo'

  return (
    <div>
      <section className="hero relative isolate overflow-hidden pb-12 pt-10 lg:pb-12 lg:pt-16">
        <div className="hero-bg" aria-hidden="true">
          <span className="tri tri-1" />
          <span className="tri tri-2" />
          <span className="tri tri-3" />
        </div>

        <div className={`${CONTENEDOR} grid items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-12`}>
          <div className="flex flex-col items-start gap-5 lg:py-6">
            <Eyebrow texto="marketplace de talento independiente" />

            <h1 className="max-w-[15ch] text-[clamp(2.35rem,5.2vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
              Contrata <span className="grad-text">talento experto</span> solo
              cuando lo necesitas
            </h1>

            <p className="max-w-[56ch] text-[clamp(1.0625rem,1.6vw,1.25rem)] leading-relaxed text-ink-2">
              Servicios de precio fijo publicados por profesionales. Reserva en
              minutos y paga con tranquilidad: tu dinero queda protegido hasta
              que confirmes la entrega.
            </p>

            <form
              onSubmit={buscar}
              role="search"
              className="search flex w-full max-w-[660px] flex-wrap items-stretch gap-1.5 rounded-[20px] border border-line bg-white p-2 shadow-float transition focus-within:border-[#b4c7fb] focus-within:ring-4 focus-within:ring-brand-blue/10"
            >
              <label className="search-field flex min-w-0 flex-1 items-center gap-2.5 px-3.5 text-ink-3">
                <Icon nombre="search" className="h-5 w-5 shrink-0" />
                <span className="sr-only">¿Qué servicio necesitas?</span>
                <input
                  type="search"
                  name="q"
                  autoComplete="off"
                  placeholder="Ej: sitio web, diseño UX, auditoría…"
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent py-3.5 text-ink outline-none placeholder:text-[#8797a8]"
                />
              </label>

              <label className="search-select flex items-center border-line pl-1.5">
                <span className="sr-only">Categoría</span>
                <select
                  name="categoria"
                  value={categoria}
                  onChange={(evento) => setCategoria(evento.target.value)}
                  className="max-w-[190px] appearance-none border-0 bg-transparent py-3.5 pl-3 pr-9 font-semibold text-ink-2 outline-none"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((item) => (
                    <option key={item.id} value={item.slug || item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] bg-brand-blue px-6 py-3 text-[0.95rem] font-bold text-white shadow-[0_8px_20px_-8px_rgba(43,100,240,0.7)] transition hover:-translate-y-0.5 hover:bg-brand-blue-deep"
              >
                Buscar
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
              <span className="text-[0.875rem] font-bold text-ink-3">
                Populares
              </span>
              <ul className="flex flex-wrap gap-2">
                {POPULARES.map((item) => (
                  <li key={item.texto}>
                    <Link
                      to={`/catalogo?q=${encodeURIComponent(item.consulta)}`}
                      className="inline-block rounded-full border border-line bg-white px-3.5 py-1.5 text-[0.875rem] font-semibold text-ink-2 no-underline transition hover:border-brand-blue hover:bg-brand-blue-soft hover:text-brand-blue"
                    >
                      {item.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="relative mx-auto min-h-[460px] w-full max-w-[520px] sm:min-h-[520px] lg:min-h-[540px]"
            aria-hidden="true"
          >
            <div className="absolute inset-[8%_4%_8%_10%] -z-10 rounded-full bg-brand-blue/20 blur-3xl" />

            <div className="absolute right-[4%] top-8 w-[86%] max-w-[350px] rotate-2 overflow-hidden rounded-[22px] border border-line bg-white shadow-deep">
              <div
                className="svc-cover relative grid h-[150px] place-items-center overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${estiloHero.c1}, ${estiloHero.c2})`,
                }}
              >
                <span className="absolute left-3.5 top-3.5 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[0.75rem] font-bold text-ink">
                  {categoriaHero}
                </span>
                <Icon
                  nombre={estiloHero.icono}
                  className="relative z-10 h-[54px] w-[54px] text-white"
                  strokeWidth={1.5}
                />
              </div>

              <div className="flex flex-col gap-3 p-[18px]">
                <p className="text-[1.0625rem] font-extrabold leading-[1.3] tracking-[-0.015em]">
                  {tituloHero}
                </p>

                {principal?.profesional_nombre && (
                  <p className="flex items-center gap-2 text-[0.875rem] font-semibold text-ink-2">
                    <span
                      className="grid h-[30px] w-[30px] place-items-center rounded-full text-[0.6875rem] font-extrabold text-white"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${estiloHero.c1}, ${estiloHero.c2})`,
                      }}
                    >
                      {principal.profesional_nombre
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((parte) => parte[0]?.toUpperCase())
                        .join('')}
                    </span>
                    {principal.profesional_nombre}
                  </p>
                )}

                <div className="flex flex-wrap gap-3.5 text-[0.8125rem] font-semibold text-ink-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon
                      nombre={
                        principal?.formato === 'remoto' ? 'monitor' : 'pin'
                      }
                      className="h-4 w-4"
                    />
                    {formatoHero}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon nombre="clock" className="h-4 w-4" />
                    {duracionHero}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-3 border-t border-dashed border-line pt-3">
                  <div>
                    <span className="block text-[1.5rem] font-extrabold leading-none tracking-[-0.03em]">
                      {precioHero}
                    </span>
                    <span className="text-[0.75rem] font-semibold text-ink-3">
                      {unidadHero}
                    </span>
                  </div>
                  <Link
                    to={detalleHero}
                    tabIndex={-1}
                    className="rounded-xl bg-brand-blue px-4 py-2.5 text-[0.875rem] font-bold text-white no-underline"
                  >
                    {principal ? 'Ver servicio' : 'Explorar'}
                  </Link>
                </div>
              </div>
            </div>

            <div className="float-slow absolute left-0 top-[118px] flex items-center gap-3 rounded-2xl border border-line bg-white p-3 pr-4 shadow-float">
              <span className="grid h-[38px] w-[38px] place-items-center rounded-xl bg-brand-mint-soft text-brand-mint-deep">
                <Icon nombre="lock" className="h-5 w-5" strokeWidth={2} />
              </span>
              <span>
                <strong className="block text-[0.875rem] leading-tight">
                  Pago autorizado
                </strong>
                <small className="text-[0.75rem] font-medium text-ink-3">
                  Aún no se cobra
                </small>
              </span>
            </div>

            <div className="float-slow float-reverse absolute bottom-24 right-0 flex items-center gap-3 rounded-2xl border border-line bg-white p-3 pr-4 shadow-float">
              <span className="grid h-[38px] w-[38px] place-items-center rounded-xl bg-brand-blue-soft text-brand-blue">
                <Icon nombre="user-check" className="h-5 w-5" strokeWidth={2} />
              </span>
              <span>
                <strong className="block text-[0.875rem] leading-tight">
                  Profesional aprobado
                </strong>
                <small className="text-[0.75rem] font-medium text-ink-3">
                  Perfil revisado por Skilly
                </small>
              </span>
            </div>

            <div className="absolute bottom-[26px] left-[2%] hidden w-[236px] -rotate-3 rounded-[22px] border border-line bg-white p-4 shadow-deep sm:block">
              <p className="mb-3 flex items-center gap-2 text-[0.875rem] font-bold">
                <Icon nombre="calendar" className="h-4 w-4" />
                Elige fecha y hora
              </p>
              <div className="flex gap-2">
                {['9:00', '9:30', '10:00'].map((hora, indice) => (
                  <span
                    key={hora}
                    className={`flex-1 rounded-[10px] border py-2 text-center text-[0.8125rem] font-bold ${
                      indice === 1
                        ? 'border-navy-800 bg-navy-800 text-white'
                        : 'border-line text-ink-2'
                    }`}
                  >
                    {hora}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={CONTENEDOR}>
          <ul className="trust-list mt-10 grid overflow-hidden rounded-[24px] border border-line bg-white shadow-card">
            {BENEFICIOS.map((beneficio) => (
              <li
                key={beneficio.titulo}
                className="trust-item flex items-start gap-3.5 p-5 sm:p-[22px]"
              >
                <span
                  className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[13px] ${beneficio.clase}`}
                >
                  <Icon
                    nombre={beneficio.icono}
                    className="h-5 w-5"
                    strokeWidth={2}
                  />
                </span>
                <span>
                  <strong className="block text-[0.9375rem] leading-tight">
                    {beneficio.titulo}
                  </strong>
                  <span className="mt-0.5 block text-[0.8125rem] leading-snug text-ink-3">
                    {beneficio.texto}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="categorias" className="py-14 lg:py-24">
        <div className={CONTENEDOR}>
          <SectionHead
            etiqueta="categorías"
            titulo="Explora por categoría"
            descripcion="Cinco áreas para que tu equipo avance sin sumar contratos fijos."
            accion={<EnlaceCatalogo>Ver todo el catálogo</EnlaceCatalogo>}
          />

          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {cargando &&
              Array.from({ length: 5 }).map((_, indice) => (
                <li
                  key={indice}
                  className="h-[220px] animate-pulse rounded-[16px] border border-line bg-canvas"
                />
              ))}

            {!cargando &&
              categorias.slice(0, 5).map((item, indice) => {
                const estilo = estiloCategoria(item.slug)
                return (
                  <li
                    key={item.id}
                    data-reveal
                    style={{ '--i': indice }}
                    className="reveal"
                  >
                    <Link
                      to={`/catalogo?categoria=${item.slug || item.id}`}
                      className="flex h-full min-h-[220px] flex-col gap-2.5 rounded-[16px] border border-line bg-white p-5 text-inherit no-underline shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-float"
                    >
                      <span
                        className="mb-1.5 grid h-[50px] w-[50px] place-items-center rounded-[15px]"
                        style={{
                          backgroundColor: estilo.tint,
                          color: estilo.hue,
                        }}
                      >
                        <Icon
                          nombre={estilo.icono}
                          className="h-[26px] w-[26px]"
                        />
                      </span>
                      <h3 className="text-[1.0625rem] font-bold leading-tight">
                        {item.nombre}
                      </h3>
                      <p className="flex-1 text-[0.875rem] leading-normal text-ink-3">
                        {DESCRIPCIONES[item.slug] ||
                          'Servicios profesionales con precio fijo.'}
                      </p>
                      <span
                        className="inline-flex items-center gap-1.5 text-[0.8125rem] font-bold"
                        style={{ color: estilo.hue }}
                      >
                        Ver servicios
                        <Icon nombre="arrow" className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </li>
                )
              })}
          </ul>
        </div>
      </section>

      <section id="servicios" className="bg-canvas py-14 lg:py-24">
        <div className={CONTENEDOR}>
          <SectionHead
            etiqueta="destacados"
            titulo="Servicios publicados recientemente"
            descripcion="Precio fijo, alcance claro y un profesional con nombre y apellido."
            accion={<EnlaceCatalogo>Ver todo el catálogo</EnlaceCatalogo>}
          />

          {cargando ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, indice) => (
                <div
                  key={indice}
                  className="h-[390px] animate-pulse rounded-[20px] border border-line bg-white"
                />
              ))}
            </div>
          ) : destacados.length === 0 ? (
            <div className="rounded-[24px] border border-line bg-white p-10 text-center shadow-card">
              <p className="text-[1.0625rem] font-bold">
                Todavía no hay servicios publicados.
              </p>
              <p className="mt-2 text-[0.95rem] text-ink-3">
                Vuelve pronto o revisa el catálogo completo.
              </p>
              <Link
                to="/catalogo"
                className="mt-5 inline-flex rounded-xl bg-brand-blue px-5 py-3 font-bold text-white no-underline"
              >
                Ir al catálogo
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {destacados.map((servicio, indice) => (
                <ServicioCard
                  key={servicio.id}
                  servicio={servicio}
                  indice={indice}
                  revelar
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="como-funciona" className="py-14 lg:py-24">
        <div className={`${CONTENEDOR} grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16`}>
          <div>
            <SectionHead
              etiqueta="cómo funciona"
              titulo="De la idea a la entrega, en cuatro pasos"
              descripcion="Sin licitaciones ni contratos largos. Tú decides qué contratar y cuándo."
            />

            <ol className="steps relative flex flex-col gap-1.5">
              {PASOS.map((paso, indice) => (
                <li
                  key={paso.titulo}
                  data-reveal
                  style={{ '--i': indice }}
                  className="reveal relative flex gap-5 py-3.5"
                >
                  <span className="step-n relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-brand-blue bg-white text-[1.0625rem] font-extrabold text-brand-blue">
                    {indice + 1}
                  </span>
                  <div>
                    <h3 className="mb-1 text-[1.125rem] font-bold leading-snug">
                      {paso.titulo}
                    </h3>
                    <p className="max-w-[46ch] leading-relaxed text-ink-3">
                      {paso.texto}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside
            data-reveal
            className="protect-panel reveal rounded-[28px] p-7 text-white shadow-deep sm:p-8 lg:sticky lg:top-[96px]"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-mint/20 px-3.5 py-1.5 text-[0.8125rem] font-bold text-[#7ff0d3]">
              <Icon nombre="shield" className="h-4 w-4" strokeWidth={2} />
              Pago protegido
            </span>
            <h3 className="mb-6 mt-4 text-[1.625rem] font-bold leading-tight tracking-[-0.025em]">
              Tu dinero, cuidado en cada etapa
            </h3>

            <ol className="timeline relative flex flex-col">
              <li className="done relative flex gap-4 py-2.5">
                <span className="dot relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full">
                  <Icon nombre="check" className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div>
                  <strong className="block">Autorizado</strong>
                  <span className="block text-[0.875rem] leading-snug text-[#b6c5dc]">
                    Se reserva el cupo de tu tarjeta. No se cobra.
                  </span>
                </div>
              </li>
              <li className="done relative flex gap-4 py-2.5">
                <span className="dot relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full">
                  <Icon nombre="check" className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div>
                  <strong className="block">Retenido</strong>
                  <span className="block text-[0.875rem] leading-snug text-[#b6c5dc]">
                    El profesional aceptó. Skilly retiene el pago.
                  </span>
                </div>
              </li>
              <li className="relative flex gap-4 py-2.5">
                <span className="dot relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full">
                  <Icon nombre="lock" className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div>
                  <strong className="block">Liberado</strong>
                  <span className="block text-[0.875rem] leading-snug text-[#b6c5dc]">
                    Confirmaste la entrega. El profesional recibe su pago.
                  </span>
                </div>
              </li>
            </ol>

            <p className="mt-5 border-t border-white/15 pt-5 text-[0.875rem] leading-relaxed text-[#b6c5dc]">
              ¿Algo salió mal? Reporta un problema: el pago permanece retenido
              mientras Skilly revisa el caso.
            </p>
            <p className="mt-3.5 flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-3 text-[0.875rem] text-[#e3ecfb]">
              <Icon
                nombre="calendar"
                className="h-4 w-4 shrink-0 text-[#7ff0d3]"
              />
              Cancela con 24 h o más de anticipación y recupera el 100 %. Con
              menos de 24 h, el 90 %.
            </p>
          </aside>
        </div>
      </section>

      <section
        id="profesionales"
        className="section-pro bg-gradient-to-b from-canvas to-white py-14 lg:py-24"
      >
        <div className={`${CONTENEDOR} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
          <div data-reveal className="reveal flex flex-col items-start gap-4">
            <Eyebrow texto="para profesionales" />
            <h2 className="text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold leading-[1.12] tracking-[-0.028em]">
              Publica tus servicios y trabaja a tu manera
            </h2>
            <p className="max-w-[56ch] text-[1.0625rem] leading-relaxed text-ink-3">
              Súmate como talento independiente: tú pones el precio, el horario
              y las condiciones.
            </p>

            <ul className="mt-2 flex flex-col gap-3.5">
              {[
                {
                  titulo: 'Tú defines tu horario.',
                  texto:
                    'Las organizaciones solo reservan dentro de tu disponibilidad.',
                },
                {
                  titulo: 'Siempre ves tu monto neto.',
                  texto: 'Lo que recibirás, con la comisión ya descontada.',
                },
                {
                  titulo: 'Hablas directo con la organización',
                  texto: 'una vez que aceptas la solicitud.',
                },
                {
                  titulo: 'Sin calificaciones por estrellas.',
                  texto: 'Tu trabajo se evalúa por el servicio entregado.',
                },
              ].map((item) => (
                <li key={item.titulo} className="flex items-start gap-3">
                  <Icon
                    nombre="check-circle"
                    className="mt-0.5 h-5 w-5 shrink-0 text-brand-mint-deep"
                    strokeWidth={2}
                  />
                  <span className="text-ink-2">
                    <strong className="text-ink">{item.titulo}</strong>{' '}
                    {item.texto}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                to="/postular"
                className="inline-flex items-center justify-center rounded-[14px] bg-brand-blue px-6 py-3.5 font-bold text-white no-underline shadow-[0_8px_20px_-8px_rgba(43,100,240,0.7)] transition hover:-translate-y-0.5 hover:bg-brand-blue-deep"
              >
                Postula como profesional
              </Link>
              <Link
                to="/ayuda"
                className="inline-flex items-center gap-2 font-bold text-brand-blue no-underline transition hover:gap-3"
              >
                Cómo se valida mi perfil
                <Icon nombre="arrow" className="h-4 w-4" strokeWidth={2.2} />
              </Link>
            </div>
          </div>

          <div
            data-reveal
            className="reveal relative mx-auto min-h-[380px] w-full max-w-[520px] sm:min-h-[400px]"
            aria-hidden="true"
          >
            <div className="absolute left-0 top-0 w-[94%] max-w-[340px] -rotate-2 rounded-[22px] border border-line bg-white p-[22px] shadow-deep">
              <p className="mb-3.5 text-[0.9375rem] font-extrabold">
                Tu monto neto
              </p>
              <div className="rounded-xl bg-brand-mint-soft/60 px-4 py-5">
                <span className="text-[0.8125rem] font-semibold text-ink-2">
                  Recibirás
                </span>
                <strong className="block text-[2rem] font-extrabold leading-tight tracking-[-0.03em] text-brand-mint-deep">
                  {formatearCLP(montoNeto(700000))}
                </strong>
                <span className="text-[0.75rem] font-semibold text-ink-3">
                  Ejemplo ilustrativo · comisión ya descontada
                </span>
              </div>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-3">
                Ves exactamente lo que recibirás. Sin desgloses ni sorpresas.
              </p>
            </div>

            <div className="absolute bottom-0 right-0 w-[84%] max-w-[300px] rotate-[2.5deg] rounded-[22px] border border-line bg-white p-[22px] shadow-deep">
              <p className="mb-3.5 flex items-center gap-2 text-[0.9375rem] font-extrabold">
                <Icon nombre="calendar" className="h-4 w-4" />
                Mi horario de atención
              </p>
              <div className="flex gap-1.5">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, indice) => (
                  <span
                    key={`${dia}-${indice}`}
                    className={`grid h-[34px] w-[34px] place-items-center rounded-[10px] border text-[0.8125rem] font-bold ${
                      indice < 5
                        ? 'border-brand-blue bg-brand-blue text-white'
                        : 'border-line text-ink-3'
                    }`}
                  >
                    {dia}
                  </span>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-2 font-bold text-ink-2">
                <Icon nombre="clock" className="h-4 w-4" />
                9:00 – 18:00
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-canvas py-14 lg:py-24">
        <div className={`${CONTENEDOR} grid items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16`}>
          <div data-reveal className="reveal lg:sticky lg:top-[96px]">
            <Eyebrow texto="preguntas frecuentes" />
            <h2 className="mt-3 text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold leading-[1.12] tracking-[-0.028em]">
              Lo que más nos preguntan
            </h2>
            <p className="mt-3 max-w-[56ch] text-[1.0625rem] leading-relaxed text-ink-3">
              ¿Tienes otra duda? Escríbenos a{' '}
              <a
                href="mailto:hola@skillylatam.com"
                className="font-semibold text-brand-blue underline underline-offset-4"
              >
                hola@skillylatam.com
              </a>
              .
            </p>
          </div>

          <div className="faq-list flex flex-col gap-3">
            {PREGUNTAS.map((item, indice) => (
              <details
                key={item.pregunta}
                data-reveal
                style={{ '--i': indice }}
                className="faq-item reveal rounded-[16px] border border-line bg-white shadow-card transition hover:border-[#c9d6ee]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[16px] px-[22px] py-5 text-[1.0625rem] font-bold transition hover:text-brand-blue">
                  {item.pregunta}
                  <Icon
                    nombre="chevron"
                    className="chev h-4 w-4 shrink-0 text-ink-3"
                    strokeWidth={2.2}
                  />
                </summary>
                <p className="max-w-[60ch] px-[22px] pb-[22px] leading-relaxed text-ink-3">
                  {item.respuesta}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-canvas pb-14 pt-6 lg:pb-24">
        <div className={CONTENEDOR}>
          <div
            data-reveal
            className="cta-card reveal relative isolate overflow-hidden rounded-[32px] px-5 py-[56px] text-center text-white sm:px-6 lg:py-[76px]"
          >
            <span className="tri tri-a" aria-hidden="true" />
            <span className="tri tri-b" aria-hidden="true" />
            <Eyebrow texto="empecemos" claro />
            <h2 className="mx-auto mb-3.5 mt-3.5 max-w-[18ch] text-[clamp(2rem,4.4vw,3.25rem)] font-extrabold leading-[1.08] tracking-[-0.03em]">
              Contrata solo lo que necesitas.
            </h2>
            <p className="mx-auto max-w-[46ch] text-[1.125rem] text-[#c3d3ec]">
              Encuentra al profesional indicado y reserva hoy mismo, con tu pago
              protegido.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                to="/catalogo"
                className="inline-flex items-center justify-center rounded-[14px] bg-white px-6 py-3.5 font-bold text-navy-900 no-underline transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.5)]"
              >
                Explorar servicios
              </Link>
              <Link
                to="/postular"
                className="inline-flex items-center justify-center rounded-[14px] border border-white/40 px-6 py-3.5 font-bold text-white no-underline transition hover:border-white hover:bg-white/10"
              >
                Soy profesional
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
