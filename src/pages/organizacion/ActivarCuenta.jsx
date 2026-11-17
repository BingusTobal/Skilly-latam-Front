import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { confirmarReset } from '../../api/auth'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import { Boton, Campo, Card, Input } from '../../components/ui'

export default function ActivarCuenta() {
  const { uid, token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function enviar(evento) {
    evento.preventDefault()
    setError('')
    if (password !== password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setEnviando(true)
    try {
      await confirmarReset({ uid, token, password })
      navigate('/login', {
        replace: true,
        state: { mensaje: 'Cuenta activada. Ya puedes iniciar sesión.' },
      })
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
          <Icon nombre="lock" className="h-6 w-6" />
        </span>
        <h1 className="text-[1.5rem] font-extrabold tracking-[-0.02em] text-ink">
          Activa tu cuenta
        </h1>
        <p className="mt-2 mb-5 text-[0.875rem] leading-relaxed text-ink-3">
          Crea tu contraseña para activar la cuenta con la que gestionarás tus
          reservas.
        </p>

        {error && (
          <div className="mb-4">
            <Alerta>{error}</Alerta>
          </div>
        )}

        <form onSubmit={enviar} className="space-y-4">
          <Campo etiqueta="Contraseña" htmlFor="activar-password" requerido>
            <Input
              id="activar-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Campo>
          <Campo etiqueta="Repetir contraseña" htmlFor="activar-password2" requerido>
            <Input
              id="activar-password2"
              type="password"
              required
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </Campo>
          <Boton type="submit" tamano="lg" className="w-full" cargando={enviando}>
            {enviando ? 'Activando…' : 'Crear contraseña y activar'}
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
