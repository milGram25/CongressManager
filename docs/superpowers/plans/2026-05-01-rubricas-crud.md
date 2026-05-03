# Rúbricas CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir el modelo Django `RubricaCriterio` (que apunta a la tabla incorrecta), agregar `RubricaGrupo`, completar los endpoints CRUD y conectar el frontend para gestión de grupos, criterios, preguntas y dictámenes.

**Architecture:** El esquema real es `rubrica → rubrica_grupo → rubrica_criterio`. La tabla `rubrica_criterio` usa `id_grupo` (FK a `rubrica_grupo`) y `peso` (numeric 3,2). El Django model actual tiene `id_rubrica` y `puntaje_maximo` — ambos incorrectos. Se corrigen como `managed=False` sin migración. Se agregan viewsets para grupos y criterios. El frontend se actualiza para mostrar y editar la estructura anidada.

**Tech Stack:** Django REST Framework, React, DaisyUI

---

### Task 1: Corregir modelos en `congresos/models.py`

**Files:**
- Modify: `backend/congresos/models.py` (líneas 126-134)

- [ ] **Step 1: Agregar modelo `RubricaGrupo` ANTES de `RubricaCriterio`**

En `backend/congresos/models.py`, insertar DESPUÉS de la línea `124` (después del `__str__` de Rubrica) y ANTES de `class RubricaCriterio`:

```python
class RubricaGrupo(models.Model):
    id_grupo = models.AutoField(primary_key=True)
    id_rubrica = models.ForeignKey(Rubrica, models.CASCADE, db_column='id_rubrica', related_name='grupos')
    nombre_grupo = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'rubrica_grupo'

    def __str__(self):
        return self.nombre_grupo
```

- [ ] **Step 2: Corregir `RubricaCriterio`**

Reemplazar el modelo `RubricaCriterio` existente (líneas 126-134):

```python
class RubricaCriterio(models.Model):
    id_criterio = models.AutoField(primary_key=True)
    id_grupo = models.ForeignKey(RubricaGrupo, models.CASCADE, db_column='id_grupo', related_name='criterios')
    descripcion = models.CharField(max_length=255)
    peso = models.DecimalField(max_digits=3, decimal_places=2, default=1.0)

    class Meta:
        managed = False
        db_table = 'rubrica_criterio'
```

- [ ] **Step 3: Verificar que no hay errores de sintaxis**

```bash
cd /home/diego07/Documentos/CongressManager/backend
python manage.py check
```

Esperado: "System check identified no issues"

- [ ] **Step 4: Commit**

```bash
git add backend/congresos/models.py
git commit -m "fix(congresos): corregir modelo RubricaCriterio y agregar RubricaGrupo"
```

---

### Task 2: Actualizar serializers

**Files:**
- Modify: `backend/congresos/serializers.py`

- [ ] **Step 1: Agregar serializers para `RubricaGrupo` y `RubricaCriterio`**

Agregar ANTES de `class RubricaSerializer` (línea 34):

```python
from .models import RubricaGrupo, RubricaCriterio

class RubricaCriterioSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricaCriterio
        fields = ['id_criterio', 'id_grupo', 'descripcion', 'peso']

class RubricaGrupoSerializer(serializers.ModelSerializer):
    criterios = RubricaCriterioSerializer(many=True, read_only=True)

    class Meta:
        model = RubricaGrupo
        fields = ['id_grupo', 'id_rubrica', 'nombre_grupo', 'criterios']
```

- [ ] **Step 2: Actualizar `RubricaSerializer` para incluir grupos anidados**

Reemplazar la clase `RubricaSerializer` existente (línea 34-37):

```python
class RubricaSerializer(serializers.ModelSerializer):
    grupos = RubricaGrupoSerializer(many=True, read_only=True)

    class Meta:
        model = Rubrica
        fields = ['id_rubrica', 'id_congreso', 'tipo_trabajo', 'nombre', 'esta_activo', 'fecha_creacion', 'grupos']
```

