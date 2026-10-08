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