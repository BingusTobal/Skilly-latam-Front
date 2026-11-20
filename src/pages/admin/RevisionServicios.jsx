import { useEffect, useState } from 'react'

import {
  aprobar,
  devolver,
  listarServiciosAdmin,
  rechazar,
} from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import StatusBadge from '../../components/StatusBadge'
import { Encabezado } from '../../components/admin/ui'
import {
  Boton,
  Card,
  Chip,
  EmptyState,
  Skeleton,
  Textarea,
} from '../../components/ui'
import { formatearCLP } from '../../lib/formato'

const FILTROS = [
  ['en_revision', 'En revisión'],
  ['aprobado', 'Aprobados'],
  ['devuelto', 'Devueltos'],
  ['rechazado', 'Rechazados'],
  ['borrador', 'Borradores'],
  ['', 'Todos'],
]

function SkeletonServicio() {
  return (
    <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
      <div className="space-y-2.5">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3.5 w-3/5" />
      </div>
    </div>
  )
}

// Revisión de servicios: aprueba, devuelve o rechaza servicios publicados.
export default function RevisionServicios() {
  const [estado, setEstado] = useState('en_revision')
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [moderando, setModerando] = useState(null)
  const [comentario, setComentario] = useState('')
  const [aprobando, setAprobando] = useState(null)
  const [enviando, setEnviando] = useState(false)

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
    setAprobando(id)
    try {
      await aprobar(id)
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setAprobando(null)
    }
  }

  async function enviarModeracion() {
    if (!comentario.trim()) {
      setError('Escribe un comentario para devolver o rechazar.')
      return
    }
    setError('')
    setEnviando(true)
    try {
      if (moderando.tipo === 'devolver') await devolver(moderando.id, comentario.trim())
      else await rechazar(moderando.id, comentario.trim())
      setModerando(null)
      setComentario('')
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      <Encabezado
        titulo="Revisión de servicios"
        descripcion="Aprueba, devuelve con comentarios o rechaza los servicios enviados por profesionales."
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
        <div className="space-y-3">
          {[0, 1, 2].map((indice) => (
            <SkeletonServicio key={indice} />
          ))}
        </div>
      ) : servicios.length === 0 ? (
        <EmptyState icono="layout" titulo="No hay servicios en este estado">
          Cuando un profesional envíe un servicio a revisión, aparecerá aquí.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {servicios.map((servicio) => (
            <li key={servicio.id}>
              <Card className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3.5">
                    <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue-deep">
                      <Icon nombre="layout" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.9375rem] font-bold text-ink">
                        {servicio.titulo}
                      </p>
                      <p className="mt-1 text-[0.8125rem] text-ink-3">
                        {servicio.profesional_nombre} ·{' '}
                        {servicio.categoria?.nombre || 'Sin categoría'} ·{' '}
                        <span className="font-semibold text-ink-2">
                          {formatearCLP(servicio.precio)}
                        </span>
                      </p>
                      {servicio.descripcion_corta && (
                        <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">
                          {servicio.descripcion_corta}
                        </p>
                      )}
                      {servicio.comentarios_admin && (
                        <p className="mt-2 rounded-lg bg-warn-soft px-2.5 py-1.5 text-[0.75rem] font-semibold text-warn">
                          {servicio.comentarios_admin}
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge estado={servicio.estado} />
                </div>

                {servicio.estado === 'en_revision' && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                    <Boton
                      tamano="sm"
                      cargando={aprobando === servicio.id}
                      onClick={() => aprobarServicio(servicio.id)}
                    >
                      <Icon nombre="check" className="h-4 w-4" />
                      Aprobar
                    </Boton>
                    <Boton
                      tamano="sm"
                      variante="secundario"
                      onClick={() => {
                        setModerando({ id: servicio.id, tipo: 'devolver' })
                        setComentario('')
                      }}
                    >
                      <Icon nombre="arrow-left" className="h-4 w-4" />
                      Devolver
                    </Boton>
                    <Boton
                      tamano="sm"
                      variante="peligro"
                      onClick={() => {
                        setModerando({ id: servicio.id, tipo: 'rechazar' })
                        setComentario('')
                      }}
                    >
                      Rechazar
                    </Boton>
                  </div>
                )}

                {moderando?.id === servicio.id && (
                  <div className="mt-3 rounded-xl border border-line bg-canvas/60 p-3.5">
                    <Textarea
                      className="min-h-20 bg-white"
                      rows={3}
                      placeholder={
                        moderando.tipo === 'devolver'
                          ? 'Indica qué debe corregir el profesional'
                          : 'Motivo del rechazo'
                      }
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                    />
                    <div className="mt-2.5 flex gap-2">
                      <Boton tamano="sm" cargando={enviando} onClick={enviarModeracion}>
                        Confirmar {moderando.tipo}
                      </Boton>
                      <Boton
                        tamano="sm"
                        variante="fantasma"
                        onClick={() => {
                          setModerando(null)
                          setComentario('')
                        }}
                      >
                        Cancelar
                      </Boton>
                    </div>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
