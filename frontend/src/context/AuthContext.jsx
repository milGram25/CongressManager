import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, registerApi, getMeApi } from "../api/authApi";

const AuthContext = createContext(null);

/** Mapea roles del backend al formato que usa el frontend para rutas */
function mapRol(rolBackend) {
  if (rolBackend === 'admin') return 'administrador';
  return rolBackend; // asistente, revisor, dictaminador
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // cargando sesión inicial

  // Al montar, intentar restaurar sesión desde el access token guardado
  useEffect(() => {
    const accessToken = localStorage.getItem("congress_access");
    if (!accessToken) {
      setAuthLoading(false);
      return;
    }
    getMeApi(accessToken)
      .then((userData) => {
        setUser({ ...userData, rol: mapRol(userData.rol) });
      })
      .catch(() => {
        // Token expirado o inválido — limpiar sesión
        localStorage.removeItem("congress_access");
        localStorage.removeItem("congress_refresh");
      })
      .finally(() => setAuthLoading(false));
  }, []);

  /**
   * Inicia sesión con el backend. Devuelve true si tuvo éxito, lanza un Error si falla.
   */
  const login = async (email, password) => {
    const data = await loginApi(email, password); // puede lanzar Error
    localStorage.setItem("congress_access", data.access);
    localStorage.setItem("congress_refresh", data.refresh);
    setUser({ ...data.user, rol: mapRol(data.user.rol) });
    return data.user;
  };

  /**
   * Registra un usuario en el backend. Devuelve { success: true } o { success: false, message }.
   */
  const register = async (formData) => {
    try {
      const data = await registerApi(formData);
      // Auto-login tras registro exitoso
      localStorage.setItem("congress_access", data.access);
      localStorage.setItem("congress_refresh", data.refresh);
      setUser({ ...data.user, rol: mapRol(data.user.rol) });
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("congress_access");
    localStorage.removeItem("congress_refresh");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de conveniencia
export function useAuth() {
  return useContext(AuthContext);
}
