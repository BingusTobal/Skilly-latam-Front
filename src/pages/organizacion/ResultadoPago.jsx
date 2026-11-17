import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { estadoPago } from '../../api/pagos'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import { BotonEnlace, Card, Cargando, Estado } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { ESTADOS_PAGO } from '../../lib/formato'

const ESTADOS_PAGO_OK = new Set(['autorizado', 'capturando', 'retenido', 'liberado'])

const TITULOS = {
  ok: 'Pago aprobado',
  fallo: 'No pudimos completar el pago',
  abandono: 'Pago cancelado',
}

export default function ResultadoPago() {
  const [searchParams] = useSearchParams()
  const { usuario } = useAuth()
  const referencia = searchParams.get('ref')
  const resultadoUrl = searchParams.get('estado') || ''

  const [pago, setPago] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(Boolean(referencia))

  useEffect(() => {
    if (!referencia) {
      setCargando(false)
      return undefined
    }
    let activo = true
    estadoPago(referencia)
      .then((data) => activo && setPago(data))
      .catch((err) => activo && setError(mensajeDeError(err)))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [referencia])

  if (cargando) return <Cargando>Consultando el pago…</Cargando>

  const estadoInterno = pago?.estado || ''
  const aprobado = ESTADOS_PAGO_OK.has(estadoInterno) || resultadoUrl === 'ok'
  const titulo = error
    ? 'No pudimos consultar el pago'
    : aprobado
      ? 'Pago aprobado'
      : TITULOS[resultadoUrl] || 'Pago no completado'

  const config = error
    ? { icono: 'alert-circle', caja: 'bg-danger-soft text-danger', tono: 'peligro' }
    : aprobado
      ? { icono: 'check-circle', caja: 'bg-ok-soft text-ok', tono: 'ok' }
      : { icono: 'alert-triangle', caja: 'bg-warn-soft text-warn', tono: 'warn' }

  const tonoPago = ESTADOS_PAGO_OK.has(pago?.estado)
    ? 'ok'
    : ['rechazado', 'cancelado', 'expirado'].includes(pago?.estado)
      ? 'peligro'
      : 'info'

  return (
    <div className="mx-auto max-w-xl">
      <Card className="overflow-hidden">
        <div className="px-6 pb-6 pt-8 text-center sm:px-8">
          <span
            className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full ${config.caja}`}
          >
            <Icon nombre={config.icono} className="h-8 w-8" strokeWidth={2} />
          </span>
          <h1 className="text-[1.75rem] font-extrabold tracking-[-0.03em] text-ink">
            {titulo}
          </h1>

          {aprobado && (
            <p className="mx-auto mt-2 max-w-md text-[0.9rem] leading-relaxed text-ink-3">
              Tu pago quedó retenido en custodia. El profesional ahora puede aceptar la
              reserva; si no lo hace dentro del plazo, se libera automáticamente.
            </p>
          )}

          {!aprobado && !error && (
            <p className="mx-auto mt-2 max-w-md text-[0.9rem] leading-relaxed text-ink-3">
              El pago no fue autorizado o fue cancelado. La reserva no se envió al
              profesional y puedes intentarlo nuevamente desde el detalle.
            </p>
          )}

          {error && (
            <div className="mt-4 text-left">
              <Alerta>{error}</Alerta>
            </div>
          )}
        </div>

        {pago && (
          <div className="mx-6 mb-6 rounded-xl bg-canvas px-4 py-3 sm:mx-8">
            <dl className="space-y-2 text-[0.8125rem]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-3">Referencia</dt>
                <dd className="font-mono font-semibold text-ink">
                  {pago.referencia_publica}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-3">Estado del pago</dt>
                <dd>
                  <Estado tono={tonoPago}>
                    {ESTADOS_PAGO[pago.estado] || pago.estado}
                  </Estado>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-3">Estado de la reserva</dt>
                <dd className="font-semibold text-ink">{pago.reserva_estado}</dd>
              </div>
            </dl>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 border-t border-line px-6 py-5 sm:px-8">
          {usuario ? (
            <BotonEnlace to="/mis-reservas">Ver mis reservas</BotonEnlace>
          ) : (
            <BotonEnlace to="/catalogo">Volver al catálogo</BotonEnlace>
          )}
          <BotonEnlace to="/" variante="secundario">
            Ir al inicio
          </BotonEnlace>
        </div>
      </Card>

      {!usuario && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[0.8125rem] text-ink-3">
          <Icon nombre="mail" className="h-3.5 w-3.5" />
          Revisa tu correo: allí enviamos el enlace para volver a esta reserva.
        </p>
      )}
    </div>
  )
}
