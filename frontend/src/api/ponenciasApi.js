const API_URL = 'http://localhost:8000';

// ============================================
// SERVICIOS PARA DICTAMINADORES
// ============================================

export async function getResumenesPendientes(accessToken) {
    const res = await fetch(`${API_URL}/api/ponencias/dictaminador/resumenes-pendientes/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Error al cargar los resúmenes pendientes');
    return res.json(); // Trae el arreglo de resúmenes desde Django
}

export async function enviarDictamen(idResumen, estatus, retroalimentacion, accessToken) {
    const res = await fetch(`${API_URL}/api/ponencias/dictaminador/dictaminar/${idResumen}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            estatus: estatus,
            retroalimentacion_general: retroalimentacion
        })
    });
    if (!res.ok) throw new Error('Error al enviar el dictamen');
    return res.json();
}

// ============================================
// SERVICIOS PARA REVISORES (EVALUADORES)
// ============================================

export async function getExtensosPendientes(accessToken) {
    const res = await fetch(`${API_URL}/api/ponencias/revisor/extensos-pendientes/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Error al cargar los extensos pendientes');
    return res.json();
}

export async function enviarRevision(idExtenso, estatus, retroalimentacion, accessToken) {
    const res = await fetch(`${API_URL}/api/ponencias/revisor/revisar/${idExtenso}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            estatus: estatus,
            retroalimentacion_general: retroalimentacion
        })
    });
    if (!res.ok) throw new Error('Error al enviar la revisión de extenso');
    return res.json();
}

// ============================================
// SERVICIOS PARA ASISTENTES (Autores)
// ============================================

export async function getMisPonencias(accessToken) {
    const res = await fetch(`${API_URL}/api/ponencias/mis-ponencias/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error('Error al cargar mis ponencias');
    return res.json();
}

export async function enviarNuevaPonencia(datosIn, accessToken) {
    const res = await fetch(`${API_URL}/api/ponencias/subir-resumen/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(datosIn)
    });
    if (!res.ok) throw new Error('Error al enviar la ponencia');
    return res.json();
}
