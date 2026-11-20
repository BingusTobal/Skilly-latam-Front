import api from './axios'

// Disputas de las partes de una reserva.
export async function misDisputas(params = {}) {
  const { data } = await api.get('/disputas/', { params })
  return data
}

export async function obtenerDisputa(id) {
  const { data } = await api.get(`/disputas/${id}/`)
  return data
}

export async function abrirDisputa({
  reserva,
  motivo,
  descripcion = '',
  evidencia = null,
}) {
  const cuerpo = new FormData()
  cuerpo.append('reserva', reserva)
  cuerpo.append('motivo', motivo)
  if (descripcion) cuerpo.append('descripcion', descripcion)
  if (evidencia) cuerpo.append('evidencia', evidencia)

  const { data } = await api.post('/disputas/', cuerpo)
  return data
}

export async function subirEvidencia(id, archivo, nombre = '') {
  const cuerpo = new FormData()
  cuerpo.append('archivo', archivo)
  if (nombre) cuerpo.append('nombre', nombre)

  const { data } = await api.post(`/disputas/${id}/evidencias/`, cuerpo)
  return data
}
