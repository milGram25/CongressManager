# Flujo Ponencias Multi-Revisor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dual-reviewer mandatory flow for extensos, tiebreaker third reviewer, derived-state LEDs/buttons in admin, and real-data EstatusPonenciaView for ponentes.

**Architecture:** Raw SQL via `connection.cursor()` throughout the backend (consistent with existing pattern). No new Django apps — all changes in `ponencias/`. Frontend keeps the same component structure, updating data sources and adding UI blocks.

**Tech Stack:** Django 4.x, DRF, PostgreSQL, React 18, DaisyUI/Tailwind, react-router-dom v6.

---

## File Map

| File | Action |
|---|---|
| `backend/ponencias/migrations/0003_extenso_evaluadores.py` | Create — SQL migration adding id_evaluador_2 and id_evaluador_3 |
| `backend/ponencias/models.py` | Modify — add id_evaluador_2 and id_evaluador_3 FK fields to Extenso |
| `backend/ponencias/views.py` | Modify — add helper, 3 new views, update 3 existing views |
| `backend/ponencias/urls.py` | Modify — register 4 new URL paths |
| `frontend/src/api/ponenciasApi.js` | Modify — add 3 new API functions |
| `frontend/src/views/admin/ProcesosResumenesView.jsx` | Modify — remove selector, show dictaminador as text |
| `frontend/src/views/admin/ProcesosExtensosView.jsx` | Modify — dual selectors, new LEDs, publicar/3er revisor buttons |
| `frontend/src/views/admin/PonenciaCrearView.jsx` | Modify — accept nombre_evento and id_subarea query params for pre-fill |
| `frontend/src/views/asistentes/EstatusPonenciaView.jsx` | Modify — replace hardcoded data with real API |

---

### Task 1: DB Migration and Model Update

**Files:**
- Create: `backend/ponencias/migrations/0003_extenso_evaluadores.py`
- Modify: `backend/ponencias/models.py`

- [ ] **Step 1: Create migration file**

```python
# backend/ponencias/migrations/0003_extenso_evaluadores.py
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ponencias', '0002_extenso_id_evaluador'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE extenso
                  ADD COLUMN IF NOT EXISTS id_evaluador_2 INTEGER REFERENCES evaluador(id_evaluador) ON DELETE SET NULL,
                  ADD COLUMN IF NOT EXISTS id_evaluador_3 INTEGER REFERENCES evaluador(id_evaluador) ON DELETE SET NULL;
            """,
            reverse_sql="""
                ALTER TABLE extenso
                  DROP COLUMN IF EXISTS id_evaluador_2,
                  DROP COLUMN IF EXISTS id_evaluador_3;
            """,
        ),
    ]
```

- [ ] **Step 2: Update Extenso model in models.py**

Find the `Extenso` class and replace it:

```python
class Extenso(models.Model):
    id_extenso = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=255)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    revisado = models.BooleanField(default=False)
    version_numero = models.IntegerField(default=1)
    id_evaluador = models.ForeignKey(
        Evaluador, models.SET_NULL, db_column='id_evaluador',
        null=True, blank=True, related_name='extensos_r1'
    )
    id_evaluador_2 = models.ForeignKey(
        Evaluador, models.SET_NULL, db_column='id_evaluador_2',
        null=True, blank=True, related_name='extensos_r2'
    )
    id_evaluador_3 = models.ForeignKey(
        Evaluador, models.SET_NULL, db_column='id_evaluador_3',
        null=True, blank=True, related_name='extensos_r3'
    )

    class Meta:
        managed = False
        db_table = 'extenso'
```

- [ ] **Step 3: Run migration**

```bash
cd backend && DJANGO_SETTINGS_MODULE=core.settings python manage.py migrate ponencias
```

Expected output:
```
Applying ponencias.0003_extenso_evaluadores... OK
```

- [ ] **Step 4: Verify columns exist**

```bash
cd backend && DJANGO_SETTINGS_MODULE=core.settings python manage.py shell -c "
from django.db import connection
with connection.cursor() as c:
    c.execute(\"SELECT column_name FROM information_schema.columns WHERE table_name='extenso' AND column_name IN ('id_evaluador_2','id_evaluador_3')\")
    print(c.fetchall())
"
```

Expected: `[('id_evaluador_2',), ('id_evaluador_3',)]`

- [ ] **Step 5: Commit**

```bash
git add backend/ponencias/migrations/0003_extenso_evaluadores.py backend/ponencias/models.py
git commit -m "feat(ponencias): agrega id_evaluador_2 e id_evaluador_3 a extenso"
```

---

### Task 2: Backend Helper Functions

Add `calcular_estado_extenso` and `_finalizar_extenso_si_procede` to `backend/ponencias/views.py`, just before the `ExtensosCongresoView` class.

**Files:**
- Modify: `backend/ponencias/views.py` (insert after imports section, before `PonenciaViewSet`)

- [ ] **Step 1: Add the two helper functions after the imports block (before `class PonenciaViewSet`)**

```python
def calcular_estado_extenso(ext, evaluaciones_por_eval):
    """
    ext: dict with id_evaluador, id_evaluador_2, id_evaluador_3, revisado (int or None for IDs)
    evaluaciones_por_eval: dict {id_evaluador_int: estatus_str} — latest per evaluador
    Returns: estado string
    """
    r1 = ext.get('id_evaluador')
    r2 = ext.get('id_evaluador_2')
    r3 = ext.get('id_evaluador_3')
    revisado = ext.get('revisado', False)

    if revisado:
        # Final decision is made — determine result from evaluaciones
        if r3 and r3 in evaluaciones_por_eval:
            estatus = evaluaciones_por_eval[r3]
        elif r1 and r1 in evaluaciones_por_eval:
            estatus = evaluaciones_por_eval[r1]
        elif r2 and r2 in evaluaciones_por_eval:
            estatus = evaluaciones_por_eval[r2]
        else:
            estatus = 'aceptado'
        return 'extenso_rechazado' if estatus == 'rechazado' else 'extenso_aceptado'

    if not r1 and not r2:
        return 'en_revision'  # no reviewers assigned yet

    ev1 = evaluaciones_por_eval.get(r1) if r1 else None
    ev2 = evaluaciones_por_eval.get(r2) if r2 else None

    if not r2:
        # Legacy single-reviewer
        if ev1 in ('aceptado con ligeras modificaciones', 'aceptado con modificaciones mayores'):
            return 'con_modificaciones'
        return 'en_revision'

    # Dual reviewer
    if ev1 and ev2:
        r1_rechazado = ev1 == 'rechazado'
        r2_rechazado = ev2 == 'rechazado'
        if r1_rechazado != r2_rechazado:
            return 'desacuerdo'
        if r1_rechazado and r2_rechazado:
            return 'en_revision'  # should be caught by revisado=TRUE
        any_mods = any(e in ('aceptado con ligeras modificaciones', 'aceptado con modificaciones mayores')
                       for e in [ev1, ev2])
        return 'con_modificaciones' if any_mods else 'en_revision'

    ev = ev1 or ev2
    if ev in ('aceptado con ligeras modificaciones', 'aceptado con modificaciones mayores'):
        return 'con_modificaciones'
    return 'en_revision'


def _finalizar_extenso_si_procede(cursor, pk, evaluador_id, r1, r2, r3):
    """After inserting evaluation, mark extenso.revisado=TRUE if a final decision is reached."""
    if not r2:
        # Legacy single reviewer — always finalize on submission
        cursor.execute("UPDATE extenso SET revisado = TRUE WHERE id_extenso = %s", [pk])
        return

    if r3 and evaluador_id == r3:
        # Third reviewer always finalizes
        cursor.execute("UPDATE extenso SET revisado = TRUE WHERE id_extenso = %s", [pk])
        return

    if evaluador_id not in (r1, r2):
        return

    # Get latest evaluation from both reviewers
    cursor.execute("""
        SELECT DISTINCT ON (id_evaluador) id_evaluador, estatus
        FROM evaluacion
        WHERE id_extenso = %s AND id_evaluador = ANY(%s)
        ORDER BY id_evaluador, fecha_de_revision DESC
    """, [pk, [r1, r2]])
    evals = {row[0]: row[1] for row in cursor.fetchall()}

    if r1 not in evals or r2 not in evals:
        return  # Not both reviewed yet

    s1, s2 = evals[r1], evals[r2]
    if (s1 == 'rechazado' and s2 == 'rechazado') or (s1 == 'aceptado' and s2 == 'aceptado'):
        cursor.execute("UPDATE extenso SET revisado = TRUE WHERE id_extenso = %s", [pk])
```

