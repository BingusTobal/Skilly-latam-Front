import PanelLayout from '../PanelLayout'

const SECCIONES = [
  { to: '/admin', etiqueta: 'Resumen', icono: 'chart', fin: true },
  { to: '/admin/servicios', etiqueta: 'Revisión de servicios', icono: 'layout' },
  { to: '/admin/postulaciones', etiqueta: 'Postulaciones', icono: 'user-check' },
  { to: '/admin/certificados', etiqueta: 'Certificados', icono: 'shield' },
  { separador: true },
  { to: '/admin/profesionales', etiqueta: 'Profesionales', icono: 'users' },
  { to: '/admin/organizaciones', etiqueta: 'Organizaciones', icono: 'building' },
  { separador: true },
  { to: '/admin/disputas', etiqueta: 'Disputas', icono: 'alert-triangle' },
  { to: '/admin/comisiones', etiqueta: 'Comisiones', icono: 'wallet' },
]

export default function AdminLayout() {
  return (
    <PanelLayout
      titulo="Administración"
      subtitulo="Skilly Latam"
      icono="shield"
      secciones={SECCIONES}
    />
  )
}
