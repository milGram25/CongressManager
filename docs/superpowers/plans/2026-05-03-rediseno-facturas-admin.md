# Rediseño Vista Admin Facturas Pendientes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar `/admin/usuarios/facturas` para mostrar exclusivamente facturas pendientes con flujo directo: selección → subida PDF/XML → desaparición del listado.

**Architecture:** Nuevo endpoint `GET /api/users/facturas/pendientes/` devuelve facturas pendientes enriquecidas con monto pagado. El frontend consume este endpoint directamente. El panel derecho muestra filas de facturas (no participantes), y el panel izquierdo de subida se adapta a la estructura de factura. Al subir exitosamente, la factura se elimina del estado local sin recargar.

**Tech Stack:** Django REST Framework, raw SQL (PostgreSQL), React 18, Tailwind CSS, DaisyUI.

---

## File Structure

| Archivo | Acción |
|---|---|
| `backend/users/views.py` | Agregar clase `FacturasPendientesAdminView` |
| `backend/users/urls.py` | Agregar ruta `facturas/pendientes/` |
| `backend/users/tests.py` | Agregar `FacturasPendientesAdminViewTests` |
| `frontend/src/api/adminApi.js` | Agregar `getPendingFacturasApi` |
| `frontend/src/views/admin/Componentes/FilterHeader.jsx` | Quitar filtro de Rol |
| `frontend/src/views/admin/Componentes/FacturaPendienteList.jsx` | Crear (reemplaza `UserInvoiceList.jsx`) |
| `frontend/src/views/admin/Componentes/InvoiceUpload.jsx` | Adaptar de `selectedUser` a `selectedFactura` |
| `frontend/src/views/admin/UsuariosFacturasView.jsx` | Reescribir completo |

---

### Task 1: Backend — FacturasPendientesAdminView + tests

**Files:**
- Modify: `backend/users/views.py`
- Modify: `backend/users/urls.py`
- Modify: `backend/users/tests.py`

- [ ] **Step 1: Escribir el test que falla**

Agregar al final de `backend/users/tests.py`:

```python
class FacturasPendientesAdminViewTests(TestCase):
    databases = ['default']

    def setUp(self):
        self.client = APIClient()
        self.admin = _create_persona('admin_fp@test.com', is_staff=True, is_superuser=True)
        self.user = _create_persona('user_fp@test.com', nombre='María', apellido='González')
        self.congreso_id = _create_congreso('Congreso FP Test')
        self.client.force_authenticate(user=self.admin)

        with connection.cursor() as c:
            c.execute(
                """INSERT INTO factura (id_persona, id_congreso, rfc, razon_social, estatus, fecha_solicitud)
                   VALUES (%s, %s, %s, %s, 'pendiente', NOW()) RETURNING id_factura""",
                [self.user.id_persona, self.congreso_id, 'GOMA800101ABC', 'María González S.A.'],
            )
            self.id_factura = c.fetchone()[0]

    def test_requires_staff(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get('/api/users/facturas/pendientes/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_returns_pending_facturas(self):
        res = self.client.get('/api/users/facturas/pendientes/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [f['id_factura'] for f in res.data]
        self.assertIn(self.id_factura, ids)

    def test_filters_by_congreso(self):
        otro = _create_congreso('Otro Congreso')
        res = self.client.get(f'/api/users/facturas/pendientes/?id_congreso={otro}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [f['id_factura'] for f in res.data]
        self.assertNotIn(self.id_factura, ids)

    def test_response_shape(self):
        res = self.client.get(f'/api/users/facturas/pendientes/?id_congreso={self.congreso_id}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        f = res.data[0]
        self.assertEqual(f['id_factura'], self.id_factura)
        self.assertEqual(f['rfc'], 'GOMA800101ABC')
        self.assertIn('nombre_completo', f)
        self.assertIn('monto_pagado', f)
        self.assertIn('fecha_solicitud', f)
        self.assertIn('nombre_congreso', f)

    def test_does_not_return_enviadas(self):
        with connection.cursor() as c:
            c.execute(
                "INSERT INTO factura (id_persona, id_congreso, rfc, estatus, fecha_solicitud)"
                " VALUES (%s, %s, %s, 'enviada', NOW())",
                [self.user.id_persona, self.congreso_id, 'ENVIADA999XYZ'],
            )
        res = self.client.get(f'/api/users/facturas/pendientes/?id_congreso={self.congreso_id}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        rfcs = [f.get('rfc') for f in res.data]
        self.assertNotIn('ENVIADA999XYZ', rfcs)
```

