import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { abrirDisputa } from '../../api/disputas'
import { iniciarPago } from '../../api/pagos'
import { cancelarReserva, obtenerReserva } from '../../api/reservas'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import {
  ESTADOS_DISPUTA,
  ESTADOS_RESERVA,
  FORMATOS,
  RESULTADOS_DISPUTA,
  formatearCLP,
  formatearFecha,
  formatearFechaHora,
  formatearHora,
} from '../../lib/formato'
import { irAWebpay } from '../../lib/webpay'

function Fila({ etiqueta, children }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <span className="text-gray-500">{etiqueta}</span>
      <span className="text-right">{children}</span>
    </div>
  )
}

export default function DetalleReserva() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const token = searchParams.get('token')
  const { usuario } = useAuth()

  const [reserva, setReserva] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(location.state?.errorPago || '')
  const [aviso, setAviso] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [formDisputa, setFormDisputa] = useState(false)
  const [motivoDisputa, setMotivoDisputa] = useState('')
  const [descripcionDisputa, setDescripcionDisputa] = useState('')
  const [evidenciaDisputa, setEvidenciaDisputa] = useState(null)
  const [enviandoDisputa, setEnviandoDisputa] = useState(false)

  const cargar = useCallback(() => {
    setCargando(true)
    obtenerReserva(id, token)
      .then(setReserva)
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [id, token])

  useEffect(cargar, [cargar])

  async function ejecutar(accion, mensajeExito) {
    setError('')
    setAviso('')
    setProcesando(true)
    try {
      const actualizada = await accion()
      setReserva(actualizada)
      setAviso(mensajeExito)
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setProcesando(false)
    }
  }

  async function pagar() {
    setError('')
    setAviso('')
    setProcesando(true)
    try {
      const pago = await iniciarPago(reserva.id, token)
      if (!irAWebpay(pago)) {
        setError('Transbank no devolvió la URL de pago. Intenta nuevamente.')
        setProcesando(false)
      }
    } catch (err) {
      setError(mensajeDeError(err))
      setProcesando(false)
    }
  }

  async function enviarDisputa(evento) {
    evento.preventDefault()
    setError('')
    setAviso('')
    setEnviandoDisputa(true)
    try {
      await abrirDisputa({
        reserva: reserva.id,
        motivo: motivoDisputa,
        descripcion: descripcionDisputa,
        evidencia: evidenciaDisputa,
      })
      setFormDisputa(false)
      setMotivoDisputa('')
      setDescripcionDisputa('')
      setEvidenciaDisputa(null)
      setAviso('Registramos tu disputa. El equipo de Skilly revisará el caso.')
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviandoDisputa(false)
    }
  }

  if (cargando) {
    return <p className="p-8 text-center text-sm text-gray-500">Cargando…</p>
  }
  if (!reserva) {
    return (
      <div className="py-10 text-center">
        <Alerta>{error || 'No encontramos esta reserva.'}</Alerta>
        <Link to="/catalogo" className="mt-4 inline-block text-[13px] underline">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const estado = reserva.estado
  const conSesion = Boolean(usuario)
  const puedePagar = estado === 'pendiente_pago' && (conSesion || Boolean(token))
  const puedeCancelar = conSesion && ['pendiente_aceptacion', 'en_curso'].includes(estado)
  const puedeConfirmar = conSesion && estado === 'entregado_por_confirmar'
  const disputa = reserva.disputa
  const puedeReportar =
    conSesion && !disputa && ['en_curso', 'entregado_por_confirmar'].includes(estado)
  const mostrandoAcciones = puedePagar || puedeCancelar || puedeConfirmar || puedeReportar
  const requiereSesion =
    !conSesion &&
    ['en_curso', 'entregado_por_confirmar'].includes(estado) &&
    Boolean(token)

  return (
    <div className="mx-auto max-w-3xl pt-5">
      <Link
        to={usuario ? '/mis-reservas' : '/catalogo'}
        className="text-[13px] text-gray-600 no-underline"
      >
        &larr; {usuario ? 'Mis reservas' : 'Catálogo'}
      </Link>

      <div className="mb-4 mt-3 flex items-center justify-between">
        <h1 className="text-[20px] font-bold">Reserva #{reserva.id}</h1>
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

      {estado === 'finalizada' && (
        <div className="mb-4 border border-green-300 bg-green-50 px-4 py-3 text-[13px] text-green-800">
          Servicio entregado y confirmado. ¡Gracias por usar Skilly!
        </div>
      )}

      {estado === 'pendiente_pago' && (
        <div className="mb-4 border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          Tu reserva está creada, pero todavía falta el pago. Complétalo para
          enviarla al profesional y bloquear el horario.
        </div>
      )}

      {token && ['pendiente_pago', 'pendiente_aceptacion'].includes(estado) && (
        <div className="mb-4 border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] text-amber-800">
          Revisa tu correo: te enviamos un enlace para gestionar y seguir esta
          reserva. Guarda también esta página, puedes volver con el mismo enlace.
        </div>
      )}

      <div className="border border-line">
        <div className="border-b border-line px-4 py-3">
          <Link
            to={`/servicios/${reserva.servicio.id}`}
            className="text-[14px] font-bold no-underline"
          >
            {reserva.servicio.titulo}
          </Link>
          <p className="text-[12px] text-gray-500">
            {formatearFecha(reserva.fecha)} · {formatearHora(reserva.hora_inicio)}–
            {formatearHora(reserva.hora_fin)}
          </p>
        </div>

        <dl className="divide-y divide-gray-100 px-4 text-[13px]">
          <Fila etiqueta="Modalidad">{FORMATOS[reserva.formato]}</Fila>
          {reserva.ubicacion && <Fila etiqueta="Ubicación">{reserva.ubicacion}</Fila>}
          <Fila etiqueta="Profesional">{reserva.profesional_nombre || 'Por asignar'}</Fila>
          {reserva.profesional_email && (
            <Fila etiqueta="Contacto">{reserva.profesional_email}</Fila>
          )}
          {reserva.profesional_telefono && (
            <Fila etiqueta="Teléfono">{reserva.profesional_telefono}</Fila>
          )}
          <Fila etiqueta="Total">
            <span className="font-bold text-brand-red">
              {formatearCLP(reserva.precio_acordado)}
            </span>
          </Fila>
        </dl>
      </div>

      {reserva.mensaje && (
        <div className="mt-4 border border-line px-4 py-3 text-[13px]">
          <p className="mb-1 text-[12px] font-bold text-gray-500">Tu mensaje</p>
          <p>{reserva.mensaje}</p>
        </div>
      )}

      {disputa && (
        <div className="mt-4 border border-red-300 px-4 py-3 text-[13px]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-bold">Disputa #{disputa.id}</p>
            <StatusBadge estado={disputa.estado} mapa={ESTADOS_DISPUTA} />
          </div>
          <p className="mb-1">
            <b>Motivo:</b> {disputa.motivo}
          </p>
          {disputa.descripcion && <p className="mb-1">{disputa.descripcion}</p>}
          <p className="text-[12px] text-gray-500">
            Abierta el {formatearFechaHora(disputa.creada_en)}
          </p>

          {disputa.evidencias?.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-[12px] font-bold text-gray-500">Evidencia</p>
              <ul className="space-y-1">
                {disputa.evidencias.map((archivo) => (
                  <li key={archivo.id} className="text-[12.5px]">
                    {archivo.archivo ? (
                      <a
                        href={archivo.archivo}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {archivo.nombre || `Archivo ${archivo.id}`}
                      </a>
                    ) : (
                      archivo.nombre || `Archivo ${archivo.id}`
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {disputa.estado === 'resuelta' && (
            <div className="mt-3 border-t border-red-200 pt-3">
              <p className="mb-1">
                <b>Resultado:</b>{' '}
                {RESULTADOS_DISPUTA[disputa.resultado]?.etiqueta || disputa.resultado}
              </p>
              {disputa.monto_reembolso && (
                <p className="mb-1">
                  <b>Reembolso:</b> {formatearCLP(disputa.monto_reembolso)}
                </p>
              )}
              {disputa.resolucion && <p>{disputa.resolucion}</p>}
              {disputa.resuelta_en && (
                <p className="mt-1 text-[12px] text-gray-500">
                  Resuelta el {formatearFechaHora(disputa.resuelta_en)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {formDisputa && (
        <form
          onSubmit={enviarDisputa}
          className="mt-4 border border-red-300 px-4 py-4 text-[13px]"
        >
          <p className="mb-3 font-bold">Reportar un problema</p>
          <label className="mb-1 block text-[12px] font-bold text-gray-500">
            Motivo
          </label>
          <input
            value={motivoDisputa}
            onChange={(e) => setMotivoDisputa(e.target.value)}
            maxLength={200}
            required
            placeholder="Ej: Entrega incompleta"
            className="mb-3 w-full border border-gray-400 px-3 py-2 text-[13px] outline-none"
          />
          <label className="mb-1 block text-[12px] font-bold text-gray-500">
            Descripción
          </label>
          <textarea
            value={descripcionDisputa}
            onChange={(e) => setDescripcionDisputa(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Cuéntanos qué ocurrió con el servicio."
            className="mb-3 w-full border border-gray-400 px-3 py-2 text-[13px] outline-none"
          />
          <label className="mb-1 block text-[12px] font-bold text-gray-500">
            Evidencia (opcional, PDF/JPG/PNG hasta 5 MB)
          </label>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(e) => setEvidenciaDisputa(e.target.files?.[0] || null)}
            className="mb-4 block text-[12px]"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={enviandoDisputa}
              className="border border-black bg-black px-4 py-2 text-[13px] text-white disabled:opacity-50"
            >
              {enviandoDisputa ? 'Enviando…' : 'Abrir disputa'}
            </button>
            <button
              type="button"
              onClick={() => setFormDisputa(false)}
              className="border border-black px-4 py-2 text-[13px]"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {estado === 'pendiente_aceptacion' && (
        <p className="mt-4 text-[12.5px] text-gray-500">
          El profesional tiene un plazo de 6 horas para responder. Si no lo hace, la
          reserva se libera automáticamente y no se te cobra.
        </p>
      )}
      {estado === 'cancelada' && reserva.motivo_cancelacion && (
        <p className="mt-4 text-[12.5px] text-gray-500">
          Motivo de cancelación: {reserva.motivo_cancelacion}
        </p>
      )}

      {requiereSesion && (
        <div className="mt-5 border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          Para confirmar la entrega, cancelar o reportar un problema necesitas{' '}
          <Link
            to="/login"
            state={{ desde: `/reserva/${reserva.id}${token ? `?token=${token}` : ''}` }}
            className="underline"
          >
            iniciar sesión
          </Link>
          . Guardamos tu enlace de seguimiento.
        </div>
      )}

      {mostrandoAcciones && (
        <div className="mt-6 flex flex-wrap gap-3">
          {puedePagar && (
            <button
              type="button"
              disabled={procesando}
              onClick={pagar}
              className="border border-black bg-black px-5 py-2.5 text-[13px] text-white disabled:opacity-50"
            >
              {procesando ? 'Abriendo Webpay…' : 'Pagar ahora con Webpay'}
            </button>
          )}
          {puedeConfirmar && (
            <Link
              to={`/reserva/${reserva.id}/confirmar`}
              className="border border-black bg-black px-5 py-2.5 text-[13px] text-white no-underline"
            >
              Confirmar entrega
            </Link>
          )}
          {puedeCancelar && (
            <button
              type="button"
              disabled={procesando}
              onClick={() =>
                ejecutar(
                  () => cancelarReserva(reserva.id, 'Cancelada por la organización'),
                  'Reserva cancelada.',
                )
              }
              className="border border-black px-5 py-2.5 text-[13px] disabled:opacity-50"
            >
              Cancelar reserva
            </button>
          )}
          {puedeReportar && (
            <button
              type="button"
              onClick={() => setFormDisputa(true)}
              className="border border-red-300 px-5 py-2.5 text-[13px] text-red-600"
            >
              Reportar un problema
            </button>
          )}
        </div>
      )}
    </div>
  )
}
