import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SidebarLayout from "./layouts/SidebarLayout";
import AgendaView from "./views/asistentes/AgendaView";
import CatalogoView from "./views/asistentes/CatalogoView";
import PagosView from "./views/asistentes/PagosView";
import MisPonenciasView from "./views/asistentes/MisPonenciasView";
import EnviarPonenciaView from "./views/asistentes/EnviarPonenciaView";
import EstatusPonenciaView from "./views/asistentes/EstatusPonenciaView";
import ConstanciasView from "./views/asistentes/ConstanciasView";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import RevisionesView from "./views/revisores/RevisionesView";
import PlaceholderView from "./views/revisores/PlaceholderView";
import DetalleRevisionView from "./views/revisores/DetalleRevisionView";
import DetalleDictamenView from "./views/dictaminadores/DetalleDictamenView";
import DictamenesView from "./views/dictaminadores/DictamenesView";

import { GrStatusGood } from "react-icons/gr";
import {
  MdCalendarMonth,
  MdLibraryBooks,
  MdPayment,
  MdCoPresent,
  MdUploadFile,
  MdRateReview,
  MdGavel,
  MdSchool,
  MdBadge,
  MdPerson,
  MdDashboard,
  MdHistory,
} from "react-icons/md";

const AsistenteLayoutWrapper = () => {
  const { user } = useAuth();
  const menuItems = [
    ...(user?.rol === 'revisor' ? [
      { type: 'subheader', label: 'Modo Revisor', className: 'text-primary' },
      { to: '/revisor/revisiones', label: 'Panel Revisor', icon: MdRateReview, className: 'text-primary', labelClassName: 'font-bold text-primary' },
      { type: 'separator' }
    ] : []),
    ...(user?.rol === 'dictaminador' ? [
      { type: 'subheader', label: 'Modo Dictaminador', className: 'text-primary' },
      { to: '/dictaminador/dictamenes', label: 'Panel Dictaminador', icon: MdGavel, className: 'text-primary', labelClassName: 'font-bold text-primary' },
      { type: 'separator' }
    ] : []),
    { to: '/asistente/agenda', label: 'Agenda', icon: MdCalendarMonth },
    { to: '/asistente/catalogo', label: 'Catálogo', icon: MdLibraryBooks },
    { to: '/asistente/pagos', label: 'Pagos', icon: MdPayment },
    { to: '/asistente/constancias', label: 'Mis Constancias', icon: MdBadge },
    { type: 'header', label: 'Ponente' },
    { to: '/asistente/mis-ponencias', label: 'Mis Ponencias', icon: MdCoPresent },
    { to: '/asistente/enviar-ponencia', label: 'Enviar Ponencia', icon: MdUploadFile },
    { to: '/asistente/estatus-ponencia', label: 'Estatus Ponencia', icon: GrStatusGood },
  ];

  return <SidebarLayout roleTitle="Asistente" drawerId="asistente-drawer" menuItems={menuItems} MainIcon={MdSchool} />;
};

const RevisorLayoutWrapper = () => {
  const menuItems = [
    { type: 'subheader', label: 'Modo Asistente' },
    { to: '/asistente/agenda', label: 'Vista Asistente', icon: MdPerson },
    { type: 'separator' },
    { to: '/revisor/inicio', label: 'Inicio', icon: MdDashboard },
    { to: '/revisor/revisiones', label: 'Mis Revisiones', icon: MdRateReview },
    { to: '/revisor/historial', label: 'Historial', icon: MdHistory },
  ];

  return <SidebarLayout roleTitle="Revisor" drawerId="revisor-drawer" menuItems={menuItems} MainIcon={MdRateReview} />;
};

const DictaminadorLayoutWrapper = () => {
  const menuItems = [
    { type: 'subheader', label: 'Modo Asistente' },
    { to: '/asistente/agenda', label: 'Vista Asistente', icon: MdPerson },
    { type: 'separator' },
    { to: '/dictaminador/inicio', label: 'Inicio', icon: MdDashboard },
    { to: '/dictaminador/dictamenes', label: 'Mis Dictámenes', icon: MdGavel },
    { to: '/dictaminador/historial', label: 'Historial', icon: MdHistory },
  ];

  return <SidebarLayout roleTitle="Dictaminador" drawerId="dictaminador-drawer" menuItems={menuItems} MainIcon={MdGavel} />;
};

// Routea a las diferentes vistas del sistema
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública: login y registro */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas para Asistentes */}
          <Route
            path="/asistente"
            element={
              <ProtectedRoute allowedRole="asistente">
                <AsistenteLayoutWrapper />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="agenda" replace />} />
            <Route path="agenda" element={<AgendaView />} />
            <Route path="catalogo" element={<CatalogoView />} />
            <Route path="pagos" element={<PagosView />} />
            <Route path="mis-ponencias" element={<MisPonenciasView />} />
            <Route path="enviar-ponencia" element={<EnviarPonenciaView />} />
            <Route path="estatus-ponencia" element={<EstatusPonenciaView />} />
            <Route
              path="constancias"
              element={<ConstanciasView title="Mis Constancias" />}
            />
          </Route>

          {/* Rutas para Revisores */}
          <Route
            path="/revisor"
            element={
              <ProtectedRoute allowedRole="revisor">
                <RevisorLayoutWrapper />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="revisiones" replace />} />
            <Route path="inicio" element={<PlaceholderView title="Inicio" />} />
            <Route path="revisiones" element={<RevisionesView />} />
            <Route path="revision/:id" element={<DetalleRevisionView />} />
            <Route
              path="historial"
              element={<PlaceholderView title="Historial" />}
            />
          </Route>

          {/* Rutas para Dictaminadores */}
          <Route
            path="/dictaminador"
            element={
              <ProtectedRoute allowedRole="dictaminador">
                <DictaminadorLayoutWrapper />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dictamenes" replace />} />
            <Route path="inicio" element={<PlaceholderView title="Inicio" />} />
            <Route path="dictamenes" element={<DictamenesView />} />
            <Route path="dictamen/:id" element={<DetalleDictamenView />} />
            <Route
              path="historial"
              element={<PlaceholderView title="Historial" />}
            />
          </Route>

          {/* Por defecto va al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
