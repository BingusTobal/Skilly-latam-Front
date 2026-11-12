import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { crearPostulacion } from '../../api/postulaciones'
import Alerta from '../../components/Alerta'
import { useAuth } from '../../context/AuthContext'

const CLASE_INPUT = 'w-full border border-gray-400 px-3 py-2 text-[13px] outline-none'
const CLASE_LABEL = 'mb-1 block text-[12px] text-gray-600'

const VACIO = {
  email: '',
  password: '',
  password2: '',
  nombre_completo: '',
  rut: '',
  telefono: '',
  ciudad: '',
  linkedin_url: '',
  disponibilidad: 'inmediata',
  especialidad: '',
  experiencia: '',
}

export default function Postular() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setError('')

    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (form.linkedin_url && !form.linkedin_url.startsWith('https://www.linkedin.com/in/')) {
      setError('La URL de LinkedIn debe empezar con https://www.linkedin.com/in/')
      return
    }

    setEnviando(true)
    try {
      const email = form.email.trim().toLowerCase()
      await crearPostulacion({
        email,
        password: form.password,
        nombre_completo: form.nombre_completo,
        rut: form.rut,
        telefono: form.telefono,
        ciudad: form.ciudad,
        linkedin_url: form.linkedin_url,
        disponibilidad: form.disponibilidad,
        especialidad: form.especialidad,
        experiencia: form.experiencia,
      })
      await iniciarSesion(email, form.password)
      navigate('/profesional/postulacion', {
        replace: true,
        state: { recienPostulado: true },
      })
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl pt-6">
      <Link to="/" className="text-[13px] text-gray-600 no-underline">
        ← Volver al inicio
      </Link>
      <h1 className="mt-2 text-[21px] font-bold">Postula como profesional</h1>
      <p className="mb-6 text-[12.5px] text-gray-500">
        Crea tu cuenta y cuéntanos tu experiencia. Un administrador revisará tu
        postulación y podrás subir tus certificados en el siguiente paso.
      </p>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      <form onSubmit={enviar} className="space-y-6">
        <section>
          <h2 className="mb-3 border-b border-line pb-1.5 text-[14px] font-bold">
            Datos de la cuenta
          </h2>
          <div className="mb-4">
            <label className={CLASE_LABEL}>Correo *</label>
            <input
              type="email"
              required
              className={CLASE_INPUT}
              placeholder="nombre@correo.cl"
              value={form.email}
              onChange={(e) => actualizar('email', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={CLASE_LABEL}>Contraseña *</label>
              <input
                type="password"
                required
                className={CLASE_INPUT}
                value={form.password}
                onChange={(e) => actualizar('password', e.target.value)}
              />
            </div>
            <div>
              <label className={CLASE_LABEL}>Repetir contraseña *</label>
              <input
                type="password"
                required
                className={CLASE_INPUT}
                value={form.password2}
                onChange={(e) => actualizar('password2', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 border-b border-line pb-1.5 text-[14px] font-bold">
            Datos personales
          </h2>
          <div className="mb-4">
            <label className={CLASE_LABEL}>Nombre completo *</label>
            <input
              required
              className={CLASE_INPUT}
              value={form.nombre_completo}
              onChange={(e) => actualizar('nombre_completo', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={CLASE_LABEL}>RUT *</label>
              <input
                required
                className={CLASE_INPUT}
                placeholder="12.345.678-9"
                value={form.rut}
                onChange={(e) => actualizar('rut', e.target.value)}
              />
            </div>
            <div>
              <label className={CLASE_LABEL}>Teléfono</label>
              <input
                className={CLASE_INPUT}
                placeholder="+56 9 1234 5678"
                value={form.telefono}
                onChange={(e) => actualizar('telefono', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className={CLASE_LABEL}>Ciudad</label>
            <input
              className={CLASE_INPUT}
              value={form.ciudad}
              onChange={(e) => actualizar('ciudad', e.target.value)}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 border-b border-line pb-1.5 text-[14px] font-bold">
            Perfil profesional
          </h2>
          <div className="mb-4">
            <label className={CLASE_LABEL}>Especialidad</label>
            <input
              className={CLASE_INPUT}
              placeholder="Ej: Diseño UX/UI"
              value={form.especialidad}
              onChange={(e) => actualizar('especialidad', e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className={CLASE_LABEL}>Perfil de LinkedIn</label>
            <input
              type="url"
              className={CLASE_INPUT}
              placeholder="https://www.linkedin.com/in/tu-perfil"
              value={form.linkedin_url}
              onChange={(e) => actualizar('linkedin_url', e.target.value)}
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Se valida el formato de la URL, no el contenido del perfil. Si lo
              agregas, queda registrado como certificado automático.
            </p>
          </div>
          <div className="mb-4">
            <label className={CLASE_LABEL}>Disponibilidad</label>
            <select
              className={CLASE_INPUT}
              value={form.disponibilidad}
              onChange={(e) => actualizar('disponibilidad', e.target.value)}
            >
              <option value="inmediata">Inmediata</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
          <div>
            <label className={CLASE_LABEL}>Experiencia</label>
            <textarea
              className={`${CLASE_INPUT} min-h-28`}
              placeholder="Cuéntanos sobre tu trayectoria, proyectos y áreas de expertise."
              value={form.experiencia}
              onChange={(e) => actualizar('experiencia', e.target.value)}
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-black py-3 text-[13px] text-white disabled:opacity-60"
        >
          {enviando ? 'Enviando postulación…' : 'Enviar postulación'}
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
