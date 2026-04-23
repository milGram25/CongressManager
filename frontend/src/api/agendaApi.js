const API_URL = 'http://localhost:8000';

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
