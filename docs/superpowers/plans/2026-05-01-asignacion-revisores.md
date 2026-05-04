# Asignación de Revisores Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que el admin asigne un dictaminador a un resumen y un evaluador a un extenso. Agregar `id_evaluador` a la tabla `extenso` vía migración, modelar `Resumen`/`Extenso`/`Evaluacion`/`DictamenResumen` en Django, y exponer 4 endpoints en `ponencias/`.

**Architecture:** `resumen` ya tiene `id_dictaminador`. Se añade `id_evaluador` a `extenso` con `RunSQL`. Los modelos son `managed=False`. Los endpoints listan dictaminadores/evaluadores disponibles por congreso filtrando `DictaminadorCongreso`/`EvaluadorCongreso` cruzado con las tablas globales `dictaminador`/`evaluador`.

**Tech Stack:** Django REST Framework, PostgreSQL

---

### Task 1: Agregar modelos `Resumen`, `Extenso`, `DictamenResumen`, `Evaluacion`, `EvaluacionCriterio` en `ponencias/models.py`

**Files:**
- Modify: `backend/ponencias/models.py`

Estos modelos son todos `managed=False` — apuntan a tablas existentes. Los modelos `Dictaminador` y `Evaluador` están en `users/models.py`.

- [ ] **Step 1: Agregar modelos al final de `backend/ponencias/models.py`**

```python
from users.models import Dictaminador, Evaluador
from congresos.models import RubricaCriterio

class Resumen(models.Model):
    id_resumen = models.AutoField(primary_key=True)
    id_dictaminador = models.ForeignKey(
        Dictaminador, models.SET_NULL, db_column='id_dictaminador', null=True, blank=True
    )
    fecha_entrega = models.DateTimeField(auto_now_add=True)
    revisado = models.BooleanField(default=False)
    estatus = models.CharField(max_length=50, null=True, blank=True)
    retroalimentacion = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'resumen'


class Extenso(models.Model):
    id_extenso = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=255)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    revisado = models.BooleanField(default=False)
    version_numero = models.IntegerField(default=1)
    id_evaluador = models.ForeignKey(
        Evaluador, models.SET_NULL, db_column='id_evaluador', null=True, blank=True
    )

    class Meta:
        managed = False
        db_table = 'extenso'


class DictamenResumen(models.Model):
    id_dictamen = models.AutoField(primary_key=True)
    id_resumen = models.ForeignKey(Resumen, models.CASCADE, db_column='id_resumen')
    id_dictaminador = models.ForeignKey(Dictaminador, models.CASCADE, db_column='id_dictaminador')
    retroalimentacion_general = models.TextField(null=True, blank=True)
    estatus = models.CharField(max_length=50)
    fecha_de_revision = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'dictamen_resumen'


class EvaluacionPregunta(models.Model):
    id_evaluacion_pregunta = models.AutoField(primary_key=True)
    id_dictamen = models.ForeignKey(DictamenResumen, models.CASCADE, db_column='id_dictamen')
    id_pregunta_id = models.IntegerField(db_column='id_pregunta')
    cumplio = models.BooleanField(null=True)
    comentario_especifico = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'evaluacion_pregunta'


class Evaluacion(models.Model):
    id_evaluacion = models.AutoField(primary_key=True)
    id_extenso = models.ForeignKey(Extenso, models.CASCADE, db_column='id_extenso')
    id_evaluador = models.ForeignKey(Evaluador, models.CASCADE, db_column='id_evaluador')
    retroalimentacion_general = models.TextField(null=True, blank=True)
    estatus = models.CharField(max_length=100)
    fecha_de_revision = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'evaluacion'


class EvaluacionCriterio(models.Model):
    id_evaluacion_criterio = models.AutoField(primary_key=True)
    id_evaluacion = models.ForeignKey(Evaluacion, models.CASCADE, db_column='id_evaluacion')
    id_criterio = models.ForeignKey(RubricaCriterio, models.CASCADE, db_column='id_criterio')
    puntaje = models.IntegerField(null=True)
    comentario_especifico = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'evaluacion_criterio'
```

- [ ] **Step 2: Verificar que Django no lanza errores**

```bash
cd /home/diego07/Documentos/CongressManager/backend
python manage.py check
```

Esperado: "System check identified no issues"

- [ ] **Step 3: Commit**

```bash
git add backend/ponencias/models.py
git commit -m "feat(ponencias): modelos managed=False para Resumen, Extenso, Evaluacion, DictamenResumen"
```

---

### Task 2: Migración para agregar `extenso.id_evaluador`

**Files:**
- Create: `backend/ponencias/migrations/0002_extenso_id_evaluador.py`

- [ ] **Step 1: Crear el archivo de migración**

```python
# backend/ponencias/migrations/0002_extenso_id_evaluador.py
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ponencias', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE extenso ADD COLUMN IF NOT EXISTS id_evaluador INTEGER REFERENCES evaluador(id_evaluador) ON DELETE SET NULL;",
            reverse_sql="ALTER TABLE extenso DROP COLUMN IF EXISTS id_evaluador;",
        ),
    ]
```

