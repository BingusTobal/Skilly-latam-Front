import { Link, NavLink } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

const linkBase = 'text-[13px] no-underline text-black hover:underline'
const linkActivo = 'font-bold underline'

function Enlace({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${linkBase} ${isActive ? linkActivo : ''}`}
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth()
  const tipo = usuario?.tipo

  return (
    <header className="flex items-center justify-between border-b border-gray-100 pb-3.5">
      <Link to="/" className="text-inherit no-underline">
        <Logo />
      </Link>

      <nav className="flex items-center gap-6 text-[13px]">
        {tipo === 'profesional' && (
          <Enlace to="/profesional/servicios">Mis servicios</Enlace>
        )}
        {tipo === 'admin' && <Enlace to="/admin/servicios">Revisión de servicios</Enlace>}
        {(tipo === 'organizacion' || !tipo) && (
          <Enlace to="/catalogo">Servicios</Enlace>
        )}
        {tipo === 'organizacion' && <Enlace to="/mis-reservas">Mis reservas</Enlace>}

        {usuario ? (
          <>
            <span className="text-[12px] text-gray-500">
              {usuario.first_name || usuario.email}
            </span>
            <button
              type="button"
              onClick={cerrarSesion}
              className="border border-black px-4 py-1.5 text-[13px]"
            >
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" className={`${linkBase} border border-black px-4 py-1.5`}>
            Iniciar sesión
          </Link>
        )}
      </nav>
    </header>
  )
}