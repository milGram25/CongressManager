const API_URL = 'http://localhost:8000';

/**
 * Registra al asistente actual en una ponencia (evento).
 */
export async function registrarPonenciaApi(idEvento, accessToken) {
  const res = await fetch(`${API_URL}/api/ponencias/registrar/`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ id_evento: idEvento }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.detail || 'Error al registrarse en la ponencia.');
  }
  return data;
}

/**
 * Obtiene el listado de ponencias disponibles para el catálogo.
 */
export async function obtenerCatalogoApi(accessToken) {
  const res = await fetch(`${API_URL}/api/ponencias/catalogo/`, {
    method: 'GET',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.detail || 'Error al cargar el catálogo.');
  }
  return data;
}
