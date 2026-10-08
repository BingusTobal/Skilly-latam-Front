import { Navigate, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import RevisionServicios from './pages/admin/RevisionServicios'
import Catalogo from './pages/organizacion/Catalogo'
import DetalleServicio from './pages/organizacion/DetalleServicio'
import Home from './pages/organizacion/Home'
import LoginRegistro from './pages/organizacion/LoginRegistro'
import MisReservas from './pages/organizacion/MisReservas'
import MisServicios from './pages/profesional/MisServicios'
import PublicarServicio from './pages/profesional/PublicarServicio'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="servicios/:id" element={<DetalleServicio />} />
        <Route path="login" element={<LoginRegistro />} />

        <Route element={<RutaProtegida tipos={['organizacion']} />}>
          <Route path="mis-reservas" element={<MisReservas />} />
        </Route>

        <Route element={<RutaProtegida tipos={['profesional']} />}>
          <Route path="profesional/servicios" element={<MisServicios />} />
          <Route path="profesional/servicios/nuevo" element={<PublicarServicio />} />
          <Route path="profesional/servicios/:id/editar" element={<PublicarServicio />} />
        </Route>

        <Route element={<RutaProtegida tipos={['admin']} />}>
          <Route path="admin/servicios" element={<RevisionServicios />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}