import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { confirmarEntrega, obtenerReserva } from '../../api/reservas'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import {
  Boton,
  BotonEnlace,
  Card,
  Cargando,
  Migas,
  Precio,
} from '../../components/ui'
import { FORMATOS, formatearFecha, formatearHora } from '../../lib/formato'

function Fila({ etiqueta, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2.5 text-[0.875rem] last:border-0">
      <span className="shrink-0 text-ink-3">{etiqueta}</span>
      <span className="text-right font-semibold text-ink">{children}</span>
    </div>
  )
}

// Confirmar entrega: confirma la entrega y libera el pago retenido.
export default function ConfirmarEntrega() {
  const { id } = useParams()

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

  if (cargando) return <Cargando>Consultando la reserva…</Cargando>

  if (!reserva) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <Alerta>{error || 'No encontramos esta reserva.'}</Alerta>
        <BotonEnlace to="/mis-reservas" variante="secundario" className="mt-5">
          Volver a mis reservas
        </BotonEnlace>
      </div>
    )
  }

  if (confirmada || reserva.estado === 'finalizada') {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="overflow-hidden text-center">
          <div className="bg-ok-soft px-6 py-10">
            <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-white text-ok shadow-card">
              <Icon nombre="check-circle" className="h-8 w-8" strokeWidth={2} />
            </span>
            <h1 className="text-[1.5rem] font-extrabold tracking-[-0.02em] text-ok">
              Entrega confirmada
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[0.9rem] leading-relaxed text-ok/90">
              Liberamos el pago retenido a{' '}
              {reserva.profesional_nombre || 'el profesional'}. ¡Gracias por usar
              Skilly!
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 px-6 py-5">
            <BotonEnlace to="/mis-reservas" variante="secundario">
              Volver a mis reservas
            </BotonEnlace>
            <BotonEnlace to={`/reserva/${id}`}>Ver detalle de la reserva</BotonEnlace>
          </div>
        </Card>
      </div>
    )
  }

  const confirmable = reserva.estado === 'entregado_por_confirmar'

  return (
    <div className="mx-auto max-w-xl">
      <Migas
        className="mb-4"
        items={[
          { texto: 'Mis reservas', to: '/mis-reservas' },
          { texto: `Reserva #${id}`, to: `/reserva/${id}` },
          { texto: 'Confirmar entrega' },
        ]}
      />

      <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-ink">
        Confirmar entrega del servicio
      </h1>
      <p className="mt-2 mb-5 text-[0.95rem] leading-relaxed text-ink-3">
        Verifica que el trabajo se completó según lo acordado antes de liberar el pago
        al profesional.
      </p>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink-3">
            Resumen de la reserva
          </p>
          <p className="mt-1 text-[1.0625rem] font-bold text-ink">
            {reserva.servicio?.titulo || 'Servicio'}
          </p>
        </div>
        <div className="px-5 py-2">
          <Fila etiqueta="Profesional">{reserva.profesional_nombre || 'Por asignar'}</Fila>
          <Fila etiqueta="Fecha">
            {formatearFecha(reserva.fecha)} · {formatearHora(reserva.hora_inicio)}
          </Fila>
          <Fila etiqueta="Modalidad">{FORMATOS[reserva.formato]}</Fila>
          <div className="flex items-end justify-between gap-4 py-4">
            <span className="text-[0.875rem] font-semibold text-ink-2">
              Monto retenido
            </span>
            <Precio valor={reserva.precio_acordado} nota="" tamano="sm" className="text-right" />
          </div>
        </div>
      </Card>

      {!confirmable ? (
        <div className="mt-5">
          <Alerta tipo="info">
            Esta reserva todavía no está marcada como entregada por el profesional.
          </Alerta>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-xl bg-canvas px-4 py-3.5 text-[0.8125rem] leading-relaxed text-ink-2">
            Al confirmar, Skilly libera el pago retenido al profesional. Si algo no está
            correcto,{' '}
            <Link
              to={`/reserva/${id}`}
              className="font-bold text-danger underline-offset-2 hover:underline"
            >
              reporta un problema
            </Link>{' '}
            y el pago permanece retenido mientras lo revisamos.
          </div>

          <Boton
            tamano="lg"
            className="mt-5 w-full"
            onClick={confirmar}
            cargando={procesando}
          >
            {procesando ? 'Confirmando…' : 'Confirmar entrega y liberar pago'}
            {!procesando && <Icon nombre="check" className="h-4 w-4" strokeWidth={2.6} />}
          </Boton>
        </>
      )}
    </div>
  )
}
