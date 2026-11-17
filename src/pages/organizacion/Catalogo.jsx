import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { listarCategorias, listarServicios } from '../../api/catalogo'
import Icon from '../../components/Icon'
import ServicioCard from '../../components/ServicioCard'
import {
  Boton,
  Card,
  Chip,
  EmptyState,
  PageHeader,
  Paginacion,
  SkeletonTarjeta,
} from '../../components/ui'
import { FORMATOS } from '../../lib/formato'

const TAMANO_PAGINA = 20

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categorias, setCategorias] = useState([])
  const [servicios, setServicios] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)

  const categoria = searchParams.get('categoria') || ''
  const formato = searchParams.get('formato') || ''
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
    if (formato) params.formato = formato

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
  }, [q, categoria, formato, page])

  function buscar(evento) {
    evento.preventDefault()
    const nuevos = new URLSearchParams()
    if (texto.trim()) nuevos.set('q', texto.trim())
    if (categoria) nuevos.set('categoria', categoria)
    if (formato) nuevos.set('formato', formato)
    setSearchParams(nuevos)
  }

  function filtrarCategoria(id) {
    const nuevos = new URLSearchParams(searchParams)
    if (id) nuevos.set('categoria', id)
    else nuevos.delete('categoria')
    nuevos.delete('page')
    setSearchParams(nuevos)
  }

  function filtrarFormato(valor) {
    const nuevos = new URLSearchParams(searchParams)
    if (valor) nuevos.set('formato', valor)
    else nuevos.delete('formato')
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

  function limpiarFiltros() {
    setSearchParams(new URLSearchParams())
    setTexto('')
  }

  const hayFiltros = Boolean(q || categoria || formato)
  const categoriaActiva = categorias.find((c) => String(c.id) === categoria)

  return (
    <div>
      <PageHeader
        migas={[{ texto: 'Inicio', to: '/' }, { texto: 'Catálogo' }]}
        etiqueta="Catálogo"
        titulo="Encuentra el servicio que tu organización necesita"
        descripcion="Precio fijo, profesionales revisados y pago protegido hasta confirmar la entrega."
      />

      <form
        onSubmit={buscar}
        className="mb-5 flex flex-col gap-2 rounded-2xl border border-line bg-white p-2 shadow-card sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Icon
            nombre="search"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
          />
          <input
            className="w-full rounded-xl border-0 bg-transparent py-2.5 pl-10 pr-3 text-[0.9375rem] text-ink placeholder:text-ink-3/70 focus:outline-none"
            placeholder="Ej: diseño UX, desarrollo web…"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            aria-label="Buscar servicios"
          />
        </div>
        <Boton type="submit" className="sm:px-6">
          Buscar
        </Boton>
      </form>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-ink-3">
          <Icon nombre="monitor" className="h-3.5 w-3.5" />
          Modalidad
        </span>
        {[['', 'Todas'], ...Object.entries(FORMATOS)].map(([valor, etiqueta]) => (
          <Chip
            key={valor || 'todas'}
            activo={formato === valor}
            onClick={() => filtrarFormato(valor)}
          >
            {etiqueta}
          </Chip>
        ))}
        {hayFiltros && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="ml-auto inline-flex items-center gap-1 text-[0.75rem] font-semibold text-ink-3 underline-offset-2 hover:text-ink hover:underline"
          >
            <Icon nombre="x-circle" className="h-3.5 w-3.5" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-56 shrink-0 lg:block">
          <Card className="sticky top-24 p-4">
            <p className="mb-3 px-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-ink-3">
              Categorías
            </p>
            <button
              type="button"
              onClick={() => filtrarCategoria(null)}
              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[0.875rem] transition ${
                !categoria
                  ? 'bg-brand-blue-soft font-bold text-brand-blue-deep'
                  : 'text-ink-2 hover:bg-canvas hover:text-ink'
              }`}
            >
              <Icon nombre="folder" className="h-4 w-4 shrink-0" />
              Todas
            </button>
            {categorias.map((c) => {
              const activa = String(c.id) === categoria
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => filtrarCategoria(c.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[0.875rem] transition ${
                    activa
                      ? 'bg-brand-blue-soft font-bold text-brand-blue-deep'
                      : 'text-ink-2 hover:bg-canvas hover:text-ink'
                  }`}
                >
                  <Icon nombre="folder" className="h-4 w-4 shrink-0" />
                  <span className="truncate">{c.nombre}</span>
                </button>
              )
            })}
          </Card>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.8125rem] font-semibold text-ink-3">
              {cargando
                ? 'Buscando servicios…'
                : `${total} servicio${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}`}
              {categoriaActiva && (
                <span className="text-ink-2"> · {categoriaActiva.nombre}</span>
              )}
            </p>
            <label className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-2 lg:hidden">
              <span className="sr-only">Categoría</span>
              <select
                value={categoria}
                onChange={(evento) => filtrarCategoria(evento.target.value)}
                className="rounded-xl border border-line bg-white px-3 py-2 text-[0.8125rem] font-semibold text-ink focus:border-brand-blue focus:outline-none"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {cargando ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((indice) => (
                <SkeletonTarjeta key={indice} />
              ))}
            </div>
          ) : servicios.length === 0 ? (
            <EmptyState
              titulo="No encontramos servicios con esos filtros"
              accion={
                hayFiltros ? (
                  <Boton variante="secundario" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </Boton>
                ) : null
              }
            >
              Prueba con otra búsqueda o revisa todas las categorías disponibles.
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {servicios.map((servicio) => (
                <ServicioCard key={servicio.id} servicio={servicio} />
              ))}
            </div>
          )}

          <Paginacion
            page={page}
            total={total}
            tamano={TAMANO_PAGINA}
            onCambiar={cambiarPagina}
          />
        </div>
      </div>
    </div>
  )
}
