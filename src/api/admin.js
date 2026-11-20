import api from './axios'

// Revisión de servicios
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

// Resumen y comisiones
export function resumenAdmin() {
  return api.get('/admin/resumen/')
}

export function resumenComisionesAdmin(params = {}) {
  return api.get('/admin/comisiones/', { params })
}

// Comisiones
export function listarTasasComisionAdmin() {
  return api.get('/admin/tasas-comision/')
}

export function crearTasaComisionAdmin(payload) {
  return api.post('/admin/tasas-comision/', payload)
}

export function actualizarTasaComisionAdmin(id, payload) {
  return api.patch(`/admin/tasas-comision/${id}/`, payload)
}

export function listarDisputasAdmin(params = {}) {
  return api.get('/admin/disputas/', { params })
}

export function resolverDisputaAdmin(id, { resultado, resolucion, porcentaje_reembolso }) {
  return api.post(`/admin/disputas/${id}/resolver/`, {
    resultado,
    resolucion,
    porcentaje_reembolso,
  })
}

// Postulaciones y certificados
export function listarPostulacionesAdmin(params = {}) {
  return api.get('/postulaciones/admin/postulaciones/', { params })
}

export function obtenerPostulacionAdmin(id) {
  return api.get(`/postulaciones/admin/postulaciones/${id}/`)
}

export function aprobarPostulacion(id) {
  return api.post(`/postulaciones/admin/postulaciones/${id}/aprobar/`)
}

export function devolverPostulacion(id, comentarios_admin) {
  return api.post(`/postulaciones/admin/postulaciones/${id}/devolver/`, {
    comentarios_admin,
  })
}

export function rechazarPostulacion(id, comentarios_admin) {
  return api.post(`/postulaciones/admin/postulaciones/${id}/rechazar/`, {
    comentarios_admin,
  })
}

export function listarCertificadosAdmin(params = {}) {
  return api.get('/postulaciones/admin/certificados/', { params })
}

export function aprobarCertificado(id) {
  return api.post(`/postulaciones/admin/certificados/${id}/aprobar/`)
}

export function rechazarCertificado(id, comentario_revisor) {
  return api.post(`/postulaciones/admin/certificados/${id}/rechazar/`, {
    comentario_revisor,
  })
}

// Profesionales y organizaciones
export function listarProfesionalesAdmin(params = {}) {
  return api.get('/auth/admin/profesionales/', { params })
}

export function listarOrganizacionesAdmin(params = {}) {
  return api.get('/auth/admin/organizaciones/', { params })
}

export function detalleOrganizacionAdmin(id) {
  return api.get(`/auth/admin/organizaciones/${id}/`)
}
