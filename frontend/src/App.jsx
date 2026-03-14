import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AsistenteLayout from "./views/asistentes/layouts/MainLayout";
import AgendaView from "./views/asistentes/AgendaView";
import CatalogoView from "./views/asistentes/CatalogoView";
import PagosView from "./views/asistentes/PagosView";
import MisPonenciasView from "./views/asistentes/MisPonenciasView";
import EnviarPonenciaView from "./views/asistentes/EnviarPonenciaView";
import EstatusPonenciaView from "./views/asistentes/EstatusPonenciaView";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import RevisorLayout from "./views/revisores/layouts/MainLayout";
import RevisionesView from "./views/revisores/RevisionesView";
import PlaceholderView from "./views/revisores/PlaceholderView";
import DetalleRevisionView from "./views/revisores/DetalleRevisionView";

// Routea a las diferentes vistas del sistema
function App() {
  return (
    // Definicion de rutas
    <BrowserRouter>
      {/* Rutas "root" ej. https:asdf.com/{root} */}
      <Routes>
        {/* Rutas sub asistente ej. https:asdf.com/asistente/{subruta} */}
        {/* Estas rutasa se encutran dentro de la carpeta views/asistentes */}
        <Route path="/asistente" element={<AsistenteLayout />}>
          <Route index element={<Navigate to="agenda" replace />} />

          <Route path="agenda" element={<AgendaView />} />
          <Route path="catalogo" element={<CatalogoView />} />
          <Route path="pagos" element={<PagosView />} />
          <Route path="mis-ponencias" element={<MisPonenciasView />} />
          <Route path="enviar-ponencia" element={<EnviarPonenciaView />} />
          <Route path="estatus-ponencia" element={<EstatusPonenciaView />} />
        </Route>
          {/* Rutas para Asistentes */}
          <Route
            path="/asistente"
            element={
              <ProtectedRoute allowedRole="asistente">
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
          </Route>

        {/* Por defecto va a asistente hasta que tengamos algo mas */}
        <Route path="*" element={<Navigate to="/asistente/catalogo" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
