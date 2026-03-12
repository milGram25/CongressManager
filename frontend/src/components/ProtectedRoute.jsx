import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Envuelve rutas que requieren autenticación y opcionalmente un rol específico.
 * Si no hay sesión activa, redirige al login.
 * Si el rol no coincide, redirige a una página por defecto (asistente).
 */
export default function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.rol !== allowedRole) {
    return <Navigate to="/asistente" replace />;
  }

  return children;
}
