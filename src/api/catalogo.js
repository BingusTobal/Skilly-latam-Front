import api from './axios'

export async function listarCategorias() {
  const { data } = await api.get('/categorias/')
  return data
}

export async function listarServicios(params = {}) {
  const { data } = await api.get('/servicios/', { params })
  return data
}

export async function obtenerServicio(id) {
  const { data } = await api.get(`/servicios/${id}/`)
  return data
}

export async function misServicios() {
  const { data } = await api.get('/profesional/servicios/')
  return data
}

export async function obtenerMiServicio(id) {
  const { data } = await api.get(`/profesional/servicios/${id}/`)
  return data
}

export async function crearServicio(payload) {
  const { data } = await api.post('/profesional/servicios/', payload)
  return data
}

export async function actualizarServicio(id, payload) {
  const { data } = await api.put(`/profesional/servicios/${id}/`, payload)
  return data
}

export function enviarARevision(id) {
  return api.post(`/profesional/servicios/${id}/publicar/`)
}