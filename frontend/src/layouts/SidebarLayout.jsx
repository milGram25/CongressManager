import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import cienuLogo from "../assets/CIENU.jpg";
import ridmaeLogo from "../assets/ridmae.jpg";
import { MdLogout } from "react-icons/md";

export default function SidebarLayout({ 
  roleTitle, 
  drawerId, 
  menuItems, 
  MainIcon 
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const headerRef = useRef(null);

  // Intersection Observer para detectar cuando el header principal sale de la vista
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
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Determinar si estamos en una sección de ponente (específico para Asistente)
  const isPonenteSection = 
    pathname.includes('mis-ponencias') || 
    pathname.includes('enviar-ponencia') || 
    pathname.includes('estatus-ponencia') ||
    pathname.includes('subir-multimedia') ||
    pathname.includes('subir-extenso');

  const displayTitle = (roleTitle === "Asistente" && isPonenteSection) ? "Ponente" : roleTitle;

  const closeDrawer = () => {
    const drawerCheckbox = document.getElementById(drawerId);
    if (drawerCheckbox) {
      drawerCheckbox.checked = false;
    }
  };

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200 text-base-content">
      <input id={drawerId} type="checkbox" className="drawer-toggle" />

      {/* Vista principal */}
      <div className="drawer-content flex bg-base-100 flex-col p-6 md:p-10 relative overflow-y-auto">
        <header ref={headerRef} className="flex items-center gap-6 border-b border-base-300 pb-4 mb-8">
          {/* Menu desplegable en móvil */}
          <label
            htmlFor={drawerId}
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

        <main className="flex-1 w-full max-w-5xl mx-auto pb-24">
          <Outlet />
        </main>

        <div className="mt-auto pt-4 border-t border-base-200 flex justify-between items-end w-full ">
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
          htmlFor={drawerId}
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        {/* Contenedor del sidebar */}
        <div className="bg-base-100 text-base-content min-h-full w-64 p-6 border-r border-base-200 lg:border-none lg:bg-transparent flex flex-col">
          {/* Título dinámico en el Sidebar para Desktop */}
          <div className="hidden lg:flex h-[88px] items-center px-4 overflow-hidden relative">
            <div className={`transition-all duration-500 transform ${isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} absolute`}>
               {MainIcon && <MainIcon className="text-5xl text-primary animate-bounce" title="¡Bienvenido!" />}
            </div>
            <div className={`transition-all duration-500 transform ${!isHeaderVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
               <h2 className="text-3xl font-bold text-base-content">{displayTitle}</h2>
            </div>
          </div>

          {/* Links de navegación */}
          <nav className="flex flex-col space-y-1 mt-4 lg:mt-0">
            {menuItems.map((item, index) => {
              if (item.type === 'header') {
                return (
                  <div key={index} className="pt-4 pb-2">
                    <span className="px-4 text-xs font-semibold uppercase opacity-50 tracking-wider">
                      {item.label}
                    </span>
                  </div>
                );
              }
              if (item.type === 'subheader') {
                return (
                  <div key={index} className="pt-2 pb-2">
                    <span className={`px-4 text-[10px] font-bold uppercase tracking-widest opacity-80 ${item.className || 'text-primary'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              }
              if (item.type === 'role-icons') {
                const fitsFull = item.roles.length === 1;
                return (
                  <div key={index} className={`flex ${fitsFull ? 'flex-col' : 'items-center gap-2'} px-2 py-2 mb-2`}>
                    {item.roles.map((role, rIdx) => {
                      const RoleIcon = role.icon;
                      const isActiveRole = pathname.includes(role.to.split('/')[1]);
                      
                      if (fitsFull) {
                        return (
                          <NavLink
                            key={rIdx}
                            to={role.to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                              isActiveRole 
                                ? "bg-primary text-base-100 shadow-md" 
                                : "bg-base-200 text-base-content/70 hover:bg-primary/10 hover:text-primary"
                            }`}
                            onClick={closeDrawer}
                          >
                            <RoleIcon className="text-xl" />
                            <span>{role.label}</span>
                          </NavLink>
                        );
                      }

                      return (
                        <NavLink
                          key={rIdx}
                          to={role.to}
                          className={`group flex items-center justify-center h-10 rounded-full transition-all duration-500 ease-in-out overflow-hidden ${
                            isActiveRole 
                              ? "bg-primary text-base-100 px-4 min-w-[130px]" 
                              : "bg-base-200 text-base-content/70 hover:bg-primary/10 hover:text-primary px-3 hover:px-4 hover:min-w-[130px]"
                          }`}
                          onClick={closeDrawer}
                        >
                          <RoleIcon className={`text-xl flex-shrink-0 ${isActiveRole ? '' : 'group-hover:scale-110'} transition-transform`} />
                          <span className={`whitespace-nowrap ml-2 text-xs font-bold transition-all duration-500 opacity-0 group-hover:opacity-100 ${isActiveRole ? 'opacity-100 block' : 'max-w-0 group-hover:max-w-[110px]'}`}>
                            {role.label}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                );
              }
              
              const Icon = item.icon;
              const isSubItem = item.className?.includes('pl-9');
              const isSubSubItem = item.className?.includes('pl-14');
              
              return (
                <NavLink
                  key={index}
                  to={item.to}
                  className={({ isActive }) => {
                    const baseClasses = `group block px-4 py-2 rounded-xl text-sm transition-all duration-200 relative ${item.className || ''}`;
                    const isSub = isSubItem || isSubSubItem;
                    
                    if (isActive) {
                      return `${baseClasses} ${
                        isSub 
                          ? "bg-primary/10 text-primary font-semibold" 
                          : "bg-primary text-base-100 font-semibold shadow-sm"
                      } ${isSubItem ? 'py-1.5' : ''} ${isSubSubItem ? 'py-1' : ''}`;
                    }
                    
                    return `${baseClasses} hover:bg-base-200/50 text-base-content/70 hover:text-base-content ${
                      isSubItem ? 'py-1.5' : ''
                    } ${isSubSubItem ? 'py-1' : ''}`;
                  }}
                  onClick={closeDrawer}
                >
                  {({ isActive }) => (
                    <div className="flex items-center gap-3">
                      {Icon && (
                        <Icon className={`transition-transform duration-200 group-hover:scale-110 ${
                          isSubSubItem ? 'text-base' : 'text-lg'
                        } ${isActive ? '' : 'opacity-70'}`} />
                      )}
                      
                      <span className={`truncate ${item.labelClassName || ''} ${
                        isSubSubItem ? 'text-[13px]' : ''
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Pie del sidebar: usuario + cerrar sesión */}
          <div className="mt-auto pt-4 border-t border-base-300">
            <p className="text-xs text-base-content/40 px-4 mb-2 truncate">{user?.nombre}</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-full text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <MdLogout className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