- [ ] **Step 2: Verify Python syntax is correct**

```bash
cd backend && DJANGO_SETTINGS_MODULE=core.settings python -c "from ponencias.views import calcular_estado_extenso, _finalizar_extenso_si_procede; print('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add backend/ponencias/views.py
git commit -m "feat(ponencias): helper calcular_estado_extenso y _finalizar_extenso"
```

---

### Task 3: New Backend Views — AsignarEvaluadoresView, AsignarEvaluador3View, EstatusPonenteView

Add three new `APIView` classes to `backend/ponencias/views.py`.

**Files:**
- Modify: `backend/ponencias/views.py` (append at end of file)

- [ ] **Step 1: Add `AsignarEvaluadoresView` at the end of views.py**

```python
class AsignarEvaluadoresView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_evaluador = request.data.get('id_evaluador')
        id_evaluador_2 = request.data.get('id_evaluador_2')
        if not id_evaluador or not id_evaluador_2:
            return Response({'detail': 'id_evaluador e id_evaluador_2 son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            extenso = Extenso.objects.get(pk=pk)
        except Extenso.DoesNotExist:
            return Response({'detail': 'Extenso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        if extenso.revisado:
            return Response({'detail': 'El extenso ya fue revisado.'}, status=status.HTTP_400_BAD_REQUEST)
        extenso.id_evaluador_id = id_evaluador
        extenso.id_evaluador_2_id = id_evaluador_2
        extenso.save(update_fields=['id_evaluador', 'id_evaluador_2'])
        return Response({'id_extenso': pk, 'id_evaluador': id_evaluador, 'id_evaluador_2': id_evaluador_2})
```

- [ ] **Step 2: Add `AsignarEvaluador3View` after the previous class**

```python
class AsignarEvaluador3View(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_evaluador_3 = request.data.get('id_evaluador_3')
        if not id_evaluador_3:
            return Response({'detail': 'id_evaluador_3 es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            extenso = Extenso.objects.get(pk=pk)
        except Extenso.DoesNotExist:
            return Response({'detail': 'Extenso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        with connection.cursor() as c:
            c.execute("""
                SELECT DISTINCT ON (id_evaluador) id_evaluador, estatus
                FROM evaluacion
                WHERE id_extenso = %s AND id_evaluador = ANY(%s)
                ORDER BY id_evaluador, fecha_de_revision DESC
            """, [pk, [extenso.id_evaluador_id, extenso.id_evaluador_2_id]])
            evals = {row[0]: row[1] for row in c.fetchall()}

        r1, r2 = extenso.id_evaluador_id, extenso.id_evaluador_2_id
        if not r1 or not r2 or r1 not in evals or r2 not in evals:
            return Response({'detail': 'Ambos revisores deben haber evaluado antes de asignar un tercero.'}, status=status.HTTP_400_BAD_REQUEST)

        s1, s2 = evals[r1], evals[r2]
        r1_rechazado = s1 == 'rechazado'
        r2_rechazado = s2 == 'rechazado'
        if r1_rechazado == r2_rechazado:
            return Response({'detail': 'No hay desacuerdo entre los revisores.'}, status=status.HTTP_400_BAD_REQUEST)

        extenso.id_evaluador_3_id = id_evaluador_3
        extenso.save(update_fields=['id_evaluador_3'])
        return Response({'id_extenso': pk, 'id_evaluador_3': id_evaluador_3})
```

- [ ] **Step 3: Add `EstatusPonenteView` after the previous class**

```python
class EstatusPonenteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        with connection.cursor() as c:
            c.execute("SELECT id_ponente FROM ponente WHERE id_persona = %s", [request.user.pk])
            row = c.fetchone()
            if not row:
                return Response([])
            id_ponente = row[0]

            c.execute("""
                SELECT DISTINCT
                    p.id_ponencia,
                    COALESCE(s.nombre, 'Ponencia ' || p.id_ponencia::text) AS titulo,
                    e.tipo_evento AS tipo_ponencia,
                    p.id_resumen,
                    r.revisado AS resumen_revisado,
                    r.estatus AS resumen_estatus,
                    r.retroalimentacion AS resumen_retroalimentacion,
                    p.id_extenso,
                    ext.revisado AS extenso_revisado,
                    ext.id_evaluador,
                    ext.id_evaluador_2,
                    ext.id_evaluador_3
                FROM ponente_has_ponencia php
                JOIN ponencia p ON php.id_ponencia = p.id_ponencia
                JOIN evento e ON p.id_evento = e.id_evento
                LEFT JOIN subareas s ON p.id_subarea = s.id_subareas
                LEFT JOIN resumen r ON p.id_resumen = r.id_resumen
                LEFT JOIN extenso ext ON p.id_extenso = ext.id_extenso
                WHERE php.id_ponente = %s
                ORDER BY p.id_ponencia
            """, [id_ponente])
            cols = ['id_ponencia','titulo','tipo_ponencia','id_resumen','resumen_revisado',
                    'resumen_estatus','resumen_retroalimentacion','id_extenso','extenso_revisado',
                    'id_evaluador','id_evaluador_2','id_evaluador_3']
            ponencias = [dict(zip(cols, row)) for row in c.fetchall()]

            if not ponencias:
                return Response([])

            extenso_ids = [p['id_extenso'] for p in ponencias if p['id_extenso']]
            evals_map = {}
            if extenso_ids:
                c.execute("""
                    SELECT DISTINCT ON (id_extenso, id_evaluador) id_extenso, id_evaluador, estatus, retroalimentacion_general
                    FROM evaluacion
                    WHERE id_extenso = ANY(%s)
                    ORDER BY id_extenso, id_evaluador, fecha_de_revision DESC
                """, [extenso_ids])
                for id_ext, id_eval, estatus, retro in c.fetchall():
                    if id_ext not in evals_map:
                        evals_map[id_ext] = {'por_eval': {}, 'retroalimentacion': None, 'ultima_fecha': None}
                    evals_map[id_ext]['por_eval'][id_eval] = estatus
                    if estatus in ('aceptado con ligeras modificaciones', 'aceptado con modificaciones mayores'):
                        evals_map[id_ext]['retroalimentacion'] = retro

        result = []
        for p in ponencias:
            if not p['id_resumen']:
                continue
            resumen_revisado = p['resumen_revisado'] or False
            if not resumen_revisado:
                estado = 'pendiente_dictaminacion'
                retroalimentacion = None
            elif p['resumen_estatus'] == 'rechazado':
                estado = 'resumen_rechazado'
                retroalimentacion = p['resumen_retroalimentacion']
            elif not p['id_extenso']:
                estado = 'pendiente_extenso'
                retroalimentacion = None
            else:
                ext_data = {
                    'id_evaluador': p['id_evaluador'],
                    'id_evaluador_2': p['id_evaluador_2'],
                    'id_evaluador_3': p['id_evaluador_3'],
                    'revisado': p['extenso_revisado'] or False,
                }
                ev_map = evals_map.get(p['id_extenso'], {}).get('por_eval', {})
                estado = calcular_estado_extenso(ext_data, ev_map)
                if estado == 'desacuerdo':
                    estado = 'en_revision'
                retroalimentacion = evals_map.get(p['id_extenso'], {}).get('retroalimentacion')

            result.append({
                'id_ponencia': p['id_ponencia'],
                'titulo': p['titulo'],
                'tipo_ponencia': p['tipo_ponencia'],
                'estado': estado,
                'retroalimentacion': retroalimentacion,
                'id_resumen': p['id_resumen'],
                'id_extenso': p['id_extenso'],
            })
        return Response(result)
```

