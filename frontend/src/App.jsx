import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AsistenteLayout from "./layouts/SidebarLayout";
import AgendaView from "./views/asistentes/AgendaView";
import CatalogoView from "./views/asistentes/CatalogoView";
import PagosView from "./views/asistentes/PagosView";
import MisPonenciasView from "./views/asistentes/MisPonenciasView";
import EnviarPonenciaView from "./views/asistentes/EnviarPonenciaView";
import EstatusPonenciaView from "./views/asistentes/EstatusPonenciaView";
import ConstanciasView from "./views/asistentes/ConstanciasView";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import RevisorLayout from "./views/revisores/layouts/MainLayout";
import RevisionesView from "./views/revisores/RevisionesView";
import PlaceholderView from "./views/revisores/PlaceholderView";
import DetalleRevisionView from "./views/revisores/DetalleRevisionView";
import DictaminadorLayout from "./views/dictaminadores/layouts/MainLayout";
import DetalleDictamenView from "./views/dictaminadores/DetalleDictamenView";
import DictamenesView from "./views/dictaminadores/DictamenesView";

// Routea a las diferentes vistas del sistema
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública: login y registro */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="agenda" element={<AgendaView />} />
          <Route path="catalogo" element={<CatalogoView />} />
          <Route path="pagos" element={<PagosView />} />
          <Route path="mis-ponencias" element={<MisPonenciasView />} />
          <Route path="enviar-ponencia" element={<EnviarPonenciaView />} />
          <Route path="estatus-ponencia" element={<EstatusPonenciaView />} />
          {/* Rutas para Asistentes */}
          <Route
            path="/asistente"
            element={
              <ProtectedRoute allowedRoles={["asistente", "ponente"]}>
                <AsistenteLayout />
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
                <RevisorLayout />
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
                <DictaminadorLayout />
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
