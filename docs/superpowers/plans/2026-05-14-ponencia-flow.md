# Ponencia Flow Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three gaps in the ponencia flow: (1) "Publicar ponencia" navigates to a form with pre-filled data instead of publishing directly, (2) the extenso detail panel shows both reviewers' rubricas, (3) the magistral create form exposes an editable multimedia link field.

**Architecture:** Backend changes to `PublicarPonenciaView` (accept form fields) and `ExtensosCongresoView` (return `evaluacion_1`/`evaluacion_2`). A new migration adds `enlace_multimedia` to `ponencia_magistral`. Frontend changes wire the create form into the publish flow and render the two reviewer cards.

**Tech Stack:** Django 6 (raw SQL views), React + React Router, TailwindCSS/DaisyUI

---

## File Map

| File | Change |
|------|--------|
| `backend/ponencias/models.py` | Add `enlace_multimedia` field to `PonenciaMagistral` |
| `backend/ponencias/migrations/0006_ponenciamagistral_enlace_multimedia.py` | `RunSQL` to add column |
| `backend/ponencias/serializers.py` | Add `enlace_multimedia` to magistral serializers; include in `create()` |
| `backend/ponencias/views.py` — `PublicarPonenciaView` | Accept event fields in POST body |
| `backend/ponencias/views.py` — `ExtensosCongresoView` | Return `evaluacion_1` + `evaluacion_2` per reviewer |
| `frontend/src/api/ponenciasApi.js` | `publicarPonenciaApi` sends JSON body |
| `frontend/src/views/admin/Componentes/DetallesEditarPonencia.jsx` | `idExtenso` prop; publish-mode `handleSave`; editable magistral multimedia field |
| `frontend/src/views/admin/PonenciaCrearView.jsx` | Read `id_extenso` param; add `enlace_multimedia`; pass `idExtenso` prop |
| `frontend/src/views/admin/ProcesosExtensosView.jsx` | `handlePublicar` → navigate; two reviewer rubrica cards |

---

## Task 1: Backend — PublicarPonenciaView accepts event form fields

**Files:**
- Modify: `backend/ponencias/views.py:1565-1615`

- [ ] **Step 1: Replace the POST body of `PublicarPonenciaView`**

Find the `post` method starting at line 1565. Replace the entire method body so that after fetching the ponencia data, it reads form fields from `request.data` instead of hard-coding empty/default values:

```python
def post(self, request, pk):
    if not request.user.is_staff:
        return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT p.id_ponencia, p.id_extenso, p.id_evento,
                   pm.id_congreso, pm.id_tipo_trabajo,
                   COALESCE(mult.nombre, ext.titulo, 'Ponencia ' || p.id_ponencia::text) AS titulo,
                   ext.revisado
            FROM ponencia p
            JOIN ponencia_meta pm ON pm.id_ponencia = p.id_ponencia
            JOIN extenso ext ON p.id_extenso = ext.id_extenso
            LEFT JOIN multimedia mult ON p.id_multimedia = mult.id_material
            WHERE p.id_extenso = %s
        """, [pk])
        row = cursor.fetchone()
        if not row:
            return Response({'detail': 'Extenso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        id_ponencia, id_extenso, id_evento_existente, id_congreso, id_tipo_trabajo, titulo, revisado = row

        if id_evento_existente:
            return Response({'detail': 'Esta ponencia ya fue publicada.'}, status=status.HTTP_400_BAD_REQUEST)

        if not revisado:
            return Response({'detail': 'El extenso aún no ha sido marcado como revisado.'}, status=status.HTTP_400_BAD_REQUEST)

        # Read event fields from form data; fall back to congress dates if missing
        fecha_inicio = request.data.get('fecha_hora_inicio') or None
        fecha_fin = request.data.get('fecha_hora_final') or None

        if not fecha_inicio or not fecha_fin:
            cursor.execute("""
                SELECT fc.fecha_inicio_evento, fc.fecha_final_evento
                FROM congreso c
                JOIN fechas_congreso fc ON c.id_fechas_congreso = fc.id_fechas_congreso
                WHERE c.id_congreso = %s
            """, [id_congreso])
            dates_row = cursor.fetchone()
            if not fecha_inicio:
                fecha_inicio = dates_row[0] if dates_row else None
            if not fecha_fin:
                fecha_fin = dates_row[1] if dates_row else None

        cupos = int(request.data.get('cupos', 0) or 0)
        sinopsis = request.data.get('sinopsis', '') or ''
        enlace = request.data.get('enlace', '') or ''
        id_mesas_trabajo = request.data.get('id_mesas_trabajo') or None
        tipo_participacion = request.data.get('tipo_participacion', 'Presencial') or 'Presencial'

        with transaction.atomic():
            cursor.execute("""
                INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo,
                                    id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final,
                                    sinopsis, cupos, enlace)
                VALUES (%s, %s, 'ponencia', %s, %s, %s, %s, %s, %s, %s)
                RETURNING id_evento
            """, [id_congreso, titulo, id_tipo_trabajo, id_mesas_trabajo,
                  fecha_inicio, fecha_fin, sinopsis, cupos, enlace])
            id_evento = cursor.fetchone()[0]

            cursor.execute(
                "UPDATE ponencia SET id_evento = %s, tipo_participacion = %s WHERE id_ponencia = %s",
                [id_evento, tipo_participacion, id_ponencia]
            )

    return Response({'detail': 'Ponencia publicada correctamente.', 'id_evento': id_evento}, status=status.HTTP_201_CREATED)
```

