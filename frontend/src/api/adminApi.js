import { API_URL } from './constants';

// Participantes
export async function getParticipantsApi(accessToken, idCongreso = null) {
  let url = `${API_URL}/api/users/participants/`;
  if (idCongreso) url += `?id_congreso=${idCongreso}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener participantes.');
  return res.json();
}

export async function uploadConstanciaApi(accessToken, idPersona, idCongreso, file, tipo) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('id_congreso', idCongreso);
  formData.append('tipo', tipo);
  const res = await fetch(`${API_URL}/api/users/constancia/${idPersona}/upload/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Error al subir constancia.');
  return res.json();
}

export async function uploadFacturaApi(accessToken, idPersona, idCongreso, file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('id_congreso', idCongreso);
  const res = await fetch(`${API_URL}/api/users/factura/${idPersona}/upload/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Error al subir factura.');
  return res.json();
}

export async function bulkConstanciaActionApi(accessToken, action, idCongreso, userIds) {
  const res = await fetch(`${API_URL}/api/users/constancia/bulk-action/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, id_congreso: idCongreso, user_ids: userIds }),
  });
  if (!res.ok) throw new Error('Error en acción masiva.');
  return res.json();
}

export async function getUserHistoryApi(accessToken, tipo = 'general') {
  const res = await fetch(`${API_URL}/api/users/history/?tipo=${tipo}`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener historial.');
  return res.json();
}

// Congresos
export async function getCongresosApi(accessToken) {
  const res = await fetch(`${API_URL}/api/congresos/lista/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener congresos.');
  return res.json();
}

export async function createCongresoApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/lista/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Error al crear congreso.');
  return resData;
}

export async function updateCongresoApi(accessToken, idCongreso, data) {
  const res = await fetch(`${API_URL}/api/congresos/lista/${idCongreso}/`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Error al actualizar congreso.');
  return resData;
}

export async function getCongresoSignaturesApi(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/congresos/${idCongreso}/signatures/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener firmas.');
  return res.json();
}

export async function updateCongresoSignaturesApi(accessToken, idCongreso, data) {
  const formData = new FormData();
  if (data.firma_organizador) formData.append('firma_organizador', data.firma_organizador);
  if (data.firma_secretaria) formData.append('firma_secretaria', data.firma_secretaria);
  if (data.lock !== undefined) formData.append('lock', data.lock);
  const res = await fetch(`${API_URL}/api/congresos/${idCongreso}/signatures/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Error al actualizar firmas.');
  return res.json();
}

// Sedes
export async function getSedesApi(accessToken) {
  const res = await fetch(`${API_URL}/api/congresos/sedes/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener sedes.');
  return res.json();
}

export async function updateSedeApi(accessToken, idSede, data) {
  const res = await fetch(`${API_URL}/api/congresos/sedes/${idSede}/`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar sede.');
  return res.json();
}

// Mesas de Trabajo
export async function getMesasApi(accessToken, idSede = null) {
  let url = `${API_URL}/api/congresos/mesas/`;
  if (idSede) url += `?id_sede=${idSede}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener mesas.');
  return res.json();
}

export async function createMesaApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/mesas/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear mesa.');
  return res.json();
}

export async function deleteMesaApi(accessToken, idMesa) {
  const res = await fetch(`${API_URL}/api/congresos/mesas/${idMesa}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error al eliminar mesa.');
  return true;
}

// Instituciones
export async function getInstitucionesApi(accessToken) {
  const res = await fetch(`${API_URL}/api/congresos/instituciones/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener instituciones.');
  return res.json();
}

export async function createInstitucionApi(accessToken, data) {
  const formData = new FormData();
  formData.append('nombre', data.nombre);
  formData.append('ubicacion', data.ubicacion);
  formData.append('pais', data.pais);
  if (data.imageFile) formData.append('image', data.imageFile);

  const res = await fetch(`${API_URL}/api/congresos/instituciones/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: formData,
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Error al crear institución.');
  return resData;
}

export async function updateInstitucionApi(accessToken, idInstitucion, data) {
  const formData = new FormData();
  formData.append('nombre', data.nombre);
  formData.append('ubicacion', data.ubicacion);
  formData.append('pais', data.pais);
  if (data.imageFile) formData.append('image', data.imageFile);

  const res = await fetch(`${API_URL}/api/congresos/instituciones/${idInstitucion}/`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: formData,
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Error al actualizar institución.');
  return resData;
}

// Rúbricas
export async function getRubricasApi(accessToken, idCongreso = null) {
  let url = `${API_URL}/api/congresos/rubricas/`;
  if (idCongreso) url += `?id_congreso=${idCongreso}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener rúbricas.');
  return res.json();
}

export async function createRubricaApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/rubricas/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear rúbrica.');
  return res.json();
}

// Tipos de Trabajo
export async function getTiposTrabajoApi(accessToken, idCongreso = null) {
  let url = `${API_URL}/api/congresos/tipos-trabajo/`;
  if (idCongreso) url += `?id_congreso=${idCongreso}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener tipos de trabajo.');
  return res.json();
}

export async function createTipoTrabajoApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/tipos-trabajo/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear tipo de trabajo.');
  return res.json();
}

export async function deleteTipoTrabajoApi(accessToken, idTipo) {
  const res = await fetch(`${API_URL}/api/congresos/tipos-trabajo/${idTipo}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error al eliminar tipo de trabajo.');
  return true;
}

// Dictámenes (Preguntas)
export async function getDictamenesApi(accessToken) {
  const res = await fetch(`${API_URL}/api/congresos/dictamenes/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener dictámenes.');
  return res.json();
}
