import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { crearPostulacion } from '../../api/postulaciones'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import {
  Boton,
  Campo,
  Card,
  Input,
  Migas,
  Select,
  Textarea,
} from '../../components/ui'
import { useAuth } from '../../context/AuthContext'

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

const PASOS = [
  ['file', 'Envías tu postulación', 'Cuéntanos tu experiencia y especialidad.'],
  ['user-check', 'Revisamos tu perfil', 'Un administrador valida tus antecedentes.'],
  ['shield', 'Subes tus certificados', 'LinkedIn se valida automáticamente.'],
  ['layout', 'Publicas servicios', 'Cada servicio pasa por revisión antes de salir.'],
]

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
    <div>
      <Migas
        className="mb-4"
        items={[{ texto: 'Inicio', to: '/' }, { texto: 'Postular' }]}
      />

      <div className="mb-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-violet-soft px-3 py-1 text-[0.75rem] font-bold text-brand-violet">
          <Icon nombre="user-check" className="h-3.5 w-3.5" />
          Talent as a Service
        </span>
        <h1 className="mt-3 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[2.125rem]">
          Postula como profesional
        </h1>
        <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-3">
          Crea tu cuenta y cuéntanos tu experiencia. Un administrador revisará tu
          postulación y podrás subir tus certificados en el siguiente paso.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        <form onSubmit={enviar} className="min-w-0 space-y-5">
          {error && <Alerta>{error}</Alerta>}

          <Card className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-[1.0625rem] font-bold text-ink">
              <Icon nombre="lock" className="h-4 w-4 text-brand-blue" />
              Datos de la cuenta
            </h2>
            <div className="space-y-4">
              <Campo etiqueta="Correo" htmlFor="postular-email" requerido>
                <Input
                  id="postular-email"
                  type="email"
                  required
                  placeholder="nombre@correo.cl"
                  value={form.email}
                  onChange={(e) => actualizar('email', e.target.value)}
                />
              </Campo>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo etiqueta="Contraseña" htmlFor="postular-password" requerido>
                  <Input
                    id="postular-password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => actualizar('password', e.target.value)}
                  />
                </Campo>
                <Campo
                  etiqueta="Repetir contraseña"
                  htmlFor="postular-password2"
                  requerido
                >
                  <Input
                    id="postular-password2"
                    type="password"
                    required
                    value={form.password2}
                    onChange={(e) => actualizar('password2', e.target.value)}
                  />
                </Campo>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-[1.0625rem] font-bold text-ink">
              <Icon nombre="users" className="h-4 w-4 text-brand-blue" />
              Datos personales
            </h2>
            <div className="space-y-4">
              <Campo etiqueta="Nombre completo" htmlFor="postular-nombre" requerido>
                <Input
                  id="postular-nombre"
                  required
                  value={form.nombre_completo}
                  onChange={(e) => actualizar('nombre_completo', e.target.value)}
                />
              </Campo>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo etiqueta="RUT" htmlFor="postular-rut" requerido>
                  <Input
                    id="postular-rut"
                    required
                    placeholder="12.345.678-9"
                    value={form.rut}
                    onChange={(e) => actualizar('rut', e.target.value)}
                  />
                </Campo>
                <Campo etiqueta="Teléfono" htmlFor="postular-telefono">
                  <Input
                    id="postular-telefono"
                    placeholder="+56 9 1234 5678"
                    value={form.telefono}
                    onChange={(e) => actualizar('telefono', e.target.value)}
                  />
                </Campo>
              </div>
              <Campo etiqueta="Ciudad" htmlFor="postular-ciudad">
                <Input
                  id="postular-ciudad"
                  value={form.ciudad}
                  onChange={(e) => actualizar('ciudad', e.target.value)}
                />
              </Campo>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-[1.0625rem] font-bold text-ink">
              <Icon nombre="file" className="h-4 w-4 text-brand-blue" />
              Perfil profesional
            </h2>
            <div className="space-y-4">
              <Campo etiqueta="Especialidad" htmlFor="postular-especialidad">
                <Input
                  id="postular-especialidad"
                  placeholder="Ej: Diseño UX/UI"
                  value={form.especialidad}
                  onChange={(e) => actualizar('especialidad', e.target.value)}
                />
              </Campo>
              <Campo
                etiqueta="Perfil de LinkedIn"
                htmlFor="postular-linkedin"
                ayuda="Se valida el formato de la URL, no el contenido. Si lo agregas, queda registrado como certificado automático."
              >
                <Input
                  id="postular-linkedin"
                  type="url"
                  placeholder="https://www.linkedin.com/in/tu-perfil"
                  value={form.linkedin_url}
                  onChange={(e) => actualizar('linkedin_url', e.target.value)}
                />
              </Campo>
              <Campo etiqueta="Disponibilidad" htmlFor="postular-disponibilidad">
                <Select
                  id="postular-disponibilidad"
                  value={form.disponibilidad}
                  onChange={(e) => actualizar('disponibilidad', e.target.value)}
                >
                  <option value="inmediata">Inmediata</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </Select>
              </Campo>
              <Campo etiqueta="Experiencia" htmlFor="postular-experiencia">
                <Textarea
                  id="postular-experiencia"
                  className="min-h-28"
                  placeholder="Cuéntanos sobre tu trayectoria, proyectos y áreas de expertise."
                  value={form.experiencia}
                  onChange={(e) => actualizar('experiencia', e.target.value)}
                />
              </Campo>
            </div>
          </Card>

          <Boton type="submit" tamano="lg" className="w-full" cargando={enviando}>
            {enviando ? 'Enviando postulación…' : 'Enviar postulación'}
          </Boton>

          <p className="text-center text-[0.8125rem] text-ink-3">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-blue-deep underline-offset-2 hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </form>

        <aside className="w-full lg:w-[300px]">
          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden">
              <div className="border-b border-line bg-canvas px-5 py-4">
                <p className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-ink-3">
                  Qué pasa después
                </p>
              </div>
              <ol className="space-y-4 px-5 py-5">
                {PASOS.map(([icono, titulo, detalle], indice) => (
                  <li key={titulo} className="flex gap-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-blue-soft text-[0.75rem] font-extrabold text-brand-blue-deep">
                      {indice + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[0.8125rem] font-bold text-ink">
                        <Icon nombre={icono} className="h-3.5 w-3.5 text-ink-3" />
                        {titulo}
                      </p>
                      <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-3">
                        {detalle}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="border-t border-line px-5 py-4">
                <p className="text-[0.75rem] leading-relaxed text-ink-3">
                  Tus datos se usan solo para validar tu postulación y gestionar los
                  servicios que publiques.
                </p>
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}
