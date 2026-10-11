import { Navigate, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import RevisionServicios from './pages/admin/RevisionServicios'
import Catalogo from './pages/organizacion/Catalogo'
import ConfirmarEntrega from './pages/organizacion/ConfirmarEntrega'
import DetalleServicio from './pages/organizacion/DetalleServicio'
import Home from './pages/organizacion/Home'
import LoginRegistro from './pages/organizacion/LoginRegistro'
import MisReservas from './pages/organizacion/MisReservas'
import DetalleReserva from './pages/organizacion/DetalleReserva'
import FormularioReserva from './pages/organizacion/FormularioReserva'
import ProgramaServicio from './pages/organizacion/ProgramaServicio'
import ActivarCuenta from './pages/organizacion/ActivarCuenta'
import SolicitarReset from './pages/organizacion/SolicitarReset'
import MisHorarios from './pages/profesional/MisHorarios'
import MisServicios from './pages/profesional/MisServicios'
import MisSolicitudes from './pages/profesional/MisSolicitudes'
import PublicarServicio from './pages/profesional/PublicarServicio'
import Solicitud from './pages/profesional/Solicitud'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="servicios/:id" element={<DetalleServicio />} />
        <Route path="servicios/:id/programar" element={<ProgramaServicio />} />
        <Route path="servicios/:id/reservar" element={<FormularioReserva />} />
        <Route path="reserva/:id" element={<DetalleReserva />} />
        <Route path="login" element={<LoginRegistro />} />
        <Route path="recuperar-password" element={<SolicitarReset />} />
        <Route path="activar-cuenta/:uid/:token" element={<ActivarCuenta />} />

        <Route element={<RutaProtegida tipos={['organizacion']} />}>
          <Route path="mis-reservas" element={<MisReservas />} />
          <Route path="reserva/:id/confirmar" element={<ConfirmarEntrega />} />
        </Route>

        <Route element={<RutaProtegida tipos={['profesional']} />}>
          <Route path="profesional/servicios" element={<MisServicios />} />
          <Route path="profesional/servicios/nuevo" element={<PublicarServicio />} />
          <Route path="profesional/servicios/:id/editar" element={<PublicarServicio />} />
          <Route path="profesional/solicitudes" element={<MisSolicitudes />} />
          <Route path="profesional/solicitudes/:id" element={<Solicitud />} />
          <Route path="profesional/horarios" element={<MisHorarios />} />
        </Route>

        <Route element={<RutaProtegida tipos={['admin']} />}>
          <Route path="admin/servicios" element={<RevisionServicios />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}