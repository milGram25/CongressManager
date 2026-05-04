# Procesos Datos Reales Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar los datos MOCK en las vistas `/admin/procesos/resumenes` y `/admin/procesos/extensos` con datos reales del backend, agregar selector de congreso, y mostrar la evaluación completa (rúbricas + criterios + puntajes + comentarios).

**Architecture:** Dos nuevos endpoints en `ponencias/` que reciben `?id_congreso=N` y devuelven ponencias con sus datos de resumen/extenso + estado (asignado, revisado, aceptado) + autores + datos de evaluación. El frontend agrega un selector de congreso al inicio de cada vista y se conecta a los nuevos endpoints manteniendo la interfaz existente de `ListaResumenes`/`ListaExtensos`.

**Tech Stack:** Django REST Framework (raw SQL), React, ponenciasApi.js

---

### Task 1: Backend — endpoint resumenes por congreso

**Files:**
- Modify: `backend/ponencias/views.py`
- Modify: `backend/ponencias/urls.py`

- [ ] **Step 1: Agregar imports en `ponencias/views.py`**

Agregar (si no están ya presentes):
```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import connection
```

- [ ] **Step 2: Agregar `ResumenesCongresoView` al final de `ponencias/views.py`**

```python
class ResumenesCongresoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as c:
            # Ponencias con resumen del congreso
            c.execute("""
                SELECT
                    p.id_ponencia,
                    p.id_resumen,
                    COALESCE(s.nombre, 'Ponencia ' || p.id_ponencia::text) AS titulo,
                    r.id_dictaminador,
                    r.revisado,
                    r.estatus,
                    r.retroalimentacion,
                    CASE WHEN d_per.id_persona IS NOT NULL
                        THEN d_per.nombre || ' ' || d_per.primer_apellido
                        ELSE NULL
                    END AS nombre_dictaminador
                FROM ponencia p
                JOIN evento e ON p.id_evento = e.id_evento
                JOIN resumen r ON p.id_resumen = r.id_resumen
                LEFT JOIN subareas s ON p.id_subarea = s.id_subareas
                LEFT JOIN dictaminador d ON r.id_dictaminador = d.id_dictaminador
                LEFT JOIN persona d_per ON d.id_persona = d_per.id_persona
                WHERE e.id_congreso = %s
                ORDER BY p.id_ponencia
            """, [id_congreso])
            ponencias = c.fetchall()
            cols = ['id_ponencia','id_resumen','titulo','id_dictaminador','revisado','estatus','retroalimentacion','nombre_dictaminador']
            ponencias = [dict(zip(cols, row)) for row in ponencias]

            if not ponencias:
                return Response([])

            ponencia_ids = [p['id_ponencia'] for p in ponencias]
            resumen_ids = [p['id_resumen'] for p in ponencias]

            # Autores por ponencia
            c.execute("""
                SELECT php.id_ponencia,
                       per.nombre || ' ' || per.primer_apellido AS nombre_completo
                FROM ponente_has_ponencia php
                JOIN ponente po ON php.id_ponente = po.id_ponente
                JOIN persona per ON po.id_persona = per.id_persona
                WHERE php.id_ponencia = ANY(%s)
            """, [ponencia_ids])
            autores_rows = c.fetchall()
            autores_map = {}
            for id_pon, nombre in autores_rows:
                autores_map.setdefault(id_pon, []).append(nombre)

            # Respuestas de dictamen
            c.execute("""
                SELECT dr.id_resumen, dp.descripcion, ep.cumplio, ep.comentario_especifico
                FROM dictamen_resumen dr
                JOIN evaluacion_pregunta ep ON ep.id_dictamen = dr.id_dictamen
                JOIN dictamen_pregunta dp ON ep.id_pregunta = dp.id_pregunta
                WHERE dr.id_resumen = ANY(%s)
            """, [resumen_ids])
            dictamen_rows = c.fetchall()
            dictamen_map = {}
            for id_res, pregunta, cumplio, comentario in dictamen_rows:
                dictamen_map.setdefault(id_res, []).append({
                    'pregunta': pregunta,
                    'cumplio': cumplio,
                    'comentario': comentario,
                })

        result = []
        for p in ponencias:
            result.append({
                'id': p['id_ponencia'],
                'id_resumen': p['id_resumen'],
                'title': p['titulo'],
                'autores': autores_map.get(p['id_ponencia'], []),
                'asignado': p['id_dictaminador'] is not None,
                'revisado': p['revisado'] or False,
                'aceptado': p['estatus'] == 'aceptado',
                'id_dictaminador': p['id_dictaminador'],
                'nombre_dictaminador': p['nombre_dictaminador'],
                'estatus': p['estatus'],
                'retroalimentacion': p['retroalimentacion'],
                'preguntas': dictamen_map.get(p['id_resumen'], []),
            })
        return Response(result)
```

