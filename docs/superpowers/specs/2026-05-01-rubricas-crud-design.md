# Diseño: Subsistema C — CRUD de Rúbricas y Preguntas

## Resumen

La vista `/admin/eventos/congresos/tipos-trabajo/:id` permite gestionar las rúbricas de revisión y las preguntas de dictaminación asociadas a cada tipo de trabajo. El modelo Django `RubricaCriterio` es incorrecto respecto a la BD real (usa `id_rubrica` y `puntaje_maximo` en lugar de `id_grupo` y `peso`). Este subsistema corrige el modelo, agrega `RubricaGrupo`, y completa el CRUD tanto en backend como en frontend.

---

## Arquitectura

### Esquema real (BD)

```
rubrica (id_rubrica, nombre_rubrica, ...)
  └── rubrica_grupo (id_grupo, id_rubrica, nombre_grupo)
        └── rubrica_criterio (id_criterio, id_grupo, nombre_criterio, peso)

dictamen (id_dictamen, id_tipo_trabajo, nombre_dictamen)
  └── dictamen_pregunta (id_pregunta, id_dictamen, pregunta, tipo_respuesta)
```

### Backend — modelos (`congresos/models.py`)

Agregar modelo `RubricaGrupo` (managed=False):
```python
class RubricaGrupo(models.Model):
    id_grupo = models.AutoField(primary_key=True)
    id_rubrica = models.ForeignKey(Rubrica, on_delete=models.CASCADE, db_column='id_rubrica')
    nombre_grupo = models.CharField(max_length=255)
    class Meta:
        managed = False
        db_table = 'rubrica_grupo'
```

Corregir `RubricaCriterio` (managed=False):
```python
class RubricaCriterio(models.Model):
    id_criterio = models.AutoField(primary_key=True)
    id_grupo = models.ForeignKey(RubricaGrupo, on_delete=models.CASCADE, db_column='id_grupo')
    nombre_criterio = models.CharField(max_length=255)
    peso = models.DecimalField(max_digits=5, decimal_places=2)
    class Meta:
        managed = False
        db_table = 'rubrica_criterio'
```

### Backend — serializers (`congresos/serializers.py`)

```python
class RubricaCriterioSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricaCriterio
        fields = ['id_criterio', 'nombre_criterio', 'peso']

class RubricaGrupoSerializer(serializers.ModelSerializer):
    criterios = RubricaCriterioSerializer(many=True, read_only=True, source='rubricacriterio_set')
    class Meta:
        model = RubricaGrupo
        fields = ['id_grupo', 'nombre_grupo', 'criterios']

class RubricaSerializer(serializers.ModelSerializer):
    grupos = RubricaGrupoSerializer(many=True, read_only=True, source='rubricagrupo_set')
    class Meta:
        model = Rubrica
        fields = ['id_rubrica', 'nombre_rubrica', 'grupos']
```

### Backend — endpoints

| Método | URL | Acción |
|---|---|---|
| GET | `/api/congresos/rubricas/?id_tipo_trabajo=N` | Lista rúbricas del tipo de trabajo |
| POST | `/api/congresos/rubricas/` | Crear rúbrica |
| PUT/DELETE | `/api/congresos/rubricas/{id}/` | Editar/eliminar rúbrica |
| GET | `/api/congresos/rubrica-grupos/?id_rubrica=N` | Lista grupos de una rúbrica |
| POST | `/api/congresos/rubrica-grupos/` | Crear grupo |
| PUT/DELETE | `/api/congresos/rubrica-grupos/{id}/` | Editar/eliminar grupo |
| GET | `/api/congresos/rubrica-criterios/?id_grupo=N` | Lista criterios de un grupo |
| POST | `/api/congresos/rubrica-criterios/` | Crear criterio |
| PUT/DELETE | `/api/congresos/rubrica-criterios/{id}/` | Editar/eliminar criterio |
| GET | `/api/congresos/dictamenes/?id_tipo_trabajo=N` | Lista dictámenes |
| POST | `/api/congresos/dictamenes/` | Crear dictamen |
| PUT/DELETE | `/api/congresos/dictamenes/{id}/` | Editar/eliminar dictamen |
| GET | `/api/congresos/dictamen-preguntas/?id_dictamen=N` | Lista preguntas |
| POST | `/api/congresos/dictamen-preguntas/` | Crear pregunta |
| PUT/DELETE | `/api/congresos/dictamen-preguntas/{id}/` | Editar/eliminar pregunta |

Todos requieren `IsAuthenticated + is_staff`.

### Frontend — `RubricasYPreguntas.jsx`

Estructura visual:
```
[Rúbricas]                          [Preguntas de dictaminación]
  + Nueva rúbrica                     + Nuevo dictamen
  ─────────────                       ─────────────
  📋 Rúbrica 1  [✏️] [🗑️]            📋 Dictamen 1  [✏️] [🗑️]
    + Nuevo grupo                       + Nueva pregunta
    📁 Grupo A  [✏️] [🗑️]               ❓ ¿Pregunta?  [✏️] [🗑️]
      + Nuevo criterio
      • Criterio 1 (peso: 30%)  [✏️] [🗑️]
```

- Edición inline (campo de texto reemplaza el label, guardar con Enter o blur)
- Confirmación antes de eliminar grupo o criterio
- `peso` mostrado como porcentaje, validado entre 0-100

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/congresos/models.py` | Agregar `RubricaGrupo`, corregir `RubricaCriterio` |
| `backend/congresos/serializers.py` | Agregar `RubricaGrupoSerializer`, actualizar `RubricaSerializer` |
| `backend/congresos/views.py` | Agregar `RubricaGrupoViewSet`, `RubricaCriterioViewSet` |
| `backend/congresos/urls.py` | Registrar nuevas rutas |
| `frontend/src/views/admin/Componentes/RubricasYPreguntas.jsx` | CRUD completo |
| `frontend/src/api/congresosApi.js` | Agregar funciones para grupos, criterios |

---

## Manejo de errores

| Caso | Comportamiento |
|---|---|
| Eliminar grupo con criterios | Backend 400 o cascade delete (depende de DB constraint) |
| `peso` fuera de rango | Validación frontend antes de enviar |
| Error de red | Toast de error, operación revertida |
