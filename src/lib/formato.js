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
  aprobado: { etiqueta: 'Activo', clase: 'bg-green-100 text-green-700' },
  rechazado: { etiqueta: 'Rechazado', clase: 'bg-red-100 text-red-700' },
  devuelto: { etiqueta: 'Devuelto', clase: 'bg-orange-100 text-orange-700' },
  suspendido: { etiqueta: 'Suspendido', clase: 'bg-gray-200 text-gray-700' },
}

export const FORMATOS = {
  remoto: 'Remoto',
  presencial: 'Presencial',
  semipresencial: 'Semipresencial (Híbrido)',
}

export function etiquetaEstado(estado) {
  return ESTADOS_SERVICIO[estado]?.etiqueta || estado
}