import { API_URL } from './constants';

// Participantes
export async function getParticipantsApi(accessToken, { idCongreso = null, rol = null, institucion = null } = {}) {
  const params = new URLSearchParams();
  if (idCongreso) params.append('id_congreso', idCongreso);
  if (rol) params.append('rol', rol);
  if (institucion) params.append('institucion', institucion);
  const query = params.toString();
  const url = `${API_URL}/api/users/participants/${query ? '?' + query : ''}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener participantes.');
  return res.json();
}

export async function getPendingFacturasApi(accessToken, idCongreso = null) {
  const params = idCongreso ? `?id_congreso=${idCongreso}` : '';
  const res = await fetch(`${API_URL}/api/users/facturas/pendientes/${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error al obtener facturas pendientes.');
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

export async function uploadFacturaApi(accessToken, idPersona, idCongreso, pdfFile, xmlFile) {
  const formData = new FormData();
  formData.append('pdf_file', pdfFile);
  formData.append('xml_file', xmlFile);
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

export async function bulkFacturaActionApi(accessToken, idCongreso, userIds) {
  const res = await fetch(`${API_URL}/api/users/factura/bulk-action/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_congreso: idCongreso, user_ids: userIds }),
  });
  if (!res.ok) throw new Error('Error en envío masivo de facturas.');
  return res.json();
}

export async function getUserHistoryApi(accessToken, tipo = 'general') {
  const res = await fetch(`${API_URL}/api/users/history/?tipo=${tipo}`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener historial.');
  return res.json();
}

// Congresos
export async function getCongresosApi(accessToken, idInstitucion = null) {
  let url = `${API_URL}/api/congresos/lista/`;
  if (idInstitucion) url += `?id_institucion=${idInstitucion}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener congresos.');
  return res.json();
}

export async function getCongresoByIdApi(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/congresos/lista/${idCongreso}/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener detalles del congreso.');
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
export async function getInstitucionesPublicApi() {
  const res = await fetch(`${API_URL}/api/congresos/instituciones/`);
  if (!res.ok) throw new Error('Error al obtener instituciones.');
  return res.json();
}

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

export async function getTalleresApi(accessToken, idCongreso = null) {
  let url = `${API_URL}/api/congresos/talleres/`;
  if (idCongreso) url += `?id_congreso=${idCongreso}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener talleres.');
  return res.json();
}

export async function getPonenciasApi(accessToken, idCongreso = null) {
  let url = `${API_URL}/api/ponencias/lista/`;
  if (idCongreso !== null && idCongreso !== undefined) url += `?id_congreso=${idCongreso}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener ponencias.');
  return res.json();
}

export async function getTallerByIdApi(accessToken, idTaller) {
  const res = await fetch(`${API_URL}/api/congresos/talleres/${idTaller}/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener el taller.');
  return res.json();
}

export async function getPonenciaByIdApi(accessToken, idPonencia) {
  const res = await fetch(`${API_URL}/api/ponencias/lista/${idPonencia}/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener la ponencia.');
  return res.json();
}

export async function createTallerApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/talleres/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Error al crear taller.');
  return resData;
}

export async function getSubareasApi(accessToken) {
  const res = await fetch(`${API_URL}/api/congresos/subareas/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener subáreas.');
  return res.json();
}

export async function createPonenciaApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/ponencias/lista/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Error al crear ponencia.');
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

export async function uploadFormatoTipoTrabajoApi(accessToken, idTipo, archivo) {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const res = await fetch(`${API_URL}/api/congresos/tipos-trabajo/${idTipo}/formato/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Error al subir el formato.');
  }
  return res.json();
}

export async function deleteFormatoTipoTrabajoApi(accessToken, idTipo) {
  const res = await fetch(`${API_URL}/api/congresos/tipos-trabajo/${idTipo}/formato/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error al eliminar el formato.');
  return true;
}

// Dictámenes (Preguntas)
export async function getDictamenesApi(accessToken) {
  const res = await fetch(`${API_URL}/api/congresos/dictamenes/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener dictámenes.');
  return res.json();
}


export async function getInscritosTallerApi(accessToken, idEvento) {
  const res = await fetch(`${API_URL}/api/congresos/eventos/${idEvento}/inscritos/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'No se pudieron cargar los inscritos.');
  return data;
}

export async function getAllUsersApi(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/users/all/?id_congreso=${idCongreso}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error al obtener usuarios.');
  return res.json();
}

export async function assignRoleApi(accessToken, idPersona, { rol, idCongreso, password }) {
  const body = { rol };
  if (idCongreso) body.id_congreso = idCongreso;
  if (password) body.password = password;
  const res = await fetch(`${API_URL}/api/users/${idPersona}/role/assign/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error al asignar rol.');
  return data;
}

export async function removeRoleApi(accessToken, idPersona, { rol, idCongreso, password }) {
  const body = { rol };
  if (idCongreso) body.id_congreso = idCongreso;
  if (password) body.password = password;
  const res = await fetch(`${API_URL}/api/users/${idPersona}/role/remove/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error al quitar rol.');
  return data;
}

// ── Rubrica Grupos ──────────────────────────────────────────────
export async function createRubricaGrupoApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-grupos/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creando grupo');
  return res.json();
}

export async function updateRubricaGrupoApi(accessToken, id, data) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-grupos/${id}/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error actualizando grupo');
  return res.json();
}

export async function deleteRubricaGrupoApi(accessToken, id) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-grupos/${id}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error eliminando grupo');
}

// ── Rubrica Criterios ─────────────────────────────────────────────
export async function createRubricaCriterioApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-criterios/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creando criterio');
  return res.json();
}

export async function updateRubricaCriterioApi(accessToken, id, data) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-criterios/${id}/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error actualizando criterio');
  return res.json();
}

export async function deleteRubricaCriterioApi(accessToken, id) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-criterios/${id}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error eliminando criterio');
}

// ── Dictamen y Preguntas ──────────────────────────────────────────
export async function createDictamenApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/dictamenes/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creando dictamen');
  return res.json();
}

export async function createDictamenPreguntaApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/preguntas/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creando pregunta');
  return res.json();
}

export async function updateDictamenPreguntaApi(accessToken, id, data) {
  const res = await fetch(`${API_URL}/api/congresos/preguntas/${id}/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error actualizando pregunta');
  return res.json();
}

export async function deleteDictamenPreguntaApi(accessToken, id) {
  const res = await fetch(`${API_URL}/api/congresos/preguntas/${id}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error eliminando pregunta');
}

export async function getDictamenesConFiltroApi(accessToken, tipoTrabajo = null) {
  let url = `${API_URL}/api/congresos/dictamenes/`;
  if (tipoTrabajo) url += `?tipo_trabajo=${tipoTrabajo}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error cargando dictamenes');
  return res.json();
}

export async function getDictaminadoresDisponiblesApi(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/ponencias/dictaminadores-disponibles/?id_congreso=${idCongreso}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error cargando dictaminadores');
  return res.json();
}

export async function getEvaluadoresDisponiblesApi(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/ponencias/evaluadores-disponibles/?id_congreso=${idCongreso}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error cargando evaluadores');
  return res.json();
}

export async function getLibrosApi(accessToken, idCongreso) {
  let url = `${API_URL}/api/congresos/libros/${idCongreso}/`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener libros.');
  return res.json();
}

export async function createLibroApi(accessToken, idCongreso, data) {
  const res = await fetch(`${API_URL}/api/congresos/libros/${idCongreso}/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear libro.');
  return res.json();
}

export async function updateLibroApi(accessToken, idLibro, data) {
  const res = await fetch(`${API_URL}/api/congresos/libro/${idLibro}/`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar libro.');
  return res.json();
}

export async function deleteLibroApi(accessToken, idLibro) {
  const res = await fetch(`${API_URL}/api/congresos/libro/${idLibro}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error al eliminar libro.');
  return true;
}

export async function getLibroHasPonenciaApi(accessToken, idLibro) {
  let url = `${API_URL}/api/congresos/librohasponencia/${idLibro}/`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener ponencias del libro.');
  return res.json();
}

export async function addPonenciaToLibroApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/librohasponencia/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al asignar ponencia.');
  return res.json();
}

export async function removePonenciaFromLibroApi(accessToken, idPonencia) {
  const res = await fetch(`${API_URL}/api/congresos/librohasponencia/ponencia/${idPonencia}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error al quitar ponencia.');
  return true;
}

export async function transferPonenciaApi(accessToken, idPonencia, idLibroDestino) {
  const res = await fetch(`${API_URL}/api/congresos/librohasponencia/ponencia/${idPonencia}/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_libro: idLibroDestino }),
  });
  if (!res.ok) throw new Error('Error al transferir ponencia.');
  return res.json();
}

// Ponencias Magistrales
export async function getPonenciasMagistralesApi(accessToken, idCongreso = null) {
  let url = `${API_URL}/api/ponencias/magistrales/`;
  if (idCongreso) url += `?id_congreso=${idCongreso}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener ponencias magistrales.');
  return res.json();
}

export async function getPonenciaMagistralByIdApi(accessToken, id) {
  const res = await fetch(`${API_URL}/api/ponencias/magistrales/${id}/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener ponencia magistral.');
  return res.json();
}

export async function createPonenciaMagistralApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/ponencias/magistrales/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Error al crear ponencia magistral.');
  return resData;
}

export async function updatePonenciaMagistralApi(accessToken, id, data) {
  const res = await fetch(`${API_URL}/api/ponencias/magistrales/${id}/`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.detail || 'Error al actualizar ponencia magistral.');
  return resData;
}

// Nombres de ponentes para autocompletado
export async function getPonentesNombresApi(accessToken) {
  const res = await fetch(`${API_URL}/api/ponencias/ponentes-nombres/`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error al obtener nombres de ponentes.');
  return res.json();
}
