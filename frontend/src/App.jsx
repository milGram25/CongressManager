import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AsistenteLayout from "./views/asistentes/layouts/MainLayout";
import AgendaView from "./views/asistentes/AgendaView";
import CatalogoView from "./views/asistentes/CatalogoView";
import PagosView from "./views/asistentes/PagosView";
import MisPonenciasView from "./views/asistentes/MisPonenciasView";
import EnviarPonenciaView from "./views/asistentes/EnviarPonenciaView";
import EstatusPonenciaView from "./views/asistentes/EstatusPonenciaView";
import MultimediaView from "./views/asistentes/MultimediaView";
import SubirExtensoView from "./views/asistentes/SubirExtensoView";
import Login from "./views/auth/Login";

// Routea a las diferentes vistas del sistema
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública: login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas: requieren sesión activa */}
          <Route
            path="/asistente"
            element={
              <ProtectedRoute>
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
            <Route path="subir-multimedia" element={<MultimediaView />} />
            <Route path="subir-extenso" element={<SubirExtensoView />} />
          </Route>

          {/* Por defecto va al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

