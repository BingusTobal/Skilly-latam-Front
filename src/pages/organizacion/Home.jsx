import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { listarCategorias, listarServicios } from '../../api/catalogo'
import ServicioCard, { ICONOS } from '../../components/ServicioCard'

export default function Home() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [destacados, setDestacados] = useState([])
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setCategorias([]))
    listarServicios({ page_size: 3 })
      .then((data) => setDestacados(data.results || []))
      .catch(() => setDestacados([]))
  }, [])

  function buscar(evento) {
    evento.preventDefault()
    navigate(`/catalogo?q=${encodeURIComponent(busqueda)}`)
  }

  return (
    <div className="-mx-6 -mt-5">
      <section className="bg-navy px-8 pb-12 pt-14 text-center text-white">
        <h1 className="mx-auto max-w-2xl text-[26px] font-bold leading-snug">
          Encuentra el servicio que tu organización necesita
        </h1>
        <p className="mt-2 text-[13px] text-sky">
          Servicios con precio fijo, entregados por profesionales independientes.
        </p>
        <form
          onSubmit={buscar}
          className="mx-auto mt-7 flex max-w-md border border-black bg-white"
        >
          <input
            className="flex-1 px-3 py-3 text-[13px] text-gray-700 outline-none"
            placeholder="Ej: diseño UX, desarrollo web, auditoría financiera…"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
          <button type="submit" className="border-l border-black bg-black px-5 text-[13px] text-white">
            Buscar
          </button>
        </form>
      </section>

      <section className="border-b border-gray-100 px-8 py-9">
        <h2 className="text-[15px] font-bold">Categorías</h2>
        <p className="mb-5 text-[12px] text-gray-500">
          Explora el catálogo por área de servicio
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {categorias.map((categoria) => (
            <Link
              key={categoria.id}
              to={`/catalogo?categoria=${categoria.id}`}
              className="border border-line bg-white p-4 text-center text-inherit no-underline transition hover:border-ink"
            >
              <div className="text-2xl">{ICONOS[categoria.slug] || '🛠️'}</div>
              <p className="mt-2 text-[12px] font-bold leading-tight">{categoria.nombre}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-b border-gray-100 px-8 py-9">
        <h2 className="text-[15px] font-bold">Servicios destacados</h2>
        <p className="mb-5 text-[12px] text-gray-500">Recién publicados en el catálogo</p>
        {destacados.length === 0 ? (
          <p className="text-[13px] text-gray-500">
            Todavía no hay servicios publicados.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {destacados.map((servicio) => (
              <ServicioCard key={servicio.id} servicio={servicio} />
            ))}
          </div>
        )}
      </section>

      <section className="border-b border-gray-100 px-8 py-9">
        <h2 className="text-[15px] font-bold">Cómo funciona</h2>
        <p className="mb-5 text-[12px] text-gray-500">De la búsqueda a la entrega</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            ['1', 'Explora y agenda', 'Elige un servicio y coordina con el profesional.'],
            ['2', 'El profesional acepta', 'Tu pago queda retenido hasta confirmar la entrega.'],
            ['3', 'Confirmas la entrega', 'Al aprobar el trabajo, el pago se libera al profesional.'],
          ].map(([numero, titulo, texto]) => (
            <div key={numero} className="text-center">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-navy text-[13px] font-bold text-white">
                {numero}
              </div>
              <p className="mt-2 text-[13px] font-bold">{titulo}</p>
              <p className="text-[12px] text-gray-500">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="px-8 py-8 text-center">
        <Link
          to="/catalogo"
          className="inline-block border border-black bg-black px-6 py-3 text-[13px] text-white no-underline"
        >
          Explorar todo el catálogo
        </Link>
      </div>
    </div>
  )
}