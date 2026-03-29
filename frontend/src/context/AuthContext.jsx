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
    email: "ponente@gmail.com",
    password: "12345678",
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
   * Registra un nuevo usuario en la base de datos a través del backend.
   */
  const register = async (userData) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: userData.nombre || userData.nombres,
          primer_apellido: userData.primer_apellido || userData.apellidos?.split(' ')[0] || '',
          segundo_apellido: userData.segundo_apellido || userData.apellidos?.split(' ').slice(1).join(' ') || '',
          email: userData.email,
          password: userData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || "Error al registrarse" };
      }
    } catch (error) {
      console.error("Error en registro:", error);
      return { success: false, message: "Error de conexión con el servidor" };
    }
  };

  /**
   * Intenta iniciar sesión. Valida contra el backend.
   */
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.nombre,
          rol: data.user.rol,
          token: data.token
        };
        setUser(userData);
        localStorage.setItem("congress_user", JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: data.message || "Credenciales incorrectas" };
      }
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, message: "Error de conexión con el servidor" };
    }
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
