import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import Icon from './Icon'
import Logo from './Logo'

function EnlacePanel({ enlace, onClick }) {
  return (
    <NavLink
      to={enlace.to}
      end={enlace.fin}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] font-semibold no-underline transition ${
          isActive
            ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
            : 'text-[#aebfd8] hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <Icon
        nombre={enlace.icono || 'chevron'}
        className="h-[18px] w-[18px] shrink-0"
        strokeWidth={1.9}
      />
      <span className="truncate">{enlace.etiqueta}</span>
    </NavLink>
  )
}

export default function PanelLayout({
  secciones = [],
  titulo = 'Panel',
  subtitulo = 'Skilly Latam',
  icono = 'users',
}) {
  const { usuario, cerrarSesion } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setAbierto(false)
  }, [location.pathname])

  useEffect(() => {
    if (!abierto) return undefined

    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const alPresionar = (evento) => {
      if (evento.key === 'Escape') setAbierto(false)
    }
    window.addEventListener('keydown', alPresionar)

    return () => {
      document.body.style.overflow = overflowAnterior
      window.removeEventListener('keydown', alPresionar)
    }
  }, [abierto])

  const actual = secciones
    .filter((s) => s.to)
    .filter(
      (s) =>
        location.pathname === s.to ||
        (!s.fin && location.pathname.startsWith(`${s.to}/`)),
    )
    .sort((a, b) => b.to.length - a.to.length)[0]

  const nombre = usuario?.first_name || usuario?.email || 'Sesión'
  const inicial = (usuario?.first_name || usuario?.email || 'S').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-canvas">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-navy-950 px-4 py-5 text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            abierto ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label={titulo}
        >
          <div className="flex items-center justify-between px-2">
            <Link
              to="/"
              aria-label="Skilly Latam, ir al inicio"
              className="inline-flex no-underline"
            >
              <Logo claro compacto />
            </Link>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú"
              className="grid h-9 w-9 place-items-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <Icon nombre="close" className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-mint">
              <Icon nombre={icono} className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.9rem] font-bold text-white">{titulo}</p>
              <p className="truncate text-[0.7rem] text-[#9db3d6]">{subtitulo}</p>
            </div>
          </div>

          <nav className="mt-5 flex-1 space-y-1 overflow-y-auto" aria-label={`Navegación de ${titulo}`}>
            {secciones.map((seccion, indice) =>
              seccion.separador ? (
                <div
                  key={`separador-${indice}`}
                  className="mx-3 my-3 border-t border-white/10"
                />
              ) : (
                <EnlacePanel
                  key={seccion.to}
                  enlace={seccion}
                  onClick={() => setAbierto(false)}
                />
              ),
            )}
          </nav>

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="mb-3 flex items-center gap-2.5 px-1">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-brand-mint text-[0.75rem] font-extrabold text-white">
                {inicial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[0.8125rem] font-semibold text-white">{nombre}</p>
                <p className="truncate text-[0.6875rem] text-[#8fa6c6]">{usuario?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={cerrarSesion}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-[0.8125rem] font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              <Icon nombre="logout" className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {abierto && (
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-[2px] lg:hidden"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setAbierto(true)}
              aria-label="Abrir menú"
              className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-ink-2 lg:hidden"
            >
              <Icon nombre="menu" className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="truncate text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-3">
                {titulo}
              </p>
              <p className="truncate text-[0.9375rem] font-bold text-ink">
                {actual?.etiqueta || 'Resumen'}
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[0.8125rem] font-semibold text-ink-2 no-underline transition hover:bg-canvas hover:text-ink"
              >
                <Icon nombre="external" className="h-3.5 w-3.5" />
                Ver sitio
              </Link>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-brand-mint text-[0.75rem] font-extrabold text-white lg:hidden">
                {inicial}
              </span>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1180px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