- [ ] **Step 2: Verify backend starts without errors**

```bash
cd /home/diego07/Documentos/CongressManager/backend
python manage.py check
```

Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 3: Commit**

```bash
git -C /home/diego07/Documentos/CongressManager add backend/ponencias/views.py
git -C /home/diego07/Documentos/CongressManager commit -m "feat: publicar ponencia acepta campos del evento en el body del POST"
```

---

## Task 2: Backend — ExtensosCongresoView returns evaluacion_1 and evaluacion_2

**Files:**
- Modify: `backend/ponencias/views.py:864-939`

- [ ] **Step 1: Refactor the evaluaciones query block**

In `ExtensosCongresoView.get`, replace the block from line 864 to the end of the result building. The `evals_map` currently stores only one evaluacion per extenso. Replace it with a per-reviewer structure:

```python
# Replace lines 864–898 with:
c.execute("""
    SELECT DISTINCT ON (id_extenso, id_evaluador)
        id_extenso, id_evaluador, estatus, retroalimentacion_general, id_evaluacion
    FROM evaluacion
    WHERE id_extenso = ANY(%s)
    ORDER BY id_extenso, id_evaluador, fecha_de_revision DESC
""", [extenso_ids])
evals_map = {}
all_ev_ids = []
for id_ext, id_eval, estatus, retro, id_ev in c.fetchall():
    evals_map.setdefault(id_ext, {})[id_eval] = {
        'id_evaluacion': id_ev,
        'estatus': estatus,
        'retro': retro,
    }
    all_ev_ids.append(id_ev)

criterios_map = {}
if all_ev_ids:
    c.execute("""
        SELECT ec.id_evaluacion, rg.nombre_grupo, rc.descripcion, rc.peso, ec.puntaje, ec.comentario_especifico
        FROM evaluacion_criterio ec
        JOIN rubrica_criterio rc ON ec.id_criterio = rc.id_criterio
        JOIN rubrica_grupo rg ON rc.id_grupo = rg.id_grupo
        WHERE ec.id_evaluacion = ANY(%s)
        ORDER BY rg.id_grupo, rc.id_criterio
    """, [all_ev_ids])
    for row in c.fetchall():
        id_ev, nombre_grupo, nombre_criterio, peso, puntaje, comentario = row
        grupos = criterios_map.setdefault(id_ev, {})
        grupos.setdefault(nombre_grupo, []).append({
            'nombre_criterio': nombre_criterio,
            'peso': float(peso) if peso else None,
            'puntaje': puntaje,
            'comentario_especifico': comentario,
        })
```

- [ ] **Step 2: Add helper and update result building**

Add this helper function right before the `result = []` line (after the `with connection.cursor()` block closes):

