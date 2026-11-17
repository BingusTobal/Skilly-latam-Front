import { Link } from 'react-router-dom'

import Icon from './Icon'
import Logo from './Logo'

const enlace =
  'text-[0.9375rem] text-[#b6c5dc] no-underline transition hover:text-white'

export default function SiteFooter() {
  const anio = new Date().getFullYear()

  return (
    <footer className="bg-navy-950 pt-16 text-[#b6c5dc]">
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-10">
          <div>
            <Link
              to="/"
              aria-label="Skilly Latam, ir al inicio"
              className="inline-block no-underline"
            >
              <Logo claro />
            </Link>
            <p className="mt-4 max-w-[34ch] text-[0.9375rem] leading-relaxed">
              Marketplace de talento independiente para PYMEs, startups y
              organizaciones.
            </p>
          </div>

          <nav aria-label="Plataforma">
            <h3 className="mb-4 text-[0.875rem] font-semibold uppercase tracking-[0.06em] text-white">
              Plataforma
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/catalogo" className={enlace}>
                  Servicios
                </Link>
              </li>
              <li>
                <a href="#como-funciona" className={enlace}>
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#profesionales" className={enlace}>
                  Para profesionales
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Ayuda">
            <h3 className="mb-4 text-[0.875rem] font-semibold uppercase tracking-[0.06em] text-white">
              Ayuda
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/ayuda" className={enlace}>
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <a href="#como-funciona" className={enlace}>
                  Pago protegido
                </a>
              </li>
              <li>
                <Link to="/postular" className={enlace}>
                  Postular como profesional
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 text-[0.875rem] font-semibold uppercase tracking-[0.06em] text-white">
              Contacto
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:hola@skillylatam.com"
                  className={`${enlace} inline-flex items-center gap-2.5`}
                >
                  <Icon
                    nombre="mail"
                    className="h-4 w-4 text-[#7ff0d3]"
                    strokeWidth={2}
                  />
                  hola@skillylatam.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-[#8ea2c0]">
                <Icon nombre="pin" className="h-4 w-4" strokeWidth={2} />
                Santiago, Chile
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-6 text-[0.875rem] text-[#8ea2c0] sm:px-8">
          © {anio} Skilly Latam. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
