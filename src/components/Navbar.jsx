import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import Icon from './Icon'
import Logo from './Logo'

const LINK =
  'rounded-[10px] px-3.5 py-2 text-[0.95rem] font-semibold text-ink-2 no-underline transition hover:bg-canvas hover:text-ink'
const LINK_ACTIVO = 'bg-canvas text-brand-blue'

const ENLACES_INICIO = [
  { texto: 'Servicios', href: '#servicios' },
  { texto: 'Cómo funciona', href: '#como-funciona' },
  { texto: 'Para profesionales', href: '#profesionales' },
]

function PanelLink({ tipo, onClick }) {
  if (tipo === 'profesional') {
    return (
      <Link to="/profesional/servicios" onClick={onClick} className={LINK}>
        Mi panel
      </Link>
    )
  }
  if (tipo === 'organizacion') {
    return (
      <Link to="/mis-reservas" onClick={onClick} className={LINK}>
        Mis reservas
      </Link>
    )
  }
  if (tipo === 'admin') {
    return (
      <Link to="/admin" onClick={onClick} className={LINK}>
        Panel admin
      </Link>
    )
  }
  return null
}

function BtnSalir({ cerrarSesion, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.()
        cerrarSesion()
      }}
      className={`inline-flex items-center justify-center rounded-[10px] border border-line px-4 py-2 text-[0.85rem] font-semibold text-ink-2 transition hover:border-ink-3 hover:text-ink ${className}`}
    >
      Salir
    </button>
  )
}

