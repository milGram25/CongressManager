# ponencias/serializers_detalle.py
# Agrega estas clases a tu serializers.py existente (o importa desde aquí)

from rest_framework import serializers
from .models import (
    Resumen, DictamenResumen, EvaluacionPregunta, DictamenPregunta,
    Extenso, Evaluacion, EvaluacionCriterio, RubricaCriterio, RubricaGrupo,
    Ponencia, Ponente,
)
from django.contrib.auth import get_user_model

Persona = get_user_model()


# ──────────────────────────────────────────────
#  RESÚMENES
# ──────────────────────────────────────────────

class EvaluacionPreguntaDetalleSerializer(serializers.ModelSerializer):
    """Respuesta de una pregunta del dictamen para un resumen específico."""
    descripcion_pregunta = serializers.CharField(
        source='id_pregunta.descripcion', read_only=True
    )

    class Meta:
        model = EvaluacionPregunta
        fields = [
            'id_evaluacion_pregunta',
            'id_pregunta',
            'descripcion_pregunta',
            'cumplio',
            'comentario_especifico',
        ]


class DictamenResumenDetalleSerializer(serializers.ModelSerializer):
    """Dictamen completo de un resumen (preguntas + resultado)."""
    nombre_dictaminador = serializers.SerializerMethodField()
    preguntas            = EvaluacionPreguntaDetalleSerializer(
        source='evaluacion_pregunta_set', many=True, read_only=True
    )
    calificacion_final   = serializers.SerializerMethodField()

    class Meta:
        model = DictamenResumen
        fields = [
            'id_dictamen',
            'id_dictaminador',
            'nombre_dictaminador',
            'retroalimentacion_general',
            'estatus',
            'fecha_de_revision',
            'preguntas',
            'calificacion_final',
        ]

    def get_nombre_dictaminador(self, obj):
        p = obj.id_dictaminador.id_persona
        return f"{p.nombre} {p.primer_apellido} {p.segundo_apellido or ''}".strip()

    def get_calificacion_final(self, obj):
        preguntas = obj.evaluacion_pregunta_set.all()
        total     = preguntas.count()
        aprobadas = preguntas.filter(cumplio=True).count()
        return {'aprobadas': aprobadas, 'total': total}


class ResumenDetalleSerializer(serializers.ModelSerializer):
    """
    Detalle completo de un resumen:
    - datos base del resumen
    - nombre del dictaminador asignado
    - dictamen con preguntas y calificación final
    """
    nombre_dictaminador = serializers.SerializerMethodField()
    dictamen            = serializers.SerializerMethodField()
    # Datos de la ponencia a la que pertenece
    titulo_ponencia     = serializers.SerializerMethodField()
    autores             = serializers.SerializerMethodField()

    class Meta:
        model = Resumen
        fields = [
            'id_resumen',
            'titulo_ponencia',
            'autores',
            'fecha_entrega',
            'revisado',
            'estatus',
            'retroalimentacion',
            'id_dictaminador',
            'nombre_dictaminador',
            'dictamen',
        ]

    def get_nombre_dictaminador(self, obj):
        if not obj.id_dictaminador:
            return None
        p = obj.id_dictaminador.id_persona
        return f"{p.nombre} {p.primer_apellido} {p.segundo_apellido or ''}".strip()

    def get_dictamen(self, obj):
        dictamen = obj.dictamenresumen_set.first()
        if not dictamen:
            return None
        return DictamenResumenDetalleSerializer(dictamen).data

    def get_titulo_ponencia(self, obj):
        ponencia = obj.ponencia_set.first()
        if ponencia and ponencia.id_extenso:
            return ponencia.id_extenso.titulo
        return None

    def get_autores(self, obj):
        ponencia = obj.ponencia_set.first()
        if not ponencia:
            return []
        ponentes = Ponente.objects.filter(
            ponentehasponencia__id_ponencia=ponencia
        ).select_related('id_persona')
        return [
            f"{p.id_persona.nombre} {p.id_persona.primer_apellido}".strip()
            for p in ponentes
        ]


# ──────────────────────────────────────────────
#  EXTENSOS
# ──────────────────────────────────────────────

class EvaluacionCriterioDetalleSerializer(serializers.ModelSerializer):
    """Puntaje y comentario de un criterio dentro de una evaluación."""
    descripcion_criterio = serializers.CharField(
        source='id_criterio.descripcion', read_only=True
    )
    peso_criterio = serializers.FloatField(
        source='id_criterio.peso', read_only=True
    )

    class Meta:
        model = EvaluacionCriterio
        fields = [
            'id_evaluacion_criterio',
            'id_criterio',
            'descripcion_criterio',
            'peso_criterio',
            'puntaje',
            'comentario_especifico',
        ]


