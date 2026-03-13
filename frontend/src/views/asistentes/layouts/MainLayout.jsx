import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import cienuLogo from "../../../assets/CIENU.jpg";
import ridmaeLogo from "../../../assets/ridmae.jpg";
import {
  MdCalendarMonth,
  MdLibraryBooks,
  MdPayment,
  MdCoPresent,
  MdUploadFile,
  MdRateReview,
  MdGavel,
} from "react-icons/md";

export default function AsistenteLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Determinar si estamos en una sección de ponente
  const isPonenteSection = 
    pathname.includes('mis-ponencias') || 
    pathname.includes('enviar-ponencia') || 
    pathname.includes('estatus-ponencia') ||
    pathname.includes('subir-multimedia') ||
    pathname.includes('subir-extenso');

  const displayTitle = isPonenteSection ? "Ponente" : "Asistente";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Estilo para vista activa
  const navLinkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-full text-sm transition-colors ${
      isActive
        ? "bg-primary text-base-100 font-medium"
        : "hover:bg-base-200 text-base-content opacity-80"
    }`;

  const closeDrawer = () => {
    const drawerCheckbox = document.getElementById("asistente-drawer");
    if (drawerCheckbox) {
      drawerCheckbox.checked = false;
    }
  };

  return (
    // Clase de daisy para la side bar
    <div className="drawer lg:drawer-open min-h-screen bg-base-200 text-base-content">
      {/* controla estado de la barra lateral */}
      <input id="asistente-drawer" type="checkbox" className="drawer-toggle" />

      {/*  Vista principal  */}
      <div className="drawer-content flex bg-base-100 flex-col p-6 md:p-10 relative">
        {/* Header */}
        <header className="flex items-center gap-6 border-b border-gray-300 pb-4 mb-8">
          {/* menu desplegable en mobil */}
          <label
            htmlFor="asistente-drawer"
            className="p-2 hover:bg-base-200 rounded-lg transition-colors cursor-pointer lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </label>
          <h1 className="text-4xl font-bold">{displayTitle}</h1>
        </header>

        {/* Vista Dinamica Cambiante */}
        <main className="flex-1 w-full max-w-4xl mx-auto pb-24">
          <Outlet />
        </main>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-end w-full ">
          <img
            src={cienuLogo}
            alt="Logo CIENU"
            className="h-12 w-auto object-contain"
          />
          <img
            src={ridmaeLogo}
            alt="Logo RIDMAE"
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>

      <div className="drawer-side z-50">
        <label
          htmlFor="asistente-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        {/* contenedor de la barra  */}
        <div className="bg-base-100 text-base-content min-h-full w-64 p-6 border-r border-gray-200 lg:border-none lg:bg-transparent flex flex-col">
          {/* Título en el Sidebar para Desktop */}
          <div className="hidden lg:flex h-[88px] items-center px-4">
            <h2 className="text-3xl font-bold text-slate-800">{displayTitle}</h2>
          </div>

          {/* links de navegacion */}
          <nav className="flex flex-col space-y-1 mt-4 lg:mt-0">
            {/* Acceso a Revisor (Solo si tiene el rol) */}
            {user?.rol === 'revisor' && (
              <>
                <div className="pt-2 pb-2">
                  <span className="px-4 text-[10px] font-bold uppercase text-[#148f96] tracking-widest opacity-80">
                    Modo Revisor
                  </span>
                </div>
                <NavLink
                  to="/revisor/revisiones"
                  className={navLinkClass}
                  onClick={closeDrawer}
                >
                  <div className="flex items-center gap-3">
                    <MdRateReview className="text-lg text-[#148f96]" />
                    <span className="font-bold text-[#148f96]">Panel Revisor</span>
                  </div>
                </NavLink>
                <div className="border-b border-gray-100 my-2 mx-4"></div>
              </>
            )}

            {/* Acceso a Dictaminador (Solo si tiene el rol) */}
            {user?.rol === 'dictaminador' && (
              <>
                <div className="pt-2 pb-2">
                  <span className="px-4 text-[10px] font-bold uppercase text-[#148f96] tracking-widest opacity-80">
                    Modo Dictaminador
                  </span>
                </div>
                <NavLink
                  to="/dictaminador/dictamenes"
                  className={navLinkClass}
                  onClick={closeDrawer}
                >
                  <div className="flex items-center gap-3">
                    <MdGavel className="text-lg text-[#148f96]" />
                    <span className="font-bold text-[#148f96]">Panel Dictaminador</span>
                  </div>
                </NavLink>
                <div className="border-b border-gray-100 my-2 mx-4"></div>
              </>
            )}

            <NavLink
              to="/asistente/agenda"
              className={navLinkClass}
              onClick={closeDrawer}
            >
              <div className="flex items-center gap-3">
                <MdCalendarMonth className="text-lg" />
                <span>Agenda</span>
              </div>
            </NavLink>
            <NavLink
              to="/asistente/catalogo"
              className={navLinkClass}
              onClick={closeDrawer}
            >
              <div className="flex items-center gap-3">
                <MdLibraryBooks className="text-lg" />
                <span>Catálogo</span>
              </div>
            </NavLink>

            <NavLink
              to="/asistente/pagos"
              className={navLinkClass}
              onClick={closeDrawer}
            >
              <div className="flex items-center gap-3">
                <MdPayment className="text-lg" />
                <span>Pagos</span>
              </div>
            </NavLink>
            <div className="pt-4 pb-2">
              <span className="px-4 text-xs font-semibold uppercase opacity-50 tracking-wider">
                Ponente
              </span>
            </div>

            <NavLink
              to="/asistente/mis-ponencias"
              className={navLinkClass}
              onClick={closeDrawer}
            >
              <div className="flex items-center gap-3">
                <MdCoPresent className="text-lg pl-1" />
                <span>Mis Ponencias</span>
              </div>
            </NavLink>

            <NavLink
              to="/asistente/enviar-ponencia"
              className={navLinkClass}
              onClick={closeDrawer}
            >
              <div className="flex items-center gap-3">
                <MdUploadFile className="text-lg pl-1" />
                <span>Enviar Ponencia</span>
              </div>
            </NavLink>
            <NavLink
              to="/asistente/estatus-ponencia"
              className={navLinkClass}
              onClick={closeDrawer}
            >
              <div className="flex items-center gap-3">
                <MdUploadFile className="text-lg pl-1" />
                <span>Estatus Ponencia</span>
              </div>
            </NavLink>
          </nav>

          {/* Pie del sidebar: usuario + cerrar sesión */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 px-4 mb-2 truncate">{user?.nombre}</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-full text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 12H6m6-3-3 3 3 3" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
