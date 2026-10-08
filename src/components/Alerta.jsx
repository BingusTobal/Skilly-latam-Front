export default function Alerta({ tipo = 'error', children }) {
  if (!children) return null
  const estilos = {
    error: 'border-red-300 bg-red-50 text-red-700',
    exito: 'border-green-300 bg-green-50 text-green-700',
    info: 'border-amber-300 bg-amber-50 text-amber-800',
  }
  return (
    <div className={`border px-3 py-2 text-[12.5px] ${estilos[tipo]}`} role="alert">
      {children}
    </div>
  )
}