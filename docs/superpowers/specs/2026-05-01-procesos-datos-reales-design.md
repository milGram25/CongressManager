# Diseño: Subsistema B — Vistas de Procesos con Datos Reales

## Resumen

Las vistas `/admin/procesos/resumenes` y `/admin/procesos/extensos` actualmente usan datos MOCK. Este subsistema las conecta al backend real: selector de congreso, listado de ponencias con sus estados, asignación de dictaminador/evaluador desde la misma vista, y visualización de resultados de evaluación (rúbricas + comentarios por criterio).

---

## Arquitectura

### Backend — nuevos endpoints (`ponencias/`)

**`GET /api/ponencias/resumenes/?id_congreso=N`**
```json
[{
  "id_ponencia": 1,
  "titulo": "...",
  "autores": ["Juan Pérez", "Ana López"],
  "resumen": {
    "id_resumen": 1,
    "revisado": false,
    "aceptado": null,
    "id_dictaminador": null,
    "nombre_dictaminador": null,
    "dictamen": {
      "respuestas": [
        { "pregunta": "¿Es original?", "respuesta": "Sí" }
      ]
    }
  }
}]
```

- `revisado`: `resumen.revisado` (bool)
- `aceptado`: `resumen.aceptado` (null | true | false)
- `id_dictaminador`: FK actual en resumen
- `dictamen.respuestas`: datos de `dictamen_resumen` + `dictamen_pregunta` si existen

**`GET /api/ponencias/extensos/?id_congreso=N`**
```json
[{
  "id_ponencia": 1,
  "titulo": "...",
  "autores": ["..."],
  "extenso": {
    "id_extenso": 1,
    "revisado": false,
    "aceptado": null,
    "id_evaluador": null,
    "nombre_evaluador": null,
    "evaluacion": {
      "grupos": [{
        "nombre_grupo": "Metodología",
        "criterios": [{
          "nombre_criterio": "Claridad",
          "peso": 30,
          "puntaje": 8,
          "comentario_especifico": "Buen desarrollo"
        }]
      }]
    }
  }
}]
```

- `evaluacion`: datos de `evaluacion` + `evaluacion_criterio` JOIN `rubrica_criterio` JOIN `rubrica_grupo`
- Si no hay evaluación aún, `evaluacion = null`

La relación es: `ponencia` → `id_extenso` → `extenso` → `evaluacion` → `evaluacion_criterio`

### LED status (calculado en frontend, datos del backend)

Enum `estatus_resumen_enum`: `aceptado`, `rechazado`
Enum `estatus_extenso_enum`: `aceptado`, `aceptado con ligeras modificaciones`, `aceptado con modificaciones mayores`, `rechazado`

| LED | Verde | Rojo | Gris |
|---|---|---|---|
| Revisores asignados (resumen) | `id_dictaminador != null` | `id_dictaminador == null` | — |
| Revisores asignados (extenso) | `id_evaluador != null` | `id_evaluador == null` | — |
| Estado de revisión | `revisado == true` | `revisado == false` | — |
| Estado de aceptación (resumen) | `estatus == 'aceptado'` | `estatus == 'rechazado'` | `estatus == null` |
| Estado de aceptación (extenso) | `evaluacion.estatus` contiene 'aceptado' | `evaluacion.estatus == 'rechazado'` | `evaluacion == null` |

### Frontend — `ProcesosResumenesView.jsx`

1. Selector de congreso (componente reutilizable, mismo patrón que `ProcesosRolesView`)
2. Sin congreso → "Selecciona un congreso"
3. Con congreso → llama `/api/ponencias/resumenes/?id_congreso=N`
4. Lista de ponencias con:
   - Nombre y autores
   - 3 LED badges de estado
   - Botón "Ver detalle" → abre card/modal con:
     - Datos del resumen
     - Dropdown de dictaminadores disponibles + botón asignar (usa endpoint de subsistema D)
     - Respuestas del dictamen si existen

### Frontend — `ProcesosExtensosView.jsx`

Igual que resumenes, más:
- En el detalle: mostrar rúbrica evaluada en formato de tabla agrupada por grupo
- Cada criterio: nombre, peso, puntaje obtenido, comentario específico
- Si `evaluacion == null`: mostrar "Sin evaluación enviada"

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/ponencias/views.py` | Agregar `ResumenesCongresoView`, `ExtensosCongresoView` |
| `backend/ponencias/serializers.py` | Serializers anidados para resumen+dictamen, extenso+evaluación |
| `backend/ponencias/urls.py` | Registrar nuevas rutas |
| `frontend/src/views/admin/ProcesosResumenesView.jsx` | Reemplazar MOCK por datos reales |
| `frontend/src/views/admin/ProcesosExtensosView.jsx` | Reemplazar MOCK por datos reales |
| `frontend/src/api/ponenciasApi.js` | Agregar funciones para los nuevos endpoints |

---

## Manejo de errores

| Caso | Comportamiento |
|---|---|
| Sin congreso seleccionado | Lista vacía + mensaje instructivo |
| Sin ponencias en el congreso | Mensaje "No hay ponencias para este congreso" |
| Error de red | Toast de error |
| Evaluación incompleta | Mostrar criterios sin puntaje como "—" |