- [ ] **Step 3: Verificar el check de Django**

```bash
python manage.py check
```

Esperado: "System check identified no issues"

- [ ] **Step 4: Commit**

```bash
git add backend/congresos/serializers.py
git commit -m "feat(congresos): serializers para RubricaGrupo y RubricaCriterio con anidado"
```

---

### Task 3: Agregar ViewSets y registrar URLs

**Files:**
- Modify: `backend/congresos/views.py`
- Modify: `backend/congresos/urls.py`

- [ ] **Step 1: Agregar imports en `views.py`**

En la línea 13 de `backend/congresos/views.py`, agregar `RubricaGrupo, RubricaCriterio` al import de `.models`:

```python
from .models import Sede, Institucion, Congreso, Evento, MesasTrabajo, FechasCongreso, CostosCongreso, Rubrica, RubricaGrupo, RubricaCriterio, TipoTrabajo, Dictamen, DictamenPregunta, Subarea, Taller
from .serializers import SedeSerializer, InstitucionSerializer, CongresoSerializer, EventoSerializer, MesasTrabajoSerializer, RubricaSerializer, RubricaGrupoSerializer, RubricaCriterioSerializer, TipoTrabajoSerializer, DictamenSerializer, DictamenPreguntaSerializer, SubareaSerializer, TallerSerializer
```

- [ ] **Step 2: Agregar `RubricaGrupoViewSet` en `views.py` DESPUÉS de `RubricaViewSet` (línea ~36)**

```python
class RubricaGrupoViewSet(viewsets.ModelViewSet):
    serializer_class = RubricaGrupoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = RubricaGrupo.objects.all()
        id_rubrica = self.request.query_params.get('id_rubrica')
        if id_rubrica:
            qs = qs.filter(id_rubrica_id=id_rubrica)
        return qs


class RubricaCriterioViewSet(viewsets.ModelViewSet):
    serializer_class = RubricaCriterioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = RubricaCriterio.objects.all()
        id_grupo = self.request.query_params.get('id_grupo')
        if id_grupo:
            qs = qs.filter(id_grupo_id=id_grupo)
        return qs
```

- [ ] **Step 3: Registrar rutas en `congresos/urls.py`**

Agregar después de la línea `router.register(r'rubricas', ...)`:

```python
from .views import RubricaGrupoViewSet, RubricaCriterioViewSet  # agregar al import existente
router.register(r'rubrica-grupos', RubricaGrupoViewSet, basename='rubrica-grupo')
router.register(r'rubrica-criterios', RubricaCriterioViewSet, basename='rubrica-criterio')
```

- [ ] **Step 4: Actualizar también el import en `DictamenViewSet` para filtrar por tipo_trabajo**

En `views.py`, actualizar `DictamenViewSet`:

```python
class DictamenViewSet(viewsets.ModelViewSet):
    serializer_class = DictamenSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Dictamen.objects.all()
        tipo_trabajo = self.request.query_params.get('tipo_trabajo')
        if tipo_trabajo:
            qs = qs.filter(tipo_trabajo_id=tipo_trabajo)
        return qs
```

- [ ] **Step 5: Verificar que los endpoints respondan**

```bash
python manage.py runserver &
sleep 2
curl -s http://localhost:8000/api/congresos/rubrica-grupos/ -H "Authorization: Bearer $(python manage.py shell -c \"from users.models import Persona; from users.views import get_tokens_for_user; u=Persona.objects.filter(is_staff=True).first(); print(get_tokens_for_user(u)['access'])\")" | python -m json.tool | head -20
kill %1
```

Esperado: respuesta JSON (lista vacía o con datos)

- [ ] **Step 6: Commit**

```bash
git add backend/congresos/views.py backend/congresos/urls.py
git commit -m "feat(congresos): ViewSets y rutas para RubricaGrupo y RubricaCriterio"
```

