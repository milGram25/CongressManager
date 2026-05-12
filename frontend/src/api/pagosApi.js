import { API_URL } from './constants';

export async function getPagosResumenApi(accessToken, idCongreso = null) {
  const params = idCongreso ? `?id_congreso=${idCongreso}` : '';
  const res = await fetch(`${API_URL}/api/congresos/pagos/resumen/${params}`, {
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

export async function getPagosAdminApi(accessToken, idCongreso = null) {
  const params = idCongreso ? `?id_congreso=${idCongreso}` : '';
  const res = await fetch(`${API_URL}/api/congresos/pagos/lista/${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'No se pudo cargar el historial de pagos.');
  return data;
}

export async function solicitarFacturaApi(accessToken, datos) {
  const res = await fetch(`${API_URL}/api/users/facturas/solicitar/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'No se pudo enviar la solicitud de factura.');
  return data;
}

export async function getMisConstanciasApi(accessToken) {
  const res = await fetch(`${API_URL}/api/users/constancias/mis/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar las constancias.');
  return data;
}

export async function getMisFacturasApi(accessToken) {
  const res = await fetch(`${API_URL}/api/users/facturas/mis/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar las facturas.');
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