```python
def _build_evaluacion(id_evaluador, id_extenso, evals_map, criterios_map):
    if not id_evaluador:
        return None
    reviewer_data = evals_map.get(id_extenso, {}).get(id_evaluador)
    if not reviewer_data:
        return None
    id_ev = reviewer_data['id_evaluacion']
    grupos_dict = criterios_map.get(id_ev, {})
    if not grupos_dict:
        return None
    return {
        'estatus': reviewer_data['estatus'],
        'retroalimentacion_general': reviewer_data['retro'],
        'grupos': [{'nombre_grupo': ng, 'criterios': crs} for ng, crs in grupos_dict.items()],
    }
```

Then in the `result.append({...})` block, replace the `evaluacion` key with `evaluacion_1` and `evaluacion_2`, and update `ev_por_eval` to use the new structure:

```python
# Replace the block starting at "result = []" through "return Response(result)"
result = []
for p in ponencias:
    ev_por_eval = {id_eval: d['estatus'] for id_eval, d in evals_map.get(p['id_extenso'], {}).items()}
    estado_derivado = calcular_estado_extenso(p, ev_por_eval)

    result.append({
        'id': p['id_ponencia'],
        'id_extenso': p['id_extenso'],
        'id_subarea': p['id_subarea'],
        'id_congreso': p['id_congreso'],
        'tipo_ponencia': p['tipo_ponencia'],
        'title': p['titulo'],
        'ruta_extenso': p['ruta_relativa'],
        'autores': autores_map.get(p['id_ponencia'], []),
        'ponentes_personas_ids': ponentes_personas_map.get(p['id_ponencia'], []),
        'asignado': p['id_evaluador'] is not None and p['id_evaluador_2'] is not None,
        'revisado': p['revisado'] or False,
        'aceptado': estado_derivado == 'extenso_aceptado',
        'estado_derivado': estado_derivado,
        'publicado': p['publicado'] or False,
        'id_evaluador': p['id_evaluador'],
        'id_evaluador_2': p['id_evaluador_2'],
        'id_evaluador_3': p['id_evaluador_3'],
        'nombre_evaluador': p['nombre_evaluador'],
        'nombre_evaluador_2': p['nombre_evaluador_2'],
        'nombre_evaluador_3': p['nombre_evaluador_3'],
        'evaluador_1_revisado': p['id_evaluador'] in ev_por_eval if p['id_evaluador'] else False,
        'evaluador_2_revisado': p['id_evaluador_2'] in ev_por_eval if p['id_evaluador_2'] else False,
        'evaluacion_1': _build_evaluacion(p['id_evaluador'], p['id_extenso'], evals_map, criterios_map),
        'evaluacion_2': _build_evaluacion(p['id_evaluador_2'], p['id_extenso'], evals_map, criterios_map),
    })
return Response(result)
```

- [ ] **Step 3: Verify no syntax errors**

```bash
cd /home/diego07/Documentos/CongressManager/backend
python manage.py check
```

Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 4: Commit**

```bash
git -C /home/diego07/Documentos/CongressManager add backend/ponencias/views.py
git -C /home/diego07/Documentos/CongressManager commit -m "feat: extensos devuelve evaluacion_1 y evaluacion_2 por revisor"
```

---

## Task 3: Backend — Add enlace_multimedia to ponencia_magistral

**Files:**
- Modify: `backend/ponencias/models.py:137`
- Create: `backend/ponencias/migrations/0006_ponenciamagistral_enlace_multimedia.py`
- Modify: `backend/ponencias/serializers.py` (two serializers + `create()`)
- Modify: `backend/ponencias/views.py` — `PonenciaMagistralViewSet.update()`

- [ ] **Step 1: Add field to the model**

In `backend/ponencias/models.py`, after line 137 (`id_multimedia = models.IntegerField(...)`), add:

```python
enlace_multimedia = models.CharField(max_length=500, blank=True, default='')
```

The model is `managed = False` so Django won't auto-generate a migration; we write it manually.

- [ ] **Step 2: Create the migration file**

Create `backend/ponencias/migrations/0006_ponenciamagistral_enlace_multimedia.py`:

```python
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ponencias', '0005_ponenciamagistral_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE ponencia_magistral ADD COLUMN IF NOT EXISTS enlace_multimedia VARCHAR(500) DEFAULT '';",
            reverse_sql="ALTER TABLE ponencia_magistral DROP COLUMN IF EXISTS enlace_multimedia;",
        ),
    ]
```

- [ ] **Step 3: Run the migration**

