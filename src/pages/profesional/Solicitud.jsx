import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import {
  aceptarReserva,
  marcarEntregado,
  obtenerReserva,
  rechazarReserva,
} from '../../api/reservas'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import {
  ESTADOS_RESERVA,
  FORMATOS,
  formatearCLP,
  formatearFecha,
  formatearHora,
} from '../../lib/formato'

function useCuentaRegresiva(expiraEn) {
  const [restante, setRestante] = useState(null)

  useEffect(() => {
    if (!expiraEn) return undefined
    function calcular() {
      const ms = new Date(expiraEn).getTime() - Date.now()
      setRestante(Math.max(0, ms))
    }
    calcular()
    const id = setInterval(calcular, 1000)
    return () => clearInterval(id)
  }, [expiraEn])

  if (restante === null) return null
  const totalMin = Math.floor(restante / 60000)
  const horas = Math.floor(restante / 3600000)
  const minutos = Math.floor((restante % 3600000) / 60000)
  const segundos = Math.floor((restante % 60000) / 1000)
  return {
    expirado: restante <= 0,
    texto:
      restante === 0
        ? '0:00'
        : restante >= 3600000
          ? `${horas}h ${String(Math.floor((restante % 3600000) / 60000)).padStart(2, '0')}m`
          : `${String(Math.floor(restante / 60000)).padStart(2, '0')}:${String(
              Math.floor((restante % 60000) / 1000),
            ).padStart(2, '0')}`,
    restante,
  }
}

function Fila({ etiqueta, children }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <span className="text-gray-500">{etiqueta}</span>
      <span className="text-right">{children}</span>
    </div>
  )
}

export default function Solicitud() {
  const { id } = useParams()
  const [solicitud, setSolicitud] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')

  const cargar = useCallback(() => {
    setCargando(true)
    obtenerReserva(id)
      .then(setSolicitud)
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [id])

  useEffect(cargar, [cargar])

  const cuenta = useCuentaRegresiva(solicitud?.expira_en)

  async function ejecutar(accion, mensajeExito) {
    setError('')
    setAviso('')
    setProcesando(true)
    try {
      const actualizada = await accion()
      setSolicitud(actualizada)
      setAviso(mensajeExito)
      setRechazando(false)
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return <p className="p-8 text-center text-sm text-gray-500">Cargando…</p>
  }
  if (!solicitud) {
    return (
      <div className="py-10 text-center">
        <Alerta>{error || 'No encontramos esta solicitud.'}</Alerta>
        <Link
          to="/profesional/solicitudes"
          className="mt-4 inline-block text-[13px] underline"
        >
          Volver a solicitudes
        </Link>
      </div>
    )
  }

  const estado = solicitud.estado
  const esPendiente = estado === 'pendiente_aceptacion'

  return (
    <div className="mx-auto max-w-3xl pt-5">
      <Link
        to="/profesional/solicitudes"
        className="text-[13px] text-gray-600 no-underline"
      >
        &larr; Solicitudes
      </Link>

      <div className="mb-4 mt-3 flex items-center justify-between">
        <h1 className="text-[20px] font-bold">Solicitud #{solicitud.id}</h1>
        <StatusBadge estado={estado} mapa={ESTADOS_RESERVA} />
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

      {esPendiente && cuenta && (
        <div
          className={`mb-4 border px-4 py-3 text-[13px] ${
            cuenta.restante > 0
              ? 'border-amber-300 bg-amber-50 text-amber-800'
              : 'border-red-300 bg-red-50 text-red-700'
          }`}
        >
          {cuenta.restante > 0
            ? `Responde dentro de ${Math.floor(cuenta.restante / 60000)} min o la solicitud se liberará.`
            : 'El plazo de respuesta venció.'}
        </div>
      )}

      <div className="border border-line">
        <div className="border-b border-line px-4 py-3">
          <p className="text-[14px] font-bold">{solicitud.servicio.titulo}</p>
          <p className="text-[12px] text-gray-500">
            {formatearFecha(solicitud.fecha)} · {formatearHora(solicitud.hora_inicio)}–
            {formatearHora(solicitud.hora_fin)}
          </p>
        </div>

        <dl className="divide-y divide-gray-100 px-4 text-[13px]">
          <Fila etiqueta="Organización">
            {solicitud.organizacion_nombre || solicitud.contacto_nombre}
          </Fila>
          <Fila etiqueta="Contacto">{solicitud.contacto_nombre}</Fila>
          <Fila etiqueta="Email">{solicitud.contacto_email}</Fila>
          {solicitud.contacto_telefono && (
            <Fila etiqueta="Teléfono">{solicitud.contacto_telefono}</Fila>
          )}
          <Fila etiqueta="Modalidad">{FORMATOS[solicitud.formato]}</Fila>
          {solicitud.ubicacion && <Fila etiqueta="Ubicación">{solicitud.ubicacion}</Fila>}
          <Fila etiqueta="Recibirás">
            <span className="font-bold text-navy">
              {formatearCLP(solicitud.monto_neto)}
            </span>
          </Fila>
        </dl>
      </div>

      {solicitud.mensaje && (
        <div className="mt-4 border border-line px-4 py-3 text-[13px]">
          <p className="mb-1 text-[12px] font-bold text-gray-500">
            Mensaje de la organización
          </p>
          <p>{solicitud.mensaje}</p>
        </div>
      )}

      {rechazando && (
        <div className="mt-5 border border-line px-4 py-3">
          <label className="mb-1 block text-[12px] font-bold">
            Motivo del rechazo
          </label>
          <textarea
            className="w-full border border-gray-300 px-3 py-2 text-[13px] focus:border-black focus:outline-none"
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              disabled={procesando}
              onClick={() =>
                ejecutar(
                  () => rechazarReserva(solicitud.id, motivo),
                  'Solicitud rechazada.',
                )
              }
              className="border border-red-600 bg-red-600 px-4 py-2 text-[13px] text-white disabled:opacity-50"
            >
              Confirmar rechazo
            </button>
            <button
              type="button"
              onClick={() => setRechazando(false)}
              className="text-[13px] underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {(esPendiente || estado === 'en_curso') && !rechazando && (
        <div className="mt-6 flex flex-wrap gap-3">
          {esPendiente && (
            <>
              <button
                type="button"
                disabled={procesando}
                onClick={() =>
                  ejecutar(() => aceptarReserva(solicitud.id), 'Solicitud aceptada.')
                }
                className="border border-black bg-black px-5 py-2.5 text-[13px] text-white disabled:opacity-50"
              >
                Aceptar solicitud
              </button>
              <button
                type="button"
                disabled={procesando}
                onClick={() => setRechazando(true)}
                className="border border-gray-400 px-5 py-2.5 text-[13px] disabled:opacity-50"
              >
                Rechazar
              </button>
            </>
          )}
          {estado === 'en_curso' && (
            <button
              type="button"
              disabled={procesando}
              onClick={() =>
                ejecutar(
                  () => marcarEntregado(solicitud.id),
                  'Marcaste el servicio como entregado. La organización debe confirmar.',
                )
              }
              className="border border-black bg-black px-5 py-2.5 text-[13px] text-white disabled:opacity-50"
            >
              Marcar como entregado
            </button>
          )}
        </div>
      )}

      {estado === 'finalizada' && (
        <div className="mt-6 border border-green-300 bg-green-50 px-4 py-3 text-[13px] text-green-800">
          Servicio entregado y confirmado por la organización.
        </div>
      )}
    </div>
  )
}
