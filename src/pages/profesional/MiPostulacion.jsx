import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import {
  miPostulacion,
  reenviarPostulacion,
  subirCertificado,
} from '../../api/postulaciones'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import {
  ESTADOS_CERTIFICADO,
  ESTADOS_POSTULACION,
  formatearFecha,
} from '../../lib/formato'

const CLASE_INPUT = 'w-full border border-gray-400 px-3 py-2 text-[13px] outline-none'
const CLASE_LABEL = 'mb-1 block text-[12px] text-gray-600'

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
    return <p className="pt-8 text-center text-[13px] text-gray-500">Cargando…</p>
  }

  if (sinPostulacion) {
    return (
      <div className="mx-auto max-w-lg pt-8 text-center">
        <h1 className="text-[20px] font-bold">Aún no te has postulado</h1>
        <p className="mb-5 text-[13px] text-gray-500">
          Crea tu postulación para que un administrador revise tu perfil.
        </p>
        <Link
          to="/postular"
          className="inline-block border border-black bg-black px-5 py-2.5 text-[13px] text-white no-underline"
        >
          Postular como profesional
        </Link>
      </div>
    )
  }

  if (!postulacion) {
    return (
      <div className="pt-8">
        <Alerta>{error || 'No pudimos cargar tu postulación.'}</Alerta>
      </div>
    )
  }

  const puedeSubir = ['pendiente', 'devuelta'].includes(postulacion.estado)
  const certificados = postulacion.certificados || []

  return (
    <div className="mx-auto max-w-2xl pt-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold">Mi postulación</h1>
          <p className="text-[12.5px] text-gray-500">
            Enviada el {formatearFecha(postulacion.fecha_postulacion)}
          </p>
        </div>
        <StatusBadge estado={postulacion.estado} mapa={ESTADOS_POSTULACION} />
      </div>

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
        <div className="mb-5 border border-amber-300 bg-amber-50 px-3 py-2.5 text-[12.5px] text-amber-800">
          <p className="font-bold">Comentarios del administrador</p>
          <p className="mt-1 whitespace-pre-line">{postulacion.comentarios_admin}</p>
        </div>
      )}

      {postulacion.estado === 'devuelta' && (
        <div className="mb-5">
          <p className="mb-2 text-[12.5px] text-gray-600">
            Corrige lo que corresponda y reenvía tu postulación cuando esté lista.
          </p>
          <button
            type="button"
            onClick={reenviar}
            disabled={enviando}
            className="border border-black bg-black px-4 py-2.5 text-[13px] text-white disabled:opacity-60"
          >
            {enviando ? 'Reenviando…' : 'Reenviar postulación'}
          </button>
        </div>
      )}

      {postulacion.estado === 'rechazada' && (
        <div className="mb-5">
          <Alerta tipo="error">
            Tu postulación fue rechazada. Si crees que se trata de un error,
            contacta al equipo de Skilly.
          </Alerta>
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 border-b border-line pb-1.5 text-[14px] font-bold">
          Tu información
        </h2>
        <dl className="space-y-2 text-[13px]">
          <div className="flex gap-2">
            <dt className="w-32 text-gray-500">Especialidad</dt>
            <dd>{postulacion.especialidad || '—'}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-32 text-gray-500">Experiencia</dt>
            <dd className="whitespace-pre-line">{postulacion.experiencia || '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 border-b border-line pb-1.5 text-[14px] font-bold">
          Certificados
        </h2>
        {certificados.length === 0 ? (
          <p className="mb-4 text-[13px] text-gray-500">
            Todavía no has cargado certificados.
          </p>
        ) : (
          <ul className="mb-4 space-y-2">
            {certificados.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 border border-line px-3 py-2.5"
              >
                <div>
                  <p className="text-[13px] font-bold">{item.nombre}</p>
                  {item.enlace && (
                    <a
                      href={item.enlace}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11.5px] text-gray-500 underline"
                    >
                      {item.enlace}
                    </a>
                  )}
                  {item.archivo_url && (
                    <a
                      href={item.archivo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11.5px] text-gray-500 underline"
                    >
                      Ver archivo
                    </a>
                  )}
                  {item.comentario_revisor && (
                    <p className="mt-1 text-[11.5px] text-red-600">
                      {item.comentario_revisor}
                    </p>
                  )}
                </div>
                <StatusBadge estado={item.estado} mapa={ESTADOS_CERTIFICADO} />
              </li>
            ))}
          </ul>
        )}

        {puedeSubir && (
          <form onSubmit={agregarCertificado} className="border border-line p-4">
            <h3 className="mb-3 text-[13px] font-bold">Agregar certificado</h3>
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={CLASE_LABEL}>Tipo</label>
                <select
                  className={CLASE_INPUT}
                  value={cert.tipo}
                  onChange={(e) =>
                    setCert({ ...CERT_VACIO, tipo: e.target.value })
                  }
                >
                  <option value="otro">Documento</option>
                  <option value="linkedin">Perfil de LinkedIn</option>
                </select>
              </div>
              <div>
                <label className={CLASE_LABEL}>Nombre *</label>
                <input
                  className={CLASE_INPUT}
                  placeholder="Ej: Título profesional"
                  value={cert.nombre}
                  onChange={(e) => setCert({ ...cert, nombre: e.target.value })}
                />
              </div>
            </div>

            {cert.tipo === 'linkedin' ? (
              <div className="mb-3">
                <label className={CLASE_LABEL}>URL del perfil</label>
                <input
                  type="url"
                  className={CLASE_INPUT}
                  placeholder="https://www.linkedin.com/in/tu-perfil"
                  value={cert.enlace}
                  onChange={(e) => setCert({ ...cert, enlace: e.target.value })}
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Se valida el formato de la URL; queda verificado automáticamente.
                </p>
              </div>
            ) : (
              <div className="mb-3">
                <label className={CLASE_LABEL}>Archivo (PDF, JPG o PNG, máx. 5 MB)</label>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  className="text-[12.5px]"
                  onChange={(e) =>
                    setCert({ ...cert, archivo: e.target.files?.[0] || null })
                  }
                />
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="border border-black bg-black px-4 py-2 text-[12.5px] text-white disabled:opacity-60"
            >
              {enviando ? 'Subiendo…' : 'Cargar certificado'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