- [ ] **Step 3: Registrar la ruta en `ponencias/urls.py`**

```python
from .views import (..., ResumenesCongresoView)
# En urlpatterns:
path('resumenes/', ResumenesCongresoView.as_view(), name='resumenes-congreso'),
```

- [ ] **Step 4: Probar el endpoint**

```bash
python manage.py runserver &
sleep 2
TOKEN=$(python manage.py shell -c "
from users.models import Persona
from users.views import get_tokens_for_user
u = Persona.objects.filter(is_staff=True).first()
print(get_tokens_for_user(u)['access'])
")
# Obtener id_congreso de un congreso existente
CONGRESO=$(python manage.py shell -c "
from congresos.models import Congreso
c = Congreso.objects.first()
print(c.id_congreso if c else 1)
")
curl -s "http://localhost:8000/api/ponencias/resumenes/?id_congreso=$CONGRESO" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool | head -30
kill %1
```

Esperado: lista JSON (vacía o con datos)

- [ ] **Step 5: Commit**

```bash
git add backend/ponencias/views.py backend/ponencias/urls.py
git commit -m "feat(ponencias): endpoint GET resumenes por congreso con estado y dictamen"
```

---

### Task 2: Backend — endpoint extensos por congreso

**Files:**
- Modify: `backend/ponencias/views.py`
- Modify: `backend/ponencias/urls.py`

- [ ] **Step 1: Agregar `ExtensosCongresoView` al final de `ponencias/views.py`**

