import api from './axios'

export async function login(email, password) {
  const { data } = await api.post('/auth/login/', { email, password })
  return data
}

export async function registrarse(datos) {
  const { data } = await api.post('/auth/registro-organizacion/', datos)
  return data
}

export async function miPerfil() {
  const { data } = await api.get('/auth/me/')
  return data
}

export async function miPerfilProfesional() {
  const { data } = await api.get('/auth/mi-perfil-profesional/')
  return data
}

export async function actualizarMiPerfilProfesional(datos) {
  const formData = new FormData()
  for (const campo of ['nombre_completo', 'bio', 'ciudad', 'linkedin_url']) {
    if (datos[campo] !== undefined) formData.append(campo, datos[campo] ?? '')
  }
  if (datos.foto) formData.append('foto', datos.foto)
  if (datos.quitar_foto) formData.append('quitar_foto', 'true')

  const { data } = await api.patch('/auth/mi-perfil-profesional/', formData)
  return data
}

export async function solicitarReset(email) {
  const { data } = await api.post('/auth/password-reset/', { email })
  return data
}

export async function confirmarReset({ uid, token, password }) {
  const { data } = await api.post('/auth/password-reset/confirmar/', {
    uid,
    token,
    password,
  })
  return data
}
