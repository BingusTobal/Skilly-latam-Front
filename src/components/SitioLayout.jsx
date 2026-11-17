import { Outlet } from 'react-router-dom'

import useReveal from '../lib/useReveal'
import Navbar from './Navbar'
import SiteFooter from './SiteFooter'

export default function SitioLayout({ modo = 'app' }) {
  const esInicio = modo === 'inicio'
  useReveal()

  return (
    <div className={esInicio ? 'sk-home min-h-screen bg-white' : 'min-h-screen bg-canvas'}>
      <a
        href="#contenido"
        className="fixed left-4 top-[-64px] z-[100] rounded-b-[10px] bg-navy-900 px-4 py-2.5 font-semibold text-white no-underline transition-[top] focus:top-0"
      >
        Saltar al contenido
      </a>
      <Navbar variante={esInicio ? 'inicio' : 'app'} />
      {esInicio ? (
        <main id="contenido">
          <Outlet />
        </main>
      ) : (
        <main id="contenido" className="sk-container py-8 sm:py-10">
          <Outlet />
        </main>
      )}
      <SiteFooter />
    </div>
  )
}