```python
class ExtensosCongresoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as c:
            c.execute("""
                SELECT
                    p.id_ponencia,
                    p.id_extenso,
                    ext.titulo,
                    ext.id_evaluador,
                    ext.revisado,
                    ev.id_evaluacion,
                    ev.estatus AS estatus_evaluacion,
                    ev.retroalimentacion_general,
                    CASE WHEN eval_per.id_persona IS NOT NULL
                        THEN eval_per.nombre || ' ' || eval_per.primer_apellido
                        ELSE NULL
                    END AS nombre_evaluador
                FROM ponencia p
                JOIN evento e ON p.id_evento = e.id_evento
                JOIN extenso ext ON p.id_extenso = ext.id_extenso
                LEFT JOIN evaluacion ev ON ev.id_extenso = ext.id_extenso
                LEFT JOIN evaluador eval ON ext.id_evaluador = eval.id_evaluador
                LEFT JOIN persona eval_per ON eval.id_persona = eval_per.id_persona
                WHERE e.id_congreso = %s
                ORDER BY p.id_ponencia
            """, [id_congreso])
            ponencias = c.fetchall()
            cols = ['id_ponencia','id_extenso','titulo','id_evaluador','revisado',
                    'id_evaluacion','estatus_evaluacion','retroalimentacion_general','nombre_evaluador']
            ponencias = [dict(zip(cols, row)) for row in ponencias]

            if not ponencias:
                return Response([])

            ponencia_ids = [p['id_ponencia'] for p in ponencias]
            evaluacion_ids = [p['id_evaluacion'] for p in ponencias if p['id_evaluacion']]

            # Autores
            c.execute("""
                SELECT php.id_ponencia,
                       per.nombre || ' ' || per.primer_apellido
                FROM ponente_has_ponencia php
                JOIN ponente po ON php.id_ponente = po.id_ponente
                JOIN persona per ON po.id_persona = per.id_persona
                WHERE php.id_ponencia = ANY(%s)
            """, [ponencia_ids])
            autores_map = {}
            for id_pon, nombre in c.fetchall():
                autores_map.setdefault(id_pon, []).append(nombre)

            # Criterios con grupos y puntajes
            criterios_map = {}
            if evaluacion_ids:
                c.execute("""
                    SELECT
                        ec.id_evaluacion,
                        rg.nombre_grupo,
                        rc.descripcion AS nombre_criterio,
                        rc.peso,
                        ec.puntaje,
                        ec.comentario_especifico
                    FROM evaluacion_criterio ec
                    JOIN rubrica_criterio rc ON ec.id_criterio = rc.id_criterio
                    JOIN rubrica_grupo rg ON rc.id_grupo = rg.id_grupo
                    WHERE ec.id_evaluacion = ANY(%s)
                    ORDER BY rg.id_grupo, rc.id_criterio
                """, [evaluacion_ids])
                for row in c.fetchall():
                    id_ev, nombre_grupo, nombre_criterio, peso, puntaje, comentario = row
                    grupos = criterios_map.setdefault(id_ev, {})
                    criterios = grupos.setdefault(nombre_grupo, [])
                    criterios.append({
                        'nombre_criterio': nombre_criterio,
                        'peso': float(peso) if peso else None,
                        'puntaje': puntaje,
                        'comentario_especifico': comentario,
                    })

        result = []
        for p in ponencias:
            # Construir evaluacion anidada
            evaluacion = None
            if p['id_evaluacion'] and p['id_evaluacion'] in criterios_map:
                grupos_dict = criterios_map[p['id_evaluacion']]
                evaluacion = {
                    'estatus': p['estatus_evaluacion'],
                    'retroalimentacion_general': p['retroalimentacion_general'],
                    'grupos': [
                        {'nombre_grupo': nombre_grupo, 'criterios': criterios}
                        for nombre_grupo, criterios in grupos_dict.items()
                    ],
                }
            estatus_ev = p.get('estatus_evaluacion', '')
            result.append({
                'id': p['id_ponencia'],
                'id_extenso': p['id_extenso'],
                'title': p['titulo'],
                'autores': autores_map.get(p['id_ponencia'], []),
                'asignado': p['id_evaluador'] is not None,
                'revisado': p['revisado'] or False,
                'aceptado': 'aceptado' in (estatus_ev or ''),
                'id_evaluador': p['id_evaluador'],
                'nombre_evaluador': p['nombre_evaluador'],
                'evaluacion': evaluacion,
            })
        return Response(result)
```

- [ ] **Step 2: Registrar la ruta**

```python
from .views import (..., ExtensosCongresoView)
path('extensos/', ExtensosCongresoView.as_view(), name='extensos-congreso'),
```

- [ ] **Step 3: Probar el endpoint**

```bash
python manage.py runserver &
sleep 2
TOKEN=$(python manage.py shell -c "
from users.models import Persona
from users.views import get_tokens_for_user
u = Persona.objects.filter(is_staff=True).first()
print(get_tokens_for_user(u)['access'])
")
CONGRESO=$(python manage.py shell -c "
from congresos.models import Congreso
c = Congreso.objects.first()
print(c.id_congreso if c else 1)
")
curl -s "http://localhost:8000/api/ponencias/extensos/?id_congreso=$CONGRESO" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool | head -30
kill %1
```

Esperado: lista JSON (vacía o con datos)

- [ ] **Step 4: Commit**

```bash
git add backend/ponencias/views.py backend/ponencias/urls.py
git commit -m "feat(ponencias): endpoint GET extensos por congreso con evaluacion anidada"
```

---

### Task 3: Funciones API en frontend

