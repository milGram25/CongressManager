# Rediseño Vista Admin de Facturas Pendientes

## Goal

Rediseñar `/admin/usuarios/facturas` para que muestre exclusivamente facturas pendientes de procesamiento, con un flujo directo: seleccionar factura → subir PDF/XML → factura desaparece del listado.

## Architecture

Nuevo endpoint dedicado `GET /api/users/facturas/pendientes/` que devuelve solo facturas con `estatus='pendiente'`, enriquecidas con nombre del solicitante, congreso y monto pagado. El frontend consume este endpoint directamente, eliminando la dependencia de `getParticipantsApi` para esta vista.

## Backend

### Nuevo endpoint: `GET /api/users/facturas/pendientes/`

- **Permiso:** `IsAdminUser`
- **Query param opcional:** `id_congreso=<int>` — filtra por congreso
- **Orden:** `fecha_solicitud` ASC (más antigua primero)
- **Respuesta por factura:**

```json
{
  "id_factura": 5,
  "id_persona": 12,
  "nombre_completo": "Ana López García",
  "correo_electronico": "ana@mail.com",
  "rfc": "LOGA900101ABC",
  "razon_social": "Ana López S.A.",
  "regimen_fiscal": "601 - General",
  "codigo_postal": "06600",
  "nombre_congreso": "CIENU 2026",
  "id_congreso": 3,
  "fecha_solicitud": "2026-04-28T14:30:00Z",
  "monto_pagado": 1500.00
}
```

El campo `monto_pagado` se obtiene sumando todos los registros en `pagos` donde `id_persona = factura.id_persona` y la `costos_congreso` apunta al congreso de la factura:

```sql
SELECT COALESCE(SUM(p.monto), 0)
FROM pagos p
JOIN costos_congreso cc ON cc.id_costos_congreso = p.id_costos
WHERE p.id_persona = %s AND cc.id_costos_congreso = (
    SELECT id_costos_congreso FROM congreso WHERE id_congreso = %s LIMIT 1
)
```

### Archivos a modificar

- **Modificar:** `backend/users/views.py` — agregar clase `FacturasPendientesAdminView`
- **Modificar:** `backend/users/urls.py` — agregar ruta `facturas/pendientes/`

## Frontend

### Nuevo API function

- **Modificar:** `frontend/src/api/adminApi.js` — agregar `getPendingFacturasApi(accessToken, idCongreso = null)`

```js
export async function getPendingFacturasApi(accessToken, idCongreso = null) {
  const params = idCongreso ? `?id_congreso=${idCongreso}` : '';
  const res = await fetch(`${API_URL}/api/users/facturas/pendientes/${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error al obtener facturas pendientes.');
  return res.json();
}
```

### `UsuariosFacturasView.jsx` — cambios principales

- **Eliminar:** estado `allUsers`, `isBulkSending`, `bulkCount`; función `handleBulkSend`
- **Agregar:** estado `facturasPendientes`, `selectedFactura`
- **Fetch:** usa `getPendingFacturasApi` en lugar de `getParticipantsApi`
- **Botón "Listar todas las pendientes":** en el header; al hacer clic llama a `getPendingFacturasApi(token, null)` sin filtro de congreso y limpia los selects de institución/congreso
- **Eliminar:** botón "Enviar Pendientes" y barra de progreso bulk
- **Al subir exitosamente:** remueve la factura del estado local (ya no es pendiente)
- **Contadores en header:** solo muestra total de pendientes visibles

### `FilterHeader.jsx` — cambios

- **Eliminar:** filtro de Rol (tercer columna del grid)
- El grid pasa de `md:grid-cols-3` a `md:grid-cols-2`
- Se mantienen: Institución y Congreso

### `UserInvoiceList.jsx` → renombrar a `FacturaPendienteList.jsx`

Reescrito para mostrar filas de facturas (no participantes):

Cada fila muestra:
- Nombre completo del solicitante
- RFC
- Nombre del congreso
- Fecha de solicitud (formateada: `dd de mes, yyyy`)
- Monto pagado (formateado como moneda MXN)

Sin íconos de rol. Sin badge de status (todas son pendientes). Al hacer clic activa el panel izquierdo.

### `InvoiceUpload.jsx` — cambios

- Recibe `selectedFactura` en lugar de `selectedUser`
- Header muestra: nombre, email, RFC, razón social, régimen fiscal, código postal, congreso, fecha de solicitud, monto pagado
- Se elimina el badge de rol y los colores por rol
- El mensaje de éxito sigue igual

## Flujo completo

1. Admin entra a `/admin/usuarios/facturas`
2. Puede filtrar por institución + congreso, o hacer clic en "Listar todas las pendientes"
3. Panel derecho muestra facturas pendientes ordenadas por fecha (más antigua primero)
4. Admin hace clic en una factura → panel izquierdo activa el área de subida con los datos de la factura
5. Admin arrastra o selecciona PDF/XML → modal de confirmación → confirma
6. La factura pasa a `estatus='enviada'` en el backend y desaparece del listado del panel derecho
7. El asistente puede descargar el archivo desde `/asistente/facturas`

## Archivos afectados

| Archivo | Acción |
|---|---|
| `backend/users/views.py` | Agregar `FacturasPendientesAdminView` |
| `backend/users/urls.py` | Agregar ruta `facturas/pendientes/` |
| `frontend/src/api/adminApi.js` | Agregar `getPendingFacturasApi` |
| `frontend/src/views/admin/UsuariosFacturasView.jsx` | Reescribir |
| `frontend/src/views/admin/Componentes/FilterHeader.jsx` | Quitar filtro de Rol |
| `frontend/src/views/admin/Componentes/UserInvoiceList.jsx` | Reescribir como `FacturaPendienteList.jsx` |
| `frontend/src/views/admin/Componentes/InvoiceUpload.jsx` | Adaptar a `selectedFactura` |
