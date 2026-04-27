from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction, connection
from .models import AsistenteEvento, Ponencia
from .serializers import PonenciaSerializer, CatalogoEventoSerializer, AsistenteEventoSerializer
from users.models import Asistente
from congresos.models import Evento
from congresos.views import clean_date
class PonenciaViewSet(viewsets.ModelViewSet):
    serializer_class = PonenciaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ponencia.objects.all().select_related('id_evento', 'id_subarea', 'id_evento__id_congreso')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        data['id'] = instance.id_ponencia
        data['id_congreso'] = instance.id_evento.id_congreso_id
        data['id_subarea'] = instance.id_subarea_id
        return Response(data)


    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            with transaction.atomic():
                id_congreso = data.get('id_congreso')
                from congresos.models import TipoTrabajo
                tipo_str = data.get('tipo_evento', 'ponencia')
                
                with connection.cursor() as cursor:
                    # 1. Asegurar tipo_trabajo
                    cursor.execute("SELECT id_tipo_trabajo FROM tipo_trabajo WHERE id_congreso = %s AND tipo_trabajo ILIKE %s LIMIT 1", [id_congreso, tipo_str])
                    row = cursor.fetchone()
                    if row:
                        id_tipo_id = row[0]
                    else:
                        cursor.execute("INSERT INTO tipo_trabajo (tipo_trabajo, id_congreso) VALUES (%s, %s) RETURNING id_tipo_trabajo", [tipo_str.capitalize(), id_congreso])
                        id_tipo_id = cursor.fetchone()[0]

                    # 2. Insertar Evento
                    cursor.execute("""
                        INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id_evento
                    """, [
                        id_congreso, data.get('nombre_evento'), tipo_str, id_tipo_id,
                        clean_date(data.get('id_mesas_trabajo')),
                        clean_date(data.get('fecha_hora_inicio')), clean_date(data.get('fecha_hora_final')),
                        data.get('sinopsis', ''), int(data.get('cupos', 0)), data.get('enlace', '')
                    ])
                    id_evento = cursor.fetchone()[0]

                    # 3. Normalizar participación
                    tipo_p = str(data.get('tipo_participacion', 'presencial')).lower()
                    if 'híbrido' in tipo_p or 'hibrido' in tipo_p: tipo_p = 'hibrida'
                    
                    # 4. Insertar Ponencia
                    cursor.execute("""
                        INSERT INTO ponencia (id_evento, tipo_participacion, id_subarea, id_resumen, id_extenso, id_multimedia)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING id_ponencia
                    """, [
                        id_evento, tipo_p, clean_date(data.get('id_subarea')),
                        clean_date(data.get('id_resumen')), clean_date(data.get('id_extenso')), clean_date(data.get('id_multimedia'))
                    ])
                    id_ponencia = cursor.fetchone()[0]
                    
                    p = Ponencia.objects.get(id_ponencia=id_ponencia)
                    res_data = self.get_serializer(p).data
                    res_data['id'] = id_ponencia
                    return Response(res_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    # 1. Actualizar Evento
                    cursor.execute("""
                        UPDATE evento SET 
                            nombre_evento = %s, id_mesas_trabajo = %s, 
                            fecha_hora_inicio = %s, fecha_hora_final = %s, 
                            sinopsis = %s, cupos = %s, enlace = %s
                        WHERE id_evento = %s
                    """, [
                        data.get('nombre_evento', instance.id_evento.nombre_evento),
                        clean_date(data.get('id_mesas_trabajo'), instance.id_evento.id_mesas_trabajo_id),
                        clean_date(data.get('fecha_hora_inicio'), instance.id_evento.fecha_hora_inicio),
                        clean_date(data.get('fecha_hora_final'), instance.id_evento.fecha_hora_final),
                        data.get('sinopsis', instance.id_evento.sinopsis),
                        int(data.get('cupos', instance.id_evento.cupos)),
                        data.get('enlace', instance.id_evento.enlace),
                        instance.id_evento_id
                    ])

                    # 2. Normalizar participación
                    tipo_p = str(data.get('tipo_participacion', instance.tipo_participacion)).lower()
                    if 'híbrido' in tipo_p or 'hibrido' in tipo_p: tipo_p = 'hibrida'

                    # 3. Actualizar Ponencia
                    cursor.execute("""
                        UPDATE ponencia SET 
                            tipo_participacion = %s, id_subarea = %s
                        WHERE id_ponencia = %s
                    """, [
                        tipo_p, clean_date(data.get('id_subarea'), instance.id_subarea_id),
                        instance.id_ponencia
                    ])
                
                instance.refresh_from_db()
                res_data = self.get_serializer(instance).data
                res_data['id'] = instance.id_ponencia
                return Response(res_data)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            with transaction.atomic():
                ev_id = instance.id_evento_id
                with connection.cursor() as cursor:
                    cursor.execute("DELETE FROM ponencia WHERE id_ponencia = %s", [instance.id_ponencia])
                    cursor.execute("DELETE FROM evento WHERE id_evento = %s", [ev_id])
                return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def registrar_ponencia(request):
    try:
        user = request.user
        asistente = Asistente.objects.filter(id_persona=user).first()
        if not asistente:
            return Response({"error": "El usuario no es un asistente."}, status=status.HTTP_400_BAD_REQUEST)
        id_evento = request.data.get('id_evento')
        if not id_evento:
            return Response({"error": "id_evento es requerido."}, status=status.HTTP_400_BAD_REQUEST)
        if AsistenteEvento.objects.filter(id_asistente=asistente, id_evento_id=id_evento).exists():
            return Response({"error": "Ya estás registrado en esta ponencia."}, status=status.HTTP_400_BAD_REQUEST)
        asistente_evento = AsistenteEvento.objects.create(id_asistente=asistente, id_evento_id=id_evento)
        return Response({"message": "Registro exitoso", "id": asistente_evento.id_asistente_evento}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": f"Error interno del servidor: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_catalogo_ponencias(request):
    try:
        user = request.user
        asistente = Asistente.objects.filter(id_persona=user).first()
        eventos = Evento.objects.filter(tipo_evento='ponencia')
        serializer = CatalogoEventoSerializer(eventos, many=True)
        data = []
        for item in serializer.data:
            eid = item.get('id')
            if asistente and eid:
                item['registrado'] = AsistenteEvento.objects.filter(id_asistente=asistente, id_evento_id=eid).exists()
            else:
                item['registrado'] = False
            data.append(item)
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Error interno del servidor: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
