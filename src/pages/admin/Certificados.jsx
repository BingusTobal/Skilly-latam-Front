import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  aprobarCertificado,
  listarCertificadosAdmin,
  rechazarCertificado,
} from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import {
  Cargando,
  Encabezado,
  Kpi,
  Panel,
  Vacio,
} from '../../components/admin/ui'
import { Boton, Textarea } from '../../components/ui'
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
      <Encabezado
        titulo="Certificados"
        descripcion="Valida los documentos cargados por los profesionales. LinkedIn se verifica automáticamente."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Kpi
          etiqueta="Documentos pendientes"
          valor={kpis.pendientes}
          tono="warn"
          icono="file"
        />
        <Kpi
          etiqueta="Profesionales involucrados"
          valor={kpis.profesionales}
          icono="users"
        />
        <Kpi
          etiqueta="Documentos privados"
          valor={kpis.documentos}
          icono="shield"
        />
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

      <Panel titulo="Cola de moderación de documentos" icono="shield">
        <p className="mb-4 rounded-xl bg-info-soft px-3.5 py-2.5 text-[0.8125rem] leading-relaxed text-info">
          Aprobar un certificado no aprueba la postulación: son decisiones
          independientes. El perfil de LinkedIn se valida automáticamente por formato de
          URL y no aparece acá.
        </p>

        {certificados.length === 0 ? (
          <Vacio>No hay certificados pendientes de revisión.</Vacio>
        ) : (
          <ul className="space-y-2.5">
            {certificados.map((certificado) => (
              <li
                key={certificado.id}
                className="rounded-xl border border-line px-4 py-3"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-canvas text-ink-3">
                      <Icon nombre="file" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.875rem] font-bold text-ink">
                        {certificado.nombre}
                      </p>
                      <p className="mt-0.5 text-[0.75rem] text-ink-3">
                        {certificado.profesional_nombre} ·{' '}
                        {certificado.especialidad || 'Sin especialidad'} ·{' '}
                        {certificado.profesional_email}
                      </p>
                      <p className="mt-1 text-[0.6875rem] text-ink-3">
                        Cargado el {formatearFechaHora(certificado.cargado_en)}
                      </p>
                      {certificado.comentario_revisor && (
                        <p className="mt-1 text-[0.75rem] font-semibold text-danger">
                          {certificado.comentario_revisor}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
                    {certificado.archivo_url && (
                      <a
                        href={certificado.archivo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-[10px] border border-line px-2.5 py-1.5 text-[0.75rem] font-semibold text-ink-2 no-underline transition hover:border-ink-3"
                      >
                        <Icon nombre="external" className="h-3.5 w-3.5" />
                        Archivo
                      </a>
                    )}
                    {certificado.enlace && (
                      <a
                        href={certificado.enlace}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-[10px] border border-line px-2.5 py-1.5 text-[0.75rem] font-semibold text-ink-2 no-underline transition hover:border-ink-3"
                      >
                        <Icon nombre="external" className="h-3.5 w-3.5" />
                        Enlace
                      </a>
                    )}
                    <Link
                      to={`/admin/postulaciones/${certificado.postulacion_id}`}
                      className="inline-flex items-center gap-1.5 rounded-[10px] border border-line px-2.5 py-1.5 text-[0.75rem] font-semibold text-ink-2 no-underline transition hover:border-ink-3"
                    >
                      Ver postulación
                    </Link>
                    <Boton
                      tamano="sm"
                      disabled={enviando}
                      onClick={() => aprobar(certificado)}
                    >
                      Aprobar
                    </Boton>
                    <Boton
                      tamano="sm"
                      variante="peligro"
                      disabled={enviando}
                      onClick={() => {
                        setError('')
                        setAviso('')
                        setRechazo(certificado)
                        setComentario('')
                      }}
                    >
                      Rechazar
                    </Boton>
                  </div>
                </div>

                {rechazo?.id === certificado.id && (
                  <div className="mt-3 rounded-xl border border-line bg-canvas/60 p-3.5">
                    <p className="mb-2 text-[0.8125rem] font-bold text-ink">
                      Motivo del rechazo para {certificado.nombre}
                    </p>
                    <Textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      rows={3}
                      className="bg-white"
                      placeholder="Explica qué debe corregir el profesional…"
                    />
                    <div className="mt-2.5 flex gap-2">
                      <Boton
                        tamano="sm"
                        variante="peligro"
                        cargando={enviando}
                        onClick={confirmarRechazo}
                      >
                        Confirmar rechazo
                      </Boton>
                      <Boton
                        tamano="sm"
                        variante="fantasma"
                        onClick={() => setRechazo(null)}
                      >
                        Cancelar
                      </Boton>
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
