# Diseño: Vista /admin/procesos/roles — Gestión de Roles de Usuarios

## Resumen

Nueva sub-vista dentro de la sección de Procesos del panel de administrador. Permite listar todos los usuarios del sistema, buscarlos por nombre y gestionar sus roles (dictaminador, evaluador, administrador) mediante un modal con información completa del usuario. Los roles son acumulativos (un usuario puede tener varios simultáneamente). Todas las operaciones sobre roles requieren confirmación doble: asignar o quitar dictaminador/evaluador muestra un "¿Estás seguro?"; asignar administrador requiere además la contraseña del admin operador.

---

## Arquitectura

### Backend — 3 nuevos endpoints en `users/`

**`GET /api/users/all/`**
- Requiere token de admin (`is_staff=True`)
- Devuelve todos los usuarios de la tabla `persona` sin filtrar por `is_staff`
- Respuesta por usuario:
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
      "evaluador": false,
      "administrador": true
    }
  }
  ```

**`POST /api/users/{id}/role/assign/`**
- Requiere token de admin
- Body: `{ "rol": "dictaminador" | "evaluador" | "administrador", "password": "<contraseña del admin>" }`
- El campo `password` es requerido **únicamente** cuando `rol == "administrador"`; para los demás roles se ignora
- Cuando `rol == "administrador"`: valida la contraseña del usuario autenticado con `authenticate()` antes de proceder
- Para `dictaminador`: `Dictaminador.objects.get_or_create(id_persona=persona)`
- Para `evaluador`: `Evaluador.objects.get_or_create(id_persona=persona)`
- Para `administrador`: `persona.is_staff = True; persona.is_superuser = True; persona.save()`
- Devuelve 200 con los roles actualizados o 400/401 si hay error

**`POST /api/users/{id}/role/remove/`**
- Requiere token de admin
- Body: `{ "rol": "dictaminador" | "evaluador" | "administrador" }`
- No requiere contraseña para ningún rol
- Para `dictaminador`: `Dictaminador.objects.filter(id_persona=persona).delete()`
- Para `evaluador`: `Evaluador.objects.filter(id_persona=persona).delete()`
- Para `administrador`: `persona.is_staff = False; persona.is_superuser = False; persona.save()`
- Devuelve 200 con los roles actualizados

### Frontend — nuevos archivos

| Archivo | Descripción |
|---|---|
| `src/views/admin/ProcesosRolesView.jsx` | Vista principal con buscador y lista de usuarios |
| `src/api/adminApi.js` | 3 nuevas funciones: `getAllUsersApi`, `assignRoleApi`, `removeRoleApi` |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/users/views.py` | Agregar `AllUsersView`, `RoleAssignView`, `RoleRemoveView` |
| `backend/users/urls.py` | Registrar las 3 nuevas rutas |
| `src/views/admin/ProcesosView.jsx` | Agregar tarjeta "Roles" |
| `src/App.jsx` | Agregar ruta `procesos/roles` |
| `src/layouts/SidebarLayout.jsx` (vía `App.jsx`) | Sub-ítem "Roles" en sidebar de Procesos |

---

## Componentes y flujo de datos

### `ProcesosRolesView`

1. Al montar: llama `getAllUsersApi` → guarda lista completa en estado
2. Buscador: filtra la lista en frontend por `nombre_completo` (case-insensitive, sin llamadas extra al API)
3. Lista de usuarios: tarjetas con nombre, correo y badges de roles activos
4. Click en "Gestionar" → abre modal con el usuario seleccionado

### Modal de usuario

- Muestra: nombre completo, correo, teléfono, género, país
- Sección "Roles": un toggle por cada rol (Dictaminador, Evaluador, Administrador)
- Los toggles reflejan el estado actual del usuario (`roles.dictaminador`, etc.)
- Al activar un toggle:
  - Si es "dictaminador" o "evaluador": muestra confirmación simple "¿Estás seguro de asignar este rol?" con botones Cancelar / Confirmar
  - Si es "administrador": muestra campo de contraseña inline + botones Cancelar / Confirmar; al confirmar valida contraseña en backend
- Al desactivar un toggle → muestra confirmación simple "¿Estás seguro de quitar este rol?" con botones Cancelar / Confirmar; al confirmar llama `removeRoleApi`
- Tras cada operación exitosa: actualiza el estado local del usuario en la lista + toast de éxito
- Tras error: toast con el mensaje del backend, el toggle regresa a su estado anterior

---

## Sidebar

En `AdminLayoutWrapper` de `App.jsx`, el sub-menú de Procesos (que ya muestra Resúmenes y Extensos cuando la ruta incluye `/admin/procesos`) se extiende con:

```jsx
{ to: '/admin/procesos/roles', label: 'Roles', icon: MdManageAccounts, className: 'pl-9 opacity-70' }
```

---

## Manejo de errores

| Caso | Comportamiento |
|---|---|
| Contraseña incorrecta al asignar admin | Backend devuelve 401, toast "Contraseña incorrecta", toggle regresa a estado anterior |
| Usuario ya tiene el rol | Backend devuelve 200 (idempotente con `get_or_create`) |
| Usuario no tiene el rol al intentar quitar | Backend devuelve 200 (idempotente con `filter().delete()`) |
| Error de red | Toast "Error de conexión", toggle regresa a estado anterior |

---

## Seguridad

- Los 3 endpoints verifican `IsAuthenticated` + `is_staff=True` del usuario en sesión
- La validación de contraseña para admin usa `authenticate()` de Django, no comparación directa
- El frontend nunca almacena la contraseña ingresada más allá del ciclo de vida del modal

---

## Lo que NO incluye este diseño

- Paginación en el backend (la lista se carga completa y se filtra en frontend; aceptable para el volumen esperado de usuarios de un gestor de congresos)
- Búsqueda por correo o institución (solo por nombre, según lo acordado)
- Confirmación de contraseña para quitar roles (solo se pide contraseña al asignar administrador)
- Notificación por correo al usuario cuando se le asigna/quita un rol