- [ ] **Step 2: Verificar que el test falla**

```bash
cd /home/diego07/Documentos/CongressManager/backend
python manage.py test users.tests.FacturasPendientesAdminViewTests --verbosity=2
```

Expected: error 404 o `AttributeError` — la vista no existe aún.

- [ ] **Step 3: Implementar FacturasPendientesAdminView en views.py**

Agregar justo después de la clase `MisFacturasView` en `backend/users/views.py`:

```python
class FacturasPendientesAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        id_congreso = request.query_params.get('id_congreso')

        facturas = (
            Factura.objects
            .filter(estatus='pendiente')
            .select_related('id_persona', 'id_congreso')
            .order_by('fecha_solicitud')
        )
        if id_congreso:
            facturas = facturas.filter(id_congreso_id=id_congreso)

        result = []
        with connection.cursor() as cursor:
            for f in facturas:
                persona = f.id_persona
                nombre = ' '.join(
                    x for x in [persona.nombre, persona.primer_apellido, persona.segundo_apellido] if x
                ).strip()

                monto = 0
                if f.id_congreso_id:
                    cursor.execute("""
                        SELECT COALESCE(SUM(p.monto), 0)
                        FROM pagos p
                        JOIN costos_congreso cc ON cc.id_costos_congreso = p.id_costos
                        WHERE p.id_persona = %s AND cc.id_costos_congreso = (
                            SELECT id_costos_congreso FROM congreso WHERE id_congreso = %s LIMIT 1
                        )
                    """, [persona.id_persona, f.id_congreso_id])
                    row = cursor.fetchone()
                    monto = float(row[0]) if row else 0

                result.append({
                    'id_factura': f.id_factura,
                    'id_persona': persona.id_persona,
                    'nombre_completo': nombre,
                    'correo_electronico': persona.correo_electronico,
                    'rfc': f.rfc,
                    'razon_social': f.razon_social,
                    'regimen_fiscal': f.regimen_fiscal,
                    'codigo_postal': f.codigo_postal,
                    'nombre_congreso': f.id_congreso.nombre_congreso if f.id_congreso else None,
                    'id_congreso': f.id_congreso_id,
                    'fecha_solicitud': f.fecha_solicitud,
                    'monto_pagado': monto,
                })

        return Response(result)
```

- [ ] **Step 4: Registrar la ruta en urls.py**

En `backend/users/urls.py`, agregar `FacturasPendientesAdminView` al import:

```python
from .views import (
    RegisterView, LoginView, UserMeView,
    ParticipantsListView,
    ConstanciaUploadView, BulkConstanciaActionView,
    FacturaUploadView, BulkFacturaActionView,
    SolicitarFacturaView, MisFacturasView,
    FacturasPendientesAdminView,
    UserActionHistoryView,
    AllUsersView, RoleAssignView, RoleRemoveView,
)
```

Y agregar en `urlpatterns`:

```python
path('facturas/pendientes/', FacturasPendientesAdminView.as_view(), name='facturas-pendientes-admin'),
```

- [ ] **Step 5: Correr los tests y verificar que pasan**

```bash
cd /home/diego07/Documentos/CongressManager/backend
python manage.py test users.tests.FacturasPendientesAdminViewTests --verbosity=2
```

