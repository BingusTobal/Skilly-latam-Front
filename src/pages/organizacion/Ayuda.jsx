import { useMemo, useState } from 'react'

import { CATEGORIAS_AYUDA, CONTACTO, PREGUNTAS } from '../../content/ayuda'
import Icon from '../../components/Icon'
import {
  BotonEnlace,
  Card,
  EmptyState,
  PageHeader,
} from '../../components/ui'

const ESTILOS_CATEGORIA = [
  { icono: 'credit-card', clase: 'bg-brand-blue-soft text-brand-blue-deep' },
  { icono: 'users', clase: 'bg-ok-soft text-ok' },
  { icono: 'alert-triangle', clase: 'bg-warn-soft text-warn' },
]

function normalizar(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function Ayuda() {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [abierta, setAbierta] = useState(null)

  const resultados = useMemo(() => {
    const termino = normalizar(busqueda.trim())
    return PREGUNTAS.filter((item) => {
      if (categoria && item.categoria !== categoria) return false
      if (!termino) return true
      return (
        normalizar(item.pregunta).includes(termino) ||
        normalizar(item.respuesta).includes(termino) ||
        normalizar(item.categoria).includes(termino)
      )
    })
  }, [busqueda, categoria])

  const agrupadas = useMemo(() => {
    return CATEGORIAS_AYUDA.map((grupo) => ({
      ...grupo,
      preguntas: resultados.filter((item) => item.categoria === grupo.id),
    })).filter((grupo) => grupo.preguntas.length > 0)
  }, [resultados])

  const correo = `mailto:${CONTACTO.email}?subject=${encodeURIComponent(
    CONTACTO.asunto,
  )}`

  return (
    <div>
      <PageHeader
        migas={[{ texto: 'Inicio', to: '/' }, { texto: 'Ayuda' }]}
        etiqueta="Centro de ayuda"
        titulo="¿En qué podemos ayudarte?"
        descripcion="Busca por reserva, pago, certificado o disputa."
      />

      <div className="mb-6 overflow-hidden rounded-[24px] bg-navy-950 px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-xl">
          <label htmlFor="ayuda-busqueda" className="sr-only">
            Buscar en el centro de ayuda
          </label>
          <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-float">
            <Icon nombre="search" className="ml-2 h-5 w-5 shrink-0 text-ink-3" />
            <input
              id="ayuda-busqueda"
              value={busqueda}
              onChange={(evento) => {
                setBusqueda(evento.target.value)
                setAbierta(null)
              }}
              className="min-w-0 flex-1 border-0 bg-transparent py-2 text-[0.9375rem] text-ink placeholder:text-ink-3/70 focus:outline-none"
              placeholder="Ej: cancelar una reserva, comisión, certificados…"
            />
          </div>
          <p className="mt-3 text-center text-[0.75rem] text-white/60">
            {PREGUNTAS.length} respuestas sobre reservas, pagos y profesionales.
          </p>
        </div>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CATEGORIAS_AYUDA.map((grupo, indice) => {
          const activa = categoria === grupo.id
          const estilo = ESTILOS_CATEGORIA[indice % ESTILOS_CATEGORIA.length]
          return (
            <button
              key={grupo.id}
              type="button"
              onClick={() => {
                setCategoria(activa ? '' : grupo.id)
                setAbierta(null)
              }}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                activa
                  ? 'border-brand-blue bg-white shadow-float ring-4 ring-brand-blue/10'
                  : 'border-line bg-white shadow-card hover:border-ink-3/40 hover:shadow-float'
              }`}
              aria-pressed={activa}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${estilo.clase}`}
              >
                <Icon nombre={estilo.icono} className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.875rem] font-bold text-ink">
                  {grupo.titulo}
                </span>
                <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-ink-3">
                  {grupo.descripcion}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {categoria && (
        <button
          type="button"
          onClick={() => setCategoria('')}
          className="mb-4 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-brand-blue-deep hover:underline"
        >
          <Icon nombre="x-circle" className="h-3.5 w-3.5" />
          Ver todas las categorías
        </button>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        <section className="min-w-0">
          <h2 className="mb-4 text-[1.25rem] font-extrabold tracking-[-0.02em] text-ink">
            Preguntas frecuentes
          </h2>

          {agrupadas.length === 0 ? (
            <EmptyState
              icono="message"
              titulo="No encontramos resultados"
              accion={
                <BotonEnlace href={correo} variante="secundario">
                  Escribir a soporte
                </BotonEnlace>
              }
            >
              Prueba con otra palabra o escríbenos directamente.
            </EmptyState>
          ) : (
            <div className="space-y-6">
              {agrupadas.map((grupo) => (
                <div key={grupo.id}>
                  <h3 className="mb-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-ink-3">
                    {grupo.titulo}
                  </h3>
                  <Card className="overflow-hidden">
                    <ul className="divide-y divide-line">
                      {grupo.preguntas.map((item) => {
                        const clave = `${grupo.id}-${item.pregunta}`
                        const estaAbierta = abierta === clave
                        return (
                          <li key={clave}>
                            <button
                              type="button"
                              onClick={() => setAbierta(estaAbierta ? null : clave)}
                              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-[0.875rem] font-bold text-ink transition hover:bg-canvas sm:px-5"
                              aria-expanded={estaAbierta}
                            >
                              <span>{item.pregunta}</span>
                              <Icon
                                nombre="chevron"
                                className={`h-4 w-4 shrink-0 text-ink-3 transition ${
                                  estaAbierta ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            {estaAbierta && (
                              <p className="px-4 pb-4 text-[0.875rem] leading-relaxed text-ink-2 sm:px-5">
                                {item.respuesta}
                              </p>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-24">
          <Card className="overflow-hidden">
            <div className="bg-navy-950 px-5 py-5 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-brand-mint">
                <Icon nombre="message" className="h-5 w-5" />
              </span>
              <p className="mt-3 text-[1rem] font-bold">¿No encontraste lo que buscabas?</p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-white/70">
                {CONTACTO.horario}
              </p>
            </div>
            <div className="px-5 py-4">
              <a
                href={correo}
                className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-2 no-underline hover:text-brand-blue-deep"
              >
                <Icon nombre="mail" className="h-4 w-4 text-brand-blue" />
                {CONTACTO.email}
              </a>
              <BotonEnlace href={correo} className="mt-4 w-full" tamano="sm">
                Contactar a soporte
              </BotonEnlace>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
