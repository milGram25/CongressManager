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

  // Lista de usuarios registrados (esto normalmente iría en el backend)
  const getRegisteredUsers = () => {
    const users = localStorage.getItem("registered_users");
    return users ? JSON.parse(users) : [GENERIC_USER];
  };

  /**
   * Registra un nuevo usuario en localStorage.
   */
  const register = (userData) => {
    const users = getRegisteredUsers();
    
    // Validar si el correo ya existe
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: "El correo ya está registrado." };
    }

    // Guardar nuevo usuario
    const newUsers = [...users, userData];
    localStorage.setItem("registered_users", JSON.stringify(newUsers));
    return { success: true };
  };

  /**
   * Intenta iniciar sesión. Valida contra los usuarios registrados.
   */
  const login = (email, password) => {
    const users = getRegisteredUsers();
    const foundUser = users.find(
      u => u.email.trim() === email.trim() && u.password === password
    );

    if (foundUser) {
      const userData = { 
        email: foundUser.email, 
        nombre: foundUser.nombres || foundUser.nombre, 
        rol: foundUser.rol || "asistente" 
      };
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
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de conveniencia
export function useAuth() {
  return useContext(AuthContext);
}
