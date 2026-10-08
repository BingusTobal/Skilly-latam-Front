import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import { useAuth } from '../../context/AuthContext'

function destinoPorTipo(tipo) {
  if (tipo === 'profesional') return '/profesional/servicios'
  if (tipo === 'admin') return '/admin/servicios'
  return '/catalogo'
}

export default function LoginRegistro() {
  const { iniciarSesion, registrarse } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const [login, setLogin] = useState({ email: '', password: '' })
  const [registro, setRegistro] = useState({
    nombre: '',
    rut: '',
    nombre_contacto: '',
    email_contacto: '',
    telefono: '',
    password: '',
    password2: '',
  })

  async function enviarLogin(evento) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const usuario = await iniciarSesion(login.email, login.password)
      navigate(location.state?.desde || destinoPorTipo(usuario.tipo), { replace: true })
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  async function enviarRegistro(evento) {
    evento.preventDefault()
    setError('')
    if (registro.password !== registro.password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setEnviando(true)
    try {
      const usuario = await registrarse({
        nombre: registro.nombre,
        rut: registro.rut,
        nombre_contacto: registro.nombre_contacto,
        email_contacto: registro.email_contacto,
        telefono: registro.telefono,
        password: registro.password,
      })
      navigate(destinoPorTipo(usuario.tipo), { replace: true })
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  const claseInput = 'w-full border border-gray-400 px-3 py-2 text-[13px] outline-none'
  const claseBoton =
    'w-full bg-black py-2.5 text-[13px] text-white disabled:opacity-60'

  return (
    <div className="mx-auto max-w-lg pt-8">
      <h1 className="text-[20px] font-bold">Inicia sesión o crea tu cuenta</h1>
      <p className="mb-5 text-[12px] text-gray-500">
        Necesitas una cuenta para publicar servicios o gestionar tus reservas.
      </p>

      <div className="mb-6 flex border-b border-line">
        {[
          ['login', 'Iniciar sesión'],
          ['registro', 'Crear cuenta'],
        ].map(([clave, etiqueta]) => (
          <button
            key={clave}
            type="button"
            onClick={() => {
              setTab(clave)
              setError('')
            }}
            className={`border-b-2 px-4 py-2.5 text-[13px] ${
              tab === clave
                ? 'border-black font-bold text-black'
                : 'border-transparent text-gray-400'
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      {tab === 'login' ? (
        <form onSubmit={enviarLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-[12px] text-gray-600">Correo</label>
            <input
              type="email"
              required
              className={claseInput}
              placeholder="nombre@empresa.cl"
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-gray-600">Contraseña</label>
            <input
              type="password"
              required
              className={claseInput}
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={enviando} className={claseBoton}>
            {enviando ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
      ) : (
        <form onSubmit={enviarRegistro} className="space-y-4">
          <div>
            <label className="mb-1 block text-[12px] text-gray-600">
              Nombre de la organización
            </label>
            <input
              required
              className={claseInput}
              value={registro.nombre}
              onChange={(e) => setRegistro({ ...registro, nombre: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] text-gray-600">RUT</label>
              <input
                required
                className={claseInput}
                placeholder="76.XXX.XXX-X"
                value={registro.rut}
                onChange={(e) => setRegistro({ ...registro, rut: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] text-gray-600">Contacto</label>
              <input
                required
                className={claseInput}
                value={registro.nombre_contacto}
                onChange={(e) =>
                  setRegistro({ ...registro, nombre_contacto: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] text-gray-600">Correo</label>
              <input
                type="email"
                required
                className={claseInput}
                value={registro.email_contacto}
                onChange={(e) =>
                  setRegistro({ ...registro, email_contacto: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] text-gray-600">Teléfono</label>
              <input
                className={claseInput}
                value={registro.telefono}
                onChange={(e) => setRegistro({ ...registro, telefono: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] text-gray-600">Contraseña</label>
              <input
                type="password"
                required
                className={claseInput}
                value={registro.password}
                onChange={(e) => setRegistro({ ...registro, password: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] text-gray-600">Repetir</label>
              <input
                type="password"
                required
                className={claseInput}
                value={registro.password2}
                onChange={(e) => setRegistro({ ...registro, password2: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" disabled={enviando} className={claseBoton}>
            {enviando ? 'Creando…' : 'Crear cuenta'}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-[11px] text-gray-500">
        ¿Solo quieres mirar?{' '}
        <Link to="/catalogo" className="underline">
          Volver al catálogo sin iniciar sesión
        </Link>
      </p>
    </div>
  )
}