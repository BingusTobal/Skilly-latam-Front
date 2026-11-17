import { useEffect, useState } from 'react'

import { listarPostulacionesAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import { Cargando, Encabezado } from '../../components/admin/ui'
import {
  Avatar,
  BotonEnlace,
  Chip,
  EmptyState,
  Tabla,
  Td,
  Th,
  Tr,
} from '../../components/ui'
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
      <Encabezado
        titulo="Postulaciones de profesionales"
        descripcion="Revisa los antecedentes y decide quiénes pueden ofrecer servicios en Skilly."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTROS.map(([clave, etiqueta]) => (
          <Chip
            key={clave}
            activo={estado === clave}
            onClick={() => setEstado(clave)}
          >
            {etiqueta}
          </Chip>
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
        <EmptyState icono="user-check" titulo="No hay postulaciones en este estado">
          Cuando un profesional postule, aparecerá aquí para su revisión.
        </EmptyState>
      ) : (
        <Tabla>
          <thead>
            <tr>
              <Th>Nombre</Th>
              <Th>Especialidad</Th>
              <Th>Fecha</Th>
              <Th>Certificados</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acción</Th>
            </tr>
          </thead>
          <tbody>
            {postulaciones.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar nombre={p.profesional_nombre} tamano="sm" />
                    <div className="min-w-0">
                      <p className="font-bold text-ink">{p.profesional_nombre}</p>
                      <p className="text-[0.75rem] text-ink-3">{p.profesional_email}</p>
                    </div>
                  </div>
                </Td>
                <Td>{p.especialidad || '—'}</Td>
                <Td className="whitespace-nowrap">
                  {formatearFechaCorta(p.fecha_postulacion)}
                </Td>
                <Td className="text-ink-3">{resumenCertificados(p.certificados)}</Td>
                <Td>
                  <StatusBadge estado={p.estado} mapa={ESTADOS_POSTULACION} />
                </Td>
                <Td className="text-right">
                  <BotonEnlace
                    to={`/admin/postulaciones/${p.id}`}
                    tamano="sm"
                    variante="secundario"
                  >
                    Revisar
                  </BotonEnlace>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Tabla>
      )}
    </div>
  )
}
