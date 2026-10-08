import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { enviarARevision, misServicios } from '../../api/catalogo'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import { formatearCLP } from '../../lib/formato'

export default function MisServicios() {
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  function cargar() {
    setCargando(true)
    misServicios()
      .then((data) => setServicios(data.results || []))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  async function publicar(id) {
    setError('')
    try {
      await enviarARevision(id)
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  return (
    <div className="pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[20px] font-bold">Mis servicios</h1>
        <Link
          to="/profesional/servicios/nuevo"
          className="border border-black bg-black px-4 py-2.5 text-[13px] text-white no-underline"
        >
          + Publicar nuevo servicio
        </Link>
      </div>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      {cargando ? (
        <p className="text-[13px] text-gray-500">Cargando…</p>
      ) : servicios.length === 0 ? (
        <p className="text-[13px] text-gray-500">
          Aún no has publicado servicios. Crea el primero para aparecer en el catálogo.
        </p>
      ) : (
        <ul className="space-y-3.5">
          {servicios.map((servicio) => (
            <li
              key={servicio.id}
              className="flex items-center justify-between border border-line px-4 py-3.5"
            >
              <div>
                <p className="text-[14px] font-bold">{servicio.titulo}</p>
                <p className="text-[11.5px] text-gray-500">
                  {servicio.categoria?.nombre}
                  {servicio.comentarios_admin
                    ? ` · ${servicio.comentarios_admin}`
                    : ''}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[15px] font-bold text-brand-red">
                  {formatearCLP(servicio.precio)}
                </span>
                <StatusBadge estado={servicio.estado} />
                {(servicio.estado === 'borrador' || servicio.estado === 'devuelto') && (
                  <button
                    type="button"
                    onClick={() => publicar(servicio.id)}
                    className="border border-black px-3 py-1.5 text-[12px]"
                  >
                    Enviar a revisión
                  </button>
                )}
                <Link
                  to={`/profesional/servicios/${servicio.id}/editar`}
                  className="text-[12px] underline"
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}