```bash
cd /home/diego07/Documentos/CongressManager/backend
python manage.py migrate ponencias 0006_ponenciamagistral_enlace_multimedia
```

Expected: `Applying ponencias.0006_ponenciamagistral_enlace_multimedia... OK`

- [ ] **Step 4: Update PonenciaMagistralSerializer**

In `backend/ponencias/serializers.py`, in `PonenciaMagistralSerializer.Meta.fields` (around line 152), add `'enlace_multimedia'` to the list:

```python
fields = [
    'id', 'id_ponencia_magistral', 'titulo', 'tipo_participacion',
    'id_subarea', 'nombre_subarea', 'fecha_inicio', 'fecha_fin',
    'id_congreso', 'nombre_congreso', 'id_multimedia', 'ponentes',
    'tipo_ponencia', 'ponente_principal', 'coautores',
    'nombre_institucion', 'nombre_tipo_trabajo', 'enlace_multimedia',
]
```

- [ ] **Step 5: Update PonenciaMagistralCreateSerializer**

In `PonenciaMagistralCreateSerializer` (around line 195), add the field after `coautores`:

```python
enlace_multimedia = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')
```

Then in `create()` (around line 226), update the INSERT to include the new column:

```python
cursor.execute("""
    INSERT INTO ponencia_magistral
    (titulo, tipo_participacion, id_subarea, id_congreso, fecha_inicio, fecha_fin, id_multimedia, enlace_multimedia)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id_ponencia_magistral
""", [
    validated_data['titulo'],
    tipo_p,
    validated_data.get('id_subarea'),
    validated_data['id_congreso'],
    validated_data.get('fecha_inicio'),
    validated_data.get('fecha_fin'),
    validated_data.get('id_multimedia'),
    validated_data.get('enlace_multimedia', ''),
])
```

- [ ] **Step 6: Update PonenciaMagistralViewSet.update()**

In the `update` method in `views.py` (around line 1494), update the SQL to include `enlace_multimedia`:

```python
cursor.execute("""
    UPDATE ponencia_magistral SET
        titulo = %s, tipo_participacion = %s, id_subarea = %s,
        fecha_inicio = %s, fecha_fin = %s, enlace_multimedia = %s
    WHERE id_ponencia_magistral = %s
""", [
    data.get('titulo', instance.titulo),
    tipo_p,
    data.get('id_subarea', instance.id_subarea_id),
    data.get('fecha_inicio', instance.fecha_inicio),
    data.get('fecha_fin', instance.fecha_fin),
    data.get('enlace_multimedia', instance.enlace_multimedia or ''),
    instance.id_ponencia_magistral
])
```

- [ ] **Step 7: Verify**

```bash
cd /home/diego07/Documentos/CongressManager/backend
python manage.py check
```

Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 8: Commit**

```bash
git -C /home/diego07/Documentos/CongressManager add \
    backend/ponencias/models.py \
    backend/ponencias/migrations/0006_ponenciamagistral_enlace_multimedia.py \
    backend/ponencias/serializers.py \
    backend/ponencias/views.py
git -C /home/diego07/Documentos/CongressManager commit -m "feat: enlace_multimedia en ponencia magistral"
```

---

## Task 4: Frontend API — publicarPonenciaApi sends form data

**Files:**
- Modify: `frontend/src/api/ponenciasApi.js:197-205`

- [ ] **Step 1: Update the function signature and request**

Replace lines 197–205 with:

