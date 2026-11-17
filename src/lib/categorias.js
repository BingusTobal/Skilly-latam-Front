export const ESTILOS = {
  'desarrollo-software': {
    icono: 'code',
    c1: '#2B64F0',
    c2: '#7C4DFF',
    tint: '#E7EEFF',
    hue: '#2B64F0',
  },
  'diseno-grafico': {
    icono: 'layout',
    c1: '#7C4DFF',
    c2: '#D08BFF',
    tint: '#F0EAFF',
    hue: '#7C4DFF',
  },
  finanzas: {
    icono: 'chart',
    c1: '#0E9F7E',
    c2: '#5ED9B5',
    tint: '#DDF6EF',
    hue: '#0B7A63',
  },
  marketing: {
    icono: 'megaphone',
    c1: '#F0603A',
    c2: '#FFB347',
    tint: '#FFEBE4',
    hue: '#D9481F',
  },
  'salud-y-bienestar': {
    icono: 'heart',
    c1: '#E8579A',
    c2: '#FF9A8B',
    tint: '#FFE8F1',
    hue: '#C2255C',
  },
}

export const ESTILO_BASE = {
  icono: 'user-check',
  c1: '#1A3A5C',
  c2: '#2B64F0',
  tint: '#E7EEFF',
  hue: '#2B64F0',
}

export const ICONOS_EMOJI = {
  'desarrollo-software': '💻',
  'diseno-grafico': '🎨',
  finanzas: '📊',
  marketing: '📣',
  'salud-y-bienestar': '🌿',
}

export const DESCRIPCIONES = {
  'desarrollo-software': 'Sitios web, apps y soporte técnico.',
  'diseno-grafico': 'Identidad visual, UX/UI y piezas gráficas.',
  finanzas: 'Auditoría, contabilidad y análisis para PYMEs.',
  marketing: 'Estrategia digital, contenidos y campañas.',
  'salud-y-bienestar': 'Talleres, evaluaciones y apoyo para tu equipo.',
  'salud-bienestar': 'Talleres, evaluaciones y apoyo para tu equipo.',
}

const ICONOS_FORMATO = {
  remoto: 'monitor',
  presencial: 'pin',
  semipresencial: 'calendar',
}

export function estiloCategoria(slug) {
  return ESTILOS[slug] || ESTILO_BASE
}

export function iconoCategoria(slug) {
  return estiloCategoria(slug).icono
}

export function iconoFormato(formato) {
  return ICONOS_FORMATO[formato] || 'calendar'
}

export function descripcionCategoria(slug) {
  return DESCRIPCIONES[slug] || 'Servicios profesionales con precio fijo.'
}

export function iniciales(nombre) {
  return (nombre || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('')
}
