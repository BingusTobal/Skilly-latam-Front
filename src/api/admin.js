import api from './axios'

export function listarServiciosAdmin(params = {}) {
  return api.get('/admin/servicios/', { params })
}

export function aprobar(id) {
  return api.post(`/admin/servicios/${id}/aprobar/`)
}

export function devolver(id, comentarios_admin) {
  return api.post(`/admin/servicios/${id}/devolver/`, { comentarios_admin })
}

export function rechazar(id, comentarios_admin) {
  return api.post(`/admin/servicios/${id}/rechazar/`, { comentarios_admin })
}