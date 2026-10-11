import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { misReservas } from '../../api/reservas'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import {
  ESTADOS_RESERVA,
  formatearCLP,
  formatearFecha,
  formatearHora,
} from '../../lib/formato'

export default function MisReservas() {
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    misReservas()
      .then((data) => activo && setReservas(data.results || []))
      .catch((err) => activo && setError(mensajeDeError(err)))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [])

  return (
    <div className="pt-6">
      <h1 className="mb-5 text-[20px] font-bold">Mis reservas</h1>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      {cargando ? (
        <p className="text-[13px] text-gray-500">Cargando…</p>
      ) : reservas.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] text-gray-500">
            Aún no tienes reservas. Explora el catálogo para contratar un servicio.
          </p>
          <Link to="/catalogo" className="mt-4 inline-block text-[13px] underline">
            Explorar el catálogo
          </Link>
        </div>
      ) : (
        <ul className="space-y-3.5">
          {reservas.map((reserva) => (
            <li key={reserva.id} className="border border-line">
              <Link
                to={`/reserva/${reserva.id}`}
                className="flex items-center justify-between px-4 py-3.5 no-underline"
              >
                <div>
                  <p className="text-[14px] font-bold">{reserva.servicio.titulo}</p>
                  <p className="text-[12px] text-gray-500">
                    {formatearFecha(reserva.fecha)} ·{' '}
                    {formatearHora(reserva.hora_inicio)}–{formatearHora(reserva.hora_fin)}
                    {reserva.profesional_nombre
                      ? ` · ${reserva.profesional_nombre}`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[14px] font-bold text-brand-red">
                    {formatearCLP(reserva.precio_acordado)}
                  </span>
                  <StatusBadge estado={reserva.estado} mapa={ESTADOS_RESERVA} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
