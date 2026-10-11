import api from './axios'

// --- Disponibilidad (público) ---------------------------------------------
export async function slotsServicio(id, fecha) {
  const { data } = await api.get(`/servicios/${id}/slots/`, { params: { fecha } })
  return data
}

export async function disponibilidadServicio(id, params = {}) {
  const { data } = await api.get(`/servicios/${id}/disponibilidad/`, { params })
  return data
}

// --- Reservas ---
export async function crearReserva(payload) {
  const { data } = await api.post('/reservas/', payload)
  return data
}

export async function obtenerReserva(id, token) {
  const { data } = await api.get(`/reservas/${id}/`, {
    params: token ? { token } : undefined,
  })
  return data
}

export async function misReservas() {
  const { data } = await api.get('/reservas/mias/')
  return data
}

export async function misSolicitudes(params = {}) {
  const { data } = await api.get('/reservas/solicitudes/', { params })
  return data
}

export async function aceptarReserva(id) {
  const { data } = await api.post(`/reservas/${id}/aceptar/`)
  return data
}

export async function rechazarReserva(id, motivo = '') {
  const { data } = await api.post(`/reservas/${id}/rechazar/`, { motivo })
  return data
}

export async function marcarEntregado(id) {
  const { data } = await api.post(`/reservas/${id}/marcar-entregado/`)
  return data
}

export async function confirmarEntrega(id) {
  const { data } = await api.post(`/reservas/${id}/confirmar-entrega/`)
  return data
}

export async function cancelarReserva(id, motivo = '') {
  const { data } = await api.post(`/reservas/${id}/cancelar/`, { motivo })
  return data
}

export async function reportarProblema(id, { motivo = '', descripcion = '' } = {}) {
  const { data } = await api.post(`/reservas/${id}/reportar-problema/`, {
    motivo,
    descripcion,
  })
  return data
}
