# Diseño: Vista /admin/procesos/roles — Gestión de Roles de Usuarios

## Resumen

Nueva sub-vista dentro de la sección de Procesos del panel de administrador. Permite listar todos los usuarios del sistema, filtrarlos por nombre, y gestionar sus roles (dictaminador, evaluador, administrador) en el contexto de un congreso específico. Los roles dictaminador y evaluador son **por congreso** — viven en nuevas tablas de unión independientes del sistema global de revisiones. El rol administrador sigue siendo global. Todas las operaciones requieren confirmación doble: "¿Estás seguro?" para dictaminador/evaluador, y contraseña del admin para asignar o quitar administrador.

---

## Arquitectura

### Nuevos modelos Django (`managed=True`)

```python
class DictaminadorCongreso(models.Model):
    id_persona  = models.ForeignKey(Persona,   on_delete=models.CASCADE)
    id_congreso = models.ForeignKey(Congreso,  on_delete=models.CASCADE)
    class Meta:
        unique_together = ('id_persona', 'id_congreso')
        db_table = 'dictaminador_congreso'

class EvaluadorCongreso(models.Model):
    id_persona  = models.ForeignKey(Persona,   on_delete=models.CASCADE)
    id_congreso = models.ForeignKey(Congreso,  on_delete=models.CASCADE)
    class Meta:
        unique_together = ('id_persona', 'id_congreso')
        db_table = 'evaluador_congreso'
```

Estos modelos son independientes de las tablas globales `dictaminador` y `evaluador` que usa el sistema de revisiones existente. Se crean con `makemigrations` / `migrate`.

### Backend — 3 nuevos endpoints en `users/`

**`GET /api/users/all/?id_congreso=<id>`**
- Requiere token de admin (`is_staff=True`)
- Parámetro obligatorio: `id_congreso`
- Devuelve todos los usuarios de `persona` con sus roles para ese congreso:
  ```json
  {
    "id_persona": 1,
    "nombre_completo": "Juan Pérez López",
    "correo_electronico": "juan@example.com",
    "num_telefono": "5512345678",
    "genero": "masculino",
    "pais": "México",
    "roles": {
      "dictaminador": false,
      "evaluador": true,
      "administrador": false
    }
  }
  ```
- `roles.dictaminador` = existe entrada en `DictaminadorCongreso` para ese congreso
- `roles.evaluador` = existe entrada en `EvaluadorCongreso` para ese congreso
- `roles.administrador` = `is_staff=True` o `is_superuser=True` (siempre global)

**`POST /api/users/{id}/role/assign/`**
- Requiere token de admin
- Body: `{ "rol": "dictaminador" | "evaluador" | "administrador", "id_congreso": <id>, "password": "<solo para admin>" }`
- `id_congreso` requerido para dictaminador y evaluador; ignorado para administrador
- `password` requerido únicamente cuando `rol == "administrador"`; valida con `authenticate()`
- Para `dictaminador`: `DictaminadorCongreso.objects.get_or_create(id_persona=persona, id_congreso_id=id_congreso)`
- Para `evaluador`: `EvaluadorCongreso.objects.get_or_create(id_persona=persona, id_congreso_id=id_congreso)`
- Para `administrador`: `persona.is_staff = True; persona.is_superuser = True; persona.save()`
- Devuelve 200 con los roles actualizados para ese congreso

**`POST /api/users/{id}/role/remove/`**
- Requiere token de admin
- Body: `{ "rol": "dictaminador" | "evaluador" | "administrador", "id_congreso": <id>, "password": "<solo para admin>" }`
- `id_congreso` requerido para dictaminador y evaluador
- `password` requerido únicamente cuando `rol == "administrador"`; valida con `authenticate()`
- Para `dictaminador`: `DictaminadorCongreso.objects.filter(id_persona=persona, id_congreso_id=id_congreso).delete()`
- Para `evaluador`: `EvaluadorCongreso.objects.filter(id_persona=persona, id_congreso_id=id_congreso).delete()`
- Para `administrador`: `persona.is_staff = False; persona.is_superuser = False; persona.save()`
- Devuelve 200 con los roles actualizados

