from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from users.models import Dictaminador, Evaluador, Ponente
from .models import Resumen, Extenso, DictamenResumen, Evaluacion, PonenteHasPonencia, Evento, Ponencia
from .serializers import ResumenSerializer, ExtensoSerializer, PonenteHasPonenciaSerializer

# ==========================================
# LOGICA PARA DICTAMINADORES (Resúmenes)
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_resumenes_asignados(request):
    try:
        dictaminador = Dictaminador.objects.get(id_persona=request.user)
    except Dictaminador.DoesNotExist:
        return Response({"error": "Acceso denegado."}, status=status.HTTP_403_FORBIDDEN)
    
    # Filtramos la base de datos separando en dos costales
    pendientes = Resumen.objects.filter(id_dictaminador=dictaminador, revisado=False)
    completadas = Resumen.objects.filter(id_dictaminador=dictaminador, revisado=True)
    
    return Response({
        "pendientes": ResumenSerializer(pendientes, many=True).data,
        "completadas": ResumenSerializer(completadas, many=True).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dictaminar_resumen(request, id_resumen):
    """ Acepta o rechaza el resumen. """
    try:
        dictaminador = Dictaminador.objects.get(id_persona=request.user)
        resumen = Resumen.objects.get(id_resumen=id_resumen, id_dictaminador=dictaminador)
    except:
        return Response({"error": "Resumen no encontrado o no autorizado."}, status=status.HTTP_404_NOT_FOUND)
    
    nuevo_estatus = request.data.get('estatus')
    retroalimentacion = request.data.get('retroalimentacion_general', '')


    resumen.revisado = True
    resumen.estatus = nuevo_estatus
    resumen.retroalimentacion = retroalimentacion
    resumen.save()

    DictamenResumen.objects.create(
        id_resumen=resumen,
        id_dictaminador=dictaminador,
        estatus=nuevo_estatus,
        retroalimentacion_general=retroalimentacion
    )
    return Response({"mensaje": "Dictamen guardado exitosamente."})


# ==========================================
# LOGICA PARA REVISORES / EVALUADORES (Extensos)
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_extensos_asignados(request):
    try:
        evaluador = Evaluador.objects.get(id_persona=request.user)
    except Evaluador.DoesNotExist:
        return Response({"error": "Acceso denegado."}, status=status.HTTP_403_FORBIDDEN)
    
    # Pendientes son los de estatus 'pendiente', Completadas son todos los demás
    evals_pend = Evaluacion.objects.filter(id_evaluador=evaluador, estatus='pendiente')
    evals_comp = Evaluacion.objects.filter(id_evaluador=evaluador).exclude(estatus='pendiente')
    
    return Response({
        "pendientes": ExtensoSerializer([ev.id_extenso for ev in evals_pend], many=True).data,
        "completadas": ExtensoSerializer([ev.id_extenso for ev in evals_comp], many=True).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revisar_extenso(request, id_extenso):
    """ Permite al Evaluador asentar su veredicto sobre el extenso. """
    try:
        evaluador = Evaluador.objects.get(id_persona=request.user)
        evaluacion = Evaluacion.objects.get(
            id_extenso__id_extenso=id_extenso, 
            id_evaluador=evaluador, 
            estatus='pendiente'
        )
    except:
        return Response({"error": "Extenso no válido o ya revisado."}, status=status.HTTP_404_NOT_FOUND)
    
    nuevo_estatus = request.data.get('estatus') # 'aceptado', 'rechazado', 'cambios'
    retro = request.data.get('retroalimentacion_general', '')

    evaluacion.estatus = nuevo_estatus
    evaluacion.retroalimentacion_general = retro
    evaluacion.save()
    extenso = evaluacion.id_extenso
    extenso.revisado = True
    extenso.save()

    return Response({"mensaje": "Revisión guardada súper exitosamente."})

# ==========================================
# LOGICA PARA ASISTENTES (Autores/Ponentes)
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_ponencias_asistente(request):
    try:
        ponente = Ponente.objects.get(id_persona=request.user)
    except Ponente.DoesNotExist:
        # Si aún no es ponente, devolvemos lista vacía sin error
        return Response([])

    relaciones = PonenteHasPonencia.objects.filter(id_ponente=ponente)
    serializer = PonenteHasPonenciaSerializer(relaciones, many=True)
    
    data = serializer.data
    for p in data:
        ponencia_data = p['ponencia_detalle']
        if ponencia_data and ponencia_data['id_evento']:
            try:
                evento = Evento.objects.get(id_evento=ponencia_data['id_evento'])
                p['evento_info'] = {
                    'nombre': evento.nombre_evento,
                    'fecha_hora': evento.fecha_hora_inicio,
                    'cupos': evento.cupos
                }
            except Evento.DoesNotExist:
                p['evento_info'] = None
        else:
            p['evento_info'] = None
            
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subir_resumen_asistente(request):
    # 1. Asegurar Ponente
    ponente, created = Ponente.objects.get_or_create(id_persona=request.user)
    
    # 2. Guardar Resumen en blanco (Sin dictaminador, esperando al Admin)
    resumen = Resumen.objects.create(
        id_dictaminador=None,
        revisado=False
    )
    
    # 3. Crear Ponencia (El título real y el archivo lo subirá en su formato .pdf/doc)
    ponencia = Ponencia.objects.create(
        id_subarea=1, # Se guarda con el área comodín hasta enlazar selector
        id_resumen=resumen,
        tipo_participacion=request.data.get('tipoParticipacion', 'presencial')
    )
    
    # 4. Enlace final al usuario
    PonenteHasPonencia.objects.create(
        id_ponente=ponente,
        id_ponencia=ponencia
    )
    
    return Response({"mensaje": "Resumen enviado y en espera del Administrador"})
