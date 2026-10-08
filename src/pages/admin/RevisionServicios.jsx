import { useEffect, useState } from 'react'

import {
  aprobar,
  devolver,
  listarServiciosAdmin,
  rechazar,
} from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import { formatearCLP } from '../../lib/formato'

const FILTROS = [
  ['en_revision', 'En revisión'],
  ['aprobado', 'Aprobados'],
  ['devuelto', 'Devueltos'],
  ['rechazado', 'Rechazados'],
  ['borrador', 'Borradores'],
  ['', 'Todos'],
]

export default function RevisionServicios() {
  const [estado, setEstado] = useState('en_revision')
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [moderando, setModerando] = useState(null)
  const [comentario, setComentario] = useState('')

  function cargar() {
    setCargando(true)
    const params = {}
    if (estado) params.estado = estado
    listarServiciosAdmin(params)
      .then((res) => setServicios(res.data.results || []))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [estado])

  async function aprobarServicio(id) {
    setError('')
    try {
      await aprobar(id)
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  async function enviarModeracion() {
    if (!comentario.trim()) {
      setError('Escribe un comentario para devolver o rechazar.')
      return
    }
    setError('')
    try {
      if (moderando.tipo === 'devolver') await devolver(moderando.id, comentario.trim())
      else await rechazar(moderando.id, comentario.trim())
      setModerando(null)
      setComentario('')
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  return (
    <div className="pt-6">
      <h1 className="text-[20px] font-bold">Revisión de servicios</h1>
      <p className="mb-5 text-[12.5px] text-gray-500">
        Aprueba, devuelve con comentarios o rechaza los servicios enviados por
        profesionales.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTROS.map(([clave, etiqueta]) => (
          <button
            key={clave}
            type="button"
            onClick={() => setEstado(clave)}
            className={`border px-3 py-1.5 text-[12px] ${
              estado === clave ? 'border-black bg-black text-white' : 'border-line'
            }`}
          >
            {etiqueta}
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
      ) : servicios.length === 0 ? (
        <p className="text-[13px] text-gray-500">No hay servicios en este estado.</p>
      ) : (
        <ul className="space-y-3">
          {servicios.map((servicio) => (
            <li key={servicio.id} className="border border-line px-4 py-3.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-bold">{servicio.titulo}</p>
                  <p className="text-[11.5px] text-gray-500">
                    {servicio.profesional_nombre} · {servicio.categoria?.nombre} ·{' '}
                    {formatearCLP(servicio.precio)}
                  </p>
                  {servicio.descripcion_corta && (
                    <p className="mt-1 text-[12px] text-gray-600">
                      {servicio.descripcion_corta}
                    </p>
                  )}
                  {servicio.comentarios_admin && (
                    <p className="mt-1 text-[11.5px] italic text-orange-700">
                      Comentario: {servicio.comentarios_admin}
                    </p>
                  )}
                </div>
                <StatusBadge estado={servicio.estado} />
              </div>

              {servicio.estado === 'en_revision' && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => aprobarServicio(servicio.id)}
                    className="border border-black bg-black px-3 py-1.5 text-[12px] text-white"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModerando({ id: servicio.id, tipo: 'devolver' })
                      setComentario('')
                    }}
                    className="border border-black px-3 py-1.5 text-[12px]"
                  >
                    Devolver
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModerando({ id: servicio.id, tipo: 'rechazar' })
                      setComentario('')
                    }}
                    className="border border-brand-red px-3 py-1.5 text-[12px] text-brand-red"
                  >
                    Rechazar
                  </button>
                </div>
              )}

              {moderando?.id === servicio.id && (
                <div className="mt-3 border border-line bg-[#f7f7f7] p-3">
                  <textarea
                    className="min-h-20 w-full border border-gray-400 px-3 py-2 text-[12.5px] outline-none"
                    placeholder={
                      moderando.tipo === 'devolver'
                        ? 'Indica qué debe corregir el profesional'
                        : 'Motivo del rechazo'
                    }
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={enviarModeracion}
                      className="border border-black bg-black px-3 py-1.5 text-[12px] text-white"
                    >
                      Confirmar {moderando.tipo}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModerando(null)
                        setComentario('')
                      }}
                      className="border border-line px-3 py-1.5 text-[12px]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}