function NavInicio() {
  const { usuario, cerrarSesion } = useAuth()
  const tipo = usuario?.tipo
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [conFondo, setConFondo] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const alHacerScroll = () => setConFondo(window.scrollY > 8)
    alHacerScroll()
    window.addEventListener('scroll', alHacerScroll, { passive: true })
    return () => window.removeEventListener('scroll', alHacerScroll)
  }, [])

  useEffect(() => {
    setMenuAbierto(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuAbierto) return undefined

    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const alPresionar = (evento) => {
      if (evento.key === 'Escape') setMenuAbierto(false)
    }
    window.addEventListener('keydown', alPresionar)

    return () => {
      document.body.style.overflow = overflowAnterior
      window.removeEventListener('keydown', alPresionar)
    }
  }, [menuAbierto])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition ${
        conFondo
          ? 'border-line bg-white/90 shadow-[0_6px_20px_-16px_rgba(13,34,64,0.5)] backdrop-blur-xl'
          : 'border-transparent bg-white/75 backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center gap-6 px-5 sm:px-8 lg:h-[72px]">
        <Link to="/" aria-label="Skilly Latam, ir al inicio" className="no-underline">
          <Logo />
        </Link>

        <div className="ml-auto hidden items-center gap-6 lg:flex xl:gap-10">
          <nav className="flex items-center gap-1" aria-label="Principal">
            {ENLACES_INICIO.map((enlace) => (
              <a key={enlace.href} href={enlace.href} className={LINK}>
                {enlace.texto}
              </a>
            ))}
            <NavLink
              to="/ayuda"
              className={({ isActive }) => `${LINK} ${isActive ? LINK_ACTIVO : ''}`}
            >
              Ayuda
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {usuario ? (
              <>
                <PanelLink tipo={tipo} />
                <span className="max-w-[150px] truncate text-[0.8rem] text-ink-3">
                  {usuario.first_name || usuario.email}
                </span>
                <BtnSalir cerrarSesion={cerrarSesion} />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-[10px] px-2 py-2 text-[0.9rem] font-semibold text-ink-2 no-underline transition hover:text-brand-blue"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/catalogo"
                  className="inline-flex items-center justify-center rounded-xl bg-brand-blue px-4 py-2.5 text-[0.9rem] font-bold text-white no-underline shadow-[0_8px_20px_-8px_rgba(43,100,240,0.7)] transition hover:-translate-y-0.5 hover:bg-brand-blue-deep"
                >
                  Explorar servicios
                </Link>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          aria-expanded={menuAbierto}
          aria-controls="menu-inicio"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          className="ml-auto grid h-11 w-11 place-items-center rounded-xl border border-line bg-white lg:hidden"
        >
          <Icon nombre={menuAbierto ? 'close' : 'menu'} className="h-5 w-5" />
        </button>
      </div>

      {menuAbierto && (
        <div
          id="menu-inicio"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-white p-5 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Principal móvil">
            {ENLACES_INICIO.map((enlace) => (
              <a
                key={enlace.href}
                href={enlace.href}
                onClick={() => setMenuAbierto(false)}
                className="rounded-xl px-3 py-3.5 text-[1.05rem] font-semibold text-ink-2 no-underline transition hover:bg-canvas hover:text-ink"
              >
                {enlace.texto}
              </a>
            ))}
            <Link
              to="/ayuda"
              onClick={() => setMenuAbierto(false)}
              className="rounded-xl px-3 py-3.5 text-[1.05rem] font-semibold text-ink-2 no-underline transition hover:bg-canvas hover:text-ink"
            >
              Ayuda
            </Link>
            <Link
              to="/catalogo"
              onClick={() => setMenuAbierto(false)}
              className="rounded-xl px-3 py-3.5 text-[1.05rem] font-semibold text-ink-2 no-underline transition hover:bg-canvas hover:text-ink"
            >
              Catálogo completo
            </Link>
          </nav>

          <div className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5">
            {usuario ? (
              <>
                <PanelLink tipo={tipo} onClick={() => setMenuAbierto(false)} />
                <span className="px-1 text-[0.8rem] text-ink-3">
                  {usuario.first_name || usuario.email}
                </span>
                <BtnSalir
                  cerrarSesion={cerrarSesion}
                  onClick={() => setMenuAbierto(false)}
                  className="w-full py-3 text-[0.95rem]"
                />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="rounded-xl border border-line px-4 py-3 text-center text-[0.95rem] font-semibold text-ink-2 no-underline"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/catalogo"
                  onClick={() => setMenuAbierto(false)}
                  className="rounded-xl bg-brand-blue px-4 py-3 text-center text-[0.95rem] font-bold text-white no-underline"
                >
                  Explorar servicios
                </Link>
                <Link
                  to="/postular"
                  onClick={() => setMenuAbierto(false)}
                  className="px-2 py-2 text-center text-[0.9rem] font-semibold text-ink-3 no-underline"
                >
                  Postula como profesional
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function NavApp() {
  const { usuario, cerrarSesion } = useAuth()
  const tipo = usuario?.tipo
  const [menuAbierto, setMenuAbierto] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuAbierto(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuAbierto) return undefined

    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const alPresionar = (evento) => {
      if (evento.key === 'Escape') setMenuAbierto(false)
    }
    window.addEventListener('keydown', alPresionar)

    return () => {
      document.body.style.overflow = overflowAnterior
      window.removeEventListener('keydown', alPresionar)
    }
  }, [menuAbierto])

  const enlaces = [
    { to: '/catalogo', texto: 'Servicios' },
    ...(tipo === 'organizacion' ? [{ to: '/mis-reservas', texto: 'Mis reservas' }] : []),
    ...(tipo === 'profesional' ? [{ to: '/profesional/servicios', texto: 'Mi panel' }] : []),
    ...(tipo === 'admin' ? [{ to: '/admin', texto: 'Panel admin' }] : []),
    { to: '/ayuda', texto: 'Ayuda' },
  ]

  const claseEnlace = ({ isActive }) => `${LINK} ${isActive ? LINK_ACTIVO : ''}`

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center gap-6 px-5 sm:px-8 lg:h-[72px]">
        <Link to="/" aria-label="Skilly Latam, ir al inicio" className="no-underline">
          <Logo />
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Principal">
          {enlaces.map((enlace) => (
            <NavLink key={enlace.to} to={enlace.to} className={claseEnlace}>
              {enlace.texto}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          {usuario ? (
            <>
              <span className="max-w-[160px] truncate text-[0.8125rem] text-ink-3">
                {usuario.first_name || usuario.email}
              </span>
              <BtnSalir cerrarSesion={cerrarSesion} />
            </>
          ) : (
            <>
              <Link
                to="/postular"
                className="text-[0.875rem] font-semibold text-ink-2 no-underline transition hover:text-brand-blue"
              >
                Postula como profesional
              </Link>
              <Link
                to="/login"
                className="rounded-xl bg-brand-blue px-4 py-2.5 text-[0.875rem] font-bold text-white no-underline shadow-[0_8px_20px_-10px_rgba(43,100,240,0.7)] transition hover:bg-brand-blue-deep"
              >
                Iniciar sesión
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          aria-expanded={menuAbierto}
          aria-controls="menu-app"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          className="ml-auto grid h-11 w-11 place-items-center rounded-xl border border-line bg-white lg:hidden"
        >
          <Icon nombre={menuAbierto ? 'close' : 'menu'} className="h-5 w-5" />
        </button>
      </div>

      {menuAbierto && (
        <div
          id="menu-app"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-white p-5 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Principal móvil">
            {enlaces.map((enlace) => (
              <NavLink
                key={enlace.to}
                to={enlace.to}
                onClick={() => setMenuAbierto(false)}
                className="rounded-xl px-3 py-3.5 text-[1.05rem] font-semibold text-ink-2 no-underline transition hover:bg-canvas hover:text-ink"
              >
                {enlace.texto}
              </NavLink>
            ))}
          </nav>

          <div className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5">
            {usuario ? (
              <>
                <span className="px-1 text-[0.8rem] text-ink-3">
                  {usuario.first_name || usuario.email}
                </span>
                <BtnSalir
                  cerrarSesion={cerrarSesion}
                  onClick={() => setMenuAbierto(false)}
                  className="w-full py-3 text-[0.95rem]"
                />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="rounded-xl bg-brand-blue px-4 py-3 text-center text-[0.95rem] font-bold text-white no-underline"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/postular"
                  onClick={() => setMenuAbierto(false)}
                  className="px-2 py-2 text-center text-[0.9rem] font-semibold text-ink-3 no-underline"
                >
                  Postula como profesional
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default function Navbar({ variante = 'app' }) {
  if (variante === 'inicio') return <NavInicio />
  return <NavApp />
}