class GrupoCriteriosSerializer(serializers.ModelSerializer):
    """Grupo de rúbrica con sus criterios evaluados."""
    criterios = serializers.SerializerMethodField()

    class Meta:
        model = RubricaGrupo
        fields = ['id_grupo', 'nombre_grupo', 'criterios']

    def get_criterios(self, obj):
        # Se inyecta el queryset de evaluacion_criterios desde el contexto
        evaluacion_criterios = self.context.get('evaluacion_criterios', [])
        result = []
        for criterio in obj.rubricacriterio_set.all():
            # Buscar si este criterio fue evaluado
            ec = next(
                (e for e in evaluacion_criterios if e.id_criterio_id == criterio.id_criterio),
                None
            )
            result.append({
                'id_criterio':        criterio.id_criterio,
                'descripcion':        criterio.descripcion,
                'peso':               float(criterio.peso),
                'puntaje':            ec.puntaje if ec else None,
                'comentario_especifico': ec.comentario_especifico if ec else None,
            })
        return result


class EvaluacionDetalleSerializer(serializers.ModelSerializer):
    """Evaluación completa de un extenso (grupos + criterios + calificación)."""
    nombre_evaluador  = serializers.SerializerMethodField()
    grupos            = serializers.SerializerMethodField()
    calificacion_final = serializers.SerializerMethodField()

    class Meta:
        model = Evaluacion
        fields = [
            'id_evaluacion',
            'id_evaluador',
            'nombre_evaluador',
            'retroalimentacion_general',
            'estatus',
            'fecha_de_revision',
            'grupos',
            'calificacion_final',
        ]

    def get_nombre_evaluador(self, obj):
        p = obj.id_evaluador.id_persona
        return f"{p.nombre} {p.primer_apellido} {p.segundo_apellido or ''}".strip()

    def get_grupos(self, obj):
        criterios_eval = obj.evaluacioncriterio_set.all()
        # Obtener los grupos de la rúbrica a través de los criterios evaluados
        ids_criterios = criterios_eval.values_list('id_criterio_id', flat=True)
        grupos_ids = RubricaCriterio.objects.filter(
            id_criterio__in=ids_criterios
        ).values_list('id_grupo_id', flat=True).distinct()

        grupos = RubricaGrupo.objects.filter(id_grupo__in=grupos_ids)
        return GrupoCriteriosSerializer(
            grupos, many=True,
            context={'evaluacion_criterios': list(criterios_eval)}
        ).data

    def get_calificacion_final(self, obj):
        criterios = obj.evaluacioncriterio_set.all()
        total_peso    = sum(float(c.id_criterio.peso) for c in criterios)
        puntaje_total = sum(
            (c.puntaje or 0) * float(c.id_criterio.peso)
            for c in criterios
        )
        max_posible = total_peso * 5  # puntaje máx por criterio = 5
        return {
            'puntaje_obtenido': round(puntaje_total, 2),
            'puntaje_maximo':   round(max_posible, 2),
            'porcentaje':       round((puntaje_total / max_posible * 100), 1) if max_posible else 0,
        }


class ExtensoDetalleSerializer(serializers.ModelSerializer):
    """
    Detalle completo de un extenso:
    - metadatos (versión, fechas, ruta)
    - hasta 3 evaluadores con sus grupos/criterios y calificación
    - calificación final consolidada
    """
    evaluaciones       = serializers.SerializerMethodField()
    calificacion_final = serializers.SerializerMethodField()
    # Nombres de evaluadores asignados (aunque aún no hayan evaluado)
    nombre_evaluador_1 = serializers.SerializerMethodField()
    nombre_evaluador_2 = serializers.SerializerMethodField()
    nombre_evaluador_3 = serializers.SerializerMethodField()

    class Meta:
        model = Extenso
        fields = [
            'id_extenso',
            'titulo',
            'fecha_subida',
            'version_numero',
            'revisado',
            'ruta_relativa',
            'id_evaluador',
            'nombre_evaluador_1',
            'id_evaluador_2',
            'nombre_evaluador_2',
            'id_evaluador_3',
            'nombre_evaluador_3',
            'evaluaciones',
            'calificacion_final',
        ]

    def _nombre(self, evaluador_obj):
        if not evaluador_obj:
            return None
        p = evaluador_obj.id_persona
        return f"{p.nombre} {p.primer_apellido} {p.segundo_apellido or ''}".strip()

    def get_nombre_evaluador_1(self, obj):
        return self._nombre(obj.id_evaluador)

    def get_nombre_evaluador_2(self, obj):
        return self._nombre(obj.id_evaluador_2)

    def get_nombre_evaluador_3(self, obj):
        return self._nombre(obj.id_evaluador_3)

    def get_evaluaciones(self, obj):
        evals = obj.evaluacion_set.all().order_by('fecha_de_revision')
        return EvaluacionDetalleSerializer(evals, many=True).data

    def get_calificacion_final(self, obj):
        evals = obj.evaluacion_set.all()
        if not evals.exists():
            return None
        totales = []
        for ev in evals:
            criterios  = ev.evaluacioncriterio_set.all()
            total_peso = sum(float(c.id_criterio.peso) for c in criterios)
            puntaje    = sum((c.puntaje or 0) * float(c.id_criterio.peso) for c in criterios)
            max_pos    = total_peso * 5
            if max_pos:
                totales.append(puntaje / max_pos * 100)
        if not totales:
            return None
        promedio = round(sum(totales) / len(totales), 1)
        return {'promedio_porcentaje': promedio, 'num_evaluaciones': len(totales)}