Expected: 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/users/views.py backend/users/urls.py backend/users/tests.py
git commit -m "feat: endpoint GET /api/users/facturas/pendientes/ para admin"
```

---

### Task 2: Frontend API + FilterHeader

**Files:**
- Modify: `frontend/src/api/adminApi.js`
- Modify: `frontend/src/views/admin/Componentes/FilterHeader.jsx`

- [ ] **Step 1: Agregar getPendingFacturasApi en adminApi.js**

Insertar después de `getParticipantsApi` (línea ~14) en `frontend/src/api/adminApi.js`:

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

- [ ] **Step 2: Reescribir FilterHeader.jsx sin el filtro de Rol**

Reemplazar el contenido completo de `frontend/src/views/admin/Componentes/FilterHeader.jsx`:

```jsx
import { useState, useMemo } from 'react';
import Select from 'react-select';

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: '10px',
    borderColor: state.isFocused ? '#005a6a' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(0,90,106,0.15)' : 'none',
    padding: '1px',
    '&:hover': { borderColor: '#005a6a' },
    transition: 'all 0.2s',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#005a6a' : state.isFocused ? '#f0f9fa' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    fontSize: '13px',
  }),
  placeholder: (base) => ({ ...base, fontSize: '13px', color: '#9ca3af' }),
  singleValue: (base) => ({ ...base, fontSize: '13px', color: '#374151' }),
};

