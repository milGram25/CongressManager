from rest_framework import serializers
from django.utils import timezone
from .models import Congreso, Institucion, Sede, MesasTrabajo, Evento, FechasCongreso, CostosCongreso, Rubrica, RubricaGrupo, RubricaCriterio, TipoTrabajo, Dictamen, DictamenPregunta, AreaGeneral, Subarea, Taller

class InstitucionSerializer(serializers.ModelSerializer):
    congresos_totales = serializers.SerializerMethodField()
    congresos_activos = serializers.SerializerMethodField()

    class Meta:
        model = Institucion
        fields = '__all__'

    def get_congresos_totales(self, obj):
        return Congreso.objects.filter(id_institucion=obj).count()

    def get_congresos_activos(self, obj):
        now = timezone.now()
        return Congreso.objects.filter(
            id_institucion=obj,
            id_fechas_congreso__fecha_inicio_evento__lte=now,
            id_fechas_congreso__fecha_final_evento__gte=now
        ).count()

class SedeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sede
        fields = '__all__'

class SubareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subarea
        fields = '__all__'

class RubricaCriterioSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricaCriterio
        fields = ['id_criterio', 'id_grupo', 'descripcion', 'peso']

class RubricaGrupoSerializer(serializers.ModelSerializer):
    criterios = RubricaCriterioSerializer(many=True, read_only=True)

    class Meta:
        model = RubricaGrupo
        fields = ['id_grupo', 'id_rubrica', 'nombre_grupo', 'criterios']

class RubricaSerializer(serializers.ModelSerializer):
    grupos = RubricaGrupoSerializer(many=True, read_only=True)

    class Meta:
        model = Rubrica
        fields = ['id_rubrica', 'id_congreso', 'tipo_trabajo', 'nombre', 'esta_activo', 'fecha_creacion', 'grupos']

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
    # Campos base de congreso
    id_institucion_id = serializers.IntegerField(source='id_institucion.id_institucion', read_only=True)
    nombre_institucion = serializers.CharField(source='id_institucion.nombre', read_only=True)
    
    # Mapear campos de SEDE
    nombre_sede = serializers.CharField(source='id_sede.nombre_sede', read_only=True)
    pais = serializers.CharField(source='id_sede.pais', read_only=True)
    estado = serializers.CharField(source='id_sede.estado', read_only=True)
    ciudad = serializers.CharField(source='id_sede.ciudad', read_only=True)
    calle = serializers.CharField(source='id_sede.calle', read_only=True)
    numero_exterior = serializers.IntegerField(source='id_sede.num_exterior', read_only=True)
    numero_interior = serializers.IntegerField(source='id_sede.num_interior', read_only=True)
    modulo_fisico = serializers.CharField(source='id_sede.modulo_fisico', read_only=True)

    # Mapear campos de FECHAS
    congreso_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_evento', read_only=True)
    congreso_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_final_evento', read_only=True)
    envio_ponencias_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_subida_ponencias', read_only=True)
    envio_ponencias_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_fin_subida_ponencias', read_only=True)
    inscripcion_dictaminadores_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_inscribir_dictaminador', read_only=True)
    inscripcion_dictaminadores_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_fin_inscribir_dictaminador', read_only=True)
    revision_resumenes_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_evaluar_resumenes', read_only=True)
    revision_resumenes_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_final_evaluar_resumenes', read_only=True)
    envio_extensos_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_subir_extenso_final', read_only=True)
    envio_extensos_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_fin_subir_extenso_final', read_only=True)
    inscripcion_evaluadores_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_inscribir_evaluador', read_only=True)
    inscripcion_evaluadores_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_fin_inscribir_evaluador', read_only=True)
    revision_extensos_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_evaluar_extensos', read_only=True)
    revision_extensos_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_fin_evaluar_extensos', read_only=True)
    subir_multimedia_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_subir_multimedia', read_only=True)
    subir_multimedia_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_fin_subir_multimedia', read_only=True)

    # Mapear campos de COSTOS (Asegurando coincidencia con DB física)
    costo_asistente = serializers.DecimalField(source='id_costos_congreso.costo_congreso_asistente', max_digits=10, decimal_places=2, read_only=True)
    costo_ponente = serializers.DecimalField(source='id_costos_congreso.costo_congreso_ponente', max_digits=10, decimal_places=2, read_only=True)
    costo_miembro_comite = serializers.DecimalField(source='id_costos_congreso.costo_congreso_comite', max_digits=10, decimal_places=2, read_only=True)
    cuenta_deposito = serializers.CharField(source='id_costos_congreso.cuenta_deposito', read_only=True)
    descuento_prepago = serializers.FloatField(source='id_costos_congreso.descuento_prepago', read_only=True)
    descuento_estudiante = serializers.FloatField(source='id_costos_congreso.descuento_estudiante', read_only=True)

    cantidad_eventos = serializers.SerializerMethodField()

    class Meta:
        model = Congreso
        fields = '__all__'

    def get_cantidad_eventos(self, obj):
        return obj.eventos.count() if hasattr(obj, 'eventos') else 0

class MesasTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MesasTrabajo
        fields = '__all__'

class TallerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_taller', read_only=True)
    id_congreso = serializers.IntegerField(source='id_evento.id_congreso.id_congreso', read_only=True)
    nombre_evento = serializers.CharField(source='id_evento.nombre_evento', read_only=True)
    nombre_congreso = serializers.CharField(source='id_evento.id_congreso.nombre_congreso', read_only=True)
    fecha_hora_inicio = serializers.DateTimeField(source='id_evento.fecha_hora_inicio', read_only=True)
    fecha_hora_final = serializers.DateTimeField(source='id_evento.fecha_hora_final', read_only=True)
    cupos = serializers.IntegerField(source='id_evento.cupos', read_only=True)
    enlace = serializers.CharField(source='id_evento.enlace', read_only=True)
    sinopsis = serializers.CharField(source='id_evento.sinopsis', read_only=True)
    id_mesas_trabajo = serializers.IntegerField(source='id_evento.id_mesas_trabajo.id_mesas_trabajo', read_only=True)
    nombre_subarea = serializers.CharField(source='id_subarea.nombre', read_only=True)
    lugar = serializers.SerializerMethodField()

    class Meta:
        model = Taller
        fields = [
            'id', 'id_taller', 'tallerista', 'id_evento', 'id_congreso', 'nombre_evento', 
            'nombre_congreso', 'fecha_hora_inicio', 'fecha_hora_final', 
            'cupos', 'tipo_participacion', 'id_subarea', 'nombre_subarea', 
            'id_multimedia', 'enlace', 'sinopsis', 'id_mesas_trabajo', 'lugar'
        ]

    def get_lugar(self, obj):
        if obj.id_evento and obj.id_evento.id_mesas_trabajo and obj.id_evento.id_mesas_trabajo.id_sede:
            return obj.id_evento.id_mesas_trabajo.id_sede.nombre_sede
        return "Por confirmar"

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'