```js
export async function publicarPonenciaApi(accessToken, idExtenso, formData = {}) {
  const res = await fetch(`${API_URL}/api/ponencias/extensos/${idExtenso}/publicar/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error al publicar la ponencia');
  return data;
}
```

- [ ] **Step 2: Commit**

```bash
git -C /home/diego07/Documentos/CongressManager add frontend/src/api/ponenciasApi.js
git -C /home/diego07/Documentos/CongressManager commit -m "feat: publicarPonenciaApi envía campos del evento en el body"
```

---

## Task 5: Frontend — DetallesEditarPonencia: publish mode + magistral multimedia

**Files:**
- Modify: `frontend/src/views/admin/Componentes/DetallesEditarPonencia.jsx`

- [ ] **Step 1: Add publicarPonenciaApi import**

At the top of the file, after the existing imports, add:

```js
import { publicarPonenciaApi } from '../../../api/ponenciasApi';
```

- [ ] **Step 2: Add idExtenso prop to forwardRef signature**

Change line 12 from:

```js
const DetallesEditarPonencia = forwardRef(({ ponenciaData, initialModificando = false, isFullPage = false }, ref) => {
```

to:

```js
const DetallesEditarPonencia = forwardRef(({ ponenciaData, initialModificando = false, isFullPage = false, idExtenso = null }, ref) => {
```

- [ ] **Step 3: Add publish-mode branch at the top of handleSave**

In `handleSave` (around line 221), add a new branch **before** the `isMagistral` check:

```js
async function handleSave() {
    if (!formatData.nombre_evento || !formatData.id_congreso || !formatData.id_subarea) {
        alert("Por favor completa los campos obligatorios (Título, Congreso, Subárea).");
        return;
    }

    setSaving(true);
    try {
        // Publish-existing-ponencia mode (from extenso flow)
        if (idExtenso) {
            const formData = {
                fecha_hora_inicio: formatData.fecha_hora_inicio || null,
                fecha_hora_final: formatData.fecha_hora_final || null,
                cupos: Number(formatData.cupos) || 0,
                sinopsis: formatData.sinopsis || '',
                enlace: formatData.enlace || '',
                id_mesas_trabajo: formatData.id_mesas_trabajo || null,
                tipo_participacion: formatData.tipo_participacion || 'Presencial',
            };
            const { id_evento } = await publicarPonenciaApi(accessToken, idExtenso, formData);
            navigate(`/admin/eventos/ponencias/detalles/${id_evento}?edit=true`);
            return;
        }

        if (isMagistral) {
            // ... existing magistral block unchanged ...
```

- [ ] **Step 4: Include enlace_multimedia in the magistral save payload**

In the magistral branch of `handleSave` (around line 230), add `enlace_multimedia` to `magistralData`:

```js
const magistralData = {
    titulo: formatData.nombre_evento,
    tipo_participacion: formatData.tipo_participacion || 'presencial',
    id_subarea: formatData.id_subarea ? parseInt(formatData.id_subarea) : null,
    id_congreso: parseInt(formatData.id_congreso),
    fecha_inicio: formatData.fecha_hora_inicio || null,
    fecha_fin: formatData.fecha_hora_final || null,
    ponente_principal: ponentePrincipal,
    coautores: coautores,
    enlace_multimedia: formatData.enlace_multimedia || '',
};
```

- [ ] **Step 5: Make the multimedia field editable for magistral and change its label**

Find the multimedia field block (around lines 605–628). Replace it with:

```jsx
<div>
    <label className={labelClasses}>
        Enlace/ruta a multimedia
        {!isMagistral && (
            <span className="text-base-content/30 font-normal normal-case tracking-normal"> (enviado por el ponente)</span>
        )}
    </label>
    <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30"><TbFileSymlink /></span>
        <input
            id="enlace_multimedia"
            type="text"
            className={`${inputClasses} pl-11 pr-11 font-mono ${(!isMagistral || !modificando) ? 'cursor-not-allowed' : ''}`}
            value={formatData.enlace_multimedia || ''}
            onChange={isMagistral && modificando ? handleChange : undefined}
            readOnly={!isMagistral || !modificando}
            placeholder={
                isMagistral
                    ? "Enlace al material multimedia (video, presentación, etc.)"
                    : "El ponente aún no ha enviado su enlace"
            }
        />
        {formatData.enlace_multimedia && (
            <button
                type="button"
                onClick={() => handleCopy(formatData.enlace_multimedia, 'enlace_multimedia')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-base-content/40 hover:text-primary hover:bg-primary/10 transition-all"
                title="Copiar enlace multimedia"
            >
                {copiedField === 'enlace_multimedia' ? <IoIosCheckmark size={18} className="text-success" /> : <FiCopy size={14} />}
            </button>
        )}
    </div>
</div>
```

- [ ] **Step 6: Commit**

```bash
git -C /home/diego07/Documentos/CongressManager add frontend/src/views/admin/Componentes/DetallesEditarPonencia.jsx
git -C /home/diego07/Documentos/CongressManager commit -m "feat: DetallesEditarPonencia soporta modo publicar y multimedia editable en magistral"
```

---

## Task 6: Frontend — PonenciaCrearView reads id_extenso and passes it

**Files:**
- Modify: `frontend/src/views/admin/PonenciaCrearView.jsx`

- [ ] **Step 1: Read id_extenso from query params**

After the existing `esMagistral` line (around line 13), add:

```js
const idExtensoParam = queryParams.get('id_extenso') || null;
```

- [ ] **Step 2: Add enlace_multimedia to emptyPonenciaData**

In `emptyPonenciaData` (around line 17), add `enlace_multimedia`:

```js
const emptyPonenciaData = {
    id_congreso: idCongreso || "",
    nombre_evento: nombreEventoParam,
    tipo_evento: "ponencia",
    tipo_ponencia: esMagistral ? 'magistral' : 'normal',
    id_subarea: idSubareaParam,
    cupos: 0,
    tipo_participacion: "Presencial",
    enlace: "",
    sinopsis: "",
    id_mesas_trabajo: "",
    fecha_hora_inicio: "",
    fecha_hora_final: "",
    enlace_multimedia: "",
};
```

- [ ] **Step 3: Pass idExtenso to DetallesEditarPonencia**

In the JSX around line 52, update the `DetallesEditarPonencia` call:

```jsx
<DetallesEditarPonencia 
    ref={ponenciaRef}
    ponenciaData={emptyPonenciaData} 
    initialModificando={true}
    isFullPage={true}
    idExtenso={idExtensoParam}
/>
```

- [ ] **Step 4: Update page title for publish mode**

The page header can hint that this is a publish flow. After the `esMagistral` definition, derive a title:

```js
const pageTitle = idExtensoParam
    ? 'Publicar Ponencia'
    : esMagistral
        ? 'Crear Ponencia Magistral'
        : 'Crear Ponencia';

const pageSubtitle = idExtensoParam
    ? 'Completa los detalles para publicar la ponencia en el programa del congreso'
    : `Completa la información para registrar una nueva ${esMagistral ? 'ponencia magistral' : 'ponencia'}`;
```

Then in the JSX, replace the hard-coded strings with `{pageTitle}` and `{pageSubtitle}`. Also update the save button text:

```jsx
{idExtensoParam ? 'Publicar Ponencia' : esMagistral ? 'Guardar Ponencia Magistral' : 'Guardar Ponencia'}
```

- [ ] **Step 5: Commit**

```bash
git -C /home/diego07/Documentos/CongressManager add frontend/src/views/admin/PonenciaCrearView.jsx
git -C /home/diego07/Documentos/CongressManager commit -m "feat: PonenciaCrearView soporta modo publicar desde extenso"
```

---

## Task 7: Frontend — ProcesosExtensosView navigates to create form

**Files:**
- Modify: `frontend/src/views/admin/ProcesosExtensosView.jsx`

- [ ] **Step 1: Replace handlePublicar with navigate**

In `ExtensoDetailCard`, replace the entire `handlePublicar` function (lines 100–110) with:

```js
const handlePublicar = () => {
    const params = new URLSearchParams({
        id_congreso: String(extenso.id_congreso),
        nombre_evento: extenso.title,
        id_subarea: String(extenso.id_subarea || ''),
        id_extenso: String(extenso.id_extenso),
    });
    navigate(`/admin/eventos/ponencias/crear?${params.toString()}`);
};
```

- [ ] **Step 2: Remove unused state and import**

Since `handlePublicar` no longer calls `publicarPonenciaApi` or sets `publishing`, remove:
1. The `publishing` state: `const [publishing, setPublishing] = useState(false);`
2. The `publicarPonenciaApi` import from line 5 (if not used elsewhere in the file)

Update line 5 import accordingly:
```js
import { getExtensosCongreso, asignarEvaluadoresApi, asignarEvaluador3Api, buildMediaUrl } from "../../api/ponenciasApi";
```

Update the publish button (around line 222):
```jsx
{estado === 'extenso_aceptado' && !extenso.publicado && (
    <section>
        <button
            onClick={handlePublicar}
            className="w-full btn btn-success rounded-xl tracking-wider font-bold"
        >
            Publicar ponencia
        </button>
    </section>
)}
```

- [ ] **Step 3: Commit**

```bash
git -C /home/diego07/Documentos/CongressManager add frontend/src/views/admin/ProcesosExtensosView.jsx
git -C /home/diego07/Documentos/CongressManager commit -m "feat: publicar ponencia navega al formulario con datos pre-llenados"
```

---

## Task 8: Frontend — Show both reviewer rubrica cards in extenso detail

**Files:**
- Modify: `frontend/src/views/admin/ProcesosExtensosView.jsx`

- [ ] **Step 1: Remove the single-evaluacion variable**

In `ExtensoDetailCard`, remove line 112:
```js
const grupos = extenso.evaluacion?.grupos ?? null;
```

- [ ] **Step 2: Replace the rubrica section with two reviewer cards**

Find the rubrica section (around lines 240–258) and replace it with:

```jsx
<section>
    <h3 className="font-semibold tracking-wide text-slate-700 mb-3">
        Rúbrica — Revisor 1
        {extenso.nombre_evaluador && (
            <span className="text-slate-400 font-normal text-sm"> ({extenso.nombre_evaluador})</span>
        )}
    </h3>
    <div className="overflow-y-auto max-h-[220px]">
        {!extenso.evaluacion_1?.grupos?.length ? (
            <p className="text-sm text-slate-400 italic">Sin evaluación enviada aún.</p>
        ) : (
            extenso.evaluacion_1.grupos.map((grupo, i) => <RubricaGrupoStatusRow key={i} grupo={grupo} />)
        )}
    </div>
    {extenso.evaluacion_1?.estatus && (
        <div className="mt-2 rounded-[18px] border border-black/60 bg-[#f4f4f4] p-4 text-sm leading-6 text-slate-700">
            {extenso.evaluacion_1.estatus}
        </div>
    )}
</section>

<section>
    <h3 className="font-semibold tracking-wide text-slate-700 mb-3">
        Rúbrica — Revisor 2
        {extenso.nombre_evaluador_2 && (
            <span className="text-slate-400 font-normal text-sm"> ({extenso.nombre_evaluador_2})</span>
        )}
    </h3>
    <div className="overflow-y-auto max-h-[220px]">
        {!extenso.evaluacion_2?.grupos?.length ? (
            <p className="text-sm text-slate-400 italic">Sin evaluación enviada aún.</p>
        ) : (
            extenso.evaluacion_2.grupos.map((grupo, i) => <RubricaGrupoStatusRow key={i} grupo={grupo} />)
        )}
    </div>
    {extenso.evaluacion_2?.estatus && (
        <div className="mt-2 rounded-[18px] border border-black/60 bg-[#f4f4f4] p-4 text-sm leading-6 text-slate-700">
            {extenso.evaluacion_2.estatus}
        </div>
    )}
</section>
```

- [ ] **Step 3: Commit**

```bash
git -C /home/diego07/Documentos/CongressManager add frontend/src/views/admin/ProcesosExtensosView.jsx
git -C /home/diego07/Documentos/CongressManager commit -m "feat: rúbrica de extenso muestra evaluaciones de ambos revisores"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|------------------|------|
| "Publicar ponencia" navega con params del extenso (id_congreso, nombre_evento, id_subarea, id_extenso) | Task 7 |
| Admin llena detalles en el form antes de guardar | Task 6 (PonenciaCrearView recibe params) |
| handleSave llama publicarPonenciaApi con form data cuando idExtenso presente | Task 5 |
| Backend acepta campos del evento en POST body | Task 1 |
| Ponencia publicada queda con tipo_ponencia normal (no magistral) | Task 6 (sin `tipo=magistral` en URL) |
| Extenso detail muestra evaluacion_1 y evaluacion_2 | Tasks 2 + 8 |
| Campo multimedia editable en form magistral | Tasks 3 + 5 |
| Backend guarda enlace_multimedia en ponencia_magistral | Task 3 |

**Type/name consistency:**
- `idExtenso` prop → passed in Task 6, read in Task 5 ✓
- `evaluacion_1` / `evaluacion_2` → returned by backend Task 2, read in frontend Task 8 ✓
- `publicarPonenciaApi(accessToken, idExtenso, formData)` → updated in Task 4, called in Task 5 ✓
- `enlace_multimedia` in `magistralData` → sent in Task 5, saved in Task 3 ✓

**No placeholders found** — all steps include complete code.
