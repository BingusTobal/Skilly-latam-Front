import { ESTADOS_SERVICIO } from '../lib/formato'

export default function StatusBadge({ estado, mapa = ESTADOS_SERVICIO, className = '' }) {
  const config = mapa[estado] || {
    etiqueta: estado,
    clase: 'bg-gray-100 text-gray-600',
  }
  return (
    <span
      className={`inline-block rounded-sm px-2.5 py-1 text-[11px] font-bold ${config.clase} ${className}`}
    >
      {config.etiqueta}
    </span>
  )
}
