import { useMemo, useState } from 'react'

import { CATEGORIAS_AYUDA, CONTACTO, PREGUNTAS } from '../../content/ayuda'

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
    <div className="-mx-6 -mt-5">
      <section className="bg-navy px-8 pb-10 pt-12 text-center text-white">
        <h1 className="text-[24px] font-bold">¿En qué podemos ayudarte?</h1>
        <p className="mt-2 text-[12.5px] text-sky">
          Busca por reserva, pago, certificado o disputa.
        </p>
        <div className="mx-auto mt-6 flex max-w-lg border border-black bg-white">
          <input
            value={busqueda}
            onChange={(evento) => {
              setBusqueda(evento.target.value)
              setAbierta(null)
            }}
            className="flex-1 px-3 py-3 text-[13px] text-gray-700 outline-none"
            placeholder="Ej: cancelar una reserva, comisión, certificados…"
            aria-label="Buscar en el centro de ayuda"
          />
          <span className="flex items-center border-l border-black bg-black px-4 text-[12.5px] text-white">
            Buscar
          </span>
        </div>
      </section>

      <section className="border-b border-gray-100 px-8 py-7">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CATEGORIAS_AYUDA.map((grupo) => {
            const activa = categoria === grupo.id
            return (
              <button
                key={grupo.id}
                type="button"
                onClick={() => {
                  setCategoria(activa ? '' : grupo.id)
                  setAbierta(null)
                }}
                className={`border p-4 text-left transition ${
                  activa ? 'border-black' : 'border-line hover:border-ink'
                } ${grupo.color}`}
              >
                <p className="text-[12.5px] font-bold">{grupo.titulo}</p>
                <p className="mt-1 text-[11px] text-gray-600">{grupo.descripcion}</p>
              </button>
            )
          })}
        </div>
        {categoria && (
          <button
            type="button"
            onClick={() => setCategoria('')}
            className="mt-3 text-[11px] text-navy underline"
          >
            Ver todas las categorías
          </button>
        )}
      </section>

      <section className="px-8 py-7">
        <h2 className="mb-4 text-[16px] font-bold">Preguntas frecuentes</h2>

        {agrupadas.length === 0 ? (
          <div className="border border-line bg-[#fafafa] px-4 py-6 text-center">
            <p className="text-[13px] font-bold">No encontramos resultados.</p>
            <p className="mt-1 text-[12px] text-gray-600">
              Prueba con otra palabra o escríbenos a soporte.
            </p>
          </div>
        ) : (
          agrupadas.map((grupo) => (
            <div key={grupo.id} className="mb-6">
              <h3 className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-gray-500">
                {grupo.titulo}
              </h3>
              <ul className="m-0 list-none border-t border-line p-0">
                {grupo.preguntas.map((item) => {
                  const clave = `${grupo.id}-${item.pregunta}`
                  const estaAbierta = abierta === clave
                  return (
                    <li key={clave} className="border-b border-[#eeeeee]">
                      <button
                        type="button"
                        onClick={() => setAbierta(estaAbierta ? null : clave)}
                        className="flex w-full items-center justify-between gap-4 py-3 text-left text-[12.5px] font-bold"
                        aria-expanded={estaAbierta}
                      >
                        <span>{item.pregunta}</span>
                        <span className="text-[13px] font-normal text-gray-400">
                          {estaAbierta ? '⌃' : '⌄'}
                        </span>
                      </button>
                      {estaAbierta && (
                        <p className="mb-3 max-w-3xl text-[12.5px] leading-relaxed text-gray-600">
                          {item.respuesta}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </section>

      <section className="border-t border-gray-100 px-8 py-7">
        <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-[#f5f5f5] px-5 py-4">
          <div>
            <p className="text-[14px] font-bold">¿No encontraste lo que buscabas?</p>
            <p className="mt-1 text-[11.5px] text-gray-600">{CONTACTO.horario}</p>
            <a
              href={correo}
              className="mt-1 inline-block text-[11.5px] text-black underline"
            >
              {CONTACTO.email}
            </a>
          </div>
          <a
            href={correo}
            className="border border-black bg-black px-5 py-2.5 text-[12.5px] text-white no-underline"
          >
            Contactar a soporte
          </a>
        </div>
      </section>
    </div>
  )
}
