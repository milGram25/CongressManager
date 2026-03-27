import { createContext, useContext, useState } from "react";

// Usuarios genéricos para pruebas (mientras se conecta el backend)
const GENERIC_USERS = [
  {
    email: "admin@udg.mx",
    password: "admin123",
    nombre: "Administrador del Sistema",
    rol: "administrador",
  },
  {
    email: "asistente@udg.mx",
    password: "asistente123",
    nombre: "Usuario Demo Asistente",
    rol: "asistente",
  },
  {
    email: "revisor@udg.mx",
    password: "revisor123",
    nombre: "Usuario Demo Revisor",
    rol: "revisor",
  },
  {
    email: "dictaminador@udg.mx",
    password: "dictaminador123",
    nombre: "Usuario Demo Dictaminador",
    rol: "dictaminador",
  },
  {
    email: "ponente@udg.mx",
    password: "ponente123",
    nombre: "Usuario Demo Ponente",
    rol: "ponente",
  }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Inicializa desde localStorage para persistir la sesión al recargar
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("congress_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Lista de usuarios registrados (esto normalmente iría en el backend)
  const getRegisteredUsers = () => {
    const savedUsers = localStorage.getItem("registered_users");
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    
    // Combinamos con los usuarios genéricos asegurando que no haya duplicados por email
    const allUsers = [...GENERIC_USERS];
    users.forEach(u => {
      if (!allUsers.find(au => au.email === u.email)) {
        allUsers.push(u);
      }
    });
    return allUsers;
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
