import api from './axios'

export async function listarHorarios() {
  const { data } = await api.get('/auth/mis-horarios/')
  return data
}

export async function crearHorario(payload) {
  const { data } = await api.post('/auth/mis-horarios/', payload)
  return data
}

export async function actualizarHorario(id, payload) {
  const { data } = await api.patch(`/auth/mis-horarios/${id}/`, payload)
  return data
}

export async function eliminarHorario(id) {
  await api.delete(`/auth/mis-horarios/${id}/`)
}
