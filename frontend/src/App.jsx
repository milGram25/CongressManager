import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SidebarLayout from "./layouts/SidebarLayout";
import AgendaView from "./views/asistentes/AgendaView";
import CatalogoView from "./views/asistentes/CatalogoView";
import PagosView from "./views/asistentes/PagosView";
import MisPonenciasView from "./views/asistentes/MisPonenciasView";
import EnviarPonenciaView from "./views/asistentes/EnviarPonenciaView";
import EstatusPonenciaView from "./views/asistentes/EstatusPonenciaView";
import SubirModificadoView from "./views/asistentes/SubirModificadoView";
import SubirExtensoView from "./views/asistentes/SubirExtensoView";
import SubirMultimediaView from "./views/asistentes/SubirMultimediaView";
import ConstanciasView from "./views/asistentes/ConstanciasView";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import RevisionesView from "./views/revisores/RevisionesView";
import PlaceholderView from "./views/revisores/PlaceholderView";
import DetalleRevisionView from "./views/revisores/DetalleRevisionView";
import DetalleDictamenView from "./views/dictaminadores/DetalleDictamenView";
import DictamenesView from "./views/dictaminadores/DictamenesView";
import DashboardView from "./views/admin/DashboardView";
import AdminAgendaView from "./views/admin/AgendaView";
import ProcesosView from "./views/admin/ProcesosView";
import EventosView from "./views/admin/EventosView";
import AdminPagosView from "./views/admin/PagosView";
import UsuariosView from "./views/admin/UsuariosView";
import AjustesView from "./views/admin/AjustesView";
import ProcesosResumenesView from "./views/admin/ProcesosResumenesView";
import ProcesosExtensosView from "./views/admin/ProcesosExtensosView";
import TalleresView from "./views/admin/TalleresView";
import PonenciasView from "./views/admin/PonenciasView";
import CongresosView from "./views/admin/CongresosView";
import CongresoDetallesView from "./views/admin/CongresoDetallesView";
import CongresoCrearView from "./views/admin/CongresoCrearView";
import CongresoSedeView from "./views/admin/CongresoSedeView";
import CongresoFechasView from "./views/admin/CongresoFechasView";
import CongresoTiposTrabajoView from "./views/admin/CongresoTiposTrabajoView";

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
  MdAdminPanelSettings,
  MdSettings,
  MdGroup,
  MdEvent,
  MdAssignment,
  MdGroups,
  MdAccountBalance,
  MdInfo,
  MdAddCircle,
  MdPlace,
  MdEventAvailable,
  MdWork,
  MdDescription,
  MdArticle,
  MdReceipt,
} from "react-icons/md";

const AsistenteLayoutWrapper = () => {
  const { user } = useAuth();

  const menuItems = [
    // Accesos rápidos para roles con permisos extra
    ...((user?.rol === 'administrador' || user?.rol === 'revisor' || user?.rol === 'dictaminador') ? [
      { type: 'subheader', label: 'Vistas de Rol' },
      { 
        type: 'role-icons', 
        roles: [
          ...(user?.rol === 'administrador' ? [
            { to: '/admin/dashboard', label: 'Admin', icon: MdAdminPanelSettings },
            { to: '/revisor/revisiones', label: 'Revisor', icon: MdRateReview },
            { to: '/dictaminador/dictamenes', label: 'Dictaminador', icon: MdGavel },
          ] : [
            ...(user?.rol === 'revisor' ? [{ to: '/revisor/revisiones', label: 'Revisor', icon: MdRateReview }] : []),
            ...(user?.rol === 'dictaminador' ? [{ to: '/dictaminador/dictamenes', label: 'Dictaminador', icon: MdGavel }] : []),
          ]),
        ]
      },
    ] : []),

    { to: '/asistente/agenda', label: 'Agenda', icon: MdCalendarMonth },
    { to: '/asistente/catalogo', label: 'Catálogo', icon: MdLibraryBooks },
    { to: '/asistente/pagos', label: 'Pagos', icon: MdPayment },
    { to: '/asistente/constancias', label: 'Mis Constancias', icon: MdBadge },
    { type: 'header', label: 'Ponente' },
    { to: '/asistente/enviar-ponencia', label: 'Enviar Ponencia', icon: MdUploadFile },
  ];

  return <SidebarLayout roleTitle="Asistente" drawerId="asistente-drawer" menuItems={menuItems} MainIcon={MdSchool} />;
};

