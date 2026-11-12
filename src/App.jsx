import { Navigate, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import RutaProtegida from './components/RutaProtegida'
import AdminLayout from './components/admin/AdminLayout'
import Comisiones from './pages/admin/Comisiones'
import DetallePostulacion from './pages/admin/DetallePostulacion'
import Disputas from './pages/admin/Disputas'
import GananciasMes from './pages/admin/GananciasMes'
import HistorialOrganizacion from './pages/admin/HistorialOrganizacion'
import Organizaciones from './pages/admin/Organizaciones'
import Postulaciones from './pages/admin/Postulaciones'
import Profesionales from './pages/admin/Profesionales'
import Resumen from './pages/admin/Resumen'
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
import ResultadoPago from './pages/organizacion/ResultadoPago'
import ActivarCuenta from './pages/organizacion/ActivarCuenta'
import SolicitarReset from './pages/organizacion/SolicitarReset'
import MiPostulacion from './pages/profesional/MiPostulacion'
import MisHorarios from './pages/profesional/MisHorarios'
import MisServicios from './pages/profesional/MisServicios'
import MisSolicitudes from './pages/profesional/MisSolicitudes'
import Postular from './pages/profesional/Postular'
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
        <Route path="pago/resultado" element={<ResultadoPago />} />
        <Route path="login" element={<LoginRegistro />} />
        <Route path="postular" element={<Postular />} />
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
          <Route path="profesional/postulacion" element={<MiPostulacion />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route element={<RutaProtegida tipos={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<Resumen />} />
          <Route path="admin/postulaciones" element={<Postulaciones />} />
          <Route path="admin/postulaciones/:id" element={<DetallePostulacion />} />
          <Route path="admin/disputas" element={<Disputas />} />
          <Route path="admin/profesionales" element={<Profesionales />} />
          <Route path="admin/organizaciones" element={<Organizaciones />} />
          <Route
            path="admin/organizaciones/:id"
            element={<HistorialOrganizacion />}
          />
          <Route path="admin/comisiones" element={<Comisiones />} />
          <Route path="admin/comisiones/ganancias" element={<GananciasMes />} />
          <Route path="admin/servicios" element={<RevisionServicios />} />
        </Route>
      </Route>
    </Routes>
  )
}