from rest_framework import serializers
from .models import AsistenteEvento, Ponencia
from congresos.models import Evento

class PonenciaSerializer(serializers.ModelSerializer):
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
        model = Ponencia
        fields = [
            'id_ponencia', 'id_evento', 'id_congreso', 'nombre_evento', 'nombre_congreso',
            'fecha_hora_inicio', 'fecha_hora_final', 'cupos',
            'tipo_participacion', 'id_subarea', 'nombre_subarea',
            'id_resumen', 'id_extenso', 'id_multimedia', 'enlace', 'sinopsis', 'id_mesas_trabajo'
        ]

class AsistenteEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsistenteEvento
        fields = ['id_asistente_evento', 'id_asistente', 'id_evento', 'fecha_inscripcion']

class CatalogoEventoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_evento', read_only=True)
    titulo = serializers.CharField(source='nombre_evento')
    ponente = serializers.SerializerMethodField()
    modalidad = serializers.SerializerMethodField()
    lugar = serializers.SerializerMethodField()
    fecha = serializers.SerializerMethodField()
    hora = serializers.SerializerMethodField()
    # sinopsis viene directo del modelo Evento

    class Meta:
        model = Evento
        fields = ['id', 'titulo', 'ponente', 'modalidad', 'lugar', 'fecha', 'hora', 'sinopsis']

    def get_ponente(self, obj):
        # Buscar el ponente relacionado a través de ponencia -> ponente_has_ponencia -> ponente -> persona
        ponencia = Ponencia.objects.filter(id_evento=obj).first()
        if ponencia:
            rel = ponencia.ponentehasponencia_set.first()
            if rel and rel.id_ponente and rel.id_ponente.id_persona:
                persona = rel.id_ponente.id_persona
                return f"{persona.nombre} {persona.primer_apellido} {persona.segundo_apellido or ''}".strip()
        return "Por confirmar"

    def get_modalidad(self, obj):
        ponencia = Ponencia.objects.filter(id_evento=obj).first()
        if ponencia:
            return ponencia.tipo_participacion
        return "Presencial" # default

    def get_lugar(self, obj):
        if obj.id_mesas_trabajo and obj.id_mesas_trabajo.id_sede:
            return obj.id_mesas_trabajo.id_sede.nombre_sede
        return "Por confirmar"

    def get_fecha(self, obj):
        if obj.fecha_hora_inicio:
            # Formato: 30 - Abril - 2026
            meses = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
            dia = obj.fecha_hora_inicio.day
            mes = meses[obj.fecha_hora_inicio.month]
            anio = obj.fecha_hora_inicio.year
            return f"{dia} - {mes} - {anio}"
        return ""

    def get_hora(self, obj):
        if obj.fecha_hora_inicio:
            return obj.fecha_hora_inicio.strftime('%I:%M %p').lower()
        return ""
