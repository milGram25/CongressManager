import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import cienuLogo from "../../../assets/CIENU.jpg";
import ridmaeLogo from "../../../assets/ridmae.jpg";
import {
  MdDashboard,
  MdRateReview,
  MdHistory,
  MdBadge,
  MdPerson,
  MdRocketLaunch,
} from "react-icons/md";

export default function RevisorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const headerRef = useRef(null);

  // Observer para detectar si el título principal está en pantalla
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, []);

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
    const drawerCheckbox = document.getElementById("revisor-drawer");
    if (drawerCheckbox) {
      drawerCheckbox.checked = false;
    }
  };

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200 text-base-content">
      <input id="revisor-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex bg-base-100 flex-col p-6 md:p-10 relative overflow-y-auto">
        <header ref={headerRef} className="flex items-center gap-6 border-b border-gray-300 pb-4 mb-8">
          <label
            htmlFor="revisor-drawer"
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
          <h1 className="text-4xl font-bold">Revisor</h1>
        </header>

        <main className="flex-1 w-full max-w-4xl mx-auto pb-24">
          <Outlet />
        </main>

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
          htmlFor="revisor-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        <div className="bg-base-100 text-base-content min-h-full w-64 p-6 border-r border-gray-200 lg:border-none lg:bg-transparent flex flex-col">
          {/* Título dinámico en el Sidebar para Desktop */}
          <div className="hidden lg:flex h-[88px] items-center px-4 overflow-hidden relative">
            <div className={`transition-all duration-500 transform ${isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} absolute`}>
               <MdRocketLaunch className="text-5xl text-[#148f96] animate-bounce" />
            </div>
            <div className={`transition-all duration-500 transform ${!isHeaderVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
               <h2 className="text-3xl font-bold text-slate-800">Revisor</h2>
            </div>
          </div>

          <nav className="flex flex-col space-y-1 mt-4 lg:mt-0">
            {/* Acceso a Asistente (Para volver) */}
            <div className="pt-2 pb-2">
              <span className="px-4 text-[10px] font-bold uppercase text-gray-400 tracking-widest opacity-80">
                Modo Asistente
              </span>
            </div>
            <NavLink
              to="/asistente/agenda"
              className={navLinkClass}
              onClick={closeDrawer}
            >
              <div className="flex items-center gap-3">
                <MdPerson className="text-lg" />
                <span>Vista Asistente</span>
              </div>
            </NavLink>
            <div className="border-b border-gray-100 my-2 mx-4"></div>

            <NavLink
              to="/revisor/inicio"
              className={navLinkClass}
              onClick={closeDrawer}
            >
              <div className="flex items-center gap-3">
                <MdDashboard className="text-lg" />
                <span>Inicio</span>
              </div>
            </NavLink>
            <NavLink
              to="/revisor/revisiones"
              className={navLinkClass}
              onClick={closeDrawer}
            >
              <div className="flex items-center gap-3">
                <MdRateReview className="text-lg" />
                <span>Mis Revisiones</span>
              </div>
            </NavLink>
            <NavLink
              to="/revisor/historial"
              className={navLinkClass}
              onClick={closeDrawer}
            >
              <div className="flex items-center gap-3">
                <MdHistory className="text-lg" />
                <span>Historial</span>
              </div>
            </NavLink>
          </nav>

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
