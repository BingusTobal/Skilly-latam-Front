// RF: montos en pesos chilenos, sin decimales.
export const TASA_COMISION = 0.1

export function formatearCLP(monto) {
  const numero = Number(monto) || 0
  return `$${numero.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`
}

// El profesional ve solo el monto neto, nunca el desglose bruto + comisión.
export function montoNeto(precio) {
  return Math.round((Number(precio) || 0) * (1 - TASA_COMISION))
}

export const ESTADOS_SERVICIO = {
  borrador: { etiqueta: 'Borrador', clase: 'bg-gray-100 text-gray-600' },
  en_revision: { etiqueta: 'En revisión', clase: 'bg-amber-100 text-amber-700' },
  aprobado: { etiqueta: 'Aprobado', clase: 'bg-green-100 text-green-700' },
  rechazado: { etiqueta: 'Rechazado', clase: 'bg-red-100 text-red-700' },
  devuelto: { etiqueta: 'Devuelto', clase: 'bg-amber-100 text-amber-800' },
  suspendido: { etiqueta: 'Suspendido', clase: 'bg-gray-200 text-gray-600' },
}

// Estados de la postulación y de sus certificados.
export const ESTADOS_POSTULACION = {
  pendiente: { etiqueta: 'Pendiente', clase: 'bg-amber-100 text-amber-800' },
  aprobada: { etiqueta: 'Aprobada', clase: 'bg-green-100 text-green-700' },
  rechazada: { etiqueta: 'Rechazada', clase: 'bg-red-100 text-red-700' },
  devuelta: { etiqueta: 'Devuelta', clase: 'bg-amber-100 text-amber-800' },
}

export const ESTADOS_CERTIFICADO = {
  verificado_automatico: {
    etiqueta: 'Verificado automáticamente',
    clase: 'bg-green-100 text-green-700',
  },
  sin_reviewer: { etiqueta: 'Sin revisar', clase: 'bg-amber-100 text-amber-800' },
  aprobado: { etiqueta: 'Aprobado', clase: 'bg-green-100 text-green-700' },
  rechazado: { etiqueta: 'Rechazado', clase: 'bg-red-100 text-red-700' },
}

// Estados de la reserva (Sprint 3).
export const ESTADOS_RESERVA = {
  pendiente_pago: {
    etiqueta: 'Pendiente de pago',
    clase: 'bg-amber-100 text-amber-800',
  },
  pendiente_aceptacion: {
    etiqueta: 'Pendiente de aceptación',
    clase: 'bg-amber-100 text-amber-800',
  },
  en_curso: { etiqueta: 'En curso', clase: 'bg-sky text-navy' },
  entregado_por_confirmar: {
    etiqueta: 'Entregado — confirmar',
    clase: 'bg-amber-100 text-amber-800',
  },
  finalizada: { etiqueta: 'Finalizada', clase: 'bg-green-100 text-green-700' },
  cancelada: { etiqueta: 'Cancelada', clase: 'bg-gray-200 text-gray-600' },
  vencida: { etiqueta: 'Vencida', clase: 'bg-gray-200 text-gray-500' },
  con_disputa: { etiqueta: 'Con disputa', clase: 'bg-red-100 text-red-700' },
}

export function etiquetaEstadoReserva(estado) {
  return ESTADOS_RESERVA[estado]?.etiqueta || estado
}

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

export function formatearFecha(fechaISO) {
  if (!fechaISO) return ''
  const [anio, mes, dia] = fechaISO.slice(0, 10).split('-').map(Number)
  return `${dia} de ${MESES[mes - 1]} de ${anio}`
}

export function formatearHora(hora) {
  if (!hora) return ''
  return hora.slice(0, 5)
}

const MESES_CORTOS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

export function formatearFechaCorta(fechaISO) {
  if (!fechaISO) return ''
  const [anio, mes, dia] = fechaISO.slice(0, 10).split('-').map(Number)
  return `${dia} ${MESES_CORTOS[mes - 1]} ${anio}`
}

export function formatearFechaHora(fechaISO) {
  if (!fechaISO) return ''
  const fecha = new Date(fechaISO)
  if (Number.isNaN(fecha.getTime())) return ''
  const dia = String(fecha.getDate()).padStart(2, '0')
  const mes = MESES_CORTOS[fecha.getMonth()]
  const anio = fecha.getFullYear()
  const hora = `${String(fecha.getHours()).padStart(2, '0')}:${String(
    fecha.getMinutes(),
  ).padStart(2, '0')}`
  return `${dia} ${mes} ${anio} · ${hora}`
}

export function hace(fechaISO) {
  if (!fechaISO) return ''
  const fecha = new Date(fechaISO)
  if (Number.isNaN(fecha.getTime())) return ''
  const minutos = Math.max(0, Math.round((Date.now() - fecha.getTime()) / 60000))
  if (minutos < 1) return 'hace instantes'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.round(horas / 24)
  if (dias < 30) return `hace ${dias} d`
  return formatearFechaCorta(fechaISO)
}

export const ESTADOS_DISPUTA = {
  abierta: { etiqueta: 'Abierta', clase: 'bg-red-100 text-red-700' },
  en_revision: { etiqueta: 'En revisión', clase: 'bg-amber-100 text-amber-800' },
  resuelta: { etiqueta: 'Resuelta', clase: 'bg-green-100 text-green-700' },
}

export const RESULTADOS_DISPUTA = {
  a_favor_organizacion: {
    etiqueta: 'A favor de la organización',
    clase: 'bg-sky text-navy',
  },
  a_favor_profesional: {
    etiqueta: 'A favor del profesional',
    clase: 'bg-green-100 text-green-700',
  },
  division: { etiqueta: 'División', clase: 'bg-amber-100 text-amber-800' },
}

export const ESTADOS_PAGO = {
  iniciado: 'Iniciado',
  autorizado: 'Autorizado',
  capturando: 'Capturando',
  retenido: 'Retenido',
  liberado: 'Liberado',
  reembolsando: 'Reembolsando',
  reembolsado: 'Reembolsado',
  cancelando: 'Cancelando',
  cancelado: 'Cancelado',
  rechazado: 'Rechazado',
  expirado: 'Expirado',
  revision_manual: 'Revisión manual',
}

export const ESTADOS_PROFESIONAL = {
  postulando: { etiqueta: 'Postulando', clase: 'bg-amber-100 text-amber-800' },
  aprobado: { etiqueta: 'Aprobado', clase: 'bg-green-100 text-green-700' },
  rechazado: { etiqueta: 'Rechazado', clase: 'bg-red-100 text-red-700' },
  suspendido: { etiqueta: 'Suspendido', clase: 'bg-gray-200 text-gray-600' },
}

export const FORMATOS = {
  remoto: 'Remoto',
  presencial: 'Presencial',
  semipresencial: 'Semipresencial (Híbrido)',
}

export function etiquetaEstado(estado) {
  return ESTADOS_SERVICIO[estado]?.etiqueta || estado
}