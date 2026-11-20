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
import Icon from '../../components/Icon'
import StatusBadge from '../../components/StatusBadge'
import { Cargando, Encabezado, Panel, Volver } from '../../components/admin/ui'
import { Boton, Textarea } from '../../components/ui'
import {
  ESTADOS_CERTIFICADO,
  ESTADOS_POSTULACION,
  formatearFecha,
} from '../../lib/formato'

// Detalle postulación: revisa la postulación y aprueba certificados pendientes.
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
  const [enviando, setEnviando] = useState(false)

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
    setEnviando(true)
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
    } finally {
      setEnviando(false)
    }
  }

  async function decidirCertificado() {
    setError('')
    setExito('')
    setEnviando(true)
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
    } finally {
      setEnviando(false)
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

      <Encabezado
        titulo={postulacion.profesional_nombre}
        descripcion={`Postula a ${
          postulacion.especialidad || 'sin especialidad declarada'
        } · Enviada el ${formatearFecha(
          postulacion.fecha_postulacion,
        )} · ${postulacion.profesional_email}`}
        acciones={
          <StatusBadge estado={postulacion.estado} mapa={ESTADOS_POSTULACION} />
        }
      />

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

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-5">
          <Panel titulo="Sobre el postulante" icono="users">
            <p className="whitespace-pre-line text-[0.875rem] leading-relaxed text-ink-2">
              {postulacion.experiencia || 'Sin experiencia declarada.'}
            </p>
            <dl className="mt-4 space-y-2 border-t border-line pt-3">
              <div className="flex justify-between gap-3 text-[0.8125rem]">
                <dt className="text-ink-3">RUT</dt>
                <dd className="font-semibold text-ink">{postulacion.profesional_rut}</dd>
              </div>
              <div className="flex justify-between gap-3 text-[0.8125rem]">
                <dt className="text-ink-3">Estado del profesional</dt>
                <dd className="font-semibold text-ink">
                  {postulacion.profesional_estado}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-[0.8125rem]">
                <dt className="text-ink-3">Postulación</dt>
                <dd>
                  <StatusBadge
                    estado={postulacion.estado}
                    mapa={ESTADOS_POSTULACION}
                  />
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel titulo="Certificados y validación" icono="shield">
            {postulacion.certificados.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[0.8125rem] text-ink-3">
                Sin certificados cargados.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {postulacion.certificados.map((cert) => (
                  <li
                    key={cert.id}
                    className="flex flex-col gap-3 rounded-xl border border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-canvas text-ink-3">
                        <Icon nombre="file" className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.875rem] font-bold text-ink">
                          {cert.nombre}
                        </p>
                        <p className="mt-0.5 text-[0.75rem] text-ink-3">
                          {cert.tipo === 'linkedin'
                            ? 'LinkedIn'
                            : 'Documento privado'}
                          {cert.comentario_revisor && ` · ${cert.comentario_revisor}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                      {cert.archivo_url && (
                        <a
                          href={cert.archivo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[0.75rem] font-semibold text-brand-blue no-underline hover:underline"
                        >
                          Ver archivo
                        </a>
                      )}
                      {cert.enlace && (
                        <a
                          href={cert.enlace}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[0.75rem] font-semibold text-brand-blue no-underline hover:underline"
                        >
                          Ver perfil
                        </a>
                      )}
                      <StatusBadge estado={cert.estado} mapa={ESTADOS_CERTIFICADO} />
                      {cert.estado === 'sin_reviewer' && (
                        <>
                          <Boton
                            tamano="sm"
                            onClick={() =>
                              setCertificadoAccion({ id: cert.id, tipo: 'aprobar' })
                            }
                          >
                            Aprobar
                          </Boton>
                          <Boton
                            tamano="sm"
                            variante="peligro"
                            onClick={() => {
                              setCertificadoAccion({
                                id: cert.id,
                                tipo: 'rechazar',
                              })
                              setComentarioCertificado('')
                            }}
                          >
                            Rechazar
                          </Boton>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {certificadoAccion && (
              <div className="mt-3 rounded-xl border border-line bg-canvas/60 p-3.5">
                <p className="mb-2 text-[0.8125rem] font-bold text-ink">
                  {certificadoAccion.tipo === 'aprobar'
                    ? 'Confirmar aprobación del certificado'
                    : 'Motivo del rechazo del certificado'}
                </p>
                {certificadoAccion.tipo === 'rechazar' && (
                  <Textarea
                    value={comentarioCertificado}
                    onChange={(e) => setComentarioCertificado(e.target.value)}
                    className="min-h-16 bg-white"
                    rows={3}
                    placeholder="Explica qué problema tiene el documento"
                  />
                )}
                <div className="mt-2.5 flex gap-2">
                  <Boton tamano="sm" cargando={enviando} onClick={decidirCertificado}>
                    Confirmar
                  </Boton>
                  <Boton
                    tamano="sm"
                    variante="fantasma"
                    onClick={() => setCertificadoAccion(null)}
                  >
                    Cancelar
                  </Boton>
                </div>
              </div>
            )}
          </Panel>
        </div>

        <Panel titulo="Decisión" icono="check-circle" className="lg:sticky lg:top-24">
          {postulacion.comentarios_admin && (
            <p className="mb-3 rounded-lg border-l-2 border-warn bg-warn-soft px-2.5 py-2 text-[0.75rem] italic text-warn">
              Último comentario: {postulacion.comentarios_admin}
            </p>
          )}

          {puedeDecidir ? (
            <>
              {accion && accion !== 'aprobar' && (
                <Textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="mb-2.5 min-h-20"
                  rows={3}
                  placeholder={
                    accion === 'devolver'
                      ? 'Indica qué debe corregir el postulante'
                      : 'Motivo del rechazo'
                  }
                />
              )}

              {accion ? (
                <div className="flex flex-wrap gap-2">
                  <Boton tamano="sm" cargando={enviando} onClick={decidirPostulacion}>
                    Confirmar {accion}
                  </Boton>
                  <Boton
                    tamano="sm"
                    variante="fantasma"
                    onClick={() => {
                      setAccion(null)
                      setComentario('')
                    }}
                  >
                    Cancelar
                  </Boton>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Boton className="w-full" onClick={() => setAccion('aprobar')}>
                    <Icon nombre="check" className="h-4 w-4" />
                    Aprobar
                  </Boton>
                  <Boton
                    variante="secundario"
                    className="w-full"
                    onClick={() => setAccion('devolver')}
                  >
                    Devolver
                  </Boton>
                  <Boton
                    variante="peligro"
                    className="w-full"
                    onClick={() => setAccion('rechazar')}
                  >
                    Rechazar
                  </Boton>
                </div>
              )}

              <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-3">
                Al aprobar, el profesional queda habilitado para publicar servicios. La
                moderación de los certificados es independiente y no cambia con esta
                decisión.
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-[0.8125rem] text-ink-2">
                Esta postulación ya fue {postulacion.estado_nombre.toLowerCase()}.
              </p>
              <Boton
                variante="secundario"
                className="w-full"
                onClick={() => navigate('/admin/postulaciones')}
              >
                Volver a la cola
              </Boton>
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
