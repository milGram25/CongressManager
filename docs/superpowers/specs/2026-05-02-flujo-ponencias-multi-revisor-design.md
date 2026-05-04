# Diseño: Flujo Completo de Gestión de Ponencias con Multi-Revisor

## Resumen

Implementación del flujo completo de ponencias: dictaminación de resúmenes, revisión de extensos por dos revisores obligatorios simultáneos, mecanismo de desempate con tercer revisor opcional, y publicación de ponencias aceptadas a eventos. Incluye vista de estatus para el ponente con datos reales.

---

## Arquitectura

### Cambio en base de datos

Una única migración SQL agrega dos columnas nullable a `extenso`:

```sql
ALTER TABLE extenso
  ADD COLUMN id_evaluador_2 INTEGER REFERENCES evaluador(id_evaluador),
  ADD COLUMN id_evaluador_3 INTEGER REFERENCES evaluador(id_evaluador);
```

La columna `id_evaluador` existente pasa a ser "Revisor 1". `id_evaluador_2` es "Revisor 2" (obligatorio, simultáneo). `id_evaluador_3` solo se asigna en caso de desacuerdo (condicional).

### Estado derivado del flujo

El estado completo se calcula en backend sin campos de estatus adicionales:

| Estado | Condición |
|---|---|
| `pendiente_dictaminacion` | `resumen.revisado = FALSE` |
| `resumen_rechazado` | `resumen.estatus = 'rechazado'` |
| `pendiente_extenso` | resumen aceptado, ponencia sin extenso aún |
| `en_revision` | extenso existe, `revisado = FALSE`, sin desacuerdo detectado |
| `con_modificaciones` | última evaluación de algún revisor es `aceptado con ligeras/mayores modificaciones` |
| `desacuerdo` | R1 final = rechazado, R2 final = aceptado (o viceversa), ambos evaluaron versión actual |
| `extenso_aceptado` | `extenso.revisado = TRUE`, resultado = aceptado |
| `extenso_rechazado` | `extenso.revisado = TRUE`, resultado = rechazado |

**Detección de desacuerdo:** después de que un evaluador envía evaluación, el backend verifica si ambos `id_evaluador` e `id_evaluador_2` tienen una evaluación del extenso en su versión actual, y si sus estatus finales son contradictorios (uno rechaza, otro acepta). Si sí → estado `desacuerdo`.

**Decisión final con 3 revisores:** si existe `id_evaluador_3` y ya evaluó → su estatus es el definitivo. Si acepta, se marca `extenso.revisado = TRUE, estatus = 'aceptado'`. Si rechaza, `rechazado`.

**El ponente no ve `desacuerdo`** — desde su perspectiva el estado permanece `en_revision` mientras se asigna el 3er revisor.

---

## Backend

### Nuevos endpoints

**`PATCH /ponencias/extensos/<pk>/asignar-evaluadores/`**
- Requiere token de admin (`is_staff=True`)
- Body: `{ "id_evaluador": <id>, "id_evaluador_2": <id> }`
- Asigna R1 y R2 simultáneamente. Ambos campos son requeridos.
- Solo permitido si `extenso.revisado = FALSE`
- Devuelve 200 con datos actualizados del extenso

**`PATCH /ponencias/extensos/<pk>/asignar-evaluador-3/`**
- Requiere token de admin
- Body: `{ "id_evaluador_3": <id> }`
- Solo permitido si el estado derivado del extenso es `desacuerdo`
- Devuelve 200 con datos actualizados

**`GET /ponencias/ponencias/<pk>/estatus/`**
- Requiere token de ponente autenticado
- Devuelve el estado derivado y datos relevantes:
  ```json
  {
    "estado": "con_modificaciones",
    "titulo": "Mi ponencia",
    "tipo": "resumen" | "extenso",
    "retroalimentacion": "...",
    "id_extenso": 5
  }
  ```

### Endpoints modificados

**`ExtensosCongresoView`** — incluir en cada extenso:
- `id_evaluador`, `nombre_evaluador`
- `id_evaluador_2`, `nombre_evaluador_2`
- `id_evaluador_3`, `nombre_evaluador_3`
- `estado_derivado` calculado por función helper
- `tipo_ponencia` (ponencia o taller, para determinar URL de publicación)

**`EnviarEvaluacionView`** — tras insertar evaluación, verificar si se activa desacuerdo. No cambia la firma del endpoint.

### Helper de estado derivado

Función `calcular_estado_extenso(extenso_row)` que recibe los datos del extenso y devuelve uno de los estados de la tabla de arriba. Se usa en `ExtensosCongresoView` y en `EstatusView`.

---

## Vistas admin

### ProcesosResumenesView

- Eliminar completamente el selector de dictaminador en las tarjetas de resúmenes.
- Mostrar solo texto: "Dictaminador: [Nombre]" o "Sin dictaminador asignado".
- Sin otros cambios funcionales.