export default function FilterHeader({ onFilterChange = () => {}, congresos = [] }) {
  const [selectedInstitucion, setSelectedInstitucion] = useState(null);

  const institucionOptions = useMemo(() => {
    const seen = new Map();
    for (const c of congresos) {
      const id = c.id_institucion_id || c.id_institucion;
      const nombre = c.nombre_institucion;
      if (id && nombre && !seen.has(id)) {
        seen.set(id, { value: id, label: nombre });
      }
    }
    return Array.from(seen.values());
  }, [congresos]);

  const congresoOptions = useMemo(() => {
    const list = selectedInstitucion
      ? congresos.filter(c => (c.id_institucion_id || c.id_institucion) === selectedInstitucion)
      : congresos;
    return list.map(c => ({ value: c.id_congreso, label: c.nombre_congreso }));
  }, [congresos, selectedInstitucion]);

  const handleInstitucionChange = (opt) => {
    const val = opt ? opt.value : null;
    setSelectedInstitucion(val);
    onFilterChange('idCongreso', null);
    onFilterChange('institucion', null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div>
        <label className="text-[10px] font-bold text-gray-400 ml-1 mb-1.5 block uppercase tracking-widest">Institución</label>
        <Select
          options={institucionOptions}
          styles={selectStyles}
          placeholder="Todas las instituciones..."
          isClearable
          onChange={handleInstitucionChange}
          noOptionsMessage={() => 'Sin opciones'}
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-gray-400 ml-1 mb-1.5 block uppercase tracking-widest">
          Congreso {selectedInstitucion ? `(${congresoOptions.length})` : ''}
        </label>
        <Select
          key={selectedInstitucion}
          options={congresoOptions}
          styles={selectStyles}
          placeholder={selectedInstitucion ? 'Selecciona un congreso...' : 'Primero selecciona institución...'}
          isClearable
          onChange={(opt) => onFilterChange('idCongreso', opt ? opt.value : null)}
          noOptionsMessage={() => 'Sin congresos para esta institución'}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/adminApi.js frontend/src/views/admin/Componentes/FilterHeader.jsx
git commit -m "feat: getPendingFacturasApi y quitar filtro rol en FilterHeader"
```

---

### Task 3: Componente FacturaPendienteList

**Files:**
- Create: `frontend/src/views/admin/Componentes/FacturaPendienteList.jsx`

- [ ] **Step 1: Crear el archivo FacturaPendienteList.jsx**

```jsx
import { MdReceipt, MdAccessTime } from "react-icons/md";

const formatFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

const formatMonto = (monto) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto ?? 0);

export default function FacturaPendienteList({ facturas, selectedId, onSelect }) {
  return (
    <div className="divide-y divide-gray-50">
      {facturas.map((factura) => (
        <div
          key={factura.id_factura}
          onClick={() => onSelect(factura)}
          className={`group flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-gray-50
            ${selectedId === factura.id_factura
              ? 'bg-blue-50/50 border-l-4 border-l-[#005a6a]'
              : 'border-l-4 border-l-transparent'}`}
        >
          <div className="w-10 h-10 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MdReceipt className="text-orange-400 text-xl" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 truncate">{factura.nombre_completo}</h4>
            <p className="text-xs text-gray-500 font-mono">RFC: {factura.rfc || '—'}</p>
            <p className="text-xs text-[#005a6a] font-semibold truncate">{factura.nombre_congreso || '—'}</p>
          </div>

          <div className="text-right hidden sm:flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <MdAccessTime />
              {formatFecha(factura.fecha_solicitud)}
            </div>
            <span className="text-sm font-bold text-[#005a6a]">{formatMonto(factura.monto_pagado)}</span>
          </div>

          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">→</div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/views/admin/Componentes/FacturaPendienteList.jsx
git commit -m "feat: componente FacturaPendienteList para listado de facturas pendientes"
```

---

### Task 4: Adaptar InvoiceUpload a selectedFactura

**Files:**
- Modify: `frontend/src/views/admin/Componentes/InvoiceUpload.jsx`

- [ ] **Step 1: Reescribir InvoiceUpload.jsx**

Reemplazar el contenido completo de `frontend/src/views/admin/Componentes/InvoiceUpload.jsx`:

```jsx
import { useState, useEffect } from "react";
import { HiDocumentText, HiCheckCircle, HiX, HiMail } from "react-icons/hi";
import { MdReceipt, MdAccessTime } from "react-icons/md";
import { uploadFacturaApi } from "../../../api/adminApi";

const formatFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

const formatMonto = (monto) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto ?? 0);

export default function InvoiceUpload({ selectedFactura, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    setFile(null);
    setSuccessMsg(false);
  }, [selectedFactura?.id_factura]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const isXmlFile = (f) =>
    f.type === 'text/xml' || f.type === 'application/xml' || f.name.toLowerCase().endsWith('.xml');

  const handleFile = (f) => {
    if (!f) return;
    if (f.type === 'application/pdf' || isXmlFile(f)) {
      setFile(f);
      setShowModal(true);
    } else {
      alert('Solo se aceptan archivos PDF o XML.');
    }
  };

  const handleConfirmSend = async () => {
    setIsUploading(true);
    try {
      await uploadFacturaApi(
        accessToken,
        selectedFactura.id_persona,
        selectedFactura.id_congreso,
        file,
      );
      setIsUploading(false);
      setShowModal(false);
      setFile(null);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      if (onUploadSuccess) onUploadSuccess(selectedFactura.id_factura);
    } catch {
      alert('Error al subir la factura.');
      setIsUploading(false);
    }
  };

  if (!selectedFactura) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center gap-4 min-h-[300px] text-gray-300">
        <MdReceipt className="text-5xl" />
        <p className="text-sm font-semibold text-center">Selecciona una factura pendiente de la lista</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col rounded-3xl overflow-hidden shadow-lg border border-gray-100 animate-in slide-in-from-left duration-400">
        {/* Cabecera */}
        <div className="bg-gradient-to-br from-[#005a6a] to-[#007a8a] text-white p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-white/20">
              <MdReceipt />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-base leading-tight truncate">{selectedFactura.nombre_completo}</h3>
              <p className="text-white/70 text-xs truncate mt-0.5">{selectedFactura.correo_electronico}</p>
              <p className="text-white/60 text-xs mt-1 font-semibold truncate">{selectedFactura.nombre_congreso}</p>
            </div>
          </div>

          {/* Datos fiscales */}
          <div className="mt-4 bg-white/10 rounded-xl p-3 border border-white/15 space-y-1">
            {selectedFactura.rfc && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/50 font-bold uppercase tracking-wider w-20">RFC</span>
                <span className="font-mono font-bold text-white">{selectedFactura.rfc}</span>
              </div>
            )}
            {selectedFactura.razon_social && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/50 font-bold uppercase tracking-wider w-20">Razón</span>
                <span className="font-semibold text-white/90 truncate">{selectedFactura.razon_social}</span>
              </div>
            )}
            {selectedFactura.regimen_fiscal && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/50 font-bold uppercase tracking-wider w-20">Régimen</span>
                <span className="text-white/80 text-[10px] truncate">{selectedFactura.regimen_fiscal}</span>
              </div>
            )}
            {selectedFactura.codigo_postal && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/50 font-bold uppercase tracking-wider w-20">C.P.</span>
                <span className="text-white/80">{selectedFactura.codigo_postal}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs pt-1 border-t border-white/10 mt-1">
              <MdAccessTime className="text-white/50 shrink-0" />
              <span className="text-white/60">Solicitada:</span>
              <span className="text-white/90 font-semibold">{formatFecha(selectedFactura.fecha_solicitud)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/50 font-bold uppercase tracking-wider w-20">Pagado</span>
              <span className="text-yellow-300 font-black">{formatMonto(selectedFactura.monto_pagado)}</span>
            </div>
          </div>

          {successMsg && (
            <div className="mt-3 flex items-center gap-2 bg-green-500/20 border border-green-400/40 text-green-200 rounded-xl px-3 py-2 text-xs font-bold animate-in fade-in zoom-in duration-300">
              <HiCheckCircle className="text-lg shrink-0" /> Factura enviada correctamente
            </div>
          )}
        </div>

        {/* Zona de subida */}
        <div className="bg-white p-5">
          <label
            className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center
              ${dragActive ? 'bg-[#005a6a]/5 border-[#005a6a] scale-[1.02]' : 'border-gray-200 hover:border-[#005a6a]/40 hover:bg-gray-50'}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <MdReceipt className={`text-4xl transition-colors ${dragActive ? 'text-[#005a6a]' : 'text-gray-300'}`} />
            <div>
              <p className="text-sm font-semibold text-gray-600">Arrastra el PDF o XML de la factura aquí</p>
              <p className="text-xs text-gray-400 mt-0.5">o haz clic para explorar (PDF / XML)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.xml"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {/* Modal confirmación */}
      {showModal && file && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 lg:p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isUploading && setShowModal(false)} />
          <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div className="flex items-center gap-3">
                <MdReceipt className="text-2xl text-[#005a6a]" />
                <div>
                  <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">Confirmar Envío de Factura</h3>
                  <p className="text-xs text-gray-400">{selectedFactura.nombre_completo} — {selectedFactura.rfc || 'Sin RFC'}</p>
                </div>
              </div>
              <button onClick={() => !isUploading && setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <HiX className="text-xl text-gray-400" />
              </button>
            </div>

            <div className="flex-1 bg-neutral-200 overflow-auto p-6 flex items-start justify-center">
              {file.type === 'application/pdf' ? (
                <iframe src={previewUrl} className="w-full h-[60vh] rounded-lg border-none shadow-lg" title="Vista previa" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-12 bg-white rounded-2xl shadow-inner">
                  <HiDocumentText className="text-8xl text-[#005a6a]/40" />
                  <p className="font-bold text-gray-700 text-center">{file.name}</p>
                  <p className="text-xs text-gray-400">Archivo XML listo para enviar</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-white border-t flex gap-3 shrink-0">
              <button
                disabled={isUploading}
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-500 text-xs hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                disabled={isUploading}
                onClick={handleConfirmSend}
                className="flex-1 py-2.5 bg-[#005a6a] text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-[#004a5a] transition-all shadow-lg disabled:opacity-50"
              >
                {isUploading ? <span className="loading loading-spinner loading-sm" /> : <HiMail className="text-base" />}
                Confirmar y Enviar Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/views/admin/Componentes/InvoiceUpload.jsx
git commit -m "feat: adaptar InvoiceUpload a selectedFactura con monto y fecha"
```

---

### Task 5: Reescribir UsuariosFacturasView

**Files:**
- Modify: `frontend/src/views/admin/UsuariosFacturasView.jsx`

- [ ] **Step 1: Reescribir UsuariosFacturasView.jsx**

Reemplazar el contenido completo de `frontend/src/views/admin/UsuariosFacturasView.jsx`:

```jsx
import { useState, useEffect, useMemo } from "react";
import { HiSearch, HiFilter, HiCollection } from "react-icons/hi";
import { MdReceipt } from "react-icons/md";
import InvoiceUpload from "./Componentes/InvoiceUpload";
import FacturaPendienteList from "./Componentes/FacturaPendienteList";
import FilterHeader from "./Componentes/FilterHeader";
import { getPendingFacturasApi, getCongresosApi } from "../../api/adminApi";

export default function UsuariosFacturasView() {
  const [facturasPendientes, setFacturasPendientes] = useState([]);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [congresos, setCongresos] = useState([]);
  const [filters, setFilters] = useState({ idCongreso: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listingAll, setListingAll] = useState(false);

  const accessToken = localStorage.getItem('congress_access');

  useEffect(() => {
    getCongresosApi(accessToken).then(setCongresos).catch(console.error);
  }, []);

  useEffect(() => {
    if (filters.idCongreso) fetchPendientes(filters.idCongreso);
  }, [filters.idCongreso]);

  const fetchPendientes = async (idCongreso = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingFacturasApi(accessToken, idCongreso);
      setFacturasPendientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    if (field === 'idCongreso') {
      setSelectedFactura(null);
      setListingAll(false);
      setFacturasPendientes([]);
      setFilters(prev => ({ ...prev, idCongreso: value }));
    }
  };

  const handleListarTodas = () => {
    setListingAll(true);
    setSelectedFactura(null);
    setFilters({ idCongreso: null });
    fetchPendientes(null);
  };

  const handleUploadSuccess = (idFactura) => {
    setFacturasPendientes(prev => prev.filter(f => f.id_factura !== idFactura));
    setSelectedFactura(null);
  };

  const facturasFiltradas = useMemo(() => {
    if (!searchTerm) return facturasPendientes;
    const term = searchTerm.toLowerCase();
    return facturasPendientes.filter(f =>
      f.nombre_completo.toLowerCase().includes(term) ||
      (f.rfc || '').toLowerCase().includes(term) ||
      (f.nombre_congreso || '').toLowerCase().includes(term)
    );
  }, [facturasPendientes, searchTerm]);

  const sinFiltro = !filters.idCongreso && !listingAll;

  return (
    <div className="flex flex-col h-full gap-6 p-2 md:p-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-[#005a6a] rounded-full"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Facturas</h1>
              <p className="text-sm text-gray-500">Procesa y envía facturas a los participantes del congreso</p>
            </div>
          </div>
          <button
            onClick={handleListarTodas}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
              ${listingAll
                ? 'bg-[#005a6a] text-white shadow-lg shadow-[#005a6a]/20'
                : 'bg-gray-100 text-gray-600 hover:bg-[#005a6a]/10 hover:text-[#005a6a]'}`}
          >
            <HiCollection />
            Listar todas las pendientes
          </button>
        </div>

        <FilterHeader onFilterChange={handleFilterChange} congresos={congresos} />

        {facturasPendientes.length > 0 && (
          <div className="flex gap-3 pt-1 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
              <MdReceipt /> {facturasFiltradas.length} pendientes
            </span>
          </div>
        )}
      </div>

      {/* Alerta sin filtro */}
      {sinFiltro && (
        <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top duration-500">
          <div className="bg-blue-400 p-2 rounded-xl text-white"><HiFilter className="text-xl" /></div>
          <div>
            <p className="text-blue-800 font-bold text-sm">Selecciona un congreso o lista todas las pendientes</p>
            <p className="text-blue-600 text-xs">Usa los filtros o el botón para ver facturas pendientes.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
          {error}
        </div>
      )}

      {/* Contenido principal */}
      {!sinFiltro && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            <InvoiceUpload
              selectedFactura={selectedFactura}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>

          <div className="lg:col-span-7 xl:col-span-8 bg-gray-50/50 rounded-3xl shadow-inner border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 border-b border-gray-100">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                Facturas Pendientes
                <span className="bg-orange-400 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {facturasFiltradas.length}
                </span>
              </h3>
              <div className="relative w-full sm:w-64">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RFC, congreso..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#005a6a] focus:border-transparent outline-none text-sm bg-white shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center py-16">
                  <span className="loading loading-spinner loading-lg text-[#005a6a]" />
                </div>
              ) : facturasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-16">
                  <MdReceipt className="text-5xl opacity-30" />
                  <p className="text-sm font-semibold">Sin facturas pendientes</p>
                </div>
              ) : (
                <FacturaPendienteList
                  facturas={facturasFiltradas}
                  selectedId={selectedFactura?.id_factura}
                  onSelect={(f) => setSelectedFactura(
                    selectedFactura?.id_factura === f.id_factura ? null : f
                  )}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar el flujo completo en el navegador**

Arrancar backend y frontend si no están corriendo:
```bash
# Backend
cd /home/diego07/Documentos/CongressManager/backend
source venv/bin/activate && python manage.py runserver

# Frontend (otra terminal)
cd /home/diego07/Documentos/CongressManager/frontend
npm run dev
```

Verificar:
1. Navegar a `/admin/usuarios/facturas` — debe mostrar alerta "Selecciona un congreso o lista todas las pendientes"
2. Hacer clic en "Listar todas las pendientes" — panel derecho muestra todas las facturas pendientes ordenadas por fecha
3. Seleccionar institución + congreso — filtra por ese congreso
4. Hacer clic en una factura del panel derecho — panel izquierdo activa con nombre, RFC, congreso, fecha de solicitud y monto pagado
5. Arrastrar un PDF — modal de confirmación aparece con vista previa
6. Confirmar — la factura desaparece del listado

- [ ] **Step 3: Commit**

```bash
git add frontend/src/views/admin/UsuariosFacturasView.jsx
git commit -m "feat: rediseño completo vista admin facturas pendientes"
```

---

## Self-Review

**Spec coverage:**
- ✅ Solo muestra facturas pendientes → `estatus='pendiente'` en endpoint y listado
- ✅ Panel izquierdo drag-drop → `InvoiceUpload` con `selectedFactura`
- ✅ Panel derecho ordenado por fecha → `ORDER BY fecha_solicitud ASC` en backend
- ✅ Filtros: solo institución y congreso → `FilterHeader` sin filtro de Rol, grid 2 columnas
- ✅ Botón "Listar todas las pendientes" → `handleListarTodas` llama al endpoint sin filtro, se activa visualmente
- ✅ Fecha de solicitud en info → `InvoiceUpload` y `FacturaPendienteList` la muestran
- ✅ Monto pagado → calculado con SQL en backend, mostrado en ambos paneles
- ✅ Botón "Enviar Pendientes" eliminado → no aparece en `UsuariosFacturasView`
- ✅ Al subir exitosamente → `handleUploadSuccess` filtra la factura del estado local

**Placeholder scan:** ninguno.

**Type consistency:** `selectedFactura.id_factura` usado como clave en toda la vista. `onUploadSuccess(idFactura)` recibe `id_factura` y filtra el estado. `FacturaPendienteList` recibe `selectedId` que se compara con `factura.id_factura`. Consistente en todas las tareas.
