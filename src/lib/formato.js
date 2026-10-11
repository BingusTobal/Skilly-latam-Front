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

// Estados de la reserva (Sprint 3).
export const ESTADOS_RESERVA = {
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

export const FORMATOS = {
  remoto: 'Remoto',
  presencial: 'Presencial',
  semipresencial: 'Semipresencial (Híbrido)',
}

export function etiquetaEstado(estado) {
  return ESTADOS_SERVICIO[estado]?.etiqueta || estado
}