### ProcesosExtensosView

- Eliminar selector de evaluador individual. Reemplazar con bloque "Asignar Revisores":
  - Dos selectores en paralelo: "Revisor 1" y "Revisor 2" (ambos obligatorios).
  - Botón "Asignar revisores" habilitado solo cuando ambos selectores tienen valor.
  - Al asignar, llama `PATCH /ponencias/extensos/<pk>/asignar-evaluadores/`.

- **LEDs actualizados:**
  - "Revisores asignados" → verde solo cuando `id_evaluador` AND `id_evaluador_2` son no-null.
  - "En revisión" → verde cuando al menos una evaluación registrada.
  - Nuevo LED "Desacuerdo" → naranja cuando `estado_derivado = 'desacuerdo'`.
  - "Aceptado" → verde cuando `extenso_aceptado`.

- **Botón "Asignar 3er revisor":** aparece solo en estado `desacuerdo`. Selector de evaluadores del congreso (excluye R1 y R2). Llama `PATCH /ponencias/extensos/<pk>/asignar-evaluador-3/`.

- **Botón "Publicar ponencia":** aparece solo cuando `estado_derivado = 'extenso_aceptado'`. Redirige a:
  - `/admin/eventos/ponencias/crear?id_congreso=X&id_ponencia=Y` si es ponencia
  - `/admin/eventos/talleres/crear?id_congreso=X&id_taller=Y` si es taller
  - La vista de creación de evento pre-carga título, autores y área temática desde la ponencia.

---

## Vista del ponente — EstatusPonenciaView

Actualmente usa datos hardcodeados. Se reemplaza por datos reales del endpoint `GET /ponencias/ponencias/<pk>/estatus/`.

**Parámetro `pk`:** el componente recibe el `id_ponencia` desde la URL o desde el perfil del usuario (lista de sus ponencias).

**Estados y UI por estado:**

| Estado | Mensaje | Acciones |
|---|---|---|
| `pendiente_dictaminacion` | "Tu resumen está en espera de dictamen" | — |
| `resumen_rechazado` | "Tu resumen fue rechazado" | Botón "Ver motivo" (muestra retroalimentacion) |
| `pendiente_extenso` | "Tu resumen fue aceptado — sube tu extenso" | Botón "Subir Extenso" (navega a `/asistente/subir-extenso/<id_resumen>`) |
| `en_revision` | "Tu extenso está siendo revisado" | — |
| `con_modificaciones` | "Se solicitan modificaciones a tu extenso" | Muestra retroalimentacion + Botón "Subir Corrección" (navega a `/asistente/subir-extenso/<id_extenso>?correccion=true`) |
| `extenso_aceptado` | "¡Tu ponencia fue aceptada!" | — |
| `extenso_rechazado` | "Tu ponencia fue rechazada" | Botón "Ver motivo" |

El estado `desacuerdo` no se muestra al ponente — se mantiene `en_revision`.

---

## Archivos a crear o modificar

| Archivo | Tipo | Cambio |
|---|---|---|
| `backend/ponencias/views.py` | Modificar | Agregar `AsignarEvaluadoresView`, `AsignarEvaluador3View`, `EstatusPonenciaView`; modificar `ExtensosCongresoView` y `EnviarEvaluacionView` |
| `backend/ponencias/urls.py` | Modificar | Registrar 3 nuevas rutas |
| `frontend/src/views/admin/ProcesosExtensosView.jsx` | Modificar | Doble selector obligatorio, LEDs actualizados, botón 3er revisor, botón publicar |
| `frontend/src/views/admin/ProcesosResumenesView.jsx` | Modificar | Eliminar selector de dictaminador, mostrar solo texto |
| `frontend/src/views/asistentes/EstatusPonenciaView.jsx` | Modificar | Conectar a endpoint real, UI por estado |
| `frontend/src/api/ponenciasApi.js` | Modificar | Agregar `asignarEvaluadoresApi`, `asignarEvaluador3Api`, `getEstatusPonenciaApi` |

---

## Manejo de errores

| Caso | Comportamiento |
|---|---|
| Admin intenta asignar solo un revisor | Botón deshabilitado, no hay llamada al backend |
| Admin intenta asignar 3er revisor sin desacuerdo | Backend 400, toast de error |
| Evaluador ya evaluó este extenso | Backend 400 "Ya enviaste evaluación para este extenso" |
| Ponente intenta ver estatus de ponencia ajena | Backend 403 |
| Red caída en EstatusPonenciaView | Spinner + mensaje "Error al cargar estatus" |

---

## Lo que NO incluye este diseño

- Notificaciones por correo al ponente cuando cambia el estatus
- Historial de versiones del extenso (solo se guarda el archivo más reciente)
- Paginación en vistas de procesos
- Cancelación de asignación de revisores una vez que empezó la revisión