- [ ] **Step 4: Verify syntax**

```bash
cd backend && DJANGO_SETTINGS_MODULE=core.settings python -c "from ponencias.views import AsignarEvaluadoresView, AsignarEvaluador3View, EstatusPonenteView; print('OK')"
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add backend/ponencias/views.py
git commit -m "feat(ponencias): vistas AsignarEvaluadores, AsignarEvaluador3, EstatusPonenteView"
```

---

### Task 4: Update ExtensosCongresoView, MisExtensosView, EnviarEvaluacionView

**Files:**
- Modify: `backend/ponencias/views.py`

- [ ] **Step 1: Replace `ExtensosCongresoView.get` with the updated version**

Replace the entire `ExtensosCongresoView` class (lines ~525–659 in current file) with:

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
                    p.id_subarea,
                    ext.titulo,
                    ext.id_evaluador,
                    ext.id_evaluador_2,
                    ext.id_evaluador_3,
                    ext.revisado,
                    e.tipo_evento AS tipo_ponencia,
                    e.id_congreso,
                    CASE WHEN e1_per.id_persona IS NOT NULL
                        THEN e1_per.nombre || ' ' || e1_per.primer_apellido ELSE NULL
                    END AS nombre_evaluador,
                    CASE WHEN e2_per.id_persona IS NOT NULL
                        THEN e2_per.nombre || ' ' || e2_per.primer_apellido ELSE NULL
                    END AS nombre_evaluador_2,
                    CASE WHEN e3_per.id_persona IS NOT NULL
                        THEN e3_per.nombre || ' ' || e3_per.primer_apellido ELSE NULL
                    END AS nombre_evaluador_3
                FROM ponencia p
                JOIN evento e ON p.id_evento = e.id_evento
                JOIN extenso ext ON p.id_extenso = ext.id_extenso
                LEFT JOIN evaluador ev1 ON ext.id_evaluador = ev1.id_evaluador
                LEFT JOIN persona e1_per ON ev1.id_persona = e1_per.id_persona
                LEFT JOIN evaluador ev2 ON ext.id_evaluador_2 = ev2.id_evaluador
                LEFT JOIN persona e2_per ON ev2.id_persona = e2_per.id_persona
                LEFT JOIN evaluador ev3 ON ext.id_evaluador_3 = ev3.id_evaluador
                LEFT JOIN persona e3_per ON ev3.id_persona = e3_per.id_persona
                WHERE e.id_congreso = %s
                ORDER BY p.id_ponencia
            """, [id_congreso])
            cols = ['id_ponencia','id_extenso','id_subarea','titulo','id_evaluador','id_evaluador_2',
                    'id_evaluador_3','revisado','tipo_ponencia','id_congreso',
                    'nombre_evaluador','nombre_evaluador_2','nombre_evaluador_3']
            ponencias = [dict(zip(cols, row)) for row in c.fetchall()]

            if not ponencias:
                return Response([])

            ponencia_ids = [p['id_ponencia'] for p in ponencias]
            extenso_ids = [p['id_extenso'] for p in ponencias]

            # Authors
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

            # Latest evaluation per evaluador per extenso
            c.execute("""
                SELECT DISTINCT ON (id_extenso, id_evaluador)
                    id_extenso, id_evaluador, estatus, retroalimentacion_general, id_evaluacion
                FROM evaluacion
                WHERE id_extenso = ANY(%s)
                ORDER BY id_extenso, id_evaluador, fecha_de_revision DESC
            """, [extenso_ids])
            evals_map = {}
            for id_ext, id_eval, estatus, retro, id_ev in c.fetchall():
                if id_ext not in evals_map:
                    evals_map[id_ext] = {'por_eval': {}, 'latest_id_evaluacion': id_ev,
                                         'latest_estatus': estatus, 'latest_retro': retro}
                evals_map[id_ext]['por_eval'][id_eval] = estatus

            # Rubrica criterios for latest evaluacion per extenso (for display only)
            latest_ev_ids = [v['latest_id_evaluacion'] for v in evals_map.values()]
            criterios_map = {}
            if latest_ev_ids:
                c.execute("""
                    SELECT ec.id_evaluacion, rg.nombre_grupo, rc.descripcion, rc.peso, ec.puntaje, ec.comentario_especifico
                    FROM evaluacion_criterio ec
                    JOIN rubrica_criterio rc ON ec.id_criterio = rc.id_criterio
                    JOIN rubrica_grupo rg ON rc.id_grupo = rg.id_grupo
                    WHERE ec.id_evaluacion = ANY(%s)
                    ORDER BY rg.id_grupo, rc.id_criterio
                """, [latest_ev_ids])
                for row in c.fetchall():
                    id_ev, nombre_grupo, nombre_criterio, peso, puntaje, comentario = row
                    grupos = criterios_map.setdefault(id_ev, {})
                    grupos.setdefault(nombre_grupo, []).append({
                        'nombre_criterio': nombre_criterio,
                        'peso': float(peso) if peso else None,
                        'puntaje': puntaje,
                        'comentario_especifico': comentario,
                    })

        result = []
        for p in ponencias:
            ext_info = evals_map.get(p['id_extenso'], {})
            ev_por_eval = ext_info.get('por_eval', {})
            estado_derivado = calcular_estado_extenso(p, ev_por_eval)

            evaluacion = None
            id_ev_latest = ext_info.get('latest_id_evaluacion')
            if id_ev_latest and id_ev_latest in criterios_map:
                grupos_dict = criterios_map[id_ev_latest]
                evaluacion = {
                    'estatus': ext_info.get('latest_estatus'),
                    'retroalimentacion_general': ext_info.get('latest_retro'),
                    'grupos': [{'nombre_grupo': ng, 'criterios': crs} for ng, crs in grupos_dict.items()],
                }

            result.append({
                'id': p['id_ponencia'],
                'id_extenso': p['id_extenso'],
                'id_subarea': p['id_subarea'],
                'id_congreso': p['id_congreso'],
                'tipo_ponencia': p['tipo_ponencia'],
                'title': p['titulo'],
                'autores': autores_map.get(p['id_ponencia'], []),
                'asignado': p['id_evaluador'] is not None and p['id_evaluador_2'] is not None,
                'revisado': p['revisado'] or False,
                'aceptado': estado_derivado == 'extenso_aceptado',
                'estado_derivado': estado_derivado,
                'id_evaluador': p['id_evaluador'],
                'id_evaluador_2': p['id_evaluador_2'],
                'id_evaluador_3': p['id_evaluador_3'],
                'nombre_evaluador': p['nombre_evaluador'],
                'nombre_evaluador_2': p['nombre_evaluador_2'],
                'nombre_evaluador_3': p['nombre_evaluador_3'],
                'evaluacion': evaluacion,
            })
        return Response(result)
```

- [ ] **Step 2: Update `MisExtensosView.get` to include R2 extensos and return `revisado_por_mi`**

Replace the entire `MisExtensosView` class:

```python
class MisExtensosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from users.models import Evaluador
        evaluador = Evaluador.objects.filter(id_persona=request.user).first()
        if not evaluador:
            return Response([])
        eid = evaluador.id_evaluador
        with connection.cursor() as c:
            c.execute("""
                SELECT p.id_ponencia, p.id_extenso, ext.titulo,
                       ext.revisado, cong.nombre_congreso, e.id_congreso,
                       ev.id_evaluacion, ev.estatus AS estatus_evaluacion
                FROM ponencia p
                JOIN evento e ON p.id_evento = e.id_evento
                JOIN congreso cong ON e.id_congreso = cong.id_congreso
                JOIN extenso ext ON p.id_extenso = ext.id_extenso
                LEFT JOIN evaluacion ev ON ev.id_extenso = ext.id_extenso AND ev.id_evaluador = %s
                WHERE ext.id_evaluador = %s OR ext.id_evaluador_2 = %s
                ORDER BY ev.id_evaluacion NULLS FIRST, p.id_ponencia
            """, [eid, eid, eid])
            rows = c.fetchall()
            result = []
            seen = set()
            for id_ponencia, id_extenso, titulo, revisado, nombre_congreso, id_congreso, id_evaluacion, estatus_evaluacion in rows:
                if id_extenso in seen:
                    continue
                seen.add(id_extenso)
                result.append({
                    'id': id_ponencia,
                    'id_extenso': id_extenso,
                    'titulo': titulo,
                    'revisado': id_evaluacion is not None,
                    'tiene_evaluacion': id_evaluacion is not None,
                    'estatus_evaluacion': estatus_evaluacion,
                    'congreso': nombre_congreso,
                    'id_congreso': id_congreso,
                })
        return Response(result)
```

Note: `revisado` now means "I (this evaluador) have submitted an evaluation", not "extenso.revisado". This is intentional — the reviewer sees their personal completion status.

- [ ] **Step 3: Update `EnviarEvaluacionView.post` to use new finalization logic**

Replace the entire `EnviarEvaluacionView` class:

```python
class EnviarEvaluacionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        from users.models import Evaluador
        evaluador = Evaluador.objects.filter(id_persona=request.user).first()
        if not evaluador:
            return Response({'detail': 'No eres evaluador.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            extenso = Extenso.objects.get(pk=pk)
        except Extenso.DoesNotExist:
            return Response({'detail': 'Extenso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        if extenso.revisado:
            return Response({'detail': 'El extenso ya fue revisado definitivamente.'}, status=status.HTTP_400_BAD_REQUEST)

        eid = evaluador.id_evaluador
        r1 = extenso.id_evaluador_id
        r2 = extenso.id_evaluador_2_id
        r3 = extenso.id_evaluador_3_id

        if eid not in (r for r in [r1, r2, r3] if r):
            return Response({'detail': 'No estás asignado a este extenso.'}, status=status.HTTP_403_FORBIDDEN)

        criterios = request.data.get('criterios', [])
        retroalimentacion = request.data.get('retroalimentacion_general', '')
        estatus_ev = request.data.get('estatus', 'aceptado')

        with connection.cursor() as c:
            c.execute("""
                INSERT INTO evaluacion (id_extenso, id_evaluador, retroalimentacion_general, estatus)
                VALUES (%s, %s, %s, %s) RETURNING id_evaluacion
            """, [pk, eid, retroalimentacion, estatus_ev])
            id_evaluacion = c.fetchone()[0]
            for criterio in criterios:
                c.execute("""
                    INSERT INTO evaluacion_criterio (id_evaluacion, id_criterio, puntaje, comentario_especifico)
                    VALUES (%s, %s, %s, %s)
                """, [id_evaluacion, criterio['id_criterio'], criterio['puntaje'], criterio.get('comentario', '')])
            _finalizar_extenso_si_procede(c, pk, eid, r1, r2, r3)
        return Response({'id_evaluacion': id_evaluacion}, status=status.HTTP_201_CREATED)
```

- [ ] **Step 4: Verify syntax**

```bash
cd backend && DJANGO_SETTINGS_MODULE=core.settings python -c "from ponencias.views import ExtensosCongresoView, MisExtensosView, EnviarEvaluacionView; print('OK')"
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add backend/ponencias/views.py
git commit -m "feat(ponencias): actualiza ExtensosCongresoView, MisExtensosView y EnviarEvaluacionView para multi-revisor"
```

---

### Task 5: Register New URLs

**Files:**
- Modify: `backend/ponencias/urls.py`

- [ ] **Step 1: Replace the entire `urls.py` file with the updated version**

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PonenciaViewSet, registrar_ponencia, listar_catalogo_ponencias,
    EnviarPonenciaAPIView, MiAgendaView,
    DictaminadoresDisponiblesView, EvaluadoresDisponiblesView,
    AsignarDictaminadorView, AsignarEvaluadorView,
    ResumenesCongresoView, ExtensosCongresoView,
    MisResumenesView, MisExtensosView,
    RubricaExtensoView, PreguntasResumenView,
    EnviarEvaluacionView, EnviarDictamenView,
    AsignarEvaluadoresView, AsignarEvaluador3View, EstatusPonenteView,
)

app_name = 'ponencias'

router = DefaultRouter()
router.register(r'lista', PonenciaViewSet, basename='ponencia')

urlpatterns = [
    path('', include(router.urls)),
    path('registrar/', registrar_ponencia, name='registrar_ponencia'),
    path('catalogo/', listar_catalogo_ponencias, name='listar_catalogo'),
    path('enviar/', EnviarPonenciaAPIView.as_view(), name='enviar-ponencia'),
    path('mi-agenda/', MiAgendaView.as_view(), name='mi_agenda'),
    path('dictaminadores-disponibles/', DictaminadoresDisponiblesView.as_view(), name='dictaminadores-disponibles'),
    path('evaluadores-disponibles/', EvaluadoresDisponiblesView.as_view(), name='evaluadores-disponibles'),
    path('resumenes/<int:pk>/asignar/', AsignarDictaminadorView.as_view(), name='asignar-dictaminador'),
    path('extensos/<int:pk>/asignar/', AsignarEvaluadorView.as_view(), name='asignar-evaluador'),
    path('extensos/<int:pk>/asignar-evaluadores/', AsignarEvaluadoresView.as_view(), name='asignar-evaluadores'),
    path('extensos/<int:pk>/asignar-evaluador-3/', AsignarEvaluador3View.as_view(), name='asignar-evaluador-3'),
    path('resumenes/', ResumenesCongresoView.as_view(), name='resumenes-congreso'),
    path('extensos/', ExtensosCongresoView.as_view(), name='extensos-congreso'),
    path('mis-resumenes/', MisResumenesView.as_view(), name='mis-resumenes'),
    path('mis-extensos/', MisExtensosView.as_view(), name='mis-extensos'),
    path('resumenes/<int:pk>/preguntas/', PreguntasResumenView.as_view(), name='preguntas-resumen'),
    path('extensos/<int:pk>/rubrica/', RubricaExtensoView.as_view(), name='rubrica-extenso'),
    path('extensos/<int:pk>/evaluacion/', EnviarEvaluacionView.as_view(), name='enviar-evaluacion'),
    path('resumenes/<int:pk>/dictamen/', EnviarDictamenView.as_view(), name='enviar-dictamen'),
    path('ponente/mis-ponencias/', EstatusPonenteView.as_view(), name='estatus-ponente'),
]
```

- [ ] **Step 2: Verify Django can resolve all URLs**

```bash
cd backend && DJANGO_SETTINGS_MODULE=core.settings python manage.py show_urls 2>/dev/null | grep ponencias || DJANGO_SETTINGS_MODULE=core.settings python -c "
from django.test import RequestFactory
import django; django.setup()
from django.urls import reverse
print(reverse('ponencias:asignar-evaluadores', kwargs={'pk': 1}))
print(reverse('ponencias:asignar-evaluador-3', kwargs={'pk': 1}))
print(reverse('ponencias:estatus-ponente'))
"
```

Expected: URLs resolve without errors.

- [ ] **Step 3: Commit**

```bash
git add backend/ponencias/urls.py
git commit -m "feat(ponencias): registra rutas asignar-evaluadores, asignar-evaluador-3, estatus-ponente"
```

---

### Task 6: Frontend API Functions

**Files:**
- Modify: `frontend/src/api/ponenciasApi.js`

- [ ] **Step 1: Append three new functions at the end of ponenciasApi.js**

```js
export async function asignarEvaluadoresApi(accessToken, idExtenso, idEvaluador, idEvaluador2) {
  const res = await fetch(`${API_URL}/api/ponencias/extensos/${idExtenso}/asignar-evaluadores/`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_evaluador: idEvaluador, id_evaluador_2: idEvaluador2 }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Error asignando revisores');
  }
  return res.json();
}

export async function asignarEvaluador3Api(accessToken, idExtenso, idEvaluador3) {
  const res = await fetch(`${API_URL}/api/ponencias/extensos/${idExtenso}/asignar-evaluador-3/`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_evaluador_3: idEvaluador3 }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Error asignando 3er revisor');
  }
  return res.json();
}

export async function getMisPonenciasPonenteApi(accessToken) {
  const res = await fetch(`${API_URL}/api/ponencias/ponente/mis-ponencias/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Error cargando estatus de ponencias');
  return res.json();
}
```

- [ ] **Step 2: Verify file parses correctly**

```bash
cd frontend && node -e "require('./src/api/ponenciasApi.js')" 2>&1 || echo "Check file with: npx eslint src/api/ponenciasApi.js"
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/ponenciasApi.js
git commit -m "feat(api): agrega asignarEvaluadoresApi, asignarEvaluador3Api, getMisPonenciasPonenteApi"
```

---

### Task 7: Frontend ProcesosResumenesView — Remove Selector

**Files:**
- Modify: `frontend/src/views/admin/ProcesosResumenesView.jsx`

- [ ] **Step 1: Replace the full `ProcesosResumenesView.jsx` file**

```jsx
import { useEffect, useMemo, useState } from "react";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import ListaResumenes from "./Componentes/ListaResumenes";
import ListaRevisores from "./Componentes/ListaRevisores";
import { getCongresosApi } from "../../api/adminApi";
import { getResumenesCongreso } from "../../api/ponenciasApi";

function LedStatus({ label, active, neutral = false }) {
  const color = neutral ? 'bg-gray-400' : active ? 'bg-green-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} shadow-sm`} />
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  );
}

function ResumenDetailCard({ resumen }) {
  if (!resumen) return (
    <div className="flex items-center justify-center h-64 rounded-[26px] border border-black/20 bg-white text-gray-400 italic text-sm">
      Selecciona un resumen para ver el detalle
    </div>
  );

  return (
    <article className="rounded-[26px] border border-black/55 bg-white shadow-sm overflow-hidden">
      <header className="bg-black px-6 py-4">
        <h3 className="text-white font-bold text-lg">{resumen.title}</h3>
        <p className="text-gray-400 text-sm">{resumen.autores?.join(', ') || 'Sin autores'}</p>
      </header>

      <div className="p-6 space-y-6">
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-2xl">
          <LedStatus label="Revisor asignado" active={resumen.asignado} />
          <LedStatus label="Revisado" active={resumen.revisado} />
          <LedStatus label="Aceptado" active={resumen.aceptado} neutral={resumen.estatus == null} />
        </div>

        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-1">Dictaminador asignado</h4>
          <p className="text-sm text-slate-600">
            {resumen.nombre_dictaminador ?? 'Sin dictaminador asignado'}
          </p>
        </section>

        {resumen.preguntas && resumen.preguntas.length > 0 && (
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-3">Respuestas del dictamen</h4>
            <div className="space-y-2">
              {resumen.preguntas.map((p, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    {p.cumplio ? <MdCheckCircle className="text-green-500" size={16} /> : <MdCancel className="text-red-500" size={16} />}
                    <span className="text-sm font-medium">{p.pregunta}</span>
                  </div>
                  {p.comentario && <p className="text-xs text-gray-500 pl-6">{p.comentario}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {resumen.retroalimentacion && (
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-2">Retroalimentación</h4>
            <div className="min-h-[80px] rounded-xl border border-black/20 bg-gray-50 p-3 text-sm text-slate-700">
              {resumen.retroalimentacion}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

export default function ProcesosResumenesView() {
  const accessToken = localStorage.getItem('congress_access');
  const [congresos, setCongresos] = useState([]);
  const [selectedCongreso, setSelectedCongreso] = useState(null);
  const [items, setItems] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCongresosApi(accessToken).then(setCongresos).catch(console.error);
  }, [accessToken]);

  useEffect(() => {
    if (!selectedCongreso) return;
    setLoading(true);
    getResumenesCongreso(accessToken, selectedCongreso.id_congreso)
      .then(data => {
        setItems(data);
        setViewItem(data[0] ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCongreso, accessToken]);

  const revisoresAsignados = useMemo(() => {
    if (!viewItem?.nombre_dictaminador) return [];
    return [{ nombre_completo: viewItem.nombre_dictaminador }];
  }, [viewItem]);

  return (
    <div className="w-full space-y-7">
      <section className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-7">
        <div>
          <div className="flex gap-4">
            <div className="border bg-black rounded-full h-10 w-2"></div>
            <h2 className="flex-1 text-2xl font-bold text-start">Revisión de resúmenes</h2>
          </div>
          <p className="pl-12 text-start text-gray-500 mb-3">Aquí se gestiona la revisión de resúmenes.</p>
        </div>
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
      ) : items.length === 0 ? (
        <p className="text-center py-10 text-base-content/40 italic">No hay ponencias con resumen en este congreso.</p>
      ) : (
        <section className="grid items-start gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <ListaResumenes
              listaElementos={items}
              dictaminadores={[]}
              selectedId={viewItem?.id ?? null}
              onView={setViewItem}
            />
            <ListaRevisores titulo="DICTAMINADORES" revisores={revisoresAsignados} />
          </div>
          <div>
            <ResumenDetailCard resumen={viewItem} />
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/views/admin/ProcesosResumenesView.jsx
git commit -m "feat(admin): procesos/resumenes muestra dictaminador como texto, elimina selector"
```

---

### Task 8: Frontend ProcesosExtensosView — Dual Reviewers + LEDs + Buttons

**Files:**
- Modify: `frontend/src/views/admin/ProcesosExtensosView.jsx`
- Modify: `frontend/src/views/admin/PonenciaCrearView.jsx`

This is the largest frontend change. Replace `ProcesosExtensosView` entirely.

- [ ] **Step 1: Replace the entire `ProcesosExtensosView.jsx` file**

```jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListaExtensos from "./Componentes/ListaExtensos";
import { getCongresosApi, getEvaluadoresDisponiblesApi } from "../../api/adminApi";
import { getExtensosCongreso, asignarEvaluadoresApi, asignarEvaluador3Api } from "../../api/ponenciasApi";

function LedStatus({ label, active, neutral = false, color = null }) {
  const bg = neutral ? 'bg-gray-400' : color ?? (active ? 'bg-green-500' : 'bg-red-500');
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${bg} shadow-sm`} />
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  );
}

function RubricaGrupoStatusRow({ grupo }) {
  return (
    <div className="mb-5 ml-2">
      <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2 mb-1">
        {grupo.nombre_grupo}
      </h4>
      {grupo.criterios?.map((criterio, i) => (
        <div key={i} className="flex items-center justify-between border-b border-slate-200 py-3 last:border-b-0 pl-2 ml-2">
          <div className="flex-1">
            <span className="text-sm font-medium text-slate-700">{criterio.nombre_criterio}</span>
            {criterio.comentario_especifico && (
              <p className="text-xs text-slate-400 mt-0.5">{criterio.comentario_especifico}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3">
            {[1,2,3,4,5].map(v => (
              <div key={v} className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold ${v <= (criterio.puntaje ?? 0) ? 'bg-black text-white' : 'border-slate-800 bg-white text-slate-700'}`}>{v}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExtensoDetailCard({ extenso, evaluadoresDisponibles, idCongreso, onAsignarDos, onAsignarTres, toast }) {
  const navigate = useNavigate();
  const [r1Sel, setR1Sel] = useState('');
  const [r2Sel, setR2Sel] = useState('');
  const [r3Sel, setR3Sel] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Reset selectors when extenso changes
  useEffect(() => {
    setR1Sel(extenso?.id_evaluador ? String(extenso.id_evaluador) : '');
    setR2Sel(extenso?.id_evaluador_2 ? String(extenso.id_evaluador_2) : '');
    setR3Sel('');
  }, [extenso?.id_extenso]);

  if (!extenso) return (
    <article className="rounded-[28px] border border-black/55 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">No hay un extenso seleccionado.</p>
    </article>
  );

  const estado = extenso.estado_derivado ?? 'en_revision';
  const yaAsignados = extenso.id_evaluador && extenso.id_evaluador_2;
  const evaluadoresParaR3 = evaluadoresDisponibles.filter(
    e => e.id_evaluador !== extenso.id_evaluador && e.id_evaluador !== extenso.id_evaluador_2
  );

  const handleAsignarDos = async () => {
    if (!r1Sel || !r2Sel) return;
    setAssigning(true);
    try {
      await onAsignarDos(extenso.id_extenso, Number(r1Sel), Number(r2Sel));
    } finally {
      setAssigning(false);
    }
  };

  const handleAsignarTres = async () => {
    if (!r3Sel) return;
    setAssigning(true);
    try {
      await onAsignarTres(extenso.id_extenso, Number(r3Sel));
    } catch (err) {
      toast(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handlePublicar = () => {
    const tipo = extenso.tipo_ponencia === 'taller' ? 'talleres' : 'ponencias';
    const nombre = encodeURIComponent(extenso.title ?? '');
    const subarea = extenso.id_subarea ?? '';
    navigate(`/admin/eventos/${tipo}/crear?id_congreso=${idCongreso}&nombre_evento=${nombre}&id_subarea=${subarea}`);
  };

  const grupos = extenso.evaluacion?.grupos ?? null;

  return (
    <article className="flex min-h-[760px] flex-col rounded-[28px] border border-black/55 bg-white px-5 py-5 shadow-sm md:px-6 space-y-6">
      <section>
        <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Información de extenso</h3>
        <div className="mt-4 space-y-2 text-[14px] leading-6 text-slate-700">
          <p><span className="font-semibold text-slate-900">Título:</span> {extenso.title}</p>
          <p><span className="font-semibold text-slate-900">Autores:</span> {extenso.autores?.join(' / ') || 'Sin autores'}</p>
        </div>
      </section>

      {/* LEDs */}
      <section className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-2xl">
        <LedStatus label="Revisores asignados" active={!!yaAsignados} />
        <LedStatus label="En revisión" active={estado !== 'en_revision' && estado !== 'extenso_aceptado' && estado !== 'extenso_rechazado'} />
        {estado === 'desacuerdo' && <LedStatus label="Desacuerdo" active={true} color="bg-orange-500" />}
        <LedStatus label="Aceptado" active={estado === 'extenso_aceptado'} neutral={estado === 'en_revision'} />
      </section>

      {/* Revisores asignados — texto */}
      {(extenso.nombre_evaluador || extenso.nombre_evaluador_2 || extenso.nombre_evaluador_3) && (
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-1">Revisores</h4>
          <div className="space-y-1 text-sm text-slate-600">
            {extenso.nombre_evaluador && <p>R1: {extenso.nombre_evaluador}</p>}
            {extenso.nombre_evaluador_2 && <p>R2: {extenso.nombre_evaluador_2}</p>}
            {extenso.nombre_evaluador_3 && <p>R3 (Desempate): {extenso.nombre_evaluador_3}</p>}
          </div>
        </section>
      )}

      {/* Asignar R1 y R2 — solo si no están asignados y el extenso no está revisado */}
      {!yaAsignados && !extenso.revisado && (
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-2">Asignar revisores (obligatorio ambos)</h4>
          {evaluadoresDisponibles.length === 0 ? (
            <p className="text-xs text-amber-600 italic">No hay evaluadores asignados a este congreso.</p>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <select className="select select-bordered select-sm flex-1 rounded-xl" value={r1Sel} onChange={e => setR1Sel(e.target.value)}>
                  <option value="">Revisor 1</option>
                  {evaluadoresDisponibles.map(e => (
                    <option key={e.id_evaluador} value={e.id_evaluador}>{e.nombre_completo}</option>
                  ))}
                </select>
                <select className="select select-bordered select-sm flex-1 rounded-xl" value={r2Sel} onChange={e => setR2Sel(e.target.value)}>
                  <option value="">Revisor 2</option>
                  {evaluadoresDisponibles.map(e => (
                    <option key={e.id_evaluador} value={e.id_evaluador}>{e.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAsignarDos}
                disabled={!r1Sel || !r2Sel || r1Sel === r2Sel || assigning}
                className="w-full btn btn-primary btn-sm rounded-xl disabled:opacity-50"
              >
                {assigning ? 'Asignando...' : 'Asignar revisores'}
              </button>
              {r1Sel && r2Sel && r1Sel === r2Sel && (
                <p className="text-xs text-error">El Revisor 1 y el Revisor 2 no pueden ser la misma persona.</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Botón Asignar 3er revisor — solo en desacuerdo */}
      {estado === 'desacuerdo' && !extenso.id_evaluador_3 && (
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-orange-600 mb-2">Asignar 3er revisor (desempate)</h4>
          <div className="flex gap-2">
            <select className="select select-bordered select-sm flex-1 rounded-xl" value={r3Sel} onChange={e => setR3Sel(e.target.value)}>
              <option value="">Selecciona revisor 3</option>
              {evaluadoresParaR3.map(e => (
                <option key={e.id_evaluador} value={e.id_evaluador}>{e.nombre_completo}</option>
              ))}
            </select>
            <button
              onClick={handleAsignarTres}
              disabled={!r3Sel || assigning}
              className="btn btn-warning btn-sm rounded-xl disabled:opacity-50"
            >
              {assigning ? '...' : 'Asignar'}
            </button>
          </div>
        </section>
      )}

      {/* Botón Publicar — solo cuando aceptado */}
      {estado === 'extenso_aceptado' && (
        <section>
          <button
            onClick={handlePublicar}
            className="w-full btn btn-success rounded-xl uppercase tracking-wider font-bold"
          >
            Publicar ponencia
          </button>
        </section>
      )}

      {/* Rúbrica del último evaluador */}
      <section>
        <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700 mb-3">Rúbrica de evaluación (última)</h3>
        <div className="overflow-y-auto max-h-[250px]">
          {!grupos || grupos.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Sin evaluación enviada aún.</p>
          ) : (
            grupos.map((grupo, i) => <RubricaGrupoStatusRow key={i} grupo={grupo} />)
          )}
        </div>
      </section>

      {extenso.evaluacion?.estatus && (
        <section>
          <h3 className="text-[14px] font-semibold uppercase tracking-wide text-slate-700">Estatus de evaluación</h3>
          <div className="mt-2 rounded-[18px] border border-black/60 bg-[#f4f4f4] p-4 text-sm leading-6 text-slate-700">
            {extenso.evaluacion.estatus}
          </div>
        </section>
      )}
    </article>
  );
}

export default function ProcesosExtensosView() {
  const accessToken = localStorage.getItem('congress_access');
  const [congresos, setCongresos] = useState([]);
  const [selectedCongreso, setSelectedCongreso] = useState(null);
  const [items, setItems] = useState([]);
  const [evaluadores, setEvaluadores] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

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

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const refreshExtenso = (idExtenso, patch) => {
    setItems(prev => prev.map(item => item.id_extenso === idExtenso ? { ...item, ...patch } : item));
    if (viewItem?.id_extenso === idExtenso) {
      setViewItem(prev => ({ ...prev, ...patch }));
    }
  };

  const handleAsignarDos = async (idExtenso, r1, r2) => {
    await asignarEvaluadoresApi(accessToken, idExtenso, r1, r2);
    const ev1 = evaluadores.find(e => e.id_evaluador === r1);
    const ev2 = evaluadores.find(e => e.id_evaluador === r2);
    refreshExtenso(idExtenso, {
      asignado: true,
      id_evaluador: r1,
      id_evaluador_2: r2,
      nombre_evaluador: ev1?.nombre_completo ?? null,
      nombre_evaluador_2: ev2?.nombre_completo ?? null,
      estado_derivado: 'en_revision',
    });
  };

  const handleAsignarTres = async (idExtenso, r3) => {
    await asignarEvaluador3Api(accessToken, idExtenso, r3);
    const ev3 = evaluadores.find(e => e.id_evaluador === r3);
    refreshExtenso(idExtenso, {
      id_evaluador_3: r3,
      nombre_evaluador_3: ev3?.nombre_completo ?? null,
    });
  };

  return (
    <div className="w-full space-y-7">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 alert alert-error shadow-lg max-w-sm">
          <span>{toastMsg}</span>
        </div>
      )}
      <section className="flex flex-wrap items-center gap-3 border-t border-base-300 pt-7">
        <div>
          <div className="flex gap-4">
            <div className="border bg-black rounded-full h-10 w-2"></div>
            <h2 className="flex-1 text-2xl font-bold text-start">Revisión de extensos</h2>
          </div>
          <p className="pl-12 text-start text-gray-500 mb-3">Aquí se gestiona la revisión de extensos.</p>
        </div>
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
      ) : items.length === 0 ? (
        <p className="text-center py-10 text-base-content/40 italic">No hay ponencias con extenso en este congreso.</p>
      ) : (
        <section className="grid items-start gap-6 xl:grid-cols-2">
          <ListaExtensos
            listaElementos={items}
            dictaminadores={evaluadores}
            selectedId={viewItem?.id ?? null}
            onView={setViewItem}
          />
          <ExtensoDetailCard
            extenso={viewItem}
            evaluadoresDisponibles={evaluadores}
            idCongreso={selectedCongreso.id_congreso}
            onAsignarDos={handleAsignarDos}
            onAsignarTres={handleAsignarTres}
            toast={showToast}
          />
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `PonenciaCrearView` to accept `nombre_evento` and `id_subarea` query params**

In `frontend/src/views/admin/PonenciaCrearView.jsx`, find `emptyPonenciaData` and add two new fields from query params:

```jsx
const queryParams = new URLSearchParams(search);
const idCongreso = queryParams.get('id_congreso');
const nombreEventoParam = queryParams.get('nombre_evento') || "";
const idSubareaParam = queryParams.get('id_subarea') || "";

const emptyPonenciaData = {
    id_congreso: idCongreso || "",
    nombre_evento: nombreEventoParam,
    tipo_evento: "ponencia",
    id_subarea: idSubareaParam,
    cupos: 0,
    tipo_participacion: "Presencial",
    enlace: "",
    sinopsis: "",
    id_mesas_trabajo: "",
    fecha_hora_inicio: "",
    fecha_hora_final: ""
};
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/views/admin/ProcesosExtensosView.jsx frontend/src/views/admin/PonenciaCrearView.jsx
git commit -m "feat(admin): procesos/extensos con doble revisor, LEDs, botón publicar; PonenciaCrearView acepta params"
```

---

### Task 9: Frontend EstatusPonenciaView — Real Data

**Files:**
- Modify: `frontend/src/views/asistentes/EstatusPonenciaView.jsx`

- [ ] **Step 1: Replace the entire `EstatusPonenciaView.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisPonenciasPonenteApi } from '../../api/ponenciasApi';

const ESTADO_CONFIG = {
  pendiente_dictaminacion: { label: 'En espera de dictamen', border: 'border-l-gray-400', text: 'text-gray-500' },
  resumen_rechazado:       { label: 'Resumen rechazado',    border: 'border-l-error',   text: 'text-error' },
  pendiente_extenso:       { label: 'Resumen aceptado',     border: 'border-l-primary', text: 'text-primary' },
  en_revision:             { label: 'En revisión',          border: 'border-l-warning', text: 'text-warning' },
  con_modificaciones:      { label: 'Con modificaciones',   border: 'border-l-warning', text: 'text-warning' },
  extenso_aceptado:        { label: 'Ponencia aceptada',    border: 'border-l-success', text: 'text-success' },
  extenso_rechazado:       { label: 'Ponencia rechazada',   border: 'border-l-error',   text: 'text-error' },
};

function PonenciaCard({ ponencia }) {
  const navigate = useNavigate();
  const [showMotivo, setShowMotivo] = useState(false);
  const config = ESTADO_CONFIG[ponencia.estado] ?? { label: ponencia.estado, border: 'border-l-gray-400', text: 'text-gray-500' };

  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-6 mb-4 rounded-xl shadow-sm border-l-[10px] ${config.border}`}>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${config.text}`}>{config.label}</span>
        <h3 className="text-lg font-semibold text-slate-700 leading-tight mb-1 truncate">{ponencia.titulo}</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">ID: {ponencia.id_ponencia}</p>
        {ponencia.estado === 'con_modificaciones' && ponencia.retroalimentacion && (
          <p className="text-xs text-slate-500 mt-1 italic">"{ponencia.retroalimentacion}"</p>
        )}
      </div>
      <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
        {ponencia.estado === 'pendiente_extenso' && (
          <button className="btn btn-primary btn-sm rounded-lg" onClick={() => navigate(`/asistente/subir-extenso/${ponencia.id_resumen}`)}>
            Subir Extenso
          </button>
        )}
        {ponencia.estado === 'con_modificaciones' && (
          <button className="btn btn-warning btn-sm rounded-lg" onClick={() => navigate(`/asistente/subir-extenso/${ponencia.id_extenso}?correccion=true`)}>
            Subir Corrección
          </button>
        )}
        {(ponencia.estado === 'resumen_rechazado' || ponencia.estado === 'extenso_rechazado') && (
          <>
            <button className="btn btn-error btn-outline btn-sm rounded-lg" onClick={() => setShowMotivo(true)}>
              Ver motivo
            </button>
            {showMotivo && (
              <div className="modal modal-open">
                <div className="modal-box">
                  <h3 className="font-bold text-lg text-error">Motivo de rechazo</h3>
                  <p className="py-4 text-sm text-slate-700">{ponencia.retroalimentacion || 'Sin retroalimentación registrada.'}</p>
                  <div className="modal-action">
                    <button className="btn btn-sm" onClick={() => setShowMotivo(false)}>Cerrar</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function EstatusPonenciaView() {
  const accessToken = localStorage.getItem('congress_access');
  const [ponencias, setPonencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMisPonenciasPonenteApi(accessToken)
      .then(setPonencias)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

  if (error) return (
    <div className="p-8">
      <p className="text-error text-sm">Error al cargar estatus: {error}</p>
    </div>
  );

  return (
    <div className="p-8 bg-base-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Estatus de Ponencias</h1>
      <div className="flex flex-row flex-wrap gap-6 mb-8">
        {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${cfg.border.replace('border-l-', 'bg-')}`}></span>
            <p className="text-sm">{cfg.label}</p>
          </div>
        ))}
      </div>
      {ponencias.length === 0 ? (
        <p className="text-center py-10 text-base-content/40 italic">No tienes ponencias registradas.</p>
      ) : (
        ponencias.map(p => <PonenciaCard key={p.id_ponencia} ponencia={p} />)
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/views/asistentes/EstatusPonenciaView.jsx
git commit -m "feat(ponente): EstatusPonenciaView conecta a endpoint real con estado derivado"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Start backend and verify new endpoints respond**

```bash
cd backend && DJANGO_SETTINGS_MODULE=core.settings python manage.py runserver &
sleep 3
curl -s http://localhost:8000/api/ponencias/ponente/mis-ponencias/ | python3 -m json.tool | head -5 || echo "Auth required (expected)"
```

Expected: response with auth error (401) or data — either proves the endpoint is registered.

- [ ] **Step 2: Start frontend and verify ProcesosExtensosView loads**

```bash
cd frontend && npm run dev &
sleep 5
echo "Open browser to http://localhost:5173/admin/procesos/extensos"
```

Manually verify:
- Admin view shows extensos with updated LEDs (Revisores asignados = green only when both assigned)
- Dual selector block appears for unassigned extensos
- "Asignar revisores" button is disabled until both selectors have values

- [ ] **Step 3: Verify ProcesosResumenesView has no selector**

Navigate to `/admin/procesos/resumenes`. Confirm no `<select>` for dictaminador — only text showing the assigned dictaminador's name.

- [ ] **Step 4: Verify EstatusPonenciaView loads without crash**

Navigate to `/ponente/estatus-ponencia`. Confirm spinner shows then list renders (or empty state).

- [ ] **Step 5: Commit verification note**

```bash
git add -A
git diff --cached --name-only
git commit -m "feat: flujo multi-revisor ponencias completo — DB, backend, frontend"
```

---

## Key Invariants

1. **`asignado` en ExtensosCongresoView**: `True` solo cuando AMBOS `id_evaluador` Y `id_evaluador_2` son no-null.
2. **`revisado` en MisExtensosView**: significa "yo (este evaluador) ya envié mi evaluación", NO "el extenso tiene decisión final". No confundir con `extenso.revisado` de la DB.
3. **`_finalizar_extenso_si_procede`**: solo marca `extenso.revisado=TRUE` en DB cuando hay decisión final (ambos aceptan sin mods, ambos rechazan, o R3 envía). Nunca llamar con `revisado` ya TRUE.
4. **`calcular_estado_extenso`**: pure function — no hace queries. Recibe datos ya cargados.
5. **Desacuerdo**: solo se activa cuando ambos R1 y R2 tienen evaluación Y uno rechaza y el otro no. No hay estado intermedio visible al ponente.
