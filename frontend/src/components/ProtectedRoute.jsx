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

  // Si se pasa una lista de roles permitidos
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
     // Los revisores y dictaminadores tienen permiso de ver la sección de asistente también
     const isSpecialRole = user.rol === 'revisor' || user.rol === 'dictaminador' || user.rol === 'ponente';
     if (isSpecialRole && allowedRoles.includes('asistente')) {
       return children;
     }
     return <Navigate to="/asistente" replace />;
  }

  // Si se pasa un solo rol permitido (retrocompatibilidad)
  if (allowedRole && user.rol !== allowedRole) {
    const isSpecialRole = user.rol === 'revisor' || user.rol === 'dictaminador' || user.rol === 'ponente';
    if (isSpecialRole && allowedRole === 'asistente') {
      return children;
    }
    return <Navigate to="/asistente" replace />;
  }

  return children;
}
