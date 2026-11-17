import { ESTADOS_SERVICIO } from '../lib/formato'
import Estado from './ui/Estado'

export default function StatusBadge({ estado, mapa = ESTADOS_SERVICIO, className = '' }) {
  const config = mapa[estado] || {
    etiqueta: estado,
    clase: 'bg-canvas text-ink-3',
  }
  return (
    <Estado clase={config.clase} className={className}>
      {config.etiqueta}
    </Estado>
  )
}
