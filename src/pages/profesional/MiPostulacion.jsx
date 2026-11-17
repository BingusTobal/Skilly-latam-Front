import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import {
  miPostulacion,
  reenviarPostulacion,
  subirCertificado,
} from '../../api/postulaciones'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import StatusBadge from '../../components/StatusBadge'
import {
  Boton,
  BotonEnlace,
  Campo,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Skeleton,
} from '../../components/ui'
import {
  ESTADOS_CERTIFICADO,
  ESTADOS_POSTULACION,
  formatearFecha,
} from '../../lib/formato'

const CERT_VACIO = { tipo: 'otro', nombre: '', enlace: '', archivo: null }

export default function MiPostulacion() {
  const location = useLocation()
  const [postulacion, setPostulacion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [sinPostulacion, setSinPostulacion] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState(
    location.state?.recienPostulado
      ? 'Recibimos tu postulación. Te avisamos por correo cuando la revisemos.'
      : '',
  )
  const [enviando, setEnviando] = useState(false)
  const [cert, setCert] = useState(CERT_VACIO)

  const cargar = useCallback(() => {
    setCargando(true)
    miPostulacion()
      .then((data) => {
        setPostulacion(data)
        setSinPostulacion(false)
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setSinPostulacion(true)
        } else {
          setError(mensajeDeError(err))
        }
      })
      .finally(() => setCargando(false))
  }, [])

  useEffect(cargar, [cargar])

  async function reenviar() {
    setError('')
    setEnviando(true)
    try {
      const actualizada = await reenviarPostulacion(postulacion.id)
      setPostulacion(actualizada)
      setAviso('Reenviaste tu postulación. Quedó nuevamente en revisión.')
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  async function agregarCertificado(evento) {
    evento.preventDefault()
    setError('')
    setAviso('')

    if (!cert.nombre.trim()) {
      setError('Escribe un nombre para el certificado.')
      return
    }
    if (cert.tipo === 'linkedin' && !cert.enlace.trim()) {
      setError('Ingresa la URL de tu perfil de LinkedIn.')
      return
    }
    if (cert.tipo === 'otro' && !cert.archivo) {
      setError('Adjunta el archivo del certificado (PDF, JPG o PNG, hasta 5 MB).')
      return
    }

    setEnviando(true)
    try {
      const nuevo = await subirCertificado(postulacion.id, cert)
      setPostulacion((prev) => ({
        ...prev,
        certificados: [nuevo, ...(prev.certificados || [])],
      }))
      setCert(CERT_VACIO)
      setAviso(
        nuevo.estado === 'verificado_automatico'
          ? 'Perfil de LinkedIn verificado automáticamente.'
          : 'Certificado cargado. Queda pendiente de revisión.',
      )
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-40 rounded-[20px]" />
        <Skeleton className="h-64 rounded-[20px]" />
      </div>
    )
  }

  if (sinPostulacion) {
    return (
      <div>
        <PageHeader
          etiqueta="Panel profesional"
          titulo="Mi postulación"
          descripcion="Cuéntanos sobre tu experiencia para que un administrador revise tu perfil."
        />
        <EmptyState
          icono="user-check"
          titulo="Aún no te has postulado"
          accion={
            <BotonEnlace to="/postular">
              <Icon nombre="user-check" className="h-4 w-4" />
              Postular como profesional
            </BotonEnlace>
          }
        >
          Crea tu postulación para que un administrador revise tu perfil y puedas
          empezar a ofrecer servicios.
        </EmptyState>
      </div>
    )
  }

  if (!postulacion) {
    return (
      <div>
        <Alerta>{error || 'No pudimos cargar tu postulación.'}</Alerta>
      </div>
    )
  }

  const puedeSubir = ['pendiente', 'devuelta'].includes(postulacion.estado)
  const certificados = postulacion.certificados || []

  return (
    <div>
      <PageHeader
        etiqueta="Panel profesional"
        titulo="Mi postulación"
        descripcion={`Enviada el ${formatearFecha(postulacion.fecha_postulacion)}`}
        acciones={
          <StatusBadge estado={postulacion.estado} mapa={ESTADOS_POSTULACION} />
        }
      />

      {aviso && (
        <div className="mb-4">
          <Alerta tipo="exito">{aviso}</Alerta>
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      {postulacion.comentarios_admin && (
        <div className="mb-4">
          <Alerta tipo="advertencia" titulo="Comentarios del administrador">
            <p className="whitespace-pre-line">{postulacion.comentarios_admin}</p>
          </Alerta>
        </div>
      )}

      {postulacion.estado === 'devuelta' && (
        <div className="mb-4">
          <Alerta tipo="info" titulo="Tu postulación fue devuelta">
            <p className="mb-3">
              Corrige lo que corresponda y reenvía tu postulación cuando esté lista.
            </p>
            <Boton tamano="sm" cargando={enviando} onClick={reenviar}>
              Reenviar postulación
            </Boton>
          </Alerta>
        </div>
      )}

      {postulacion.estado === 'rechazada' && (
        <div className="mb-4">
          <Alerta tipo="error">
            Tu postulación fue rechazada. Si crees que se trata de un error, contacta
            al equipo de Skilly.
          </Alerta>
        </div>
      )}

      <Card className="mb-5">
        <CardHeader>
          <div>
            <h2 className="text-[0.9375rem] font-bold text-ink">Tu información</h2>
            <p className="mt-0.5 text-[0.8125rem] text-ink-3">
              Estos datos son los que revisa el equipo de Skilly.
            </p>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue-deep">
            <Icon nombre="user-check" className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardBody>
          <dl>
            <div className="flex flex-col gap-1 border-b border-line py-2.5 sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 text-[0.8125rem] text-ink-3">
                Especialidad
              </dt>
              <dd className="text-[0.875rem] font-semibold text-ink">
                {postulacion.especialidad || '—'}
              </dd>
            </div>
            <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:gap-4">
              <dt className="w-32 shrink-0 text-[0.8125rem] text-ink-3">
                Experiencia
              </dt>
              <dd className="whitespace-pre-line text-[0.875rem] leading-relaxed text-ink-2">
                {postulacion.experiencia || '—'}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card className="mb-5">
        <CardHeader>
          <div>
            <h2 className="text-[0.9375rem] font-bold text-ink">Certificados</h2>
            <p className="mt-0.5 text-[0.8125rem] text-ink-3">
              LinkedIn se valida automáticamente; los documentos los revisa un
              administrador.
            </p>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-violet-soft text-brand-violet">
            <Icon nombre="file" className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardBody>
          {certificados.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[0.8125rem] text-ink-3">
              Todavía no has cargado certificados.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {certificados.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-canvas text-ink-3">
                      <Icon nombre="file" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.875rem] font-bold text-ink">
                        {item.nombre}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        {item.enlace && (
                          <a
                            href={item.enlace}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-brand-blue no-underline hover:underline"
                          >
                            <Icon nombre="external" className="h-3.5 w-3.5" />
                            Ver enlace
                          </a>
                        )}
                        {item.archivo_url && (
                          <a
                            href={item.archivo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-brand-blue no-underline hover:underline"
                          >
                            <Icon nombre="external" className="h-3.5 w-3.5" />
                            Ver archivo
                          </a>
                        )}
                      </div>
                      {item.comentario_revisor && (
                        <p className="mt-1.5 text-[0.75rem] font-semibold text-danger">
                          {item.comentario_revisor}
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge estado={item.estado} mapa={ESTADOS_CERTIFICADO} />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {puedeSubir && (
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-[0.9375rem] font-bold text-ink">
                Agregar certificado
              </h2>
              <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                Suma credenciales que respalden tu experiencia.
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={agregarCertificado} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo etiqueta="Tipo" htmlFor="cert_tipo">
                  <Select
                    id="cert_tipo"
                    value={cert.tipo}
                    onChange={(e) =>
                      setCert({ ...CERT_VACIO, tipo: e.target.value })
                    }
                  >
                    <option value="otro">Documento</option>
                    <option value="linkedin">Perfil de LinkedIn</option>
                  </Select>
                </Campo>
                <Campo etiqueta="Nombre" htmlFor="cert_nombre" requerido>
                  <Input
                    id="cert_nombre"
                    placeholder="Ej: Título profesional"
                    value={cert.nombre}
                    onChange={(e) => setCert({ ...cert, nombre: e.target.value })}
                  />
                </Campo>
              </div>

              {cert.tipo === 'linkedin' ? (
                <Campo
                  etiqueta="URL del perfil"
                  htmlFor="cert_enlace"
                  ayuda="Se valida el formato de la URL; queda verificado automáticamente."
                >
                  <Input
                    id="cert_enlace"
                    type="url"
                    placeholder="https://www.linkedin.com/in/tu-perfil"
                    value={cert.enlace}
                    onChange={(e) => setCert({ ...cert, enlace: e.target.value })}
                  />
                </Campo>
              ) : (
                <Campo
                  etiqueta="Archivo"
                  htmlFor="cert_archivo"
                  ayuda="PDF, JPG o PNG, hasta 5 MB."
                >
                  <input
                    id="cert_archivo"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    className="block w-full text-[0.8125rem] text-ink-3 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-blue-soft file:px-3.5 file:py-2 file:text-[0.75rem] file:font-bold file:text-brand-blue-deep"
                    onChange={(e) =>
                      setCert({ ...cert, archivo: e.target.files?.[0] || null })
                    }
                  />
                </Campo>
              )}

              <Boton type="submit" cargando={enviando}>
                <Icon nombre="upload" className="h-4 w-4" />
                Cargar certificado
              </Boton>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
