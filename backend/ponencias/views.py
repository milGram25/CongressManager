import os
import json
import uuid
from datetime import datetime
from django.conf import settings
from django.core.mail import send_mail
from django.db import connection, transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AsistenteEvento
from users.models import Asistente

class EnviarPonenciaAPIView(APIView):
    # permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data
        titulo = data.get('titulo')
        autor = data.get('autor')
        coautores = data.get('coautores', [])
        tipo_participacion = data.get('tipoParticipacion')
        eje_tematico_nombre = data.get('ejeTematico')
        tipo_trabajo_nombre = data.get('tipoTrabajo')
        palabras_clave = data.get('palabrasClave')
        resumen_texto = data.get('resumen')
        if not all([titulo, autor, tipo_participacion, eje_tematico_nombre, tipo_trabajo_nombre, palabras_clave, resumen_texto]):
            return Response({'detail': 'Faltan campos obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        coautores_json = json.dumps(coautores)
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    #resolver el id_subarea a partir del eje tematico
                    cursor.execute("SELECT id_subareas FROM subareas WHERE nombre ILIKE %s LIMIT 1", [f"%{eje_tematico_nombre}%"])
                    subarea_row = cursor.fetchone()
                    if not subarea_row:
                        #prueba, si no existe agrega
                        cursor.execute("SELECT id_areas_generales FROM areas_generales LIMIT 1")
                        area_row = cursor.fetchone()
                        if not area_row:
                            cursor.execute("INSERT INTO areas_generales (nombre) VALUES ('Area General Default') RETURNING id_areas_generales")
                            id_area_general = cursor.fetchone()[0]
                        else:
                            id_area_general = area_row[0]
                        cursor.execute("INSERT INTO subareas (nombre, id_area_general) VALUES (%s, %s) RETURNING id_subareas", [eje_tematico_nombre, id_area_general])
                        id_subarea = cursor.fetchone()[0]
                    else:
                        id_subarea = subarea_row[0]

                    #id_tipo a partir del tipo_trabajo_nombre
                    #solo compara las primeras palabras para evitar conflictos
                    first_words = " ".join(tipo_trabajo_nombre.split()[:2])
                    cursor.execute("SELECT id_tipo_trabajo FROM tipo_trabajo WHERE tipo_trabajo ILIKE %s LIMIT 1", [f"%{first_words}%"])
                    tipo_trabajo_row = cursor.fetchone()
                    if not tipo_trabajo_row:
                        #pruebas
                        cursor.execute("INSERT INTO tipo_trabajo (tipo_trabajo) VALUES (%s) RETURNING id_tipo_trabajo", [tipo_trabajo_nombre])
                        id_tipo_trabajo = cursor.fetchone()[0]
                    else:
                        id_tipo_trabajo = tipo_trabajo_row[0]

                    #Crea un archivo de etxto para el resumen, asegura que el directorio de media exista
                    media_dir = os.path.join(settings.MEDIA_ROOT, 'resumenes')
                    os.makedirs(media_dir, exist_ok=True)
                    
                    #Se genera un nombre de archivo unico
                    safe_titulo = "".join([c if c.isalnum() else "_" for c in titulo])[:50]
                    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                    unique_id = uuid.uuid4().hex[:6]
                    filename = f"resumen_{safe_titulo}_{timestamp}_{unique_id}.txt"
                    filepath = os.path.join(media_dir, filename)
                    
                    # Se escribe el contenido en el archivo
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(f"Título: {titulo}\n")
                        f.write(f"Autor: {autor}\n")
                        f.write(f"Palabras Clave: {palabras_clave}\n")
                        f.write("-" * 50 + "\n")
                        f.write(resumen_texto)
                        
                    #Crea un registro en la tabla de resumen
                    cursor.execute("""
                        INSERT INTO resumen (titulo, contenido, palabras_clave, revisado)
                        VALUES (%s, %s, %s, FALSE)
                        RETURNING id_resumen
                    """, [titulo, resumen_texto, palabras_clave])
                    id_resumen = cursor.fetchone()[0]

                    #Crea un registro en la tabla ponencia
                    cursor.execute("""
                        INSERT INTO ponencia (tipo_participacion, id_subarea, id_resumen, autor_principal, coautores, id_tipo_trabajo)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING id_ponencia
                    """, [tipo_participacion, id_subarea, id_resumen, autor, coautores_json, id_tipo_trabajo])
                    id_ponencia = cursor.fetchone()[0]

                    #se asegura que el usuario sea ponente y se crea si no existe
                    if request.user.is_authenticated:
                        id_persona = request.user.id_persona
                        cursor.execute("SELECT id_ponente FROM ponente WHERE id_persona = %s", [id_persona])
                        ponente_row = cursor.fetchone()
                        if not ponente_row:
                            cursor.execute("INSERT INTO ponente (id_persona) VALUES (%s) RETURNING id_ponente", [id_persona])
                            id_ponente = cursor.fetchone()[0]
                        else:
                            id_ponente = ponente_row[0]
                        
                        #Asociar ponente a la ponencia
                        cursor.execute("""
                            INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
                            VALUES (%s, %s, FALSE)
                            ON CONFLICT (id_ponente, id_ponencia) DO NOTHING
                        """, [id_ponente, id_ponencia])

                    #Coautores, se vinculan si tienen cuenta, correo
                    for coautor in coautores:
                        if isinstance(coautor, dict):
                            coautor_email = coautor.get('email', '').strip()
                            coautor_nombre = coautor.get('nombre', '').strip()
                            if coautor_email:
                                cursor.execute("SELECT id_persona FROM persona WHERE correo_electronico = %s", [coautor_email])
                                persona_row = cursor.fetchone()
                                if persona_row:
                                    id_persona_coautor = persona_row[0]
                                    cursor.execute("SELECT id_ponente FROM ponente WHERE id_persona = %s", [id_persona_coautor])
                                    ponente_coautor_row = cursor.fetchone()
                                    if not ponente_coautor_row:
                                        cursor.execute("INSERT INTO ponente (id_persona) VALUES (%s) RETURNING id_ponente", [id_persona_coautor])
                                        id_ponente_coautor = cursor.fetchone()[0]
                                    else:
                                        id_ponente_coautor = ponente_coautor_row[0]
                                    
                                    cursor.execute("""
                                        INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
                                        VALUES (%s, %s, FALSE)
                                        ON CONFLICT (id_ponente, id_ponencia) DO NOTHING
                                    """, [id_ponente_coautor, id_ponencia])

                                # Enviar correo al coautor
                                try:
                                    asunto = f"Has sido añadido como coautor: {titulo}"
                                    mensaje = (
                                        f"Hola {coautor_nombre},\n\n"
                                        f"Has sido registrado como coautor en la ponencia titulada '{titulo}'.\n"
                                        f"Autor principal: {autor}\n\n"
                                        f"Gracias por tu participación\n"
                                    )
                                    send_mail(
                                        asunto,
                                        mensaje,
                                        getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@congressmanager.com'),
                                        [coautor_email],
                                        fail_silently=True,
                                    )
                                except Exception as e:
                                    print(f"Error enviando correo a {coautor_email}: {e}")        
            return Response({'detail': 'Ponencia enviada exitosamente', 'id_ponencia': id_ponencia}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
