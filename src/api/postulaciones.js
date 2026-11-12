import api from './axios'

export async function crearPostulacion(datos) {
  const { data } = await api.post('/postulaciones/', datos)
  return data
}

export async function miPostulacion() {
  const { data } = await api.get('/postulaciones/mias/')
  return data
}

export async function reenviarPostulacion(id) {
  const { data } = await api.post(`/postulaciones/${id}/reenviar/`)
  return data
}

export async function subirCertificado(id, datos) {
  const formData = new FormData()
  formData.append('tipo', datos.tipo)
  formData.append('nombre', datos.nombre)
  if (datos.enlace) formData.append('enlace', datos.enlace)
  if (datos.archivo) formData.append('archivo', datos.archivo)
  const { data } = await api.post(`/postulaciones/${id}/certificados/`, formData)
  return data
}
