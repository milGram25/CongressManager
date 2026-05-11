from rest_framework import serializers
from django.db import connection, transaction
from .models import Ponencia, AsistenteEvento, PonenciaMagistral, Resumen, Extenso
from congresos.models import Evento, Subareas, Congreso

class PonenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ponencia
        fields = '__all__'

class CatalogoEventoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_evento')
    class Meta:
        model = Evento
        fields = ['id', 'nombre_evento', 'tipo_evento', 'fecha_hora_inicio', 'fecha_hora_final', 'sinopsis', 'cupos', 'enlace']

class AsistenteEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsistenteEvento
        fields = '__all__'

class PonenciaMagistralSerializer(serializers.ModelSerializer):
    nombre_subarea = serializers.CharField(source='id_subarea.nombre', read_only=True)
    nombre_congreso = serializers.CharField(source='id_congreso.nombre_congreso', read_only=True)
    ponentes = serializers.SerializerMethodField()

    class Meta:
        model = PonenciaMagistral
        fields = '__all__'

    def get_ponentes(self, obj):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id_ponencia_magistral_has_ponente_magistral, nombre_persona
                FROM ponencia_magistral_has_ponente_magistral
                WHERE id_ponencia_magistral = %s
            """, [obj.id_ponencia_magistral])
            rows = cursor.fetchall()
            return [
                {
                    "id_persona": r[0],
                    "nombre_completo": (r[1] or '').strip()
                } for r in rows
            ]

class PonenciaMagistralCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PonenciaMagistral
        fields = '__all__'

    def create(self, validated_data):
        id_congreso = validated_data.get('id_congreso').id_congreso
        id_subarea = validated_data.get('id_subarea').id_subareas
        titulo = validated_data.get('titulo')
        resumen = validated_data.get('resumen')
        fecha = validated_data.get('fecha')
        hora = validated_data.get('hora')
        
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO ponencia_magistral (titulo, resumen, fecha, hora, id_congreso, id_subarea)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id_ponencia_magistral
                """, [titulo, resumen, fecha, hora, id_congreso, id_subarea])
                id_magistral = cursor.fetchone()[0]

                ponentes_data = self.initial_data.get('ponentes', [])
                for p_data in ponentes_data:
                    id_persona = p_data.get('id_persona')
                    if id_persona:
                        cursor.execute("SELECT id_ponente FROM ponente WHERE id_persona = %s", [id_persona])
                        row = cursor.fetchone()
                        if row:
                            id_ponente = row[0]
                        else:
                            cursor.execute("INSERT INTO ponente (id_persona) VALUES (%s) RETURNING id_ponente", [id_persona])
                            id_ponente = cursor.fetchone()[0]

                        cursor.execute("""
                            INSERT INTO ponente_has_ponencia_magistral (id_ponente, id_ponencia_magistral)
                            VALUES (%s, %s)
                        """, [id_ponente, id_magistral])
                
                return PonenciaMagistral.objects.get(id_ponencia_magistral=id_magistral)

    def update(self, instance, validated_data):
        id_ponencia_magistral = instance.id_ponencia_magistral
        id_congreso = validated_data.get('id_congreso', instance.id_congreso).id_congreso
        id_subarea = validated_data.get('id_subarea', instance.id_subarea).id_subareas
        titulo = validated_data.get('titulo', instance.titulo)
        resumen = validated_data.get('resumen', instance.resumen)
        fecha = validated_data.get('fecha', instance.fecha)
        hora = validated_data.get('hora', instance.hora)

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE ponencia_magistral 
                    SET titulo = %s, resumen = %s, fecha = %s, hora = %s, 
                        id_congreso = %s, id_subarea = %s
                    WHERE id_ponencia_magistral = %s
                """, [titulo, resumen, fecha, hora, id_congreso, id_subarea, id_ponencia_magistral])

                cursor.execute("DELETE FROM ponente_has_ponencia_magistral WHERE id_ponencia_magistral = %s", [id_ponencia_magistral])
                
                ponentes_data = self.initial_data.get('ponentes', [])
                for p_data in ponentes_data:
                    id_persona = p_data.get('id_persona')
                    if id_persona:
                        cursor.execute("SELECT id_ponente FROM ponente WHERE id_persona = %s", [id_persona])
                        row = cursor.fetchone()
                        if row:
                            id_ponente = row[0]
                        else:
                            cursor.execute("INSERT INTO ponente (id_persona) VALUES (%s) RETURNING id_ponente", [id_persona])
                            id_ponente = cursor.fetchone()[0]

                        cursor.execute("""
                            INSERT INTO ponente_has_ponencia_magistral (id_ponente, id_ponencia_magistral)
                            VALUES (%s, %s)
                        """, [id_ponente, id_ponencia_magistral])

        instance.refresh_from_db()
        return instance