# Diseño: Corrección del flujo completo de envío y publicación de ponencias

**Fecha:** 2026-05-13  
**Rama:** cambio_flujo_de_eventos  
**Autor:** Diego Muñoz Cisneros

---

## Contexto

CongressManager gestiona congresos académicos. Las ponencias tienen dos sub-flujos:

- **Ponencia de participante (normal):** el ponente envía un resumen → es dictaminado → si se aprueba, envía extenso → dos revisores evalúan → admin publica la ponencia al programa del congreso.
- **Ponencia magistral:** el admin la crea directamente desde el panel, sin flujo de envío por parte de ponente.

Se identificaron tres brechas entre el comportamiento actual y el flujo deseado.

---

## Gap 1 — "Publicar ponencia" con datos pre-llenados

### Problema

El botón "Publicar ponencia" en `ProcesosExtensosView` llama directamente a `publicarPonenciaApi` y usa fechas del congreso como fechas del evento sin que el admin pueda configurar los detalles (hora, cupos, lugar, etc.). La ponencia publicada queda con datos incompletos.

### Solución

El botón **navega** a `/admin/eventos/ponencias/crear` con query params pre-llenados del extenso, y el admin llena los detalles antes de guardar.

#### Query params que se pasan

| Query param     | Fuente                          |
|-----------------|---------------------------------|
| `id_congreso`   | `extenso.id_congreso`           |
| `nombre_evento` | `extenso.title` (título)        |
| `id_subarea`    | `extenso.id_subarea`            |
| `id_extenso`    | `extenso.id_extenso` (**nuevo**)|

**Sin** `tipo=magistral` → `esMagistral` es `false` → ponencia tipo `normal`.

#### Modo "publicar existente"

Cuando `id_extenso` está presente en los params:
- `PonenciaCrearView` detecta el modo y lo pasa a `DetallesEditarPonencia` como prop `idExtenso`.
- `DetallesEditarPonencia.handleSave()`: en lugar de llamar al endpoint de creación de ponencia nueva, llama a `publicarPonenciaApi(id_extenso, formData)` (endpoint existente `extensos/<id_extenso>/publicar/`).
- El backend `PublicarPonenciaView` se actualiza para aceptar los campos del evento en el body del POST (`fecha_hora_inicio`, `fecha_hora_final`, `cupos`, `tipo_participacion`, `enlace`, `sinopsis`, `id_mesas_trabajo`) y usarlos al crear el `evento`, en lugar de tomar las fechas del congreso como defaults.
- El evento creado se liga a la ponencia existente (`UPDATE ponencia SET id_evento = %s`), sin crear una ponencia nueva.

#### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `frontend/src/views/admin/ProcesosExtensosView.jsx` | Reemplazar llamada a API por `navigate(...)` con los 4 params |
| `frontend/src/views/admin/PonenciaCrearView.jsx` | Leer `id_extenso` del query param; pasar `idExtenso` a `DetallesEditarPonencia` |
| `frontend/src/views/admin/Componentes/DetallesEditarPonencia.jsx` | Cuando `idExtenso` presente, `handleSave` llama a `publicarPonenciaApi` con form data en lugar del endpoint de creación |
| `backend/ponencias/views.py` — `PublicarPonenciaView` | Aceptar campos del evento en POST body; usarlos al crear el `evento` |

---

## Gap 2 — Rúbricas de ambos revisores

### Problema

El panel de detalle del extenso muestra solo una evaluación (`extenso.evaluacion`), que corresponde a la última evaluación registrada (cualquier revisor). Si `evaluador_1` y `evaluador_2` tienen criterios distintos evaluados, solo se ve la más reciente.

### Estado actual del backend

`ExtensosCongresoView` ya obtiene evaluaciones por revisor (`DISTINCT ON (id_extenso, id_evaluador)`), pero solo retorna los criterios de la última evaluación global (`latest_id_evaluacion`). El campo `evaluacion` del response es uno solo.

### Solución

#### Backend

Obtener criterios para las evaluaciones de **ambos** revisores (`id_evaluador` e `id_evaluador_2`) por separado. El response cambia de:

```json
{ "evaluacion": { ... } }
```

a:

```json
{
  "evaluacion_1": { "estatus": "...", "retroalimentacion_general": "...", "grupos": [...] },
  "evaluacion_2": { "estatus": "...", "retroalimentacion_general": "...", "grupos": [...] }
}
```

- Si un revisor aún no ha evaluado → su campo es `null`.
- La query de criterios (`evaluacion_criterio`) se ejecuta con los IDs de evaluación de `evaluador_1` y `evaluador_2`, no solo el `latest`.

#### Frontend

En el panel de detalle del extenso, mostrar dos cards apiladas:

```
┌─ Revisor 1: [nombre_evaluador] ───────┐
│ Grupo A                               │
│   Criterio 1: ●●●○○  comentario      │
│ Estatus: aceptado                     │
└───────────────────────────────────────┘
┌─ Revisor 2: [nombre_evaluador_2] ─────┐
│ Pendiente de revisión                 │
└───────────────────────────────────────┘
```

El componente `RubricaGrupoStatusRow` ya existe y puede reutilizarse. Solo se pasa `evaluacion_1` / `evaluacion_2` en lugar de `evaluacion`.

#### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `backend/ponencias/views.py` — `ExtensosCongresoView` | Obtener criterios para ambas evaluaciones y retornar `evaluacion_1`, `evaluacion_2` |
| `frontend/src/views/admin/ProcesosExtensosView.jsx` | Renderizar dos cards usando `extenso.evaluacion_1` y `extenso.evaluacion_2` |

---

## Gap 3 — Campo multimedia en formulario de ponencia magistral

### Problema

Al crear una ponencia magistral desde admin, el formulario no expone el campo `enlace_multimedia`. Este campo existe en `ponencia_meta` y el backend ya lo persiste para ponencias normales, pero `emptyPonenciaData` en `PonenciaCrearView` no lo incluye.

### Solución

- Agregar `enlace_multimedia: ""` al objeto `emptyPonenciaData` en `PonenciaCrearView`.
- Verificar que `DetallesEditarPonencia` renderiza el campo cuando el dato está presente (ya existe el campo en la UI para ponencias normales — confirmar que también se muestra en modo magistral).
- Verificar que el endpoint de creación de ponencia magistral persiste `enlace_multimedia` en `ponencia_meta`.

#### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `frontend/src/views/admin/PonenciaCrearView.jsx` | Agregar `enlace_multimedia: ""` en `emptyPonenciaData` |
| `frontend/src/views/admin/Componentes/DetallesEditarPonencia.jsx` | Confirmar/exponer campo multimedia en modo magistral |
| `backend/ponencias/views.py` | Verificar guardado de `enlace_multimedia` al crear ponencia magistral |

---

## Reglas de tipo de ponencia

| Origen                                       | `tipo_ponencia` | Creado por |
|----------------------------------------------|-----------------|------------|
| Enviado por participante                     | `normal`        | Ponente    |
| Publicado desde flujo de extenso             | `normal`        | Admin (publica ponencia del ponente) |
| Creado por admin directamente (magistral)    | `magistral`     | Admin      |

La distinción `magistral` solo aplica cuando el admin crea la ponencia directamente sin flujo de envío previo.

---

## Resumen de archivos impactados

| Archivo | Cambios |
|---------|---------|
| `frontend/src/views/admin/ProcesosExtensosView.jsx` | Botón navega con 4 params; renderiza dos cards de evaluación |
| `frontend/src/views/admin/PonenciaCrearView.jsx` | Lee `id_extenso`; agrega `enlace_multimedia`; pasa `idExtenso` a componente |
| `frontend/src/views/admin/Componentes/DetallesEditarPonencia.jsx` | Modo publicar (usa `publicarPonenciaApi`); campo multimedia en magistral |
| `backend/ponencias/views.py` — `PublicarPonenciaView` | Acepta campos de evento en POST body |
| `backend/ponencias/views.py` — `ExtensosCongresoView` | Retorna `evaluacion_1`, `evaluacion_2` en lugar de `evaluacion` |
