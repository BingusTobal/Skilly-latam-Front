import { useState } from 'react'
import { Link } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { solicitarReset } from '../../api/auth'
import Alerta from '../../components/Alerta'

const claseInput = 'w-full border border-gray-400 px-3 py-2 text-[13px] outline-none'
const claseBoton = 'w-full bg-black py-2.5 text-[13px] text-white disabled:opacity-60'

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
    <div className="mx-auto max-w-md pt-8">
      <h1 className="text-[20px] font-bold">Recupera tu contraseña</h1>
      <p className="mb-5 text-[12px] text-gray-500">
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
        <div>
          <label className="mb-1 block text-[12px] text-gray-600">Correo</label>
          <input
            type="email"
            required
            className={claseInput}
            placeholder="nombre@empresa.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" disabled={enviando} className={claseBoton}>
          {enviando ? 'Enviando…' : 'Enviar enlace'}
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