---

### Task 4: Actualizar frontend `RubricasYPreguntas.jsx`

**Files:**
- Modify: `frontend/src/views/admin/Componentes/RubricasYPreguntas.jsx`
- Modify: `frontend/src/api/adminApi.js`

- [ ] **Step 1: Agregar funciones API para grupos, criterios y preguntas en `adminApi.js`**

Agregar al final de `frontend/src/api/adminApi.js`:

```javascript
// ── Rubrica Grupos ──────────────────────────────────────────────
export async function getRubricaGruposApi(accessToken, idRubrica) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-grupos/?id_rubrica=${idRubrica}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error('Error cargando grupos');
  return res.json();
}

export async function createRubricaGrupoApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-grupos/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creando grupo');
  return res.json();
}

export async function updateRubricaGrupoApi(accessToken, id, data) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-grupos/${id}/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error actualizando grupo');
  return res.json();
}

export async function deleteRubricaGrupoApi(accessToken, id) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-grupos/${id}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error eliminando grupo');
}

// ── Rubrica Criterios ─────────────────────────────────────────────
export async function createRubricaCriterioApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-criterios/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creando criterio');
  return res.json();
}

export async function updateRubricaCriterioApi(accessToken, id, data) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-criterios/${id}/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error actualizando criterio');
  return res.json();
}

export async function deleteRubricaCriterioApi(accessToken, id) {
  const res = await fetch(`${API_URL}/api/congresos/rubrica-criterios/${id}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error eliminando criterio');
}

// ── Dictamen Preguntas ────────────────────────────────────────────
export async function createDictamenApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/dictamenes/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creando dictamen');
  return res.json();
}