const PonenteLayoutWrapper = () => {
  const { user } = useAuth();

  const menuItems = [
    // Accesos rápidos para roles con permisos extra
    ...((user?.rol === 'administrador' || user?.rol === 'revisor' || user?.rol === 'dictaminador') ? [
      { type: 'subheader', label: 'Vistas de Rol' },
      { 
        type: 'role-icons', 
        roles: [
          ...(user?.rol === 'administrador' ? [
            { to: '/admin/dashboard', label: 'Admin', icon: MdAdminPanelSettings },
            { to: '/revisor/revisiones', label: 'Revisor', icon: MdRateReview },
            { to: '/dictaminador/dictamenes', label: 'Dictaminador', icon: MdGavel },
          ] : [
            ...(user?.rol === 'revisor' ? [{ to: '/revisor/revisiones', label: 'Revisor', icon: MdRateReview }] : []),
            ...(user?.rol === 'dictaminador' ? [{ to: '/dictaminador/dictamenes', label: 'Dictaminador', icon: MdGavel }] : []),
          ]),
        ]
      },
    ] : []),

    { to: '/ponente/agenda', label: 'Agenda', icon: MdCalendarMonth },
    { to: '/ponente/catalogo', label: 'Catálogo', icon: MdLibraryBooks },
    { to: '/ponente/pagos', label: 'Pagos', icon: MdPayment },
    { to: '/ponente/constancias', label: 'Mis Constancias', icon: MdBadge },
    { type: 'header', label: 'Ponente' },
    { to: '/ponente/mis-ponencias', label: 'Mis Ponencias', icon: MdCoPresent },
    { to: '/ponente/enviar-ponencia', label: 'Enviar Ponencia', icon: MdUploadFile },
    { to: '/ponente/estatus-ponencia', label: 'Estatus Ponencia', icon: GrStatusGood },
  ];

  return <SidebarLayout roleTitle="Ponente" drawerId="ponente-drawer" menuItems={menuItems} MainIcon={MdCoPresent} />;
};

const AdminLayoutWrapper = () => {
  const { pathname } = useLocation();
  
  const menuItems = [
    { type: 'subheader', label: 'Vistas de Rol' },
    { 
      type: 'role-icons', 
      roles: [
        { to: '/asistente/agenda', label: 'Asistente', icon: MdPerson },
        { to: '/revisor/revisiones', label: 'Revisor', icon: MdRateReview },
        { to: '/dictaminador/dictamenes', label: 'Dictaminador', icon: MdGavel },
      ]
    },
    
    { to: '/admin/dashboard', label: 'Dashboard', icon: MdDashboard },
    { to: '/admin/agenda', label: 'Agenda', icon: MdCalendarMonth },
    
    // Procesos con sub-menú dinámico
    { to: '/admin/procesos', label: 'Procesos', icon: MdAssignment },
    ...(pathname.includes('/admin/procesos') ? [
      { to: '/admin/procesos/resumenes', label: 'Resúmenes', icon: MdDescription, className: 'pl-9 opacity-70' },
      { to: '/admin/procesos/extensos', label: 'Extensos', icon: MdArticle, className: 'pl-9 opacity-70' },
    ] : []),

    // Eventos con sub-menú dinámico
    { to: '/admin/eventos', label: 'Eventos', icon: MdEvent },
    ...(pathname.includes('/admin/eventos') ? [
      { to: '/admin/eventos/talleres', label: 'Talleres', icon: MdGroups, className: 'pl-9 opacity-70' },
      { to: '/admin/eventos/ponencias', label: 'Ponencias', icon: MdCoPresent, className: 'pl-9 opacity-70' },
      { to: '/admin/eventos/congresos', label: 'Congresos', icon: MdAccountBalance, className: 'pl-9 opacity-70' },
      // Sub-sub menú de Congresos
      ...(pathname.includes('/admin/eventos/congresos') ? [
        { to: '/admin/eventos/congresos/detalles', label: 'Detalles', icon: MdInfo, className: 'pl-14 opacity-60' },
        { to: '/admin/eventos/congresos/crear', label: 'Crear', icon: MdAddCircle, className: 'pl-14 opacity-60' },
        { to: '/admin/eventos/congresos/sede', label: 'Sede', icon: MdPlace, className: 'pl-14 opacity-60' },
        { to: '/admin/eventos/congresos/fechas', label: 'Fechas', icon: MdEventAvailable, className: 'pl-14 opacity-60' },
        { to: '/admin/eventos/congresos/tipos-trabajo', label: 'Tipos Trabajo', icon: MdWork, className: 'pl-14 opacity-60' },
      ] : [])
    ] : []),

    { to: '/admin/pagos', label: 'Pagos', icon: MdPayment },
    { to: '/admin/usuarios', label: 'Usuarios', icon: MdGroup },
    ...(pathname.includes('/admin/usuarios') ? [
      { to: '/admin/usuarios/constancias', label: 'Constancias', icon: MdBadge, className: 'pl-9 opacity-70' },
      { to: '/admin/usuarios/facturas', label: 'Facturas', icon: MdReceipt, className: 'pl-9 opacity-70' },
      { to: '/admin/usuarios/historial', label: 'Historial', icon: MdHistory, className: 'pl-9 opacity-70' },
    ] : []),
    { to: '/admin/ajustes', label: 'Configuración', icon: MdSettings },
    ...(pathname.includes('/admin/ajustes') ? [
      { to: '/admin/ajustes/instituciones', label: 'Instituciones', icon: MdAccountBalance, className: 'pl-9 opacity-70' },
      { to: '/admin/ajustes/areas', label: 'Áreas', icon: MdWork, className: 'pl-9 opacity-70' },
    ] : []),
  ];

  return <SidebarLayout roleTitle="Administrador" drawerId="admin-drawer" menuItems={menuItems} MainIcon={MdAdminPanelSettings} />;
};

