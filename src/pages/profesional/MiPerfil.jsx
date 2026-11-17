import { useEffect, useRef, useState } from 'react'

import {
  actualizarMiPerfilProfesional,
  miPerfilProfesional,
} from '../../api/auth'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import {
  Avatar,
  Boton,
  Campo,
  Card,
  CardBody,
  CardHeader,
  Input,
  PageHeader,
  Skeleton,
  Textarea,
} from '../../components/ui'

const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp']
const TAMANO_MAXIMO = 2 * 1024 * 1024

export default function MiPerfil() {
  const [perfil, setPerfil] = useState(null)
  const [formulario, setFormulario] = useState({
    nombre_completo: '',
    bio: '',
    ciudad: '',
    linkedin_url: '',
  })
  const [foto, setFoto] = useState(null)
  const [quitarFoto, setQuitarFoto] = useState(false)
  const [preview, setPreview] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const inputFoto = useRef(null)
  const urlTemporal = useRef(null)

  useEffect(() => {
    let activo = true
    miPerfilProfesional()
      .then((data) => {
        if (!activo) return
        setPerfil(data)
        setFormulario({
          nombre_completo: data.nombre_completo || '',
          bio: data.bio || '',
          ciudad: data.ciudad || '',
          linkedin_url: data.linkedin_url || '',
        })
        setPreview(data.foto || '')
      })
      .catch((err) => {
        if (activo) setError(mensajeDeError(err))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (urlTemporal.current) URL.revokeObjectURL(urlTemporal.current)
    }
  }, [])

  function liberarPreview() {
    if (urlTemporal.current) {
      URL.revokeObjectURL(urlTemporal.current)
      urlTemporal.current = null
    }
  }

  function cambiarFoto(evento) {
    const archivo = evento.target.files?.[0]
    if (!archivo) return

    if (!TIPOS_FOTO.includes(archivo.type)) {
      setError('La foto debe ser JPG, PNG o WebP.')
      evento.target.value = ''
      return
    }
    if (archivo.size > TAMANO_MAXIMO) {
      setError('La foto no puede superar 2 MB.')
      evento.target.value = ''
      return
    }

    liberarPreview()
    urlTemporal.current = URL.createObjectURL(archivo)
    setFoto(archivo)
    setQuitarFoto(false)
    setPreview(urlTemporal.current)
    setError('')
    setAviso('')
  }

  function quitar() {
    liberarPreview()
    setFoto(null)
    setQuitarFoto(true)
    setPreview('')
    if (inputFoto.current) inputFoto.current.value = ''
  }

  async function guardar(evento) {
    evento.preventDefault()
    setError('')
    setAviso('')

    if (!formulario.nombre_completo.trim()) {
      setError('Escribe tu nombre completo.')
      return
    }

    setGuardando(true)
    try {
      const actualizado = await actualizarMiPerfilProfesional({
        ...formulario,
        foto,
        quitar_foto: quitarFoto,
      })
      liberarPreview()
      setPerfil(actualizado)
      setFormulario({
        nombre_completo: actualizado.nombre_completo || '',
        bio: actualizado.bio || '',
        ciudad: actualizado.ciudad || '',
        linkedin_url: actualizado.linkedin_url || '',
      })
      setFoto(null)
      setQuitarFoto(false)
      setPreview(actualizado.foto || '')
      if (inputFoto.current) inputFoto.current.value = ''
      setAviso('Guardamos los cambios de tu perfil.')
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-48 rounded-[20px]" />
        <Skeleton className="h-72 rounded-[20px]" />
      </div>
    )
  }

  if (!perfil) {
    return (
      <div>
        <Alerta>{error || 'No pudimos cargar tu perfil.'}</Alerta>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        etiqueta="Panel profesional"
        titulo="Mi perfil"
        descripcion="Así te verán las organizaciones en el detalle de tus servicios."
      />

      {aviso && (
        <div className="mb-4">
          <Alerta tipo="exito">{aviso}</Alerta>
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      <form
        onSubmit={guardar}
        className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
      >
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <h2 className="text-[0.9375rem] font-bold text-ink">Foto de perfil</h2>
                <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                  Una foto clara genera más confianza.
                </p>
              </div>
            </CardHeader>
            <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar
                nombre={formulario.nombre_completo}
                foto={preview || undefined}
                tamano="xl"
              />
              <div>
                <input
                  ref={inputFoto}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={cambiarFoto}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Boton
                    type="button"
                    variante="secundario"
                    tamano="sm"
                    onClick={() => inputFoto.current?.click()}
                  >
                    <Icon nombre="upload" className="h-4 w-4" />
                    Cambiar foto
                  </Boton>
                  {preview && (
                    <Boton
                      type="button"
                      variante="fantasma"
                      tamano="sm"
                      className="text-danger hover:bg-danger-soft"
                      onClick={quitar}
                    >
                      Quitar foto
                    </Boton>
                  )}
                </div>
                <p className="mt-2 text-[0.75rem] text-ink-3">
                  JPG, PNG o WebP · máximo 2 MB.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h2 className="text-[0.9375rem] font-bold text-ink">Datos públicos</h2>
                <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                  Se muestran en tu perfil dentro del catálogo.
                </p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue-deep">
                <Icon nombre="users" className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardBody className="space-y-4">
              <Campo etiqueta="Nombre completo" htmlFor="nombre_completo" requerido>
                <Input
                  id="nombre_completo"
                  required
                  maxLength={150}
                  value={formulario.nombre_completo}
                  onChange={(e) =>
                    setFormulario({ ...formulario, nombre_completo: e.target.value })
                  }
                />
              </Campo>

              <Campo etiqueta="Ciudad" htmlFor="ciudad">
                <Input
                  id="ciudad"
                  maxLength={100}
                  placeholder="Ej: Santiago"
                  value={formulario.ciudad}
                  onChange={(e) =>
                    setFormulario({ ...formulario, ciudad: e.target.value })
                  }
                />
              </Campo>

              <Campo
                etiqueta="Presentación breve"
                htmlFor="bio"
                ayuda="Cuenta qué haces y cómo trabajas."
              >
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder="Cuenta qué haces y cómo trabajas."
                  value={formulario.bio}
                  onChange={(e) =>
                    setFormulario({ ...formulario, bio: e.target.value })
                  }
                />
              </Campo>

              <Campo etiqueta="Perfil de LinkedIn" htmlFor="linkedin_url">
                <Input
                  id="linkedin_url"
                  type="url"
                  maxLength={255}
                  placeholder="https://www.linkedin.com/in/tu-perfil"
                  value={formulario.linkedin_url}
                  onChange={(e) =>
                    setFormulario({ ...formulario, linkedin_url: e.target.value })
                  }
                />
              </Campo>
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <h2 className="text-[0.9375rem] font-bold text-ink">
                Datos de la cuenta
              </h2>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-canvas text-ink-3">
                <Icon nombre="lock" className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardBody>
              <dl className="space-y-3">
                <div>
                  <dt className="text-[0.75rem] font-semibold text-ink-3">Correo</dt>
                  <dd className="mt-0.5 break-all text-[0.875rem] font-semibold text-ink">
                    {perfil.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.75rem] font-semibold text-ink-3">RUT</dt>
                  <dd className="mt-0.5 text-[0.875rem] font-semibold text-ink">
                    {perfil.rut}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-3">
                Estos datos no se muestran públicamente y no se editan desde aquí.
              </p>
            </CardBody>
          </Card>

          <Boton type="submit" className="w-full" cargando={guardando}>
            Guardar cambios
          </Boton>
        </aside>
      </form>
    </div>
  )
}