- [ ] **Step 2: Aplicar la migración**

```bash
python manage.py migrate ponencias
```

Esperado: "Applying ponencias.0002_extenso_id_evaluador... OK"

- [ ] **Step 3: Verificar que la columna existe en BD**

```bash
python manage.py dbshell <<'EOF'
\d extenso
EOF
```

Esperado: columna `id_evaluador` aparece en la lista

- [ ] **Step 4: Commit**

```bash
git add backend/ponencias/migrations/0002_extenso_id_evaluador.py
git commit -m "feat(ponencias): migración para agregar extenso.id_evaluador"
```

---

### Task 3: Endpoints de asignación y listas de disponibles

**Files:**
- Modify: `backend/ponencias/views.py`
- Modify: `backend/ponencias/urls.py`

- [ ] **Step 1: Agregar imports en `ponencias/views.py`**

Agregar al inicio del archivo (después de los imports existentes):

```python
from users.models import Dictaminador, Evaluador, DictaminadorCongreso, EvaluadorCongreso
from .models import Resumen, Extenso
```

- [ ] **Step 2: Agregar 4 nuevas views al final de `ponencias/views.py`**

```python
class DictaminadoresDisponiblesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        persona_ids = DictaminadorCongreso.objects.filter(
            id_congreso_id=id_congreso
        ).values_list('id_persona_id', flat=True)
        dictaminadores = Dictaminador.objects.filter(id_persona_id__in=persona_ids).select_related('id_persona')
        data = [{
            'id_dictaminador': d.id_dictaminador,
            'nombre_completo': ' '.join(x for x in [
                d.id_persona.nombre, d.id_persona.primer_apellido, d.id_persona.segundo_apellido
            ] if x).strip(),
        } for d in dictaminadores]
        return Response(data)


class EvaluadoresDisponiblesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        persona_ids = EvaluadorCongreso.objects.filter(
            id_congreso_id=id_congreso
        ).values_list('id_persona_id', flat=True)
        evaluadores = Evaluador.objects.filter(id_persona_id__in=persona_ids).select_related('id_persona')
        data = [{
            'id_evaluador': e.id_evaluador,
            'nombre_completo': ' '.join(x for x in [
                e.id_persona.nombre, e.id_persona.primer_apellido, e.id_persona.segundo_apellido
            ] if x).strip(),
        } for e in evaluadores]
        return Response(data)


class AsignarDictaminadorView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            resumen = Resumen.objects.get(pk=pk)
        except Resumen.DoesNotExist:
            return Response({'detail': 'Resumen no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        id_dictaminador = request.data.get('id_dictaminador')
        resumen.id_dictaminador_id = id_dictaminador  # None para desasignar
        resumen.save(update_fields=['id_dictaminador'])
        return Response({'id_resumen': resumen.pk, 'id_dictaminador': id_dictaminador})


class AsignarEvaluadorView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            extenso = Extenso.objects.get(pk=pk)
        except Extenso.DoesNotExist:
            return Response({'detail': 'Extenso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        id_evaluador = request.data.get('id_evaluador')
        extenso.id_evaluador_id = id_evaluador  # None para desasignar
        extenso.save(update_fields=['id_evaluador'])
        return Response({'id_extenso': extenso.pk, 'id_evaluador': id_evaluador})
```

- [ ] **Step 3: Registrar rutas en `ponencias/urls.py`**

Agregar los imports y paths al archivo:

```python
from .views import (
    PonenciaViewSet, registrar_ponencia, listar_catalogo_ponencias,
    EnviarPonenciaAPIView, MiAgendaView,
    DictaminadoresDisponiblesView, EvaluadoresDisponiblesView,
    AsignarDictaminadorView, AsignarEvaluadorView,
)

# Agregar a urlpatterns después de los existentes:
path('dictaminadores-disponibles/', DictaminadoresDisponiblesView.as_view(), name='dictaminadores-disponibles'),
path('evaluadores-disponibles/', EvaluadoresDisponiblesView.as_view(), name='evaluadores-disponibles'),
path('resumenes/<int:pk>/asignar/', AsignarDictaminadorView.as_view(), name='asignar-dictaminador'),
path('extensos/<int:pk>/asignar/', AsignarEvaluadorView.as_view(), name='asignar-evaluador'),
```

- [ ] **Step 4: Verificar que los endpoints responden**

```bash
python manage.py runserver &
sleep 2
# Obtener token de admin
TOKEN=$(python manage.py shell -c "
from users.models import Persona
from users.views import get_tokens_for_user
u = Persona.objects.filter(is_staff=True).first()
print(get_tokens_for_user(u)['access'])
")
curl -s "http://localhost:8000/api/ponencias/dictaminadores-disponibles/?id_congreso=1" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
kill %1
```

Esperado: respuesta JSON (lista vacía si no hay dictaminadores asignados al congreso 1)

- [ ] **Step 5: Commit**

```bash
git add backend/ponencias/views.py backend/ponencias/urls.py
git commit -m "feat(ponencias): endpoints asignación dictaminador/evaluador y listas disponibles"
```
