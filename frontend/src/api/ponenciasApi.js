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

export async function getResumenDetalleApi(token, idResumen) {
  const res = await fetch(`${API_URL}/api/ponencias/resumenes/${idResumen}/detalle/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al obtener detalle del resumen');
  return res.json();
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

export async function getMisResumenes(accessToken) {
  const res = await fetch(`${API_URL}/api/ponencias/mis-resumenes/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error cargando tus resúmenes');
  return res.json();
}

export async function getMisExtensos(accessToken) {
  const res = await fetch(`${API_URL}/api/ponencias/mis-extensos/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error cargando tus extensos');
  return res.json();
}

export async function getRubricaExtenso(accessToken, idExtenso) {
  const res = await fetch(`${API_URL}/api/ponencias/extensos/${idExtenso}/rubrica/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Sin rúbrica configurada');
  return res.json();
}

export function buildMediaUrl(rutaRelativa) {
  if (!rutaRelativa) return null;
  return `${API_URL}/media/${rutaRelativa}`;
}

export async function getPreguntasResumen(accessToken, idResumen) {
  const res = await fetch(`${API_URL}/api/ponencias/resumenes/${idResumen}/preguntas/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Sin preguntas configuradas');
  return res.json();
}

export async function enviarEvaluacionApi(accessToken, idExtenso, data) {
  const res = await fetch(`${API_URL}/api/ponencias/extensos/${idExtenso}/evaluacion/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error enviando evaluación');
  return res.json();
}

export async function enviarDictamenApi(accessToken, idResumen, data) {
  const res = await fetch(`${API_URL}/api/ponencias/resumenes/${idResumen}/dictamen/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error enviando dictamen');
  return res.json();
}

export async function asignarEvaluadoresApi(accessToken, idExtenso, idEvaluador, idEvaluador2) {
  const res = await fetch(`${API_URL}/api/ponencias/extensos/${idExtenso}/asignar-evaluadores/`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_evaluador: idEvaluador, id_evaluador_2: idEvaluador2 }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Error asignando revisores');
  }
  return res.json();
}

export async function asignarEvaluador3Api(accessToken, idExtenso, idEvaluador3) {
  const res = await fetch(`${API_URL}/api/ponencias/extensos/${idExtenso}/asignar-evaluador-3/`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_evaluador_3: idEvaluador3 }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Error asignando 3er revisor');
  }
  return res.json();
}

export async function getMisPonenciasPonenteApi(accessToken) {
  const res = await fetch(`${API_URL}/api/ponencias/ponente/mis-ponencias/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error cargando estatus de ponencias');
  return res.json();
}

export async function subirExtensoApi(accessToken, idResumen, archivo) {
  const form = new FormData();
  form.append('archivo', archivo);
  const res = await fetch(`${API_URL}/api/ponencias/resumenes/${idResumen}/subir-extenso/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error al subir el extenso');
  return data;
}

export async function publicarPonenciaApi(accessToken, idExtenso, formData = {}) {
  const res = await fetch(`${API_URL}/api/ponencias/extensos/${idExtenso}/publicar/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error al publicar la ponencia');
  return data;
}

export async function actualizarEnlacePonenciaApi(accessToken, idPonencia, enlace) {
  const res = await fetch(`${API_URL}/api/ponencias/ponencia/${idPonencia}/enlace/`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ enlace }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error al guardar el enlace');
  return data;
}