**Files:**
- Modify: `frontend/src/api/ponenciasApi.js`

- [ ] **Step 1: Agregar 4 funciones al final de `ponenciasApi.js`**

```javascript
import { API_URL } from './constants';

export async function getResumenesCongreso(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/ponencias/resumenes/?id_congreso=${idCongreso}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error cargando resúmenes');
  return res.json();
}

export async function getExtensosCongreso(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/ponencias/extensos/?id_congreso=${idCongreso}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error cargando extensos');
  return res.json();
}

export async function asignarDictaminadorApi(accessToken, idResumen, idDictaminador) {
  const res = await fetch(`${API_URL}/api/ponencias/resumenes/${idResumen}/asignar/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_dictaminador: idDictaminador }),
  });
  if (!res.ok) throw new Error('Error asignando dictaminador');
  return res.json();
}

export async function asignarEvaluadorApi(accessToken, idExtenso, idEvaluador) {
  const res = await fetch(`${API_URL}/api/ponencias/extensos/${idExtenso}/asignar/`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_evaluador: idEvaluador }),
  });
  if (!res.ok) throw new Error('Error asignando evaluador');
  return res.json();
}
```

Verificar que `API_URL` ya está importado o importarlo desde `./constants`.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/ponenciasApi.js
git commit -m "feat(ponencias-api): funciones para resumenes, extensos y asignaciones por congreso"
```

---

### Task 4: Actualizar `ProcesosResumenesView.jsx` con selector y datos reales

**Files:**
- Modify: `frontend/src/views/admin/ProcesosResumenesView.jsx`

- [ ] **Step 1: Reemplazar imports y estado inicial**

Al inicio del archivo, reemplazar las importaciones y los datos MOCK:

```jsx
import { useEffect, useMemo, useState } from "react";
import ListaResumenes from "./Componentes/ListaResumenes";
import ListaRevisores from "./Componentes/ListaRevisores";
import { getCongresosApi, getDictaminadoresDisponiblesApi } from "../../api/adminApi";
import { getResumenesCongreso, asignarDictaminadorApi } from "../../api/ponenciasApi";
```

