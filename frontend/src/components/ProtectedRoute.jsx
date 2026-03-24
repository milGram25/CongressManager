import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Envuelve rutas que requieren autenticación y opcionalmente un rol específico.
 * Si no hay sesión activa, redirige al login.
 */
export default function ProtectedRoute({ children, allowedRole, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Los administradores tienen acceso a todo
  if (user.rol === 'administrador') {
    return children;
  }

  // Si se pasa una lista de roles permitidos
  if (allowedRoles) {
    if (allowedRoles.includes(user.rol)) {
      return children;
    }
    
    // Casos especiales: Revisores, dictaminadores y ponentes pueden ver la sección de asistente
    const isSpecialRole = user.rol === 'revisor' || user.rol === 'dictaminador' || user.rol === 'ponente';
    if (isSpecialRole && allowedRoles.includes('asistente')) {
      return children;
    }
    
    return <Navigate to="/asistente" replace />;
  }

  // Si se pasa un solo rol permitido (retrocompatibilidad)
  if (allowedRole) {
    if (user.rol === allowedRole) {
      return children;
    }

    // Casos especiales para rol único
    const isSpecialRole = user.rol === 'revisor' || user.rol === 'dictaminador' || user.rol === 'ponente';
    if (isSpecialRole && allowedRole === 'asistente') {
      return children;
    }
    
    return <Navigate to="/asistente" replace />;
  }

  return children;
}