export async function createDictamenPreguntaApi(accessToken, data) {
  const res = await fetch(`${API_URL}/api/congresos/preguntas/`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error creando pregunta');
  return res.json();
}

export async function updateDictamenPreguntaApi(accessToken, id, data) {
  const res = await fetch(`${API_URL}/api/congresos/preguntas/${id}/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error actualizando pregunta');
  return res.json();
}

export async function deleteDictamenPreguntaApi(accessToken, id) {
  const res = await fetch(`${API_URL}/api/congresos/preguntas/${id}/`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error eliminando pregunta');
}

export async function getDictamenesConFiltroApi(accessToken, tipoTrabajo = null) {
  let url = `${API_URL}/api/congresos/dictamenes/`;
  if (tipoTrabajo) url += `?tipo_trabajo=${tipoTrabajo}`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('Error cargando dictamenes');
  return res.json();
}
```

- [ ] **Step 2: Reescribir `RubricasYPreguntas.jsx` con CRUD completo**

Reemplazar completamente el contenido del archivo con:

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { MdDelete, MdAdd, MdEdit, MdCheck, MdClose } from 'react-icons/md';
import Notification from '../../../components/Notification';
import {
  getTiposTrabajoApi, getRubricasApi, createRubricaApi,
  createRubricaGrupoApi, updateRubricaGrupoApi, deleteRubricaGrupoApi,
  createRubricaCriterioApi, updateRubricaCriterioApi, deleteRubricaCriterioApi,
  getDictamenesConFiltroApi, createDictamenApi,
  createDictamenPreguntaApi, updateDictamenPreguntaApi, deleteDictamenPreguntaApi,
} from '../../../api/adminApi';

// Componente de edición inline
function InlineEdit({ value, onSave, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    return (
      <div className="flex gap-1 items-center flex-1">
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          className={`input input-bordered input-sm flex-1 rounded-lg ${className}`}
        />
        <button onClick={save} className="btn btn-xs btn-success rounded-lg"><MdCheck size={14} /></button>
        <button onClick={cancel} className="btn btn-xs btn-ghost rounded-lg"><MdClose size={14} /></button>
      </div>
    );
  }
  return (
    <span
      className={`flex-1 cursor-pointer hover:bg-base-200 px-2 py-1 rounded ${className}`}
      onClick={() => setEditing(true)}
    >
      {value || <span className="italic text-base-content/40">Sin nombre</span>}
    </span>
  );
}

const RubricasYPreguntas = ({ idCongreso }) => {
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tiposTrabajoDisponibles, setTiposTrabajoDisponibles] = useState([]);
  const [selectedTipoTrabajo, setSelectedTipoTrabajo] = useState(null);
  const [rubricas, setRubricas] = useState([]);
  const [dictamenes, setDictamenes] = useState([]);
  const accessToken = localStorage.getItem('congress_access');

  const showNotif = (message, type = 'success') => setNotification({ message, type });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tiposData, rubData] = await Promise.all([
        getTiposTrabajoApi(accessToken, idCongreso),
        getRubricasApi(accessToken, idCongreso),
      ]);
      setTiposTrabajoDisponibles(tiposData);
      setRubricas(rubData);
      const firstTipo = tiposData.length > 0 ? tiposData[0].id_tipo_trabajo : null;
      if (firstTipo) {
        setSelectedTipoTrabajo(prev => prev ?? firstTipo);
        const dictData = await getDictamenesConFiltroApi(accessToken, firstTipo);
        setDictamenes(dictData);
      }
    } catch (err) {
      showNotif('Error cargando datos', 'error');
    } finally {
      setLoading(false);
    }
  }, [idCongreso, accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTipoChange = async (idTipo) => {
    setSelectedTipoTrabajo(Number(idTipo));
    const dictData = await getDictamenesConFiltroApi(accessToken, idTipo);
    setDictamenes(dictData);
  };

  const currentRubrica = rubricas.find(r => r.tipo_trabajo === selectedTipoTrabajo);
  const currentDictamen = dictamenes.find(d => d.tipo_trabajo === selectedTipoTrabajo);

  // ── RÚBRICA ──────────────────────────────────────────────────────

  const crearRubrica = async () => {
    if (!selectedTipoTrabajo) return showNotif('Selecciona un tipo de trabajo primero', 'error');
    try {
      const nueva = await createRubricaApi(accessToken, {
        nombre: 'Nueva Rúbrica',
        id_congreso: idCongreso,
        tipo_trabajo: selectedTipoTrabajo,
      });
      setRubricas(prev => [...prev, { ...nueva, grupos: [] }]);
      showNotif('Rúbrica creada');
    } catch { showNotif('Error creando rúbrica', 'error'); }
  };

  const crearGrupo = async (idRubrica) => {
    try {
      const nuevo = await createRubricaGrupoApi(accessToken, { id_rubrica: idRubrica, nombre_grupo: 'Nuevo grupo' });
      setRubricas(prev => prev.map(r =>
        r.id_rubrica === idRubrica ? { ...r, grupos: [...(r.grupos || []), { ...nuevo, criterios: [] }] } : r
      ));
      showNotif('Grupo creado');
    } catch { showNotif('Error creando grupo', 'error'); }
  };

  const actualizarNombreGrupo = async (idRubrica, idGrupo, nombre_grupo) => {
    try {
      await updateRubricaGrupoApi(accessToken, idGrupo, { nombre_grupo });
      setRubricas(prev => prev.map(r =>
        r.id_rubrica === idRubrica ? {
          ...r,
          grupos: r.grupos.map(g => g.id_grupo === idGrupo ? { ...g, nombre_grupo } : g)
        } : r
      ));
    } catch { showNotif('Error actualizando grupo', 'error'); }
  };

  const eliminarGrupo = async (idRubrica, idGrupo) => {
    if (!window.confirm('¿Eliminar este grupo y todos sus criterios?')) return;
    try {
      await deleteRubricaGrupoApi(accessToken, idGrupo);
      setRubricas(prev => prev.map(r =>
        r.id_rubrica === idRubrica ? { ...r, grupos: r.grupos.filter(g => g.id_grupo !== idGrupo) } : r
      ));
      showNotif('Grupo eliminado');
    } catch { showNotif('Error eliminando grupo', 'error'); }
  };

  const crearCriterio = async (idRubrica, idGrupo) => {
    try {
      const nuevo = await createRubricaCriterioApi(accessToken, { id_grupo: idGrupo, descripcion: 'Nuevo criterio', peso: '1.00' });
      setRubricas(prev => prev.map(r =>
        r.id_rubrica === idRubrica ? {
          ...r,
          grupos: r.grupos.map(g =>
            g.id_grupo === idGrupo ? { ...g, criterios: [...(g.criterios || []), nuevo] } : g
          )
        } : r
      ));
      showNotif('Criterio creado');
    } catch { showNotif('Error creando criterio', 'error'); }
  };

  const actualizarCriterio = async (idRubrica, idGrupo, idCriterio, field, value) => {
    try {
      await updateRubricaCriterioApi(accessToken, idCriterio, { [field]: value });
      setRubricas(prev => prev.map(r =>
        r.id_rubrica === idRubrica ? {
          ...r,
          grupos: r.grupos.map(g =>
            g.id_grupo === idGrupo ? {
              ...g,
              criterios: g.criterios.map(c =>
                c.id_criterio === idCriterio ? { ...c, [field]: value } : c
              )
            } : g
          )
        } : r
      ));
    } catch { showNotif('Error actualizando criterio', 'error'); }
  };

  const eliminarCriterio = async (idRubrica, idGrupo, idCriterio) => {
    if (!window.confirm('¿Eliminar este criterio?')) return;
    try {
      await deleteRubricaCriterioApi(accessToken, idCriterio);
      setRubricas(prev => prev.map(r =>
        r.id_rubrica === idRubrica ? {
          ...r,
          grupos: r.grupos.map(g =>
            g.id_grupo === idGrupo ? { ...g, criterios: g.criterios.filter(c => c.id_criterio !== idCriterio) } : g
          )
        } : r
      ));
      showNotif('Criterio eliminado');
    } catch { showNotif('Error eliminando criterio', 'error'); }
  };

  // ── DICTAMEN ─────────────────────────────────────────────────────

  const crearDictamen = async () => {
    if (!selectedTipoTrabajo) return showNotif('Selecciona un tipo de trabajo primero', 'error');
    try {
      const nuevo = await createDictamenApi(accessToken, {
        nombre: 'Nuevo Dictamen',
        tipo_trabajo: selectedTipoTrabajo,
      });
      setDictamenes(prev => [...prev, { ...nuevo, preguntas: [] }]);
      showNotif('Dictamen creado');
    } catch { showNotif('Error creando dictamen', 'error'); }
  };

  const crearPregunta = async (idDictamen) => {
    try {
      const nueva = await createDictamenPreguntaApi(accessToken, { id_dictamen: idDictamen, descripcion: 'Nueva pregunta' });
      setDictamenes(prev => prev.map(d =>
        d.id_dictamen === idDictamen ? { ...d, preguntas: [...(d.preguntas || []), nueva] } : d
      ));
      showNotif('Pregunta creada');
    } catch { showNotif('Error creando pregunta', 'error'); }
  };

  const actualizarPregunta = async (idDictamen, idPregunta, descripcion) => {
    try {
      await updateDictamenPreguntaApi(accessToken, idPregunta, { descripcion });
      setDictamenes(prev => prev.map(d =>
        d.id_dictamen === idDictamen ? {
          ...d,
          preguntas: d.preguntas.map(p => p.id_pregunta === idPregunta ? { ...p, descripcion } : p)
        } : d
      ));
    } catch { showNotif('Error actualizando pregunta', 'error'); }
  };

  const eliminarPregunta = async (idDictamen, idPregunta) => {
    if (!window.confirm('¿Eliminar esta pregunta?')) return;
    try {
      await deleteDictamenPreguntaApi(accessToken, idPregunta);
      setDictamenes(prev => prev.map(d =>
        d.id_dictamen === idDictamen ? { ...d, preguntas: d.preguntas.filter(p => p.id_pregunta !== idPregunta) } : d
      ));
      showNotif('Pregunta eliminada');
    } catch { showNotif('Error eliminando pregunta', 'error'); }
  };

  return (
    <div className="w-full">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {/* Selector de Tipo de Trabajo */}
      <div className="bg-primary text-white p-6 rounded-t-3xl shadow-lg flex flex-col md:flex-row items-center gap-4">
        <h2 className="text-lg font-bold whitespace-nowrap">Selecciona un tipo de trabajo</h2>
        <select
          value={selectedTipoTrabajo || ''}
          onChange={e => handleTipoChange(e.target.value)}
          className="h-10 pl-2 w-full md:w-80 bg-white text-gray-900 rounded-xl font-bold border-none"
        >
          {tiposTrabajoDisponibles.map(tipo => (
            <option key={tipo.id_tipo_trabajo} value={tipo.id_tipo_trabajo}>{tipo.tipo_trabajo}</option>
          ))}
          {tiposTrabajoDisponibles.length === 0 && <option value="">No hay tipos creados</option>}
        </select>
      </div>

      <div className="flex flex-col">
        {/* SECCIÓN DICTAMINACIÓN */}
        <div className="bg-base-100 border border-base-300 p-6 shadow-sm flex flex-col h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <div className="w-2 h-6 bg-primary rounded-full"></div> Dictaminación (Preguntas)
            </h3>
            {!currentDictamen && (
              <button onClick={crearDictamen} className="btn btn-sm btn-primary gap-2 rounded-xl">
                <MdAdd size={18} /> Crear Dictamen
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center"><span className="loading loading-spinner text-primary"></span></div>
          ) : currentDictamen ? (
            <>
              <button
                onClick={() => crearPregunta(currentDictamen.id_dictamen)}
                className="btn btn-sm btn-outline btn-primary gap-2 mb-4 w-fit rounded-xl"
              >
                <MdAdd size={18} /> Nueva Pregunta
              </button>
              <div className="space-y-3">
                {currentDictamen.preguntas?.map((p, i) => (
                  <div key={p.id_pregunta} className="flex gap-2 items-center group">
                    <span className="text-xs font-bold text-base-content/30 w-5">{i + 1}</span>
                    <InlineEdit
                      value={p.descripcion}
                      onSave={v => actualizarPregunta(currentDictamen.id_dictamen, p.id_pregunta, v)}
                      className="bg-white"
                    />
                    <button
                      onClick={() => eliminarPregunta(currentDictamen.id_dictamen, p.id_pregunta)}
                      className="btn btn-sm btn-circle btn-ghost text-error opacity-0 group-hover:opacity-100"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                ))}
                {currentDictamen.preguntas?.length === 0 && (
                  <p className="text-center py-4 text-xs italic text-base-content/40">No hay preguntas aún.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-center py-4 text-xs italic text-base-content/40">
              No hay dictamen para este tipo de trabajo. Crea uno arriba.
            </p>
          )}
        </div>

        {/* SECCIÓN REVISIÓN */}
        <div className="bg-base-100 border border-base-300 p-6 shadow-sm flex flex-col h-fit rounded-b-3xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <div className="w-2 h-6 bg-primary rounded-full"></div> Revisión (Rúbricas)
            </h3>
            {!currentRubrica && (
              <button onClick={crearRubrica} className="btn btn-sm btn-primary gap-2 rounded-xl">
                <MdAdd size={18} /> Crear Rúbrica
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center"><span className="loading loading-spinner text-primary"></span></div>
          ) : currentRubrica ? (
            <>
              <button
                onClick={() => crearGrupo(currentRubrica.id_rubrica)}
                className="btn btn-sm btn-outline btn-primary gap-2 mb-4 w-fit rounded-xl"
              >
                <MdAdd size={18} /> Nuevo Grupo
              </button>
              <div className="space-y-4">
                {currentRubrica.grupos?.map(grupo => (
                  <div key={grupo.id_grupo} className="bg-base-200 p-4 rounded-2xl border border-base-300">
                    {/* Cabecera del grupo */}
                    <div className="flex items-center gap-2 mb-3 group">
                      <InlineEdit
                        value={grupo.nombre_grupo}
                        onSave={v => actualizarNombreGrupo(currentRubrica.id_rubrica, grupo.id_grupo, v)}
                        className="font-bold text-sm"
                      />
                      <button
                        onClick={() => eliminarGrupo(currentRubrica.id_rubrica, grupo.id_grupo)}
                        className="btn btn-xs btn-circle btn-ghost text-error opacity-0 group-hover:opacity-100"
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>

                    {/* Criterios del grupo */}
                    <div className="space-y-2 pl-2">
                      {grupo.criterios?.map((c, i) => (
                        <div key={c.id_criterio} className="flex items-center gap-2 group bg-white p-2 rounded-xl">
                          <span className="text-xs text-base-content/30 w-4">{i + 1}</span>
                          <InlineEdit
                            value={c.descripcion}
                            onSave={v => actualizarCriterio(currentRubrica.id_rubrica, grupo.id_grupo, c.id_criterio, 'descripcion', v)}
                            className="text-sm"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              value={parseFloat(c.peso) * 100 || ''}
                              onChange={e => actualizarCriterio(
                                currentRubrica.id_rubrica, grupo.id_grupo, c.id_criterio,
                                'peso', (parseFloat(e.target.value || 0) / 100).toFixed(2)
                              )}
                              className="input input-bordered input-xs w-16 rounded-lg text-center"
                              min="0" max="100" placeholder="%"
                            />
                            <span className="text-xs text-base-content/40">%</span>
                          </div>
                          <button
                            onClick={() => eliminarCriterio(currentRubrica.id_rubrica, grupo.id_grupo, c.id_criterio)}
                            className="btn btn-xs btn-circle btn-ghost text-error opacity-0 group-hover:opacity-100"
                          >
                            <MdDelete size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => crearCriterio(currentRubrica.id_rubrica, grupo.id_grupo)}
                        className="btn btn-xs btn-ghost gap-1 mt-1 rounded-xl"
                      >
                        <MdAdd size={14} /> Criterio
                      </button>
                    </div>
                  </div>
                ))}
                {(!currentRubrica.grupos || currentRubrica.grupos.length === 0) && (
                  <p className="text-center py-10 text-xs italic text-base-content/40 uppercase tracking-widest">
                    Sin grupos definidos. Crea uno arriba.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-center py-4 text-xs italic text-base-content/40">
              No hay rúbrica para este tipo de trabajo. Crea una arriba.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RubricasYPreguntas;
```

- [ ] **Step 3: Arrancar el servidor y verificar la vista en el navegador**

```bash
cd /home/diego07/Documentos/CongressManager/backend && python manage.py runserver &
cd /home/diego07/Documentos/CongressManager/frontend && npm run dev &
```

Navegar a `/admin/eventos/congresos/tipos-trabajo/<id>` en el navegador. Verificar:
- Dropdown de tipos de trabajo funciona
- Botones "Crear Rúbrica" y "Crear Dictamen" aparecen cuando no hay datos
- Se puede crear grupo, criterio, pregunta
- Edición inline funciona (clic en texto → campo de texto)
- Eliminación muestra confirmación

- [ ] **Step 4: Commit**

```bash
git add frontend/src/views/admin/Componentes/RubricasYPreguntas.jsx frontend/src/api/adminApi.js
git commit -m "feat(frontend): CRUD completo de rúbricas, grupos, criterios y preguntas"
```
