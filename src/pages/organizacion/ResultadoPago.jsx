import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { estadoPago } from '../../api/pagos'
import Alerta from '../../components/Alerta'
import { useAuth } from '../../context/AuthContext'

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
      return
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

  if (cargando) {
    return <p className="p-8 text-center text-sm text-gray-500">Consultando el pago…</p>
  }

  const estadoInterno = pago?.estado || ''
  const aprobado = ESTADOS_PAGO_OK.has(estadoInterno) || resultadoUrl === 'ok'
  const titulo = error
    ? 'No pudimos consultar el pago'
    : aprobado
      ? 'Pago aprobado'
      : TITULOS[resultadoUrl] || 'Pago no completado'

  return (
    <div className="mx-auto max-w-xl py-10">
      <div className="border border-line p-6">
        <h1 className="text-[20px] font-bold">{titulo}</h1>

        {aprobado && (
          <p className="mt-2 text-[13px] text-gray-600">
            Tu pago quedó retenido en custodia. El profesional ahora puede aceptar
            la reserva; si no lo hace dentro del plazo, se libera automáticamente.
          </p>
        )}

        {!aprobado && !error && (
          <p className="mt-2 text-[13px] text-gray-600">
            El pago no fue autorizado o fue cancelado. La reserva no se envió al
            profesional y puedes intentarlo nuevamente desde el detalle.
          </p>
        )}

        {error && (
          <div className="mt-4">
            <Alerta>{error}</Alerta>
          </div>
        )}

        {pago && (
          <dl className="mt-4 divide-y divide-gray-100 text-[12.5px]">
            <div className="flex justify-between py-2">
              <dt className="text-gray-500">Referencia</dt>
              <dd className="font-mono">{pago.referencia_publica}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-gray-500">Estado del pago</dt>
              <dd>{pago.estado}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-gray-500">Estado de la reserva</dt>
              <dd>{pago.reserva_estado}</dd>
            </div>
          </dl>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {usuario ? (
            <Link
              to="/mis-reservas"
              className="border border-black bg-black px-5 py-2.5 text-[13px] text-white no-underline"
            >
              Ver mis reservas
            </Link>
          ) : (
            <Link
              to="/catalogo"
              className="border border-black bg-black px-5 py-2.5 text-[13px] text-white no-underline"
            >
              Volver al catálogo
            </Link>
          )}
          <Link
            to="/"
            className="border border-black px-5 py-2.5 text-[13px] no-underline"
          >
            Ir al inicio
          </Link>
        </div>

        {!usuario && (
          <p className="mt-4 text-[11.5px] text-gray-500">
            Revisa tu correo: allí enviamos el enlace para volver a esta reserva.
          </p>
        )}
      </div>
    </div>
  )
}
