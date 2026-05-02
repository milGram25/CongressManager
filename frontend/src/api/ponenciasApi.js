import { API_URL } from './constants';

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

export async function getMiAgendaApi(accessToken) {
  const res = await fetch(`${API_URL}/api/ponencias/mi-agenda/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Error al cargar tu agenda.');
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

export async function getResumenesCongreso(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/ponencias/resumenes/?id_congreso=${idCongreso}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error cargando resúmenes');
  return res.json();
}

export async function getExtensosCongreso(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/ponencias/extensos/?id_congreso=${idCongreso}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error cargando extensos');
  return res.json();
}

export async function asignarDictaminadorApi(accessToken, idResumen, idDictaminador) {
  const res = await fetch(`${API_URL}/api/ponencias/resumenes/${idResumen}/asignar/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_dictaminador: idDictaminador }),
  });
  if (!res.ok) throw new Error('Error asignando dictaminador');
  return res.json();
}

export async function asignarEvaluadorApi(accessToken, idExtenso, idEvaluador) {
  const res = await fetch(`${API_URL}/api/ponencias/extensos/${idExtenso}/asignar/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_evaluador: idEvaluador }),
  });
  if (!res.ok) throw new Error('Error asignando evaluador');
  return res.json();
}
