from rest_framework import serializers
from .models import AsistenteEvento, Ponencia, PonenciaMagistral, PonenciaMagistralHasPonentemagistral
from congresos.models import Evento

class PonenciaSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_ponencia', read_only=True)
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
    nombres_ponentes = serializers.SerializerMethodField() #retorna a todos los ponentes de esa misma ponencia

    def get_nombres_ponentes(self,obj):
        ponentes = obj.ponentehasponencia_set.all()
        return [f"{rel.id_ponente.id_persona.nombre} {rel.id_ponente.id_persona.primer_apellido}" for rel in ponentes]
        

    class Meta:
        model = Ponencia
        fields = [
            'id', 'id_ponencia', 'id_evento', 'id_congreso', 'nombre_evento', 'nombre_congreso',
            'fecha_hora_inicio', 'fecha_hora_final', 'cupos',
            'tipo_participacion', 'id_subarea', 'nombre_subarea',
            'id_resumen', 'id_extenso', 'id_multimedia', 'enlace', 'sinopsis', 'id_mesas_trabajo','nombres_ponentes'
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


class PonentemagistralSerializer(serializers.ModelSerializer):
    class Meta:
        model = PonenciaMagistralHasPonentemagistral
        fields = ['id_ponencia_magistral_has_ponente_magistral', 'nombre_persona']


class PonenciaMagistralSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_ponencia_magistral', read_only=True)
    nombre_subarea = serializers.CharField(source='id_subarea.nombre', read_only=True)
    nombre_congreso = serializers.CharField(source='id_congreso.nombre_congreso', read_only=True)
    ponentes = PonentemagistralSerializer(many=True, read_only=True)
    tipo_ponencia = serializers.SerializerMethodField()
    
    

    class Meta:
        model = PonenciaMagistral
        fields = [
            'id', 'id_ponencia_magistral', 'titulo', 'tipo_participacion',
            'id_subarea', 'nombre_subarea', 'fecha_inicio', 'fecha_fin',
            'id_congreso', 'nombre_congreso', 'id_multimedia', 'ponentes',
            'tipo_ponencia'
        ]

    def get_tipo_ponencia(self, obj):
        return 'magistral'


class PonenciaMagistralCreateSerializer(serializers.Serializer):
    """Serializer para CREAR ponencias magistrales (sin evento)."""
    titulo = serializers.CharField(max_length=255, required=True)
    tipo_participacion = serializers.CharField(max_length=50, required=True)
    id_subarea = serializers.IntegerField(required=True)
    id_congreso = serializers.IntegerField(required=True)
    fecha_inicio = serializers.DateTimeField(required=False, allow_null=True)
    fecha_fin = serializers.DateTimeField(required=False, allow_null=True)
    id_multimedia = serializers.IntegerField(required=False, allow_null=True)
    ponentes = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True
    )

    def create(self, validated_data):
        """Crea ponencia magistral SOLO en ponencia_magistral y ponencia_magistral_has_ponente_magistral."""
        from django.db import transaction, connection
        
        try:
            with transaction.atomic():
                # 1. Normalizar tipo_participacion
                tipo_p = str(validated_data.get('tipo_participacion', 'presencial')).lower()
                if 'híbrido' in tipo_p or 'hibrido' in tipo_p:
                    tipo_p = 'hibrida'
                
                # 2. Insertar en ponencia_magistral (SIN evento)
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO ponencia_magistral 
                        (titulo, tipo_participacion, id_subarea, id_congreso, fecha_inicio, fecha_fin, id_multimedia)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING id_ponencia_magistral
                    """, [
                        validated_data['titulo'],
                        tipo_p,
                        validated_data['id_subarea'],
                        validated_data['id_congreso'],
                        validated_data.get('fecha_inicio'),
                        validated_data.get('fecha_fin'),
                        validated_data.get('id_multimedia')
                    ])
                    id_ponencia_magistral = cursor.fetchone()[0]
                    
                    # 3. Insertar ponentes en ponencia_magistral_has_ponente_magistral
                    ponentes = validated_data.get('ponentes', [])
                    for nombre_persona in ponentes:
                        cursor.execute("""
                            INSERT INTO ponencia_magistral_has_ponente_magistral
                            (id_ponencia_magistral, nombre_persona)
                            VALUES (%s, %s)
                        """, [id_ponencia_magistral, nombre_persona])
                
                # Retornar el objeto creado
                return PonenciaMagistral.objects.get(id_ponencia_magistral=id_ponencia_magistral)
        except Exception as e:
            raise serializers.ValidationError(f"Error al crear ponencia magistral: {str(e)}")