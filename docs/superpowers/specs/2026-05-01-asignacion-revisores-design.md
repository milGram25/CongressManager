# Diseño: Subsistema D — Asignación de Dictaminadores y Evaluadores

## Resumen

El admin puede asignar un dictaminador a un resumen y un evaluador a un extenso. El resumen ya tiene columna `id_dictaminador` en BD. El extenso no tiene columna de asignación, por lo que se requiere una migración para agregarla. Los dictaminadores y evaluadores disponibles se filtran por congreso usando las tablas `DictaminadorCongreso`/`EvaluadorCongreso`.

---

## Arquitectura

### Cambio de esquema (migración)

Agregar columna nullable a la tabla `extenso`:
```sql
ALTER TABLE extenso ADD COLUMN id_evaluador INTEGER REFERENCES evaluador(id_evaluador);
```

Se crea como migración Django en la app `ponencias`. El modelo `Extenso` es `managed=False`, por lo que la migración es `RunSQL`.

### Modelos

`Resumen` ya tiene `id_dictaminador = ForeignKey(Dictaminador, null=True, blank=True)` — sin cambios.

`Extenso` — agregar campo:
```python
id_evaluador = models.ForeignKey(
    'congresos.Evaluador', null=True, blank=True,
    on_delete=models.SET_NULL, db_column='id_evaluador'
)
```

### Backend — endpoints (`ponencias/`)

**`PATCH /api/ponencias/resumenes/{id}/asignar/`**
- Body: `{ "id_dictaminador": N }` (o `null` para desasignar)
- Acción: `resumen.id_dictaminador_id = N; resumen.save()`
- Respuesta 200: `{ "id_resumen": N, "id_dictaminador": N }`

**`PATCH /api/ponencias/extensos/{id}/asignar/`**
- Body: `{ "id_evaluador": N }` (o `null` para desasignar)
- Acción: `extenso.id_evaluador_id = N; extenso.save()`
- Respuesta 200: `{ "id_extenso": N, "id_evaluador": N }`

**`GET /api/ponencias/dictaminadores-disponibles/?id_congreso=N`**
- Devuelve dictaminadores asignados al congreso (JOIN `DictaminadorCongreso` → `Dictaminador` → `Persona`)
- Respuesta: `[{ "id_dictaminador": N, "nombre_completo": "..." }]`

**`GET /api/ponencias/evaluadores-disponibles/?id_congreso=N`**
- Devuelve evaluadores asignados al congreso (JOIN `EvaluadorCongreso` → `Evaluador` → `Persona`)
- Respuesta: `[{ "id_evaluador": N, "nombre_completo": "..." }]`

Todos requieren `IsAuthenticated + is_staff`.

### Frontend

Los endpoints de este subsistema los consume el subsistema B (vistas de procesos). No hay nueva vista aquí — solo la lógica de asignación dentro del modal de resumen/extenso en `ProcesosResumenesView.jsx` y `ProcesosExtensosView.jsx`.

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/ponencias/models.py` | Agregar `id_evaluador` FK en `Extenso` |
| `backend/ponencias/migrations/` | Nueva migración RunSQL para `ALTER TABLE extenso ADD COLUMN id_evaluador` |
| `backend/ponencias/views.py` | Agregar `AsignarDictaminadorView`, `AsignarEvaluadorView`, `DictaminadoresDisponiblesView`, `EvaluadoresDisponiblesView` |
| `backend/ponencias/urls.py` | Registrar las 4 nuevas rutas |

---

## Seguridad

- Solo admins (`is_staff`) pueden asignar/desasignar
- La desasignación (body con `null`) se permite explícitamente para corregir errores

---

## Lo que NO incluye

- Notificación al dictaminador/evaluador asignado
- Asignación masiva o automática
