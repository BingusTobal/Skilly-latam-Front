import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { obtenerServicio } from '../../api/catalogo'
import { iniciarPago } from '../../api/pagos'
import { crearReserva } from '../../api/reservas'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import {
  Boton,
  BotonEnlace,
  Campo,
  Card,
  Input,
  Migas,
  Precio,
  Stepper,
  Textarea,
} from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { formatearFecha, formatearHora } from '../../lib/formato'
import { irAWebpay } from '../../lib/webpay'

// Formulario reserva: crea la reserva con datos de contacto, sin exigir cuenta.
export default function FormularioReserva() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const fecha = searchParams.get('fecha') || ''
  const hora = searchParams.get('hora') || ''

  const [servicio, setServicio] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [acepto, setAcepto] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    rut: '',
    mensaje: '',
  })

  useEffect(() => {
    obtenerServicio(id).then(setServicio).catch(() => {})
  }, [id])

  useEffect(() => {
    if (!usuario) return

    const organizacion = usuario.organizacion
    const nombreContacto =
      organizacion?.nombre_contacto ||
      `${usuario.first_name || ''} ${usuario.last_name || ''}`.trim()

    setForm((actual) => ({
      ...actual,
      nombre: actual.nombre || nombreContacto,
      email: actual.email || organizacion?.email_contacto || usuario.email || '',
      telefono: actual.telefono || organizacion?.telefono || '',
      empresa: actual.empresa || organizacion?.nombre || '',
      rut: actual.rut || organizacion?.rut || '',
    }))
  }, [usuario])

  function actualizar(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const reserva = await crearReserva({
        servicio: Number(id),
        fecha,
        hora_inicio: hora,
        ...form,
      })

      let errorPago = ''
      try {
        const pago = await iniciarPago(reserva.id, reserva.token)
        if (irAWebpay(pago)) {
          return
        }
        errorPago = 'Transbank no devolvió la URL de pago. Intenta desde el detalle.'
      } catch (err) {
        errorPago = mensajeDeError(err)
      }

      const query = reserva.token ? `?token=${reserva.token}` : ''
      navigate(`/reserva/${reserva.id}${query}`, {
        replace: true,
        state: errorPago ? { errorPago } : undefined,
      })
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  if (!fecha || !hora) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <Alerta>Elige una fecha y hora antes de continuar.</Alerta>
        <BotonEnlace
          to={`/servicios/${id}/programar`}
          variante="secundario"
          className="mt-5"
        >
          Ver disponibilidad
        </BotonEnlace>
      </div>
    )
  }

  return (
    <div>
      <Migas
        className="mb-4"
        items={[
          { texto: 'Catálogo', to: '/catalogo' },
          { texto: servicio?.titulo || 'Servicio', to: `/servicios/${id}` },
          { texto: 'Reserva' },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[2.125rem]">
          Completa tu reserva
        </h1>
        <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-3">
          {usuario?.organizacion
            ? 'Usamos los datos de tu organización registrada. Puedes ajustarlos si es necesario.'
            : 'Reserva sin crear cuenta. Solo necesitamos tus datos de contacto para coordinar el servicio.'}
        </p>
      </div>

      <Stepper
        className="mb-7"
        actual={1}
        pasos={[
          { etiqueta: 'Fecha y hora' },
          { etiqueta: 'Datos de contacto' },
          { etiqueta: 'Pago seguro' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={enviar} className="min-w-0 space-y-5">
          {error && <Alerta>{error}</Alerta>}

          <Card className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-[1.0625rem] font-bold text-ink">
              <Icon nombre="users" className="h-4 w-4 text-brand-blue" />
              Datos de contacto
            </h2>

            <div className="space-y-4">
              <Campo etiqueta="Nombre de contacto" htmlFor="nombre" requerido>
                <Input
                  id="nombre"
                  required
                  value={form.nombre}
                  onChange={(e) => actualizar('nombre', e.target.value)}
                />
              </Campo>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo etiqueta="Email" htmlFor="email" requerido>
                  <Input
                    id="email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => actualizar('email', e.target.value)}
                  />
                </Campo>
                <Campo etiqueta="Teléfono" htmlFor="telefono">
                  <Input
                    id="telefono"
                    value={form.telefono}
                    onChange={(e) => actualizar('telefono', e.target.value)}
                  />
                </Campo>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo etiqueta="Empresa" htmlFor="empresa">
                  <Input
                    id="empresa"
                    value={form.empresa}
                    onChange={(e) => actualizar('empresa', e.target.value)}
                  />
                </Campo>
                <Campo etiqueta="RUT" htmlFor="rut">
                  <Input
                    id="rut"
                    placeholder="12.345.678-9"
                    value={form.rut}
                    onChange={(e) => actualizar('rut', e.target.value)}
                  />
                </Campo>
              </div>

              <Campo
                etiqueta="Mensaje para el profesional"
                htmlFor="mensaje"
                ayuda="Cuéntale el contexto del servicio para que llegue preparado."
              >
                <Textarea
                  id="mensaje"
                  rows={4}
                  value={form.mensaje}
                  onChange={(e) => actualizar('mensaje', e.target.value)}
                />
              </Campo>
            </div>
          </Card>

          {!usuario && (
            <Card className="p-5 sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 text-[1.0625rem] font-bold text-ink">
                <Icon nombre="user-check" className="h-4 w-4 text-brand-blue" />
                Gestiona tu reserva
              </h2>
              <label className="flex items-start gap-2.5 rounded-xl bg-canvas p-3.5 text-[0.8125rem] leading-relaxed text-ink-2">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-line accent-brand-blue"
                  checked={acepto}
                  onChange={(e) => setAcepto(e.target.checked)}
                />
                <span>
                  Acepto que Skilly cree una cuenta con mi correo para gestionar esta
                  reserva.
                </span>
              </label>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-3">
                Te enviaremos un correo para que crees tu contraseña y puedas activar
                la cuenta. ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  state={{ desde: `/servicios/${id}/reservar?fecha=${fecha}&hora=${hora}` }}
                  className="font-semibold text-brand-blue-deep underline-offset-2 hover:underline"
                >
                  Inicia sesión
                </Link>{' '}
                para autocompletar tus datos.
              </p>
            </Card>
          )}

          <div className="lg:hidden">
            <ResumenServicio
              servicio={servicio}
              fecha={fecha}
              hora={hora}
            />
          </div>

          <Boton
            type="submit"
            tamano="lg"
            className="w-full"
            cargando={enviando}
            disabled={!usuario && !acepto}
          >
            {enviando ? 'Preparando el pago…' : 'Reservar y pagar'}
            {!enviando && <Icon nombre="arrow-right" className="h-4 w-4" />}
          </Boton>

          <p className="flex items-center justify-center gap-1.5 text-center text-[0.75rem] text-ink-3">
            <Icon nombre="lock" className="h-3.5 w-3.5" />
            Pago protegido con Webpay. El monto queda retenido hasta la entrega.
          </p>
        </form>

        <aside className="hidden w-full lg:block lg:w-[320px]">
          <div className="lg:sticky lg:top-24">
            <ResumenServicio servicio={servicio} fecha={fecha} hora={hora} />
          </div>
        </aside>
      </div>
    </div>
  )
}

function ResumenServicio({ servicio, fecha, hora }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-[0.9375rem] font-bold text-ink">Resumen</h2>
      </div>
      <dl className="space-y-2.5 px-5 py-4 text-[0.875rem]">
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-ink-3">Servicio</dt>
          <dd className="text-right font-semibold text-ink">
            {servicio?.titulo || '…'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink-3">Fecha</dt>
          <dd className="font-semibold text-ink">{formatearFecha(fecha)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink-3">Hora</dt>
          <dd className="font-semibold text-ink">{formatearHora(hora)}</dd>
        </div>
      </dl>
      <div className="border-t border-dashed border-line px-5 py-4">
        <div className="flex items-end justify-between gap-3">
          <span className="text-[0.875rem] font-semibold text-ink-2">Total</span>
          {servicio ? (
            <Precio valor={servicio.precio} nota="" tamano="sm" className="text-right" />
          ) : (
            <span className="text-[0.875rem] text-ink-3">…</span>
          )}
        </div>
      </div>
      <div className="space-y-2 border-t border-line px-5 py-4 text-[0.75rem] leading-relaxed text-ink-3">
        <p className="flex items-start gap-2">
          <Icon nombre="shield" className="mt-0.5 h-4 w-4 shrink-0 text-brand-mint-deep" />
          Al continuar serás redirigido a Webpay. El monto queda retenido hasta que
          confirmes la entrega.
        </p>
        <p className="flex items-start gap-2">
          <Icon nombre="message" className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
          Tras la reserva podrás coordinar directamente con el profesional.
        </p>
      </div>
    </Card>
  )
}
