from rest_framework import serializers
from .models import Congreso, Institucion, Sede, MesasTrabajo, Evento, FechasCongreso, CostosCongreso, Rubrica, RubricaCriterio, TipoTrabajo, Dictamen, DictamenPregunta, AreaGeneral, Subarea, Taller

class InstitucionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institucion
        fields = '__all__'

class SedeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sede
        fields = '__all__'

class SubareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subarea
        fields = '__all__'

class RubricaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rubrica
        fields = '__all__'

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
    envio_ponencias_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_envio_resumen', read_only=True)
    envio_ponencias_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_final_envio_resumen', read_only=True)
    inscripcion_dictaminadores_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_registro_dictaminadores', read_only=True)
    inscripcion_dictaminadores_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_final_registro_dictaminadores', read_only=True)
    revision_resumenes_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_revision_resumen', read_only=True)
    revision_resumenes_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_final_revision_resumen', read_only=True)
    envio_extensos_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_subir_extenso', read_only=True)
    envio_extensos_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_final_subir_extenso', read_only=True)
    inscripcion_evaluadores_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_registro_evaluadores', read_only=True)
    inscripcion_evaluadores_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_final_registro_evaluadores', read_only=True)
    revision_extensos_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_revision_extensos', read_only=True)
    revision_extensos_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_final_revision_extensos', read_only=True)
    subir_multimedia_inicio = serializers.DateTimeField(source='id_fechas_congreso.fecha_inicio_subir_multimedia', read_only=True)
    subir_multimedia_fin = serializers.DateTimeField(source='id_fechas_congreso.fecha_final_subir_multimedia', read_only=True)

    # Mapear campos de COSTOS (Asegurando coincidencia con DB física)
    costo_asistente = serializers.DecimalField(source='id_costos_congreso.costo_congreso_asistente', max_digits=10, decimal_places=2, read_only=True)
    costo_ponente = serializers.DecimalField(source='id_costos_congreso.costo_congreso_ponente', max_digits=10, decimal_places=2, read_only=True)
    costo_miembro_comite = serializers.DecimalField(source='id_costos_congreso.costo_congreso_comite', max_digits=10, decimal_places=2, read_only=True)
    cuenta_deposito = serializers.CharField(source='id_costos_congreso.cuenta_deposito', read_only=True)
    descuento_prepago = serializers.IntegerField(source='id_costos_congreso.descuento_prepago', read_only=True)
    descuento_estudiante = serializers.IntegerField(source='id_costos_congreso.descuento_estudiante', read_only=True)

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

    class Meta:
        model = Taller
        fields = [
            'id_taller', 'tallerista', 'id_evento', 'id_congreso', 'nombre_evento', 
            'nombre_congreso', 'fecha_hora_inicio', 'fecha_hora_final', 
            'cupos', 'tipo_participacion', 'id_subarea', 'nombre_subarea', 
            'id_multimedia', 'enlace', 'sinopsis', 'id_mesas_trabajo'
        ]

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'
