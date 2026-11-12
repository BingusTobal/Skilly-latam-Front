import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { listarPostulacionesAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import { Cargando, Encabezado, Vacio } from '../../components/admin/ui'
import { ESTADOS_POSTULACION, formatearFechaCorta } from '../../lib/formato'

const FILTROS = [
  ['pendiente', 'Pendientes'],
  ['devuelta', 'Devueltas'],
  ['aprobada', 'Aprobadas'],
  ['rechazada', 'Rechazadas'],
  ['', 'Todas'],
]

function resumenCertificados(certificados = []) {
  const linkedin = certificados.filter((c) => c.tipo === 'linkedin').length
  const privados = certificados.length - linkedin
  if (!certificados.length) return 'Sin documentos'
  const partes = []
  partes.push(linkedin ? 'LinkedIn' : 'Sin LinkedIn')
  if (privados) partes.push(`${privados} privado${privados === 1 ? '' : 's'}`)
  return partes.join(' · ')
}

export default function Postulaciones() {
  const [estado, setEstado] = useState('pendiente')
  const [postulaciones, setPostulaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setCargando(true)
    setError('')
    const params = estado ? { estado } : {}
    listarPostulacionesAdmin(params)
      .then((res) => setPostulaciones(res.data.results || res.data))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [estado])

  return (
    <div>
      <Encabezado titulo="Postulaciones de profesionales" />

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
        <Cargando />
      ) : postulaciones.length === 0 ? (
        <Vacio>No hay postulaciones en este estado.</Vacio>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-2 pr-3 font-bold">Nombre</th>
                <th className="py-2 pr-3 font-bold">Especialidad</th>
                <th className="py-2 pr-3 font-bold">Fecha</th>
                <th className="py-2 pr-3 font-bold">Certificados</th>
                <th className="py-2 pr-3 font-bold">Estado</th>
                <th className="py-2 font-bold" />
              </tr>
            </thead>
            <tbody>
              {postulaciones.map((p) => (
                <tr key={p.id} className="border-b border-line">
                  <td className="py-2.5 pr-3">
                    <span className="font-bold">{p.profesional_nombre}</span>
                    <span className="block text-[10.5px] text-gray-500">
                      {p.profesional_email}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">{p.especialidad || '—'}</td>
                  <td className="py-2.5 pr-3">{formatearFechaCorta(p.fecha_postulacion)}</td>
                  <td className="py-2.5 pr-3">{resumenCertificados(p.certificados)}</td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge estado={p.estado} mapa={ESTADOS_POSTULACION} />
                  </td>
                  <td className="py-2.5 text-right">
                    <Link
                      to={`/admin/postulaciones/${p.id}`}
                      className="border border-black px-2.5 py-1 text-[11px] font-bold text-black no-underline"
                    >
                      Revisar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
