import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  aprobarCertificado,
  listarCertificadosAdmin,
  rechazarCertificado,
} from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import {
  Cargando,
  Encabezado,
  Kpi,
  Panel,
  Vacio,
} from '../../components/admin/ui'
import { formatearFechaHora } from '../../lib/formato'

export default function Certificados() {
  const [certificados, setCertificados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [rechazo, setRechazo] = useState(null)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  function cargar() {
    setCargando(true)
    return listarCertificadosAdmin({ estado: 'sin_reviewer' })
      .then((res) => setCertificados(res.data.results || res.data))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargar()
  }, [])

  const kpis = useMemo(
    () => ({
      pendientes: certificados.length,
      documentos: certificados.filter((c) => c.tipo !== 'linkedin').length,
      profesionales: new Set(certificados.map((c) => c.profesional_id)).size,
    }),
    [certificados],
  )

  async function aprobar(certificado) {
    setError('')
    setAviso('')
    setEnviando(true)
    try {
      await aprobarCertificado(certificado.id)
      setCertificados((actuales) => actuales.filter((c) => c.id !== certificado.id))
      setAviso(`Certificado de ${certificado.profesional_nombre} aprobado.`)
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  async function confirmarRechazo() {
    if (!comentario.trim()) {
      setError('Escribe el motivo: el profesional lo verá en su postulación.')
      return
    }
    setError('')
    setAviso('')
    setEnviando(true)
    try {
      await rechazarCertificado(rechazo.id, comentario.trim())
      setCertificados((actuales) => actuales.filter((c) => c.id !== rechazo.id))
      setAviso(`Certificado de ${rechazo.profesional_nombre} rechazado.`)
      setRechazo(null)
      setComentario('')
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return <Cargando />

  return (
    <div>
      <Encabezado titulo="Certificados" />

      <div className="mb-6 flex flex-wrap gap-3.5">
        <Kpi etiqueta="Documentos pendientes" valor={kpis.pendientes} tono="warn" />
        <Kpi etiqueta="Profesionales involucrados" valor={kpis.profesionales} />
        <Kpi etiqueta="Documentos privados" valor={kpis.documentos} />
      </div>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}
      {aviso && (
        <div className="mb-4">
          <Alerta tipo="exito">{aviso}</Alerta>
        </div>
      )}

      <Panel titulo="Cola de moderación de documentos">
        <p className="mb-3 text-[11.5px] leading-relaxed text-gray-500">
          El perfil de LinkedIn se valida automáticamente por formato de URL y no
          aparece acá. Aprobar un certificado no aprueba la postulación: son
          decisiones independientes.
        </p>

        {certificados.length === 0 ? (
          <Vacio>No hay certificados pendientes de revisión.</Vacio>
        ) : (
          <ul className="m-0 list-none space-y-2 p-0">
            {certificados.map((certificado) => (
              <li
                key={certificado.id}
                className="border border-line px-3 py-3 text-[12px]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-[220px] flex-1">
                    <p className="font-bold">{certificado.nombre}</p>
                    <p className="text-[11px] text-gray-600">
                      {certificado.profesional_nombre} ·{' '}
                      {certificado.especialidad || 'Sin especialidad'} ·{' '}
                      {certificado.profesional_email}
                    </p>
                    <p className="mt-1 text-[10.5px] text-gray-500">
                      Cargado el {formatearFechaHora(certificado.cargado_en)}
                    </p>
                    {certificado.comentario_revisor && (
                      <p className="mt-1 text-[10.5px] text-brand-red">
                        {certificado.comentario_revisor}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {certificado.archivo_url && (
                      <a
                        href={certificado.archivo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-line px-2 py-1 text-[10.5px] text-navy no-underline hover:underline"
                      >
                        Ver archivo
                      </a>
                    )}
                    {certificado.enlace && (
                      <a
                        href={certificado.enlace}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-line px-2 py-1 text-[10.5px] text-navy no-underline hover:underline"
                      >
                        Ver enlace
                      </a>
                    )}
                    <Link
                      to={`/admin/postulaciones/${certificado.postulacion_id}`}
                      className="border border-line px-2 py-1 text-[10.5px] text-navy no-underline hover:underline"
                    >
                      Ver postulación
                    </Link>
                    <button
                      type="button"
                      disabled={enviando}
                      onClick={() => aprobar(certificado)}
                      className="border border-brand-green px-2 py-1 text-[10.5px] font-bold text-brand-green disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      disabled={enviando}
                      onClick={() => {
                        setError('')
                        setAviso('')
                        setRechazo(certificado)
                        setComentario('')
                      }}
                      className="border border-brand-red px-2 py-1 text-[10.5px] font-bold text-brand-red disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>

                {rechazo?.id === certificado.id && (
                  <div className="mt-3 border border-line bg-[#f7f7f7] p-3">
                    <p className="mb-2 text-[12px] font-bold">
                      Motivo del rechazo para {certificado.nombre}
                    </p>
                    <textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      rows={3}
                      className="mb-2 w-full border border-line bg-white px-2 py-1.5 text-[12px]"
                      placeholder="Explica qué debe corregir el profesional…"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={enviando}
                        onClick={confirmarRechazo}
                        className="border border-brand-red bg-brand-red px-3 py-1 text-[11px] font-bold text-white disabled:opacity-50"
                      >
                        {enviando ? 'Enviando…' : 'Confirmar rechazo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRechazo(null)}
                        className="border border-line px-3 py-1 text-[11px]"
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
      </Panel>
    </div>
  )
}