### Frontend — nuevos archivos

| Archivo | Descripción |
|---|---|
| `src/views/admin/ProcesosRolesView.jsx` | Vista principal con selector de congreso, buscador y lista de usuarios |
| `src/api/adminApi.js` | 3 nuevas funciones: `getAllUsersApi`, `assignRoleApi`, `removeRoleApi` |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/users/models.py` | Agregar `DictaminadorCongreso`, `EvaluadorCongreso` |
| `backend/users/views.py` | Agregar `AllUsersView`, `RoleAssignView`, `RoleRemoveView` |
| `backend/users/urls.py` | Registrar las 3 nuevas rutas |
| `src/views/admin/ProcesosView.jsx` | Agregar tarjeta "Roles" |
| `src/App.jsx` | Agregar ruta `procesos/roles` y sub-ítem sidebar |

---

## Componentes y flujo de datos

### `ProcesosRolesView`

1. Al montar: carga lista de congresos disponibles (`getCongresosApi`)
2. Admin selecciona un congreso → llama `getAllUsersApi(token, idCongreso)` → guarda lista en estado
3. Buscador: filtra la lista en frontend por `nombre_completo` (case-insensitive)
4. Lista de usuarios: tarjetas con nombre, correo y badges de roles activos **para ese congreso**
5. Click en "Gestionar" → abre modal con el usuario seleccionado

### Modal de usuario

- Muestra: nombre completo, correo, teléfono, género, país
- Muestra el congreso seleccionado como contexto ("Roles en: Congreso X")
- Sección "Roles": un toggle por cada rol (Dictaminador, Evaluador, Administrador)
- Los toggles reflejan el estado del usuario para el congreso seleccionado
- Al activar un toggle:
  - Si es "dictaminador" o "evaluador": confirmación simple "¿Estás seguro de asignar este rol?" → Cancelar / Confirmar
  - Si es "administrador": campo de contraseña inline → Cancelar / Confirmar (llama assign con password)
- Al desactivar un toggle:
  - Si es "dictaminador" o "evaluador": confirmación simple "¿Estás seguro de quitar este rol?" → Cancelar / Confirmar
  - Si es "administrador": campo de contraseña inline → Cancelar / Confirmar (llama remove con password)
- Tras operación exitosa: actualiza estado local del usuario en la lista + toast de éxito
- Tras error: toast con mensaje del backend, toggle regresa a estado anterior

---

## Sidebar

```jsx
{ to: '/admin/procesos/roles', label: 'Roles', icon: MdManageAccounts, className: 'pl-9 opacity-70' }
```

Se añade al sub-menú de Procesos en `AdminLayoutWrapper`, igual que Resúmenes y Extensos.

---

## Manejo de errores

| Caso | Comportamiento |
|---|---|
| Admin no selecciona congreso | Lista vacía + mensaje "Selecciona un congreso para ver usuarios" |
| Contraseña incorrecta (admin) | Backend 401, toast "Contraseña incorrecta", toggle sin cambio |
| Rol ya asignado (idempotente) | Backend 200, `get_or_create` no falla |
| Rol no existe al quitar (idempotente) | Backend 200, `filter().delete()` no falla |
| Error de red | Toast "Error de conexión", toggle regresa a estado anterior |

---

## Seguridad

- Los 3 endpoints verifican `IsAuthenticated` + `is_staff=True`
- La validación de contraseña usa `authenticate()` de Django
- El frontend no almacena la contraseña fuera del ciclo de vida del modal

---

## Lo que NO incluye este diseño

- Impacto en el sistema de revisiones existente — los roles por congreso son independientes de las tablas globales `dictaminador` y `evaluador` que usa la asignación de ponencias
- Paginación en backend (filtrado en frontend)
- Búsqueda por correo o institución
- Notificaciones por correo al usuario
