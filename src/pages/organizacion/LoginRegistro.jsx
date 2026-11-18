import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import { Boton, Campo, Card, Input } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'

function destinoPorTipo(tipo) {
  if (tipo === 'profesional') return '/profesional/servicios'
  if (tipo === 'admin') return '/admin'
  return '/catalogo'
}

const TABS = [
  ['login', 'Iniciar sesión'],
  ['registro', 'Crear cuenta'],
]

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
        password_confirmacion: registro.password2,
      })
      navigate(destinoPorTipo(usuario.tipo), { replace: true })
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      <aside className="hidden lg:block">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-blue-soft px-3 py-1 text-[0.75rem] font-bold text-brand-blue-deep">
          <Icon nombre="shield" className="h-3.5 w-3.5" />
          Cuenta Skilly
        </span>
        <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.1] tracking-[-0.035em] text-ink">
          Tu organización, servicios y pagos en un solo lugar.
        </h1>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-3">
          Necesitas una cuenta para publicar servicios o gestionar tus reservas. Si
          solo quieres reservar, puedes hacerlo sin crear una.
        </p>
        <ul className="mt-6 space-y-3">
          {[
            ['shield', 'Pago en custodia hasta confirmar la entrega'],
            ['users', 'Profesionales revisados por el equipo Skilly'],
            ['message', 'Coordinación directa después de reservar'],
          ].map(([icono, texto]) => (
            <li
              key={texto}
              className="flex items-center gap-3 text-[0.875rem] font-semibold text-ink-2"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-brand-blue shadow-card">
                <Icon nombre={icono} className="h-4 w-4" />
              </span>
              {texto}
            </li>
          ))}
        </ul>
      </aside>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 pt-5 sm:px-6">
          <h2 className="text-[1.25rem] font-extrabold tracking-[-0.02em] text-ink">
            {tab === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h2>
          <p className="mt-1 text-[0.8125rem] text-ink-3">
            {tab === 'login'
              ? 'Accede para gestionar tus reservas o servicios.'
              : 'Registra tu organización para contratar y seguir reservas.'}
          </p>
          <div className="mt-4 flex gap-1 rounded-xl bg-canvas p-1">
            {TABS.map(([clave, etiqueta]) => (
              <button
                key={clave}
                type="button"
                onClick={() => {
                  setTab(clave)
                  setError('')
                }}
                className={`flex-1 rounded-[10px] px-3 py-2 text-[0.8125rem] font-bold transition ${
                  tab === clave
                    ? 'bg-white text-ink shadow-card'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          {location.state?.mensaje && tab === 'login' && !error && (
            <div className="mb-4">
              <Alerta tipo="exito">{location.state.mensaje}</Alerta>
            </div>
          )}
          {error && (
            <div className="mb-4">
              <Alerta>{error}</Alerta>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={enviarLogin} className="space-y-4">
              <Campo etiqueta="Correo" htmlFor="login-email" requerido>
                <Input
                  id="login-email"
                  type="email"
                  required
                  placeholder="nombre@empresa.cl"
                  value={login.email}
                  onChange={(e) => setLogin({ ...login, email: e.target.value })}
                />
              </Campo>
              <Campo etiqueta="Contraseña" htmlFor="login-password" requerido>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={login.password}
                  onChange={(e) => setLogin({ ...login, password: e.target.value })}
                />
              </Campo>
              <Boton type="submit" tamano="lg" className="w-full" cargando={enviando}>
                {enviando ? 'Ingresando…' : 'Iniciar sesión'}
              </Boton>
              <p className="text-center text-[0.8125rem]">
                <Link
                  to="/recuperar-password"
                  className="font-semibold text-brand-blue-deep underline-offset-2 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={enviarRegistro} className="space-y-4">
              <Campo
                etiqueta="Nombre de la organización"
                htmlFor="registro-nombre"
                requerido
              >
                <Input
                  id="registro-nombre"
                  required
                  value={registro.nombre}
                  onChange={(e) =>
                    setRegistro({ ...registro, nombre: e.target.value })
                  }
                />
              </Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="RUT" htmlFor="registro-rut" requerido>
                  <Input
                    id="registro-rut"
                    required
                    placeholder="76.XXX.XXX-X"
                    value={registro.rut}
                    onChange={(e) => setRegistro({ ...registro, rut: e.target.value })}
                  />
                </Campo>
                <Campo etiqueta="Contacto" htmlFor="registro-contacto" requerido>
                  <Input
                    id="registro-contacto"
                    required
                    value={registro.nombre_contacto}
                    onChange={(e) =>
                      setRegistro({ ...registro, nombre_contacto: e.target.value })
                    }
                  />
                </Campo>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Correo" htmlFor="registro-email" requerido>
                  <Input
                    id="registro-email"
                    type="email"
                    required
                    value={registro.email_contacto}
                    onChange={(e) =>
                      setRegistro({ ...registro, email_contacto: e.target.value })
                    }
                  />
                </Campo>
                <Campo etiqueta="Teléfono" htmlFor="registro-telefono">
                  <Input
                    id="registro-telefono"
                    value={registro.telefono}
                    onChange={(e) =>
                      setRegistro({ ...registro, telefono: e.target.value })
                    }
                  />
                </Campo>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Contraseña" htmlFor="registro-password" requerido>
                  <Input
                    id="registro-password"
                    type="password"
                    required
                    value={registro.password}
                    onChange={(e) =>
                      setRegistro({ ...registro, password: e.target.value })
                    }
                  />
                </Campo>
                <Campo etiqueta="Repetir" htmlFor="registro-password2" requerido>
                  <Input
                    id="registro-password2"
                    type="password"
                    required
                    value={registro.password2}
                    onChange={(e) =>
                      setRegistro({ ...registro, password2: e.target.value })
                    }
                  />
                </Campo>
              </div>
              <Boton type="submit" tamano="lg" className="w-full" cargando={enviando}>
                {enviando ? 'Creando…' : 'Crear cuenta'}
              </Boton>
            </form>
          )}
        </div>
      </Card>

      <p className="text-center text-[0.8125rem] text-ink-3 lg:col-start-2">
        ¿Solo quieres mirar?{' '}
        <Link
          to="/catalogo"
          className="font-semibold text-ink-2 underline-offset-2 hover:underline"
        >
          Ver el catálogo sin iniciar sesión
        </Link>
      </p>
    </div>
  )
}
