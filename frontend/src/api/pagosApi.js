import { API_URL } from './constants';

export async function getPagosResumenApi(accessToken) {
  const res = await fetch(`${API_URL}/api/congresos/pagos/resumen/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'No se pudo cargar el resumen de pagos.');
  }
  return data;
}

export async function registrarPagoApi(accessToken, payload = {}) {
  const res = await fetch(`${API_URL}/api/congresos/pagos/registrar/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'No se pudo registrar el pago.');
  }
  return data;
}
