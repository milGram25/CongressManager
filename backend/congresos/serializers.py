from rest_framework import serializers
from .models import Congreso, Institucion, Sede, MesasTrabajo, Evento, FechasCongreso, CostosCongreso, Rubrica, RubricaCriterio, TipoTrabajo, Dictamen, DictamenPregunta

class InstitucionSerializer(serializers.ModelSerializer):
    congresos_totales = serializers.SerializerMethodField()
    congresos_activos = serializers.SerializerMethodField()

    class Meta:
        model = Institucion
        fields = ['id_institucion', 'nombre', 'ubicacion', 'pais', 'ruta_imagen', 'congresos_totales', 'congresos_activos']

    def get_congresos_totales(self, obj):
        return Congreso.objects.filter(id_institucion=obj).count()

    def get_congresos_activos(self, obj):
        # Un congreso es activo si la fecha final es mayor a la actual
        from django.utils import timezone
        return Congreso.objects.filter(
            id_institucion=obj,
            id_fechas_congreso__fecha_final_evento__gt=timezone.now()
        ).count()

class SedeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sede
        fields = '__all__'

class FechasCongresoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FechasCongreso
        fields = '__all__'

class RubricaCriterioSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricaCriterio
        fields = '__all__'

class RubricaSerializer(serializers.ModelSerializer):
    criterios = RubricaCriterioSerializer(many=True, read_only=True)

    class Meta:
        model = Rubrica
        fields = ['id_rubrica', 'id_congreso', 'nombre', 'criterios']

class TipoTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoTrabajo
        fields = ['id_tipo_trabajo', 'id_congreso', 'tipo_trabajo']

class DictamenPreguntaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DictamenPregunta
        fields = '__all__'

class DictamenSerializer(serializers.ModelSerializer):
    preguntas = DictamenPreguntaSerializer(many=True, read_only=True)

    class Meta:
        model = Dictamen
        fields = ['id_dictamen', 'tipo_trabajo', 'nombre', 'esta_activo', 'preguntas']

class CongresoSerializer(serializers.ModelSerializer):
    sede = serializers.CharField(source='id_sede.nombre_sede', read_only=True)
    nombre_institucion = serializers.CharField(source='id_institucion.nombre', read_only=True)
    fecha_hora_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_evento', read_only=True)
    fecha_hora_final = serializers.DateTimeField(source='id_fechas_congreso.fecha_final_evento', read_only=True)
    cantidad_eventos = serializers.SerializerMethodField()
    rubrica_default = RubricaSerializer(source='id_rubrica_default', read_only=True)

    class Meta:
        model = Congreso
        fields = [
            'id_congreso', 'nombre_congreso', 'sede', 'nombre_institucion', 
            'fecha_hora_inicio', 'fecha_hora_final', 'cantidad_eventos',
            'firma_organizador', 'firma_secretaria', 'firmas_bloqueadas',
            'id_rubrica_default', 'rubrica_default'
        ]

    def get_cantidad_eventos(self, obj):
        return obj.eventos.count()

class MesasTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MesasTrabajo
        fields = '__all__'

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'
