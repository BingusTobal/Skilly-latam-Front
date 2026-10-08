import { Link } from 'react-router-dom'

export default function MisReservas() {
  return (
    <div className="py-10 text-center">
      <h1 className="text-[20px] font-bold">Mis reservas</h1>
      <p className="mt-2 text-[13px] text-gray-500">
        El flujo de reserva y pago en custodia se habilitará en el siguiente sprint.
      </p>
      <Link to="/catalogo" className="mt-4 inline-block text-[13px] underline">
        Explorar el catálogo
      </Link>
    </div>
  )
}