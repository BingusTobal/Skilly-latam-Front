import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { obtenerServicio } from '../../api/catalogo'
import { crearReserva } from '../../api/reservas'
import Alerta from '../../components/Alerta'
import { useAuth } from '../../context/AuthContext'
import { formatearCLP, formatearFecha, formatearHora } from '../../lib/formato'

const claseCampo =
  'w-full border border-gray-300 px-3 py-2 text-[13px] focus:border-black focus:outline-none'

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
    if (usuario) {
      setForm((actual) => ({
        ...actual,
        email: actual.email || usuario.email || '',
        nombre:
          actual.nombre ||
          `${usuario.first_name || ''} ${usuario.last_name || ''}`.trim(),
      }))
    }
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
      const query = reserva.token ? `?token=${reserva.token}` : ''
      navigate(`/reserva/${reserva.id}${query}`, { replace: true })
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  if (!fecha || !hora) {
    return (
      <div className="py-10 text-center">
        <Alerta>Elige una fecha y hora antes de continuar.</Alerta>
        <Link
          to={`/servicios/${id}/programar`}
          className="mt-4 inline-block text-[13px] underline"
        >
          Ver disponibilidad
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-5">
      <Link
        to={`/servicios/${id}/programar`}
        className="text-[13px] text-gray-600 no-underline"
      >
        &larr; Cambiar fecha y hora
      </Link>

      <h1 className="mt-3 text-[20px] font-bold">Completa tu reserva</h1>
      <p className="mb-5 text-[12.5px] text-gray-500">
        Reserva sin crear cuenta. Solo necesitamos tus datos de contacto para
        coordinar el servicio.
      </p>

      <div className="flex flex-col gap-8 md:flex-row">
        <form onSubmit={enviar} className="flex-1 space-y-4">
          {error && <Alerta>{error}</Alerta>}

          <div>
            <label className="mb-1 block text-[12px] font-bold">
              Nombre de contacto *
            </label>
            <input
              required
              className={claseCampo}
              value={form.nombre}
              onChange={(e) => actualizar('nombre', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12px] font-bold">Email *</label>
              <input
                required
                type="email"
                className={claseCampo}
                value={form.email}
                onChange={(e) => actualizar('email', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-bold">Teléfono</label>
              <input
                className={claseCampo}
                value={form.telefono}
                onChange={(e) => actualizar('telefono', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12px] font-bold">Empresa</label>
              <input
                className={claseCampo}
                value={form.empresa}
                onChange={(e) => actualizar('empresa', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-bold">RUT</label>
              <input
                className={claseCampo}
                placeholder="12.345.678-9"
                value={form.rut}
                onChange={(e) => actualizar('rut', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-bold">
              Mensaje para el profesional
            </label>
            <textarea
              rows={4}
              className={claseCampo}
              value={form.mensaje}
              onChange={(e) => actualizar('mensaje', e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={enviando || (!usuario && !acepto)}
            className="w-full border border-black bg-black py-3 text-[13px] text-white disabled:opacity-60"
          >
            {enviando ? 'Enviando…' : 'Solicitar reserva'}
          </button>

          {!usuario && (
            <>
              <label className="flex items-start gap-2 text-[12px] text-gray-600">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5"
                  checked={acepto}
                  onChange={(e) => setAcepto(e.target.checked)}
                />
                <span>
                  Acepto que Skilly cree una cuenta con mi correo para gestionar
                  esta reserva.
                </span>
              </label>
              <p className="text-center text-[11px] text-gray-500">
                Te enviaremos un correo para que crees tu contraseña y puedas
                activar la cuenta. ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  state={{ desde: `/servicios/${id}/reservar?fecha=${fecha}&hora=${hora}` }}
                  className="underline"
                >
                  Inicia sesión
                </Link>{' '}
                para autocompletar tus datos.
              </p>
            </>
          )}
        </form>

        <aside className="w-full shrink-0 md:w-72">
          <div className="border border-black p-4">
            <strong className="text-[13px]">Resumen</strong>
            <div className="mt-3 space-y-1.5 text-[12px]">
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Servicio</span>
                <span className="text-right">{servicio?.titulo || '…'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Fecha</span>
                <span>{formatearFecha(fecha)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Hora</span>
                <span>{formatearHora(hora)}</span>
              </div>
              <div className="flex justify-between py-1 text-[13px] font-bold">
                <span>Total</span>
                <span className="text-brand-red">
                  {servicio ? formatearCLP(servicio.precio) : '…'}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
