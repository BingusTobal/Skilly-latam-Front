import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  aprobarCertificado,
  aprobarPostulacion,
  devolverPostulacion,
  obtenerPostulacionAdmin,
  rechazarCertificado,
  rechazarPostulacion,
} from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import { Cargando, Encabezado, Panel, Volver } from '../../components/admin/ui'
import {
  ESTADOS_CERTIFICADO,
  ESTADOS_POSTULACION,
  formatearFecha,
} from '../../lib/formato'

export default function DetallePostulacion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [postulacion, setPostulacion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [accion, setAccion] = useState(null)
  const [comentario, setComentario] = useState('')
  const [certificadoAccion, setCertificadoAccion] = useState(null)
  const [comentarioCertificado, setComentarioCertificado] = useState('')

  function cargar() {
    setCargando(true)
    obtenerPostulacionAdmin(id)
      .then((res) => setPostulacion(res.data))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [id])

  async function decidirPostulacion() {
    if (accion !== 'aprobar' && !comentario.trim()) {
      setError('Escribe un comentario: el postulante lo necesita para corregir.')
      return
    }
    setError('')
    setExito('')
    try {
      if (accion === 'aprobar') {
        await aprobarPostulacion(id)
        setExito('Postulación aprobada.')
      } else if (accion === 'devolver') {
        await devolverPostulacion(id, comentario.trim())
        setExito('Postulación devuelta con comentarios.')
      } else {
        await rechazarPostulacion(id, comentario.trim())
        setExito('Postulación rechazada.')
      }
      setAccion(null)
      setComentario('')
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  async function decidirCertificado() {
    setError('')
    setExito('')
    try {
      if (certificadoAccion.tipo === 'aprobar') {
        await aprobarCertificado(certificadoAccion.id)
        setExito('Certificado aprobado.')
      } else {
        await rechazarCertificado(certificadoAccion.id, comentarioCertificado.trim())
        setExito('Certificado rechazado.')
      }
      setCertificadoAccion(null)
      setComentarioCertificado('')
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  if (cargando && !postulacion) return <Cargando />
  if (!postulacion) {
    return (
      <div>
        <Volver to="/admin/postulaciones">Volver a postulaciones</Volver>
        <Alerta>{error || 'Postulación no encontrada.'}</Alerta>
      </div>
    )
  }

  const puedeDecidir = ['pendiente', 'devuelta'].includes(postulacion.estado)

  return (
    <div>
      <Volver to="/admin/postulaciones">Volver a postulaciones</Volver>
      <Encabezado titulo={postulacion.profesional_nombre} />

      <p className="-mt-3 mb-5 text-[12px] text-gray-500">
        Postula a {postulacion.especialidad || 'sin especialidad declarada'} · Enviada el{' '}
        {formatearFecha(postulacion.fecha_postulacion)} · {postulacion.profesional_email}
      </p>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}
      {exito && (
        <div className="mb-4">
          <Alerta tipo="exito">{exito}</Alerta>
        </div>
      )}

      <div className="flex flex-wrap gap-5">
        <div className="min-w-[280px] flex-[2] space-y-4">
          <Panel titulo="Sobre el postulante">
            <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-gray-700">
              {postulacion.experiencia || 'Sin experiencia declarada.'}
            </p>
            <dl className="mt-3 space-y-1 text-[12px]">
              <div className="flex justify-between gap-3 border-t border-[#f0f0f0] pt-1.5">
                <dt className="text-gray-500">RUT</dt>
                <dd>{postulacion.profesional_rut}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Estado del profesional</dt>
                <dd>{postulacion.profesional_estado}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Postulación</dt>
                <dd>
                  <StatusBadge estado={postulacion.estado} mapa={ESTADOS_POSTULACION} />
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel titulo="Certificados y validación">
            {postulacion.certificados.length === 0 ? (
              <p className="text-[12px] text-gray-500">Sin certificados cargados.</p>
            ) : (
              <ul className="m-0 list-none space-y-2 p-0">
                {postulacion.certificados.map((cert) => (
                  <li
                    key={cert.id}
                    className="flex flex-wrap items-center justify-between gap-2 border border-line px-3 py-2 text-[12px]"
                  >
                    <div>
                      <p className="font-bold">{cert.nombre}</p>
                      <p className="text-[10.5px] text-gray-500">
                        {cert.tipo === 'linkedin' ? 'LinkedIn' : 'Documento privado'}
                        {cert.comentario_revisor && ` · ${cert.comentario_revisor}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {cert.archivo_url && (
                        <a
                          href={cert.archivo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-navy underline"
                        >
                          Ver archivo
                        </a>
                      )}
                      {cert.enlace && (
                        <a
                          href={cert.enlace}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-navy underline"
                        >
                          Ver perfil
                        </a>
                      )}
                      <StatusBadge estado={cert.estado} mapa={ESTADOS_CERTIFICADO} />
                      {cert.estado === 'sin_reviewer' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCertificadoAccion({ id: cert.id, tipo: 'aprobar' })}
                            className="border border-brand-green px-2 py-0.5 text-[10.5px] font-bold text-brand-green"
                          >
                            Aprobar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCertificadoAccion({ id: cert.id, tipo: 'rechazar' })
                              setComentarioCertificado('')
                            }}
                            className="border border-brand-red px-2 py-0.5 text-[10.5px] font-bold text-brand-red"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {certificadoAccion && (
              <div className="mt-3 border border-line bg-[#f7f7f7] p-3">
                <p className="mb-2 text-[12px] font-bold">
                  {certificadoAccion.tipo === 'aprobar'
                    ? 'Confirmar aprobación del certificado'
                    : 'Motivo del rechazo del certificado'}
                </p>
                {certificadoAccion.tipo === 'rechazar' && (
                  <textarea
                    value={comentarioCertificado}
                    onChange={(e) => setComentarioCertificado(e.target.value)}
                    className="min-h-16 w-full border border-gray-400 px-3 py-2 text-[12px] outline-none"
                    placeholder="Explica qué problema tiene el documento"
                  />
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={decidirCertificado}
                    className="border border-black bg-black px-3 py-1.5 text-[11.5px] text-white"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertificadoAccion(null)}
                    className="border border-line px-3 py-1.5 text-[11.5px]"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </Panel>
        </div>

        <Panel titulo="Decisión" className="min-w-[220px] self-start">
          {postulacion.comentarios_admin && (
            <p className="mb-3 border-l-2 border-brand-amber pl-2 text-[11.5px] italic text-gray-600">
              Último comentario: {postulacion.comentarios_admin}
            </p>
          )}

          {puedeDecidir ? (
            <>
              {accion && accion !== 'aprobar' && (
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="mb-2 min-h-20 w-full border border-gray-400 px-3 py-2 text-[12px] outline-none"
                  placeholder={
                    accion === 'devolver'
                      ? 'Indica qué debe corregir el postulante'
                      : 'Motivo del rechazo'
                  }
                />
              )}

              {accion ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={decidirPostulacion}
                    className="border border-black bg-black px-3 py-1.5 text-[12px] text-white"
                  >
                    Confirmar {accion}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccion(null)
                      setComentario('')
                    }}
                    className="border border-line px-3 py-1.5 text-[12px]"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAccion('aprobar')}
                    className="border border-brand-green bg-brand-green px-3 py-1.5 text-[12px] font-bold text-white"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccion('devolver')}
                    className="border border-brand-amber px-3 py-1.5 text-[12px] font-bold text-brand-amber"
                  >
                    Devolver
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccion('rechazar')}
                    className="border border-brand-red px-3 py-1.5 text-[12px] font-bold text-brand-red"
                  >
                    Rechazar
                  </button>
                </div>
              )}

              <p className="mt-3 text-[10.5px] leading-relaxed text-gray-500">
                Al aprobar, el profesional queda habilitado para publicar servicios. La
                moderación de los certificados es independiente y no cambia con esta
                decisión.
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-[12px] text-gray-600">
                Esta postulación ya fue {postulacion.estado_nombre.toLowerCase()}.
              </p>
              <button
                type="button"
                onClick={() => navigate('/admin/postulaciones')}
                className="border border-black px-3 py-1.5 text-[12px]"
              >
                Volver a la cola
              </button>
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
