from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from .models import AsistenteEvento, Ponencia
from .serializers import PonenciaSerializer, CatalogoEventoSerializer, AsistenteEventoSerializer
from users.models import Asistente
from congresos.models import Evento

class PonenciaViewSet(viewsets.ModelViewSet):
    queryset = Ponencia.objects.all()
    serializer_class = PonenciaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Ponencia.objects.all()
        id_congreso = self.request.query_params.get('id_congreso')
        # Si hay una acción de detalle (retrieve), no filtramos por congreso para no romper la búsqueda por ID
        if self.action == 'list' and id_congreso:
            queryset = queryset.filter(id_evento__id_congreso_id=id_congreso)
        return queryset

    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            with transaction.atomic():
                # Obtener id_tipo_trabajo para ponencia (usamos id 1 como fallback si no hay uno específico)
                from congresos.models import TipoTrabajo
                tipo_trabajo = TipoTrabajo.objects.filter(tipo_trabajo__icontains='ponencia').first()
                id_tipo_id = tipo_trabajo.id_tipo_trabajo if tipo_trabajo else 1

                # 1. Crear Evento
                evento = Evento.objects.create(
                    id_congreso_id=data.get('id_congreso'),
                    nombre_evento=data.get('nombre_evento'),
                    tipo_evento=data.get('tipo_evento', 'ponencia'), # ponencia o ponencia magistral
                    id_tipo_trabajo_id=id_tipo_id,
                    id_mesas_trabajo_id=data.get('id_mesas_trabajo'),
                    fecha_hora_inicio=data.get('fecha_hora_inicio'),
                    fecha_hora_final=data.get('fecha_hora_final'),
                    sinopsis=data.get('sinopsis'),
                    cupos=data.get('cupos', 0),
                    enlace=data.get('enlace')
                )
                
                # 2. Crear Ponencia
                tipo_p = data.get('tipo_participacion', 'presencial').lower()
                if 'híbrido' in tipo_p or 'hibrido' in tipo_p:
                    tipo_p = 'hibrida'

                ponencia = Ponencia.objects.create(
                    id_evento=evento,
                    tipo_participacion=tipo_p,
                    id_subarea_id=data.get('id_subarea'),
                    id_resumen=data.get('id_resumen'),
                    id_extenso=data.get('id_extenso'),
                    id_multimedia=data.get('id_multimedia')
                )
                
                return Response(self.get_serializer(ponencia).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def registrar_ponencia(request):
    try:
        user = request.user
        
        # Obtener el asistente asociado al usuario
        asistente = Asistente.objects.filter(id_persona=user).first()
        if not asistente:
            return Response({"error": "El usuario no es un asistente. Revisa que tu usuario tenga el rol de asistente en la BD."}, status=status.HTTP_400_BAD_REQUEST)
            
        id_evento = request.data.get('id_evento')
        if not id_evento:
            return Response({"error": "id_evento es requerido."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Verificar si ya está registrado
        if AsistenteEvento.objects.filter(id_asistente=asistente, id_evento_id=id_evento).exists():
            return Response({"error": "Ya estás registrado en esta ponencia."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Crear registro
        asistente_evento = AsistenteEvento.objects.create(
            id_asistente=asistente,
            id_evento_id=id_evento
        )
        
        return Response({"message": "Registro exitoso", "id": asistente_evento.id_asistente_evento}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": f"Error interno del servidor: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_catalogo_ponencias(request):
    try:
        from congresos.models import Evento
        from .serializers import CatalogoEventoSerializer
        from users.models import Asistente
        from .models import AsistenteEvento

        user = request.user
        asistente = Asistente.objects.filter(id_persona=user).first()

        # Filtrar solo eventos de tipo ponencia (o los que estén disponibles)
        eventos = Evento.objects.filter(tipo_evento='ponencia')
        serializer = CatalogoEventoSerializer(eventos, many=True)
        # Añadir un "id" al root de cada objeto para que React lo tome fácilmente
        data = []
        for item in serializer.data:
            item['id'] = item.pop('id_evento', item.get('id', None))
            if item['id'] is None and hasattr(eventos.filter(nombre_evento=item['titulo']).first(), 'id_evento'):
                item['id'] = eventos.filter(nombre_evento=item['titulo']).first().id_evento
            
            if asistente and item['id'] is not None:
                item['registrado'] = AsistenteEvento.objects.filter(id_asistente=asistente, id_evento_id=item['id']).exists()
            else:
                item['registrado'] = False

            data.append(item)
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Error interno del servidor: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
