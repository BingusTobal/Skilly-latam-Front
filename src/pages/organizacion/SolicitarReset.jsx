import { useState } from 'react'
import { Link } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { solicitarReset } from '../../api/auth'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import { Boton, Campo, Card, Input } from '../../components/ui'

export default function SolicitarReset() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    setMensaje('')
    setEnviando(true)
    try {
      const data = await solicitarReset(email)
      setMensaje(data.detail)
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6 sm:p-8">
        <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand-blue-soft text-brand-blue">
          <Icon nombre="mail" className="h-6 w-6" />
        </span>
        <h1 className="text-[1.5rem] font-extrabold tracking-[-0.02em] text-ink">
          Recupera tu contraseña
        </h1>
        <p className="mt-2 mb-5 text-[0.875rem] leading-relaxed text-ink-3">
          Te enviaremos un enlace a tu correo para que crees una nueva.
        </p>

        {error && (
          <div className="mb-4">
            <Alerta>{error}</Alerta>
          </div>
        )}
        {mensaje && (
          <div className="mb-4">
            <Alerta tipo="exito">{mensaje}</Alerta>
          </div>
        )}

        <form onSubmit={enviar} className="space-y-4">
          <Campo etiqueta="Correo" htmlFor="reset-email" requerido>
            <Input
              id="reset-email"
              type="email"
              required
              placeholder="nombre@empresa.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Campo>
          <Boton type="submit" tamano="lg" className="w-full" cargando={enviando}>
            {enviando ? 'Enviando…' : 'Enviar enlace'}
          </Boton>
        </form>

        <p className="mt-5 text-center text-[0.8125rem]">
          <Link
            to="/login"
            className="font-semibold text-brand-blue-deep underline-offset-2 hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </p>
      </Card>
    </div>
  )
}
