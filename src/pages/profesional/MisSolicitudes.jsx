import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { misSolicitudes } from '../../api/reservas'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import {
  ESTADOS_RESERVA,
  formatearCLP,
  formatearFecha,
  formatearHora,
} from '../../lib/formato'

const FILTROS = [
  { valor: '', etiqueta: 'Todas' },
  { valor: 'pendiente_aceptacion', etiqueta: 'Por responder' },
  { valor: 'en_curso', etiqueta: 'En curso' },
  { valor: 'entregado_por_confirmar', etiqueta: 'Por confirmar' },
  { valor: 'finalizada', etiqueta: 'Finalizadas' },
]

export default function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [filtro, setFiltro] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(() => {
    setCargando(true)
    misSolicitudes(filtro ? { estado: filtro } : {})
      .then((data) => setSolicitudes(data.results || []))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [filtro])

  useEffect(cargar, [cargar])

  return (
    <div className="pt-6">
      <h1 className="mb-4 text-[20px] font-bold">Solicitudes</h1>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTROS.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => setFiltro(opcion.valor)}
            className={`border px-3.5 py-1.5 text-[12.5px] ${
              filtro === opcion.valor
                ? 'border-black bg-black text-white'
                : 'border-gray-300'
            }`}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      {cargando ? (
        <p className="text-[13px] text-gray-500">Cargando…</p>
      ) : solicitudes.length === 0 ? (
        <p className="text-[13px] text-gray-500">
          No hay solicitudes en este estado.
        </p>
      ) : (
        <ul className="space-y-3.5">
          {solicitudes.map((solicitud) => (
            <li key={solicitud.id} className="border border-line">
              <Link
                to={`/profesional/solicitudes/${solicitud.id}`}
                className="flex items-center justify-between px-4 py-3.5 no-underline"
              >
                <div>
                  <p className="text-[14px] font-bold">{solicitud.servicio.titulo}</p>
                  <p className="text-[12px] text-gray-500">
                    {solicitud.organizacion_nombre || solicitud.contacto_nombre} ·{' '}
                    {formatearFecha(solicitud.fecha)} ·{' '}
                    {formatearHora(solicitud.hora_inicio)}–
                    {formatearHora(solicitud.hora_fin)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[14px] font-bold text-navy">
                    {formatearCLP(solicitud.monto_neto)}
                  </span>
                  <StatusBadge estado={solicitud.estado} mapa={ESTADOS_RESERVA} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
