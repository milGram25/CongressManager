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


# ==========================================
# LOGICA PARA ADMINISTRADOR
# ==========================================

def _nombre_persona(persona):
    """Helper: devuelve el nombre completo de una Persona."""
    partes = [persona.nombre, persona.primer_apellido, persona.segundo_apellido]
    return ' '.join([x for x in partes if x])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_listar_dictaminadores(request):
    """Lista todos los dictaminadores registrados en el sistema."""
    if not request.user.is_staff:
        return Response({"error": "Acceso denegado."}, status=status.HTTP_403_FORBIDDEN)
    dictaminadores = Dictaminador.objects.select_related('id_persona').all()
    resultado = [
        {
            'id': d.id_dictaminador,
            'nombre': _nombre_persona(d.id_persona),
            'grado': d.id_persona.correo_electronico,
            'institucion': '—',
            'especialidad': '—',
        }
        for d in dictaminadores
    ]
    return Response(resultado)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_listar_evaluadores(request):
    """Lista todos los evaluadores/revisores registrados en el sistema."""
    if not request.user.is_staff:
        return Response({"error": "Acceso denegado."}, status=status.HTTP_403_FORBIDDEN)
    evaluadores = Evaluador.objects.select_related('id_persona').all()
    resultado = [
        {
            'id': e.id_evaluador,
            'nombre': _nombre_persona(e.id_persona),
            'grado': e.id_persona.correo_electronico,
            'institucion': '—',
            'especialidad': '—',
        }
        for e in evaluadores
    ]
    return Response(resultado)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_listar_resumenes(request):
    """Lista todos los resúmenes con info de ponente y dictaminador asignado."""
    if not request.user.is_staff:
        return Response({"error": "Acceso denegado."}, status=status.HTTP_403_FORBIDDEN)

    resumenes = Resumen.objects.select_related('id_dictaminador__id_persona').all()
    resultado = []

    for resumen in resumenes:
        ponencia = resumen.ponencia_set.first()
        autores = []
        if ponencia:
            for rel in ponencia.autores.select_related('id_ponente__id_persona').all():
                autores.append(_nombre_persona(rel.id_ponente.id_persona))

        revisores = []
        if resumen.id_dictaminador:
            revisores = [resumen.id_dictaminador.id_dictaminador]

        resultado.append({
            'id': resumen.id_resumen,
            'title': f'Resumen #{resumen.id_resumen}',
            'asignado': resumen.id_dictaminador is not None,
            'revisado': resumen.revisado,
            'aceptado': str(resumen.estatus).lower() == 'aceptado',
            'revisores': revisores,
            'fechaLimite': None,
            'autores': autores or ['Sin autor registrado'],
            'subarea': str(ponencia.id_subarea) if ponencia else '—',
            'tipoTrabajo': ponencia.tipo_participacion if ponencia else '—',
            'puntuacion': {'obtenida': 0, 'total': 0},
            'preguntas': [],
            'comentario': resumen.retroalimentacion or 'Sin retroalimentación aún.',
        })

    return Response(resultado)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_asignar_dictaminador(request, id_resumen):
    """Asigna un dictaminador a un resumen específico."""
    if not request.user.is_staff:
        return Response({"error": "Acceso denegado."}, status=status.HTTP_403_FORBIDDEN)

    id_dictaminador = request.data.get('id_dictaminador')
    try:
        resumen = Resumen.objects.get(id_resumen=id_resumen)
        dictaminador = Dictaminador.objects.get(id_dictaminador=id_dictaminador)
    except (Resumen.DoesNotExist, Dictaminador.DoesNotExist):
        return Response({"error": "Resumen o dictaminador no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    resumen.id_dictaminador = dictaminador
    resumen.save()
    return Response({"mensaje": "Dictaminador asignado exitosamente."})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_listar_extensos(request):
    """Lista todos los extensos con info de ponente y evaluador asignado."""
    if not request.user.is_staff:
        return Response({"error": "Acceso denegado."}, status=status.HTTP_403_FORBIDDEN)

    extensos = Extenso.objects.prefetch_related('evaluaciones__id_evaluador__id_persona').all()
    resultado = []

    for extenso in extensos:
        ponencia = extenso.ponencia_set.first()
        autores = []
        if ponencia:
            for rel in ponencia.autores.select_related('id_ponente__id_persona').all():
                autores.append(_nombre_persona(rel.id_ponente.id_persona))

        evaluaciones = list(extenso.evaluaciones.all())
        revisores = [ev.id_evaluador.id_evaluador for ev in evaluaciones]
        aceptado = any(ev.estatus in ('aceptado', 'Aceptado') for ev in evaluaciones)

        resultado.append({
            'id': extenso.id_extenso,
            'title': extenso.titulo or f'Extenso #{extenso.id_extenso}',
            'asignado': len(revisores) > 0,
            'revisado': extenso.revisado,
            'aceptado': aceptado,
            'revisores': revisores,
            'fechaLimite': None,
            'autores': autores or ['Sin autor registrado'],
            'subarea': str(ponencia.id_subarea) if ponencia else '—',
            'tipoTrabajo': ponencia.tipo_participacion if ponencia else '—',
            'puntuacion': {'obtenida': 0, 'total': 15},
            'rubricas': [
                {'id': 1, 'texto': 'Originalidad', 'calificacion': 0, 'maximo': 5},
                {'id': 2, 'texto': 'Redaccion', 'calificacion': 0, 'maximo': 5},
                {'id': 3, 'texto': 'Claridad', 'calificacion': 0, 'maximo': 5},
            ],
            'comentario': 'Sin retroalimentación aún.',
        })

    return Response(resultado)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_asignar_evaluador(request, id_extenso):
    """Asigna un evaluador a un extenso específico."""
    if not request.user.is_staff:
        return Response({"error": "Acceso denegado."}, status=status.HTTP_403_FORBIDDEN)

    id_evaluador = request.data.get('id_evaluador')
    try:
        extenso = Extenso.objects.get(id_extenso=id_extenso)
        evaluador = Evaluador.objects.get(id_evaluador=id_evaluador)
    except (Extenso.DoesNotExist, Evaluador.DoesNotExist):
        return Response({"error": "Extenso o evaluador no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    Evaluacion.objects.get_or_create(
        id_extenso=extenso,
        id_evaluador=evaluador,
        defaults={'estatus': 'pendiente'}
    )
    return Response({"mensaje": "Evaluador asignado exitosamente."})


# ==========================================
# DETALLES Y SUBIDA DE EXTENSO
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_detalle_ponencia(request, id_ponencia):
    """Devuelve los detalles de una ponencia para la vista de subida de extenso."""
    try:
        # Verificamos que la ponencia pertenezca al usuario (asistente)
        relacion = PonenteHasPonencia.objects.get(
            id_ponencia=id_ponencia, 
            id_ponente__id_persona=request.user
        )
        p = relacion.id_ponencia
        res = p.id_resumen
        
        dictaminador_nombre = 'No asignado'
        if res.id_dictaminador:
            dictaminador_nombre = _nombre_persona(res.id_dictaminador.id_persona)

        return Response({
            'id': p.id_ponencia,
            'titulo_resumen': f"Propuesta #{res.id_resumen}",
            'resumen_texto': 'No disponible en este modelo simplificado',
            'dictaminador': dictaminador_nombre,
            'estatus_resumen': res.estatus,
            'retroalimentacion': res.retroalimentacion or "Sin comentarios adicionales.",
            'tiene_extenso': p.id_extenso is not None
        })
    except PonenteHasPonencia.DoesNotExist:
        return Response({"error": "Ponencia no encontrada."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subir_extenso_asistente(request, id_ponencia):
    """Crea un Extenso y lo vincula a la Ponencia."""
    try:
        relacion = PonenteHasPonencia.objects.get(
            id_ponencia=id_ponencia, 
            id_ponente__id_persona=request.user
        )
        ponencia = relacion.id_ponencia
        
        if ponencia.id_resumen.estatus.lower() != 'aceptado':
            return Response({"error": "No puedes subir el extenso hasta que tu resumen sea aceptado."}, status=status.HTTP_403_FORBIDDEN)

        titulo = request.data.get('titulo', f"Extenso - {ponencia.id_ponencia}")
        
        # Creamos el extenso
        # Nota: En un sistema real aquí manejaríamos el archivo físico
        extenso = Extenso.objects.create(
            titulo=titulo,
            revisado=False,
            version_numero=1
        )
        
        # Vinculamos a la ponencia
        ponencia.id_extenso = extenso
        ponencia.save()
        
        return Response({"mensaje": "Extenso subido exitosamente."})
        
    except PonenteHasPonencia.DoesNotExist:
        return Response({"error": "Ponencia no encontrada."}, status=status.HTTP_404_NOT_FOUND)
