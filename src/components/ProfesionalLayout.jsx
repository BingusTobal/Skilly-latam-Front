import PanelLayout from './PanelLayout'

const SECCIONES = [
  { to: '/profesional/servicios', etiqueta: 'Mis servicios', icono: 'layout', fin: true },
  { to: '/profesional/solicitudes', etiqueta: 'Solicitudes', icono: 'message' },
  { to: '/profesional/horarios', etiqueta: 'Mis horarios', icono: 'calendar' },
  { separador: true },
  { to: '/profesional/postulacion', etiqueta: 'Mi postulación', icono: 'user-check' },
  { to: '/profesional/perfil', etiqueta: 'Mi perfil', icono: 'users' },
]

export default function ProfesionalLayout() {
  return (
    <PanelLayout
      titulo="Panel profesional"
      subtitulo="Gestiona tu trabajo"
      icono="user-check"
      secciones={SECCIONES}
    />
  )
}
