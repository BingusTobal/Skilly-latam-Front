import { Link, NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import Logo from '../Logo'

const ENLACES = [
  ['/admin', 'Resumen'],
  ['/admin/postulaciones', 'Postulaciones'],
  ['/admin/disputas', 'Disputas'],
  ['/admin/profesionales', 'Profesionales'],
  ['/admin/organizaciones', 'Organizaciones'],
  ['/admin/comisiones', 'Comisiones'],
]

function EnlaceAdmin({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === '/admin'}
      className={({ isActive }) =>
        `block border-l-[3px] px-[18px] py-[11px] text-[13px] no-underline ${
          isActive
            ? 'border-l-[#59c3ff] bg-white/10 font-bold text-white'
            : 'border-l-transparent text-[#cfe0ee] hover:bg-white/5'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function AdminLayout() {
  const { usuario, cerrarSesion } = useAuth()

  return (
    <div className="flex justify-center px-3 py-6">
      <div className="flex min-h-[640px] w-full max-w-[1080px] border border-black bg-white">
        <aside className="w-[190px] shrink-0 bg-navy py-[18px] text-white">
          <Link to="/admin" className="block px-[18px] pb-5 text-inherit no-underline">
            <Logo className="text-[14px]" />
          </Link>
          <nav>
            {ENLACES.map(([to, etiqueta]) => (
              <EnlaceAdmin key={to} to={to}>
                {etiqueta}
              </EnlaceAdmin>
            ))}
            <div className="mx-[18px] my-3 border-t border-white/15" />
            <EnlaceAdmin to="/admin/servicios">Revisión de servicios</EnlaceAdmin>
          </nav>
          <div className="mt-8 px-[18px]">
            <p className="mb-2 truncate text-[10.5px] text-white/60">
              {usuario?.email}
            </p>
            <button
              type="button"
              onClick={cerrarSesion}
              className="border border-white/40 px-3 py-1 text-[11px] text-white/90 hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-[26px] pb-[30px] pt-[22px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
