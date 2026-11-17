import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { abrirDisputa } from '../../api/disputas'
import { iniciarPago } from '../../api/pagos'
import { cancelarReserva, obtenerReserva } from '../../api/reservas'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import StatusBadge from '../../components/StatusBadge'
import {
  Boton,
  BotonEnlace,
  Campo,
  Card,
  Cargando,
  Input,
  Migas,
  Precio,
  Textarea,
} from '../../components/ui'
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
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="shrink-0 text-[0.8125rem] text-ink-3">{etiqueta}</span>
      <span className="text-right text-[0.875rem] font-semibold text-ink">
        {children}
      </span>
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

  if (cargando) return <Cargando>Consultando la reserva…</Cargando>

  if (!reserva) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <Alerta>{error || 'No encontramos esta reserva.'}</Alerta>
        <BotonEnlace to="/catalogo" variante="secundario" className="mt-5">
          Volver al catálogo
        </BotonEnlace>
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
    <div className="mx-auto max-w-3xl">
      <Migas
        className="mb-4"
        items={[
          { texto: conSesion ? 'Mis reservas' : 'Catálogo', to: conSesion ? '/mis-reservas' : '/catalogo' },
          { texto: `Reserva #${reserva.id}` },
        ]}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.75rem] font-extrabold tracking-[-0.03em] text-ink">
            Reserva #{reserva.id}
          </h1>
          <p className="mt-1 text-[0.8125rem] text-ink-3">
            Creada para el {formatearFecha(reserva.fecha)} a las {formatearHora(reserva.hora_inicio)}
          </p>
        </div>
        <StatusBadge estado={estado} mapa={ESTADOS_RESERVA} />
      </div>

      <div className="mb-4 space-y-3">
        {aviso && <Alerta tipo="exito">{aviso}</Alerta>}
        {error && <Alerta>{error}</Alerta>}
        {estado === 'finalizada' && (
          <Alerta tipo="exito" titulo="Servicio entregado y confirmado">
            El pago fue liberado al profesional. ¡Gracias por usar Skilly!
          </Alerta>
        )}
        {estado === 'pendiente_pago' && (
          <Alerta tipo="advertencia" titulo="Falta completar el pago">
            Tu reserva está creada, pero todavía no fue enviada al profesional.
            Complétala para bloquear el horario.
          </Alerta>
        )}
        {token && ['pendiente_pago', 'pendiente_aceptacion'].includes(estado) && (
          <Alerta tipo="info" titulo="Guarda este enlace">
            Te enviamos un correo con el enlace para gestionar y seguir esta reserva.
            Puedes volver a esta página con el mismo enlace.
          </Alerta>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <Link
            to={`/servicios/${reserva.servicio.id}`}
            className="text-[1.0625rem] font-bold text-ink no-underline transition hover:text-brand-blue"
          >
            {reserva.servicio.titulo}
          </Link>
          <p className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-ink-3">
            <Icon nombre="calendar" className="h-3.5 w-3.5" />
            {formatearFecha(reserva.fecha)} · {formatearHora(reserva.hora_inicio)}–
            {formatearHora(reserva.hora_fin)}
          </p>
        </div>

        <dl className="divide-y divide-line px-5 text-[0.875rem] sm:px-6">
          <Fila etiqueta="Modalidad">{FORMATOS[reserva.formato]}</Fila>
          {reserva.ubicacion && <Fila etiqueta="Ubicación">{reserva.ubicacion}</Fila>}
          <Fila etiqueta="Profesional">{reserva.profesional_nombre || 'Por asignar'}</Fila>
          {reserva.profesional_email && (
            <Fila etiqueta="Contacto">{reserva.profesional_email}</Fila>
          )}
          {reserva.profesional_telefono && (
            <Fila etiqueta="Teléfono">{reserva.profesional_telefono}</Fila>
          )}
          <div className="flex items-end justify-between gap-4 py-4">
            <span className="text-[0.875rem] font-semibold text-ink-2">Total</span>
            <Precio valor={reserva.precio_acordado} nota="" tamano="sm" className="text-right" />
          </div>
        </dl>

        {mostrandoAcciones && (
          <div className="flex flex-wrap gap-3 border-t border-line px-5 py-4 sm:px-6">
            {puedePagar && (
              <Boton onClick={pagar} cargando={procesando}>
                {procesando ? 'Abriendo Webpay…' : 'Pagar ahora con Webpay'}
                {!procesando && <Icon nombre="credit-card" className="h-4 w-4" />}
              </Boton>
            )}
            {puedeConfirmar && (
              <BotonEnlace to={`/reserva/${reserva.id}/confirmar`}>
                Confirmar entrega
              </BotonEnlace>
            )}
            {puedeCancelar && (
              <Boton
                variante="secundario"
                disabled={procesando}
                onClick={() =>
                  ejecutar(
                    () => cancelarReserva(reserva.id, 'Cancelada por la organización'),
                    'Reserva cancelada.',
                  )
                }
              >
                Cancelar reserva
              </Boton>
            )}
            {puedeReportar && (
              <Boton variante="peligro" onClick={() => setFormDisputa(true)}>
                <Icon nombre="alert-triangle" className="h-4 w-4" />
                Reportar un problema
              </Boton>
            )}
          </div>
        )}
      </Card>

      {reserva.mensaje && (
        <Card className="mt-4 px-5 py-4 sm:px-6">
          <p className="mb-1 flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-ink-3">
            <Icon nombre="message" className="h-3.5 w-3.5" />
            Tu mensaje
          </p>
          <p className="text-[0.875rem] leading-relaxed text-ink-2">{reserva.mensaje}</p>
        </Card>
      )}

      {estado === 'pendiente_aceptacion' && (
        <p className="mt-4 flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink-3">
          <Icon nombre="clock" className="mt-0.5 h-4 w-4 shrink-0" />
          El profesional tiene un plazo de 6 horas para responder. Si no lo hace, la
          reserva se libera automáticamente y no se te cobra.
        </p>
      )}

      {estado === 'cancelada' && reserva.motivo_cancelacion && (
        <p className="mt-4 text-[0.8125rem] text-ink-3">
          Motivo de cancelación: {reserva.motivo_cancelacion}
        </p>
      )}

      {requiereSesion && (
        <div className="mt-5">
          <Alerta tipo="advertencia" titulo="Necesitas iniciar sesión">
            Para confirmar la entrega, cancelar o reportar un problema necesitas{' '}
            <Link
              to="/login"
              state={{ desde: `/reserva/${reserva.id}${token ? `?token=${token}` : ''}` }}
              className="font-bold underline underline-offset-2"
            >
              iniciar sesión
            </Link>
            . Guardamos tu enlace de seguimiento.
          </Alerta>
        </div>
      )}

      {disputa && (
        <Card className="mt-4 overflow-hidden border-danger/25">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-danger/15 bg-danger-soft/60 px-5 py-3.5">
            <p className="flex items-center gap-2 text-[0.9375rem] font-bold text-danger">
              <Icon nombre="alert-triangle" className="h-4 w-4" />
              Disputa #{disputa.id}
            </p>
            <StatusBadge estado={disputa.estado} mapa={ESTADOS_DISPUTA} />
          </div>
          <div className="space-y-2 px-5 py-4 text-[0.875rem]">
            <p>
              <span className="font-bold text-ink">Motivo: </span>
              <span className="text-ink-2">{disputa.motivo}</span>
            </p>
            {disputa.descripcion && (
              <p className="leading-relaxed text-ink-2">{disputa.descripcion}</p>
            )}
            <p className="text-[0.75rem] text-ink-3">
              Abierta el {formatearFechaHora(disputa.creada_en)}
            </p>

            {disputa.evidencias?.length > 0 && (
              <div className="pt-2">
                <p className="mb-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-ink-3">
                  Evidencia
                </p>
                <ul className="space-y-1">
                  {disputa.evidencias.map((archivo) => (
                    <li key={archivo.id} className="text-[0.8125rem]">
                      {archivo.archivo ? (
                        <a
                          href={archivo.archivo}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-brand-blue-deep hover:underline"
                        >
                          {archivo.nombre || `Archivo ${archivo.id}`}
                          <Icon nombre="external" className="h-3 w-3" />
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
              <div className="mt-3 rounded-xl bg-canvas px-4 py-3">
                <p>
                  <span className="font-bold text-ink">Resultado: </span>
                  {RESULTADOS_DISPUTA[disputa.resultado]?.etiqueta || disputa.resultado}
                </p>
                {disputa.monto_reembolso && (
                  <p>
                    <span className="font-bold text-ink">Reembolso: </span>
                    {formatearCLP(disputa.monto_reembolso)}
                  </p>
                )}
                {disputa.resolucion && (
                  <p className="mt-1 leading-relaxed text-ink-2">{disputa.resolucion}</p>
                )}
                {disputa.resuelta_en && (
                  <p className="mt-1 text-[0.75rem] text-ink-3">
                    Resuelta el {formatearFechaHora(disputa.resuelta_en)}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {formDisputa && (
        <Card as="form" onSubmit={enviarDisputa} className="mt-4 p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2 text-[1.0625rem] font-bold text-ink">
            <Icon nombre="alert-triangle" className="h-4 w-4 text-danger" />
            Reportar un problema
          </p>
          <div className="space-y-4">
            <Campo etiqueta="Motivo" htmlFor="motivo" requerido>
              <Input
                id="motivo"
                value={motivoDisputa}
                onChange={(e) => setMotivoDisputa(e.target.value)}
                maxLength={200}
                required
                placeholder="Ej: Entrega incompleta"
              />
            </Campo>
            <Campo etiqueta="Descripción" htmlFor="descripcion">
              <Textarea
                id="descripcion"
                value={descripcionDisputa}
                onChange={(e) => setDescripcionDisputa(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Cuéntanos qué ocurrió con el servicio."
              />
            </Campo>
            <Campo
              etiqueta="Evidencia (opcional)"
              htmlFor="evidencia"
              ayuda="PDF, JPG o PNG de hasta 5 MB."
            >
              <input
                id="evidencia"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setEvidenciaDisputa(e.target.files?.[0] || null)}
                className="block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[0.8125rem] text-ink-2 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-blue-soft file:px-3 file:py-1.5 file:text-[0.8125rem] file:font-bold file:text-brand-blue-deep"
              />
            </Campo>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Boton type="submit" variante="peligro" cargando={enviandoDisputa}>
              {enviandoDisputa ? 'Enviando…' : 'Abrir disputa'}
            </Boton>
            <Boton variante="secundario" onClick={() => setFormDisputa(false)}>
              Cancelar
            </Boton>
          </div>
        </Card>
      )}
    </div>
  )
}
