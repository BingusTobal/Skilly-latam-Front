import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import {
  cancelarReserva,
  obtenerReserva,
  reportarProblema,
} from '../../api/reservas'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import {
  ESTADOS_RESERVA,
  FORMATOS,
  formatearCLP,
  formatearFecha,
  formatearHora,
} from '../../lib/formato'

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
  const token = searchParams.get('token')
  const { usuario } = useAuth()

  const [reserva, setReserva] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [procesando, setProcesando] = useState(false)

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
  const puedeCancelar = conSesion && ['pendiente_aceptacion', 'en_curso'].includes(estado)
  const puedeConfirmar = conSesion && estado === 'entregado_por_confirmar'
  const puedeReportar = conSesion && ['en_curso', 'entregado_por_confirmar'].includes(estado)
  const mostrandoAcciones = puedeCancelar || puedeConfirmar || puedeReportar
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

      {token && estado === 'pendiente_aceptacion' && (
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
              disabled={procesando}
              onClick={() =>
                ejecutar(
                  () =>
                    reportarProblema(reserva.id, {
                      motivo: 'Problema reportado por la organización',
                    }),
                  'Registramos tu reporte. El equipo de Skilly lo revisará.',
                )
              }
              className="border border-red-300 px-5 py-2.5 text-[13px] text-red-600 disabled:opacity-50"
            >
              Reportar un problema
            </button>
          )}
        </div>
      )}
    </div>
  )
}
