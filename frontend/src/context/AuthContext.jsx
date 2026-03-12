import { createContext, useContext, useState } from "react";

// Usuario genérico para pruebas (mientras se conecta el backend)
const GENERIC_USER = {
  email: "admin@udg.mx",
  password: "admin123",
  nombre: "Usuario Demo",
  rol: "asistente",
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Inicializa desde localStorage para persistir la sesión al recargar
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("congress_user");
    return saved ? JSON.parse(saved) : null;
  });

  /**
   * Intenta iniciar sesión. Por ahora valida contra el usuario genérico.
   * Retorna true si tuvo éxito, false si las credenciales son incorrectas.
   */
  const login = (email, password) => {
    if (
      email.trim() === GENERIC_USER.email &&
      password === GENERIC_USER.password
    ) {
      const userData = { email: GENERIC_USER.email, nombre: GENERIC_USER.nombre, rol: GENERIC_USER.rol };
      setUser(userData);
      localStorage.setItem("congress_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("congress_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de conveniencia
export function useAuth() {
  return useContext(AuthContext);
}
