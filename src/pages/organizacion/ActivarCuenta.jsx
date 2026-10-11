import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { confirmarReset } from '../../api/auth'
import Alerta from '../../components/Alerta'

const claseInput = 'w-full border border-gray-400 px-3 py-2 text-[13px] outline-none'
const claseBoton = 'w-full bg-black py-2.5 text-[13px] text-white disabled:opacity-60'

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
    <div className="mx-auto max-w-md pt-8">
      <h1 className="text-[20px] font-bold">Activa tu cuenta</h1>
      <p className="mb-5 text-[12px] text-gray-500">
        Crea tu contraseña para activar la cuenta con la que gestionarás tus
        reservas.
      </p>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label className="mb-1 block text-[12px] text-gray-600">Contraseña</label>
          <input
            type="password"
            required
            className={claseInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] text-gray-600">Repetir contraseña</label>
          <input
            type="password"
            required
            className={claseInput}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>
        <button type="submit" disabled={enviando} className={claseBoton}>
          {enviando ? 'Activando…' : 'Crear contraseña y activar'}
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] text-gray-500">
        <Link to="/login" className="underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  )
}
