from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import AsistenteEvento
from users.models import Asistente

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
        # Filtrar solo eventos de tipo ponencia (o los que estén disponibles)
        eventos = Evento.objects.filter(tipo_evento='ponencia')
        serializer = CatalogoEventoSerializer(eventos, many=True)
        # Añadir un "id" al root de cada objeto para que React lo tome fácilmente
        data = []
        for item in serializer.data:
            item['id'] = item.pop('id_evento', item.get('id', None))
            if item['id'] is None and hasattr(eventos.filter(nombre_evento=item['titulo']).first(), 'id_evento'):
                item['id'] = eventos.filter(nombre_evento=item['titulo']).first().id_evento
            data.append(item)
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Error interno del servidor: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
