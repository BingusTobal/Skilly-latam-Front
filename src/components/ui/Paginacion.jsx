import Boton from './Boton'

export default function Paginacion({
  page = 1,
  total = 0,
  tamano = 20,
  onCambiar,
  className = '',
}) {
  const paginas = Math.max(1, Math.ceil(total / tamano))
  if (paginas <= 1) return null

  return (
    <nav
      aria-label="Paginación"
      className={`mt-8 flex flex-wrap items-center justify-center gap-3 ${className}`}
    >
      <Boton
        variante="secundario"
        tamano="sm"
        disabled={page <= 1}
        onClick={() => onCambiar(-1)}
      >
        Anterior
      </Boton>
      <span className="text-[0.8125rem] font-semibold text-ink-3">
        Página {page} de {paginas}
      </span>
      <Boton
        variante="secundario"
        tamano="sm"
        disabled={page >= paginas}
        onClick={() => onCambiar(1)}
      >
        Siguiente
      </Boton>
    </nav>
  )
}
