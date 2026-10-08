import { Link } from 'react-router-dom'

import { FORMATOS, formatearCLP } from '../lib/formato'

export const ICONOS = {
  'desarrollo-software': '💻',
  'diseno-grafico': '🎨',
  finanzas: '📊',
  marketing: '📣',
  'salud-y-bienestar': '🌿',
}

const FONDOS = ['bg-sky', 'bg-mint', 'bg-sand']

function fondoPara(categoria = {}) {
  const clave = categoria.slug || categoria.nombre || ''
  let suma = 0
  for (let i = 0; i < clave.length; i += 1) suma += clave.charCodeAt(i)
  return FONDOS[suma % FONDOS.length]
}

export default function ServicioCard({ servicio }) {
  const categoria = servicio.categoria || {}
  return (
    <Link to={`/servicios/${servicio.id}`} className="block text-inherit no-underline">
      <article className="h-full border border-line bg-white transition hover:border-ink">
        <div className={`flex h-32 items-center justify-center text-4xl ${fondoPara(categoria)}`}>
          {ICONOS[categoria.slug] || '🛠️'}
        </div>
        <div className="bg-[#f0f0f0] px-3 pb-3 pt-2.5">
          <p className="text-[10px] text-gray-500">{categoria.nombre}</p>
          <h3 className="mb-1.5 min-h-8 text-[12.5px] font-bold leading-tight">
            {servicio.titulo}
          </h3>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-brand-red">
              {formatearCLP(servicio.precio)}
            </span>
            <span className="text-[10px] text-gray-500">
              {servicio.duracion_estimada || FORMATOS[servicio.formato]}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}