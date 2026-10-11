import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { confirmarEntrega, obtenerReserva } from '../../api/reservas'
import Alerta from '../../components/Alerta'
import { formatearCLP, formatearFecha, formatearHora, FORMATOS } from '../../lib/formato'

function Fila({ etiqueta, children }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-[13px]">
      <span className="text-gray-500">{etiqueta}</span>
      <span className="text-right">{children}</span>
    </div>
  )
}

export default function ConfirmarEntrega() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [reserva, setReserva] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [confirmada, setConfirmada] = useState(false)

  useEffect(() => {
    obtenerReserva(id)
      .then(setReserva)
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [id])

  async function confirmar() {
    setError('')
    setProcesando(true)
    try {
      const actualizada = await confirmarEntrega(id)
      setReserva(actualizada)
      setConfirmada(true)
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
        <Link to="/mis-reservas" className="mt-4 inline-block text-[13px] underline">
          Volver a mis reservas
        </Link>
      </div>
    )
  }

  if (confirmada || reserva.estado === 'finalizada') {
    return (
      <div className="mx-auto max-w-xl pt-10 text-center">
        <div className="border border-green-300 bg-green-50 px-6 py-8">
          <h1 className="text-[18px] font-bold text-green-800">Entrega confirmada</h1>
          <p className="mt-2 text-[13px] text-green-800">
            Liberamos el pago retenido a {reserva.profesional_nombre || 'el profesional'}.
            ¡Gracias por usar Skilly!
          </p>
        </div>
        <Link to="/mis-reservas" className="mt-5 inline-block text-[13px] underline">
          Volver a mis reservas
        </Link>
      </div>
    )
  }

  const confirmable = reserva.estado === 'entregado_por_confirmar'

  return (
    <div className="mx-auto max-w-xl pt-5">
      <Link to={`/reserva/${id}`} className="text-[13px] text-gray-600 no-underline">
        &larr; Volver a la reserva
      </Link>

      <h1 className="mt-3 text-[20px] font-bold">Confirmar entrega del servicio</h1>
      <p className="mb-5 text-[12.5px] text-gray-500">
        Verifica que el trabajo se completó según lo acordado antes de liberar el
        pago.
      </p>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      <div className="border border-line px-4 py-2">
        <Fila etiqueta="Servicio">{reserva.servicio?.titulo || '…'}</Fila>
        <Fila etiqueta="Profesional">{reserva.profesional_nombre || 'Por asignar'}</Fila>
        <Fila etiqueta="Fecha">
          {formatearFecha(reserva.fecha)} · {formatearHora(reserva.hora_inicio)}
        </Fila>
        <Fila etiqueta="Modalidad">{FORMATOS[reserva.formato]}</Fila>
        <Fila etiqueta="Monto retenido">
          <span className="font-bold text-brand-red">
            {formatearCLP(reserva.precio_acordado)}
          </span>
        </Fila>
      </div>

      {!confirmable ? (
        <div className="mt-5">
          <Alerta tipo="info">
            Esta reserva todavía no está marcada como entregada por el profesional.
          </Alerta>
        </div>
      ) : (
        <>
          <p className="mt-4 text-[12px] text-gray-500">
            Al confirmar, Skilly libera el pago retenido al profesional. Si algo no
            está correcto,{' '}
            <Link to={`/reserva/${id}`} className="underline">
              reporta un problema
            </Link>{' '}
            y el pago permanece retenido mientras lo revisamos.
          </p>

          <button
            type="button"
            onClick={confirmar}
            disabled={procesando}
            className="mt-4 w-full border border-black bg-black py-3 text-[13px] text-white disabled:opacity-60"
          >
            {procesando ? 'Confirmando…' : 'Confirmar entrega y liberar pago'}
          </button>
        </>
      )}
    </div>
  )
}