const RevisorLayoutWrapper = () => {
  const { user } = useAuth();
  const menuItems = [
    { type: 'subheader', label: 'Vistas de Rol' },
    { 
      type: 'role-icons', 
      roles: [
        ...(user?.rol === 'administrador' ? [
          { to: '/admin/dashboard', label: 'Admin', icon: MdAdminPanelSettings },
          { to: '/asistente/agenda', label: 'Asistente', icon: MdPerson },
          { to: '/dictaminador/dictamenes', label: 'Dictaminador', icon: MdGavel },
        ] : [
          { to: '/asistente/agenda', label: 'Asistente', icon: MdPerson },
        ]),
      ]
    },
    { to: '/revisor/inicio', label: 'Inicio', icon: MdDashboard },
    { to: '/revisor/revisiones', label: 'Mis Revisiones', icon: MdRateReview },
    { to: '/revisor/historial', label: 'Historial', icon: MdHistory },
  ];

  return <SidebarLayout roleTitle="Revisor" drawerId="revisor-drawer" menuItems={menuItems} MainIcon={MdRateReview} />;
};

const DictaminadorLayoutWrapper = () => {
  const { user } = useAuth();
  const menuItems = [
    { type: 'subheader', label: 'Vistas de Rol' },
    { 
      type: 'role-icons', 
      roles: [
        ...(user?.rol === 'administrador' ? [
          { to: '/admin/dashboard', label: 'Admin', icon: MdAdminPanelSettings },
          { to: '/asistente/agenda', label: 'Asistente', icon: MdPerson },
          { to: '/revisor/revisiones', label: 'Revisor', icon: MdRateReview },
        ] : [
          { to: '/asistente/agenda', label: 'Asistente', icon: MdPerson },
        ]),
      ]
    },
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
            <Route path="enviar-ponencia" element={<EnviarPonenciaView />} />
            <Route
              path="constancias"
              element={<ConstanciasView title="Mis Constancias" />}
            />
          </Route>

          {/* Rutas para Ponentes */}
          <Route
            path="/ponente"
            element={
              <ProtectedRoute allowedRole="ponente">
                <PonenteLayoutWrapper />
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
            <Route path="subir-multimedia" element={<SubirMultimediaView />} />
            <Route path="subir-correccion" element={<SubirModificadoView />} />
            <Route path="subir-extenso" element={<SubirExtensoView />} />
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

          {/* Rutas para Administradores */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="administrador">
                <AdminLayoutWrapper />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="agenda" element={<AdminAgendaView />} />
            <Route path="procesos">
              <Route index element={<ProcesosView />} />
              <Route path="resumenes" element={<ProcesosResumenesView />} />
              <Route path="extensos" element={<ProcesosExtensosView />} />
            </Route>
            <Route path="eventos">
              <Route index element={<EventosView />} />
              <Route path="talleres" element={<TalleresView />} />
              <Route path="ponencias" element={<PonenciasView />} />
              <Route path="congresos">
                <Route index element={<CongresosView />} />
                <Route path="detalles" element={<CongresoDetallesView />} />
                <Route path="crear" element={<CongresoCrearView />} />
                <Route path="sede" element={<CongresoSedeView />} />
                <Route path="fechas" element={<CongresoFechasView />} />
                <Route path="tipos-trabajo" element={<CongresoTiposTrabajoView />} />
              </Route>
            </Route>
            <Route path="pagos" element={<AdminPagosView />} />
            <Route path="usuarios">
              <Route index element={<UsuariosView />} />
              <Route path="constancias" element={<PlaceholderView title="Constancias de Usuarios" />} />
              <Route path="facturas" element={<PlaceholderView title="Facturas de Usuarios" />} />
              <Route path="historial" element={<PlaceholderView title="Historial de Usuarios" />} />
            </Route>
            <Route path="ajustes">
              <Route index element={<AjustesView />} />
              <Route path="instituciones" element={<PlaceholderView title="Gestión de Instituciones" />} />
              <Route path="areas" element={<PlaceholderView title="Gestión de Áreas" />} />
            </Route>
          </Route>

          {/* Por defecto va al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
