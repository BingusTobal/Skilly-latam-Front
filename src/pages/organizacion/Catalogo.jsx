import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { listarCategorias, listarServicios } from '../../api/catalogo'
import ServicioCard from '../../components/ServicioCard'

const TAMANO_PAGINA = 20

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categorias, setCategorias] = useState([])
  const [servicios, setServicios] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)

  const categoria = searchParams.get('categoria') || ''
  const q = searchParams.get('q') || ''
  const page = Number(searchParams.get('page') || 1)
  const [texto, setTexto] = useState(q)

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setCategorias([]))
  }, [])

  useEffect(() => {
    setTexto(q)
  }, [q])

  useEffect(() => {
    let activo = true
    setCargando(true)
    const params = { page }
    if (q) params.q = q
    if (categoria) params.categoria = categoria

    listarServicios(params)
      .then((data) => {
        if (!activo) return
        setServicios(data.results || [])
        setTotal(data.count || 0)
      })
      .catch(() => {
        if (activo) setServicios([])
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [q, categoria, page])

  function buscar(evento) {
    evento.preventDefault()
    const nuevos = new URLSearchParams()
    if (texto.trim()) nuevos.set('q', texto.trim())
    if (categoria) nuevos.set('categoria', categoria)
    setSearchParams(nuevos)
  }

  function filtrarCategoria(id) {
    const nuevos = new URLSearchParams(searchParams)
    if (id) nuevos.set('categoria', id)
    else nuevos.delete('categoria')
    nuevos.delete('page')
    setSearchParams(nuevos)
  }

  function cambiarPagina(delta) {
    const nuevos = new URLSearchParams(searchParams)
    const destino = page + delta
    if (destino <= 1) nuevos.delete('page')
    else nuevos.set('page', destino)
    setSearchParams(nuevos)
  }

  return (
    <div className="pt-5">
      <p className="mb-4 text-[12px] text-gray-500">Inicio &gt; Servicios</p>
      <h1 className="mb-5 text-[22px] font-bold">
        Encuentra el servicio que tu organización necesita
      </h1>

      <form onSubmit={buscar} className="mb-7 flex max-w-md border border-black">
        <input
          className="flex-1 px-3 py-3 text-[13px] outline-none"
          placeholder="Ej: diseño UX, desarrollo web…"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
        />
        <button className="border-l border-black bg-black px-5 text-[13px] text-white">
          Buscar
        </button>
      </form>

      <div className="flex gap-8">
        <aside className="hidden w-48 shrink-0 md:block">
          <h3 className="mb-2 text-[13px] font-bold">Categorías</h3>
          <hr className="mb-3 border-line" />
          <button
            type="button"
            onClick={() => filtrarCategoria(null)}
            className={`flex w-full justify-between py-1 text-[12px] ${
              !categoria ? 'font-bold' : 'text-gray-600'
            }`}
          >
            <span>Todas</span>
          </button>
          {categorias.map((c) => {
            const activa = String(c.id) === categoria
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => filtrarCategoria(c.id)}
                className={`flex w-full justify-between py-1 text-left text-[12px] ${
                  activa ? 'font-bold' : 'text-gray-600'
                }`}
              >
                <span>{c.nombre}</span>
              </button>
            )
          })}
        </aside>

        <div className="flex-1">
          <p className="mb-3 text-[12px] text-gray-500">
            {cargando ? 'Buscando…' : `${total} servicio${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}`}
          </p>

          {servicios.length === 0 && !cargando ? (
            <p className="text-[13px] text-gray-500">
              No encontramos servicios con esos filtros.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {servicios.map((servicio) => (
                <ServicioCard key={servicio.id} servicio={servicio} />
              ))}
            </div>
          )}

          {(page > 1 || total > TAMANO_PAGINA) && (
            <div className="mt-6 flex items-center justify-center gap-4 text-[12px]">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => cambiarPagina(-1)}
                className="border border-black px-3 py-1.5 disabled:opacity-40"
              >
                Anterior
              </button>
              <span>Página {page}</span>
              <button
                type="button"
                disabled={page * TAMANO_PAGINA >= total}
                onClick={() => cambiarPagina(1)}
                className="border border-black px-3 py-1.5 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}