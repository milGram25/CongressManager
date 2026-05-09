import { API_URL } from './constants';

function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function handleResponse(res) {
  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) throw new Error(data?.detail || 'Error en la solicitud.');
  return data;
}

export async function obtenerAreasApi(token) {
  const res = await fetch(`${API_URL}/api/congresos/areas/`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function crearAreaApi(nombre, token) {
  const res = await fetch(`${API_URL}/api/congresos/areas/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ nombre }),
  });
  return handleResponse(res);
}

export async function editarAreaApi(id, nombre, token) {
  const res = await fetch(`${API_URL}/api/congresos/areas/${id}/`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ nombre }),
  });
  return handleResponse(res);
}

export async function eliminarAreaApi(id, token) {
  const res = await fetch(`${API_URL}/api/congresos/areas/${id}/`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function crearSubareaApi(areaId, nombre, token) {
  const res = await fetch(`${API_URL}/api/congresos/areas/${areaId}/subareas/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ nombre }),
  });
  return handleResponse(res);
}

export async function editarSubareaApi(id, nombre, token) {
  const res = await fetch(`${API_URL}/api/congresos/subareas/${id}/`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ nombre }),
  });
  return handleResponse(res);
}

export async function eliminarSubareaApi(id, token) {
  const res = await fetch(`${API_URL}/api/congresos/subareas/${id}/`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}
