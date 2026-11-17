import { iniciales } from '../../lib/categorias'

const TAMANOS = {
  sm: 'h-8 w-8 text-[0.625rem]',
  md: 'h-10 w-10 text-[0.75rem]',
  lg: 'h-14 w-14 text-[0.9rem]',
  xl: 'h-20 w-20 text-[1.15rem]',
}

const FONDOS = [
  'from-brand-blue to-brand-violet',
  'from-brand-mint to-brand-blue',
  'from-brand-violet to-brand-pink',
  'from-brand-coral to-brand-amber',
]

function fondoPara(nombre) {
  let suma = 0
  for (let i = 0; i < (nombre || '').length; i += 1) suma += nombre.charCodeAt(i)
  return FONDOS[suma % FONDOS.length]
}

export default function Avatar({
  nombre = '',
  foto,
  tamano = 'md',
  className = '',
}) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-linear-to-br font-extrabold text-white ${
        TAMANOS[tamano] || TAMANOS.md
      } ${fondoPara(nombre)} ${className}`}
      title={nombre || undefined}
    >
      {foto ? (
        <img src={foto} alt={nombre ? `Foto de ${nombre}` : ''} className="h-full w-full object-cover" />
      ) : (
        iniciales(nombre) || '—'
      )}
    </span>
  )
}
