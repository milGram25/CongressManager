import { API_URL } from './constants';

export async function getEventosCongresoApi(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/congresos/${idCongreso}/eventos/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar los eventos.');
  return data;
}

export async function getMisInscripcionesApi(accessToken) {
  const res = await fetch(`${API_URL}/api/congresos/mis-inscripciones/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar las inscripciones.');
  return data;
}

export async function getAgendaHoyApi(accessToken) {
  const res = await fetch(`${API_URL}/api/congresos/agenda/hoy/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'No se pudo cargar la agenda de hoy.');
  }
  return data;
}

export async function getAgendaCalendarioApi(accessToken, month) {
  const params = new URLSearchParams({ month });
  const res = await fetch(`${API_URL}/api/congresos/agenda/calendario/?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'No se pudo cargar la agenda general.');
  }
  return data;
}
