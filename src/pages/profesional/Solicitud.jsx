import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import {
  aceptarReserva,
  marcarEntregado,
  obtenerReserva,
  rechazarReserva,
} from '../../api/reservas'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import StatusBadge from '../../components/StatusBadge'
import {
  Boton,
  BotonEnlace,
  Campo,
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  Skeleton,
  Textarea,
} from '../../components/ui'
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
  const horas = Math.floor(restante / 3600000)
  const minutos = Math.floor((restante % 3600000) / 60000)
  const segundos = Math.floor((restante % 60000) / 1000)
  return {
    expirado: restante <= 0,
    texto:
      restante === 0
        ? '0:00'
        : restante >= 3600000
          ? `${horas}h ${String(minutos).padStart(2, '0')}m`
          : `${String(Math.floor(restante / 60000)).padStart(2, '0')}:${String(
              segundos,
            ).padStart(2, '0')}`,
    restante,
  }
}

function Fila({ etiqueta, children }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-2.5 last:border-0">
      <dt className="text-[0.8125rem] text-ink-3">{etiqueta}</dt>
      <dd className="text-right text-[0.875rem] font-semibold text-ink">
        {children}
      </dd>
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
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-[20px] lg:col-span-2" />
          <Skeleton className="h-72 rounded-[20px]" />
        </div>
      </div>
    )
  }

  if (!solicitud) {
    return (
      <div className="py-10">
        <Alerta>{error || 'No encontramos esta solicitud.'}</Alerta>
        <BotonEnlace
          to="/profesional/solicitudes"
          variante="secundario"
          className="mt-4"
        >
          <Icon nombre="arrow-left" className="h-4 w-4" />
          Volver a solicitudes
        </BotonEnlace>
      </div>
    )
  }

  const estado = solicitud.estado
  const esPendiente = estado === 'pendiente_aceptacion'

  return (
    <div>
      <PageHeader
        etiqueta="Panel profesional"
        titulo={`Solicitud #${solicitud.id}`}
        descripcion={solicitud.servicio.titulo}
        migas={[
          { texto: 'Solicitudes', to: '/profesional/solicitudes' },
          { texto: `Solicitud #${solicitud.id}` },
        ]}
        acciones={<StatusBadge estado={estado} mapa={ESTADOS_RESERVA} />}
      />

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
          className={`mb-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-[0.8125rem] leading-relaxed ${
            cuenta.restante > 0
              ? 'border-warn/25 bg-warn-soft text-warn'
              : 'border-danger/20 bg-danger-soft text-danger'
          }`}
          role="status"
        >
          <Icon
            nombre={cuenta.restante > 0 ? 'clock' : 'alert-circle'}
            className="h-4 w-4 shrink-0"
            strokeWidth={2}
          />
          <span className="flex-1">
            {cuenta.restante > 0
              ? `Responde dentro de ${Math.max(
                  1,
                  Math.floor(cuenta.restante / 60000),
                )} min o la solicitud se liberará.`
              : 'El plazo de respuesta venció.'}
          </span>
          <span className="rounded-full bg-white/70 px-2.5 py-1 text-[0.75rem] font-extrabold tabular-nums">
            {cuenta.texto}
          </span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <h2 className="text-[0.9375rem] font-bold text-ink">
                  Detalle de la reserva
                </h2>
                <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                  {formatearFecha(solicitud.fecha)} ·{' '}
                  {formatearHora(solicitud.hora_inicio)}–
                  {formatearHora(solicitud.hora_fin)}
                </p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-mint-soft text-brand-mint-deep">
                <Icon nombre="calendar" className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardBody>
              <dl>
                <Fila etiqueta="Organización">
                  {solicitud.organizacion_nombre || solicitud.contacto_nombre}
                </Fila>
                <Fila etiqueta="Contacto">{solicitud.contacto_nombre}</Fila>
                <Fila etiqueta="Email">{solicitud.contacto_email}</Fila>
                {solicitud.contacto_telefono && (
                  <Fila etiqueta="Teléfono">{solicitud.contacto_telefono}</Fila>
                )}
                <Fila etiqueta="Modalidad">{FORMATOS[solicitud.formato]}</Fila>
                {solicitud.ubicacion && (
                  <Fila etiqueta="Ubicación">{solicitud.ubicacion}</Fila>
                )}
              </dl>
            </CardBody>
          </Card>

          {solicitud.mensaje && (
            <Card>
              <CardBody>
                <p className="mb-1 flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-ink-3">
                  <Icon nombre="message" className="h-4 w-4" />
                  Mensaje de la organización
                </p>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-2">
                  {solicitud.mensaje}
                </p>
              </CardBody>
            </Card>
          )}

          {rechazando && (
            <Card>
              <CardHeader>
                <h2 className="text-[0.9375rem] font-bold text-ink">
                  Motivo del rechazo
                </h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <Campo
                  etiqueta="Cuéntale a la organización por qué no puedes tomar el servicio"
                  htmlFor="motivo"
                >
                  <Textarea
                    id="motivo"
                    rows={3}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ej: No tengo disponibilidad para esa fecha."
                  />
                </Campo>
                <div className="flex flex-wrap gap-3">
                  <Boton
                    variante="peligro"
                    cargando={procesando}
                    onClick={() =>
                      ejecutar(
                        () => rechazarReserva(solicitud.id, motivo),
                        'Solicitud rechazada.',
                      )
                    }
                  >
                    Confirmar rechazo
                  </Boton>
                  <Boton variante="fantasma" onClick={() => setRechazando(false)}>
                    Cancelar
                  </Boton>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="bg-brand-mint-soft">
            <CardBody>
              <p className="text-[0.75rem] font-semibold text-brand-mint-deep">
                Recibirás
              </p>
              <p className="mt-1 text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-ink">
                {formatearCLP(solicitud.monto_neto)}
              </p>
              <p className="mt-1.5 text-[0.6875rem] text-ink-3">
                Monto neto tras la comisión de Skilly.
              </p>
            </CardBody>
          </Card>

          {(esPendiente || estado === 'en_curso') && !rechazando && (
            <div className="flex flex-col gap-2.5">
              {esPendiente && (
                <>
                  <Boton
                    className="w-full"
                    cargando={procesando}
                    onClick={() =>
                      ejecutar(
                        () => aceptarReserva(solicitud.id),
                        'Solicitud aceptada.',
                      )
                    }
                  >
                    Aceptar solicitud
                  </Boton>
                  <Boton
                    variante="secundario"
                    className="w-full"
                    disabled={procesando}
                    onClick={() => setRechazando(true)}
                  >
                    Rechazar
                  </Boton>
                </>
              )}
              {estado === 'en_curso' && (
                <Boton
                  className="w-full"
                  cargando={procesando}
                  onClick={() =>
                    ejecutar(
                      () => marcarEntregado(solicitud.id),
                      'Marcaste el servicio como entregado. La organización debe confirmar.',
                    )
                  }
                >
                  <Icon nombre="check" className="h-4 w-4" />
                  Marcar como entregado
                </Boton>
              )}
            </div>
          )}

          {estado === 'finalizada' && (
            <Alerta tipo="exito">Servicio entregado y confirmado por la organización.</Alerta>
          )}
        </aside>
      </div>
    </div>
  )
}
