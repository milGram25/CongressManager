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
    ponente_principal = serializers.SerializerMethodField()
    coautores = serializers.SerializerMethodField()
    nombre_institucion = serializers.SerializerMethodField()
    nombre_tipo_trabajo = serializers.SerializerMethodField()
    id_tipo_trabajo = serializers.SerializerMethodField()
    tipo_ponencia = serializers.SerializerMethodField()

    def get_nombres_ponentes(self,obj):
        ponentes = obj.ponentehasponencia_set.all()
        return [f"{rel.id_ponente.id_persona.nombre} {rel.id_ponente.id_persona.primer_apellido}" for rel in ponentes]

    def get_ponente_principal(self, obj):
        rel = obj.ponentehasponencia_set.first()
        if rel and rel.id_ponente and rel.id_ponente.id_persona:
            p = rel.id_ponente.id_persona
            return f"{p.nombre} {p.primer_apellido} {p.segundo_apellido or ''}".strip()
        return ""

    def get_coautores(self, obj):
        rels = list(obj.ponentehasponencia_set.all())
        if len(rels) <= 1:
            return []
        return [
            f"{rel.id_ponente.id_persona.nombre} {rel.id_ponente.id_persona.primer_apellido} {rel.id_ponente.id_persona.segundo_apellido or ''}".strip()
            for rel in rels[1:]
        ]

    def get_nombre_institucion(self, obj):
        try:
            return obj.id_evento.id_congreso.id_institucion.nombre
        except Exception:
            return ""

    def get_nombre_tipo_trabajo(self, obj):
        try:
            return obj.id_evento.id_tipo_trabajo.tipo_trabajo
        except Exception:
            return ""

    def get_id_tipo_trabajo(self, obj):
        try:
            return obj.id_evento.id_tipo_trabajo_id
        except Exception:
            return None

    def get_tipo_ponencia(self, obj):
        return 'normal'

    class Meta:
        model = Ponencia
        fields = [
            'id', 'id_ponencia', 'id_evento', 'id_congreso', 'nombre_evento', 'nombre_congreso',
            'fecha_hora_inicio', 'fecha_hora_final', 'cupos',
            'tipo_participacion', 'id_subarea', 'nombre_subarea',
            'id_resumen', 'id_extenso', 'id_multimedia', 'enlace', 'sinopsis', 'id_mesas_trabajo','nombres_ponentes',
            'ponente_principal', 'coautores', 'nombre_institucion', 'nombre_tipo_trabajo', 'id_tipo_trabajo',
            'tipo_ponencia'
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


class PonenteMagistralSerializer(serializers.ModelSerializer):
    class Meta:
        model = PonenciaMagistralHasPonentemagistral
        fields = ['id_ponencia_magistral_has_ponente_magistral', 'nombre_persona', 'es_principal']


class PonenciaMagistralSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_ponencia_magistral', read_only=True)
    nombre_subarea = serializers.CharField(source='id_subarea.nombre', read_only=True)
    nombre_congreso = serializers.CharField(source='id_congreso.nombre_congreso', read_only=True)
    ponentes = PonenteMagistralSerializer(many=True, read_only=True)
    tipo_ponencia = serializers.SerializerMethodField()
    ponente_principal = serializers.SerializerMethodField()
    coautores = serializers.SerializerMethodField()
    nombre_institucion = serializers.SerializerMethodField()
    nombre_tipo_trabajo = serializers.SerializerMethodField()

    class Meta:
        model = PonenciaMagistral
        fields = [
            'id', 'id_ponencia_magistral', 'titulo', 'tipo_participacion',
            'id_subarea', 'nombre_subarea', 'fecha_inicio', 'fecha_fin',
            'id_congreso', 'nombre_congreso', 'id_multimedia', 'ponentes',
            'tipo_ponencia', 'ponente_principal', 'coautores',
            'nombre_institucion', 'nombre_tipo_trabajo'
        ]

    def get_tipo_ponencia(self, obj):
        return 'magistral'

    def get_ponente_principal(self, obj):
        p = obj.ponentes.filter(es_principal=True).first()
        return p.nombre_persona if p else ""

    def get_coautores(self, obj):
        return list(obj.ponentes.filter(es_principal=False).values_list('nombre_persona', flat=True))

    def get_nombre_institucion(self, obj):
        try:
            return obj.id_congreso.id_institucion.nombre
        except Exception:
            return ""

    def get_nombre_tipo_trabajo(self, obj):
        # Las magistrales no tienen tipo_trabajo directo; se puede intentar derivar del congreso
        return ""


class PonenciaMagistralCreateSerializer(serializers.Serializer):
    """Serializer para CREAR ponencias magistrales (sin evento)."""
    titulo = serializers.CharField(max_length=255, required=True)
    tipo_participacion = serializers.CharField(max_length=50, required=False, default='presencial')
    id_subarea = serializers.IntegerField(required=False, allow_null=True)
    id_congreso = serializers.IntegerField(required=True)
    fecha_inicio = serializers.CharField(required=False, allow_blank=True, allow_null=True, default=None)
    fecha_fin = serializers.CharField(required=False, allow_blank=True, allow_null=True, default=None)
    id_multimedia = serializers.IntegerField(required=False, allow_null=True)
    ponente_principal = serializers.CharField(max_length=100, required=False, allow_blank=True)
    coautores = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        allow_empty=True
    )

    def validate_fecha_inicio(self, value):
        if not value or str(value).strip() == '':
            return None
        return value

    def validate_fecha_fin(self, value):
        if not value or str(value).strip() == '':
            return None
        return value

    def validate_id_subarea(self, value):
        if not value or str(value).strip() == '':
            return None
        return value

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
                    
                    # 3. Insertar ponente principal
                    ponente_principal = validated_data.get('ponente_principal', '').strip()
                    if ponente_principal:
                        cursor.execute("""
                            INSERT INTO ponencia_magistral_has_ponente_magistral
                            (id_ponencia_magistral, nombre_persona, es_principal)
                            VALUES (%s, %s, TRUE)
                        """, [id_ponencia_magistral, ponente_principal])

                    # 4. Insertar coautores
                    coautores = validated_data.get('coautores', [])
                    for nombre_persona in coautores:
                        nombre_persona = nombre_persona.strip()
                        if nombre_persona:
                            cursor.execute("""
                                INSERT INTO ponencia_magistral_has_ponente_magistral
                                (id_ponencia_magistral, nombre_persona, es_principal)
                                VALUES (%s, %s, FALSE)
                            """, [id_ponencia_magistral, nombre_persona])
                
                # Retornar el objeto creado
                return PonenciaMagistral.objects.get(id_ponencia_magistral=id_ponencia_magistral)
        except Exception as e:
            raise serializers.ValidationError(f"Error al crear ponencia magistral: {str(e)}")