import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ tipos }) {
  const { usuario, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return <p className="p-8 text-center text-sm text-gray-500">Cargando…</p>
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  if (tipos && !tipos.includes(usuario.tipo)) {
    return (
      <p className="p-8 text-center text-sm text-red-600">
        No tienes permiso para ver esta sección.
      </p>
    )
  }

  return <Outlet />
}