import { API_URL } from './constants';

/**
 * Inicia sesión con email y password.
 * Devuelve { user, access, refresh } o lanza un error con mensaje.
 */
export async function loginApi(email, password) {
  try {
    const res = await fetch(`${API_URL}/api/users/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Error al iniciar sesión.');
    }
    return data; // { user, access, refresh }
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en ' + API_URL);
    }
    throw error;
  }
}

/**
 * Registra un usuario nuevo.
 * Devuelve { user, access, refresh } o lanza un error con los mensajes de validación.
 */
export async function registerApi(formData) {
  const res = await fetch(`${API_URL}/api/users/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) {
    // Convertir errores del serializer a un string legible
    const messages = Object.entries(data)
      .map(([field, errors]) => {
        const label = field === 'email' ? 'Correo'
          : field === 'password' ? 'Contraseña'
          : field === 'detail' ? ''
          : field;
        const msgs = Array.isArray(errors) ? errors.join(' ') : errors;
        return label ? `${label}: ${msgs}` : msgs;
      })
      .join(' | ');
    throw new Error(messages || 'Error al registrar el usuario.');
  }
  return data; // { user, access, refresh }
}

/**
 * Obtiene los datos del usuario actual a partir del access token guardado.
 */
export async function getMeApi(accessToken) {
  try {
    const res = await fetch(`${API_URL}/api/users/me/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Sesión expirada.');
    return res.json(); // datos del usuario
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Error de conexión con el servidor.');
    }
    throw error;
  }
}

/**
 * Renueva el access token usando el refresh token.
 */
export async function refreshTokenApi(refreshToken) {
  const res = await fetch(`${API_URL}/api/users/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('No se pudo renovar la sesión.');
  return data.access;
}