Agregar estas funciones en `adminApi.js` si no existen:
```javascript
export async function getDictaminadoresDisponiblesApi(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/ponencias/dictaminadores-disponibles/?id_congreso=${idCongreso}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error cargando dictaminadores');
  return res.json();
}

export async function getEvaluadoresDisponiblesApi(accessToken, idCongreso) {
  const res = await fetch(`${API_URL}/api/ponencias/evaluadores-disponibles/?id_congreso=${idCongreso}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error cargando evaluadores');
  return res.json();
}
```

- [ ] **Step 2: Reemplazar la función default de `ProcesosResumenesView`**

```jsx
export default function ProcesosResumenesView() {
  const accessToken = localStorage.getItem('congress_access');
  const [congresos, setCongresos] = useState([]);
  const [selectedCongreso, setSelectedCongreso] = useState(null);
  const [items, setItems] = useState([]);
  const [dictaminadores, setDictaminadores] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCongresosApi(accessToken).then(setCongresos).catch(console.error);
  }, [accessToken]);

  useEffect(() => {
    if (!selectedCongreso) return;
    setLoading(true);
    Promise.all([
      getResumenesCongreso(accessToken, selectedCongreso.id_congreso),
      getDictaminadoresDisponiblesApi(accessToken, selectedCongreso.id_congreso),
    ])
      .then(([resData, dictData]) => {
        setItems(resData);
        setDictaminadores(dictData);
        setViewItem(resData[0] ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCongreso, accessToken]);

  const revisoresAsignados = useMemo(() => {
    if (!viewItem || !viewItem.id_dictaminador) return [];
    return dictaminadores.filter(d => d.id_dictaminador === viewItem.id_dictaminador);
  }, [viewItem, dictaminadores]);

  const handleAsignar = async (idResumen, idDictaminador) => {
    try {
      await asignarDictaminadorApi(accessToken, idResumen, idDictaminador);
      setItems(prev => prev.map(item =>
        item.id_resumen === idResumen
          ? { ...item, asignado: idDictaminador != null, id_dictaminador: idDictaminador }
          : item
      ));
    } catch (err) {
      console.error('Error asignando dictaminador:', err);
    }
  };

  return (
    <div className="w-full space-y-7">
      <section className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-7">
        <div>
          <div className="flex gap-4">
            <div className="border bg-black rounded-full h-10 w-2"></div>
            <h2 className="flex-1 text-2xl font-bold text-start">Revision de resúmenes</h2>
          </div>
          <p className="pl-12 text-start text-gray-500 mb-3">
            Aquí se gestiona la revisión de resúmenes.
          </p>
        </div>
        {/* Selector de congreso */}
        <select
          className="select select-bordered ml-auto rounded-xl"
          value={selectedCongreso?.id_congreso ?? ''}
          onChange={e => {
            const found = congresos.find(c => String(c.id_congreso) === e.target.value);
            setSelectedCongreso(found ?? null);
          }}
        >
          <option value="">Selecciona un congreso</option>
          {congresos.map(c => (
            <option key={c.id_congreso} value={c.id_congreso}>{c.nombre_congreso}</option>
          ))}
        </select>
      </section>

      {!selectedCongreso ? (
        <p className="text-center py-10 text-base-content/40 italic">Selecciona un congreso para ver los resúmenes.</p>
      ) : loading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : (
        <section className="grid items-start gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <ListaResumenes
              listaElementos={items}
              dictaminadores={dictaminadores}
              selectedId={viewItem?.id ?? null}
              onView={setViewItem}
            />
            <ListaRevisores titulo="DICTAMINADORES" revisores={revisoresAsignados} />
          </div>
          <div>
            <ResumenDetailCard
              resumen={viewItem}
              revisores={revisoresAsignados}
              dictaminadoresDisponibles={dictaminadores}
              onAsignar={handleAsignar}
            />
          </div>
        </section>
      )}
    </div>
  );
}
```

Nota: `ResumenDetailCard` es el componente local dentro del mismo archivo. Actualizar su firma para aceptar `dictaminadoresDisponibles` y `onAsignar` si se quiere agregar asignación desde el detalle. Por ahora, mantener la firma actual y solo conectar el selector y la lista de datos reales.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/views/admin/ProcesosResumenesView.jsx frontend/src/api/adminApi.js
git commit -m "feat(procesos): resumenes con selector de congreso y datos reales del backend"
```

---

### Task 5: Actualizar `ProcesosExtensosView.jsx` con selector y datos reales

**Files:**
- Modify: `frontend/src/views/admin/ProcesosExtensosView.jsx`

- [ ] **Step 1: Reemplazar imports y función default de `ProcesosExtensosView`**

```jsx
import { useEffect, useMemo, useState } from "react";
import ListaExtensos from "./Componentes/ListaExtensos";
import ListaRevisores from "./Componentes/ListaRevisores";
import { getCongresosApi, getEvaluadoresDisponiblesApi } from "../../api/adminApi";
import { getExtensosCongreso, asignarEvaluadorApi } from "../../api/ponenciasApi";
```

Reemplazar `ProcesosExtensosView`:

```jsx
export default function ProcesosExtensosView() {
  const accessToken = localStorage.getItem('congress_access');
  const [congresos, setCongresos] = useState([]);
  const [selectedCongreso, setSelectedCongreso] = useState(null);
  const [items, setItems] = useState([]);
  const [evaluadores, setEvaluadores] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCongresosApi(accessToken).then(setCongresos).catch(console.error);
  }, [accessToken]);

  useEffect(() => {
    if (!selectedCongreso) return;
    setLoading(true);
    Promise.all([
      getExtensosCongreso(accessToken, selectedCongreso.id_congreso),
      getEvaluadoresDisponiblesApi(accessToken, selectedCongreso.id_congreso),
    ])
      .then(([extData, evalData]) => {
        setItems(extData);
        setEvaluadores(evalData);
        setViewItem(extData[0] ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCongreso, accessToken]);

  const revisoresAsignados = useMemo(() => {
    if (!viewItem || !viewItem.id_evaluador) return [];
    return evaluadores.filter(e => e.id_evaluador === viewItem.id_evaluador);
  }, [viewItem, evaluadores]);

  const handleAsignar = async (idExtenso, idEvaluador) => {
    try {
      await asignarEvaluadorApi(accessToken, idExtenso, idEvaluador);
      setItems(prev => prev.map(item =>
        item.id_extenso === idExtenso
          ? { ...item, asignado: idEvaluador != null, id_evaluador: idEvaluador }
          : item
      ));
    } catch (err) {
      console.error('Error asignando evaluador:', err);
    }
  };

  return (
    <div className="w-full space-y-7">
      <section className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-7">
        <div>
          <div className="flex gap-4">
            <div className="border bg-black rounded-full h-10 w-2"></div>
            <h2 className="flex-1 text-2xl font-bold text-start">Revisión de extensos</h2>
          </div>
          <p className="pl-12 text-start text-gray-500 mb-3">
            Aquí se gestiona la revisión de extensos
          </p>
        </div>
        {/* Selector de congreso */}
        <select
          className="select select-bordered ml-auto rounded-xl"
          value={selectedCongreso?.id_congreso ?? ''}
          onChange={e => {
            const found = congresos.find(c => String(c.id_congreso) === e.target.value);
            setSelectedCongreso(found ?? null);
          }}
        >
          <option value="">Selecciona un congreso</option>
          {congresos.map(c => (
            <option key={c.id_congreso} value={c.id_congreso}>{c.nombre_congreso}</option>
          ))}
        </select>
      </section>

      {!selectedCongreso ? (
        <p className="text-center py-10 text-base-content/40 italic">Selecciona un congreso para ver los extensos.</p>
      ) : loading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : (
        <section className="grid items-start gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <ListaExtensos
              listaElementos={items}
              dictaminadores={evaluadores}
              selectedId={viewItem?.id ?? null}
              onView={setViewItem}
            />
            <ListaRevisores titulo="EVALUADORES" revisores={revisoresAsignados} />
          </div>
          <ExtensoDetailCard
            extenso={viewItem}
            revisores={revisoresAsignados}
            evaluadoresDisponibles={evaluadores}
            onAsignar={handleAsignar}
          />
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Actualizar `ExtensoDetailCard` para mostrar datos reales de evaluación**

El componente `ExtensoDetailCard` (definido en el mismo archivo) actualmente usa `extenso.grupos` del mock. Actualizar para usar `extenso.evaluacion.grupos` del nuevo formato:

Buscar la parte que renderiza los grupos/criterios en `ExtensoDetailCard` y cambiar de:
```jsx
extenso.grupos?.map(grupo => ...)
```
a:
```jsx
extenso.evaluacion?.grupos?.map(grupo => ...)
```

Y los criterios de:
```jsx
criterio.calificacion  →  criterio.puntaje
criterio.comentario    →  criterio.comentario_especifico
criterio.nombre        →  criterio.nombre_criterio
```

Si la evaluación es null, mostrar:
```jsx
{!extenso.evaluacion && (
  <p className="text-center py-6 text-xs italic text-base-content/40">Sin evaluación enviada aún.</p>
)}
```

- [ ] **Step 3: Verificar en navegador**

Arrancar backend + frontend, navegar a `/admin/procesos/extensos`, seleccionar un congreso. Verificar:
- Lista muestra extensos reales o mensaje vacío
- Los 3 LEDs (asignado, revisado, aceptado) reflejan estado real
- Detalle muestra evaluación con grupos/criterios/puntajes si existe

- [ ] **Step 4: Commit**

```bash
git add frontend/src/views/admin/ProcesosExtensosView.jsx
git commit -m "feat(procesos): extensos con selector de congreso, datos reales y evaluacion anidada"
```
