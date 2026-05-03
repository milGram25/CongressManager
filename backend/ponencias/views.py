from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction, connection
from .models import AsistenteEvento, Ponencia, Resumen, Extenso
from .serializers import PonenciaSerializer, CatalogoEventoSerializer, AsistenteEventoSerializer
from users.models import Dictaminador, Evaluador, DictaminadorCongreso, EvaluadorCongreso
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
                        INSERT INTO ponencia (tipo_participacion, id_subarea, id_resumen, id_tipo_trabajo)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id_ponencia
                    """, [tipo_participacion, id_subarea, id_resumen, id_tipo_trabajo])
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
                            INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio, es_principal)
                            VALUES (%s, %s, FALSE, TRUE)
                            ON CONFLICT (id_ponente, id_ponencia) DO NOTHING
                        """, [id_ponente, id_ponencia])

                    #Coautores, se vinculan si tienen cuenta, correo
                    for coautor in coautores:
                        if isinstance(coautor, dict):
                            coautor_email = coautor.get('email', '').strip()
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
                                        INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio, es_principal)
                                        VALUES (%s, %s, FALSE, FALSE)
                                        ON CONFLICT (id_ponente, id_ponencia) DO NOTHING
                                    """, [id_ponente_coautor, id_ponencia])


            return Response({'detail': 'Ponencia enviada exitosamente', 'id_ponencia': id_ponencia}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
            return Response({"error": "Ya estás registrado en este evento."}, status=status.HTTP_400_BAD_REQUEST)
        evento = Evento.objects.get(id_evento=id_evento)
        if evento.cupos and evento.cupos > 0:
            ocupados = AsistenteEvento.objects.filter(id_evento_id=id_evento).count()
            if ocupados >= evento.cupos:
                return Response({"error": "No hay cupos disponibles para este evento."}, status=status.HTTP_400_BAD_REQUEST)
        asistente_evento = AsistenteEvento.objects.create(id_asistente=asistente, id_evento_id=id_evento)
        return Response({"message": "Registro exitoso", "id": asistente_evento.id_asistente_evento}, status=status.HTTP_201_CREATED)
    except Evento.DoesNotExist:
        return Response({"error": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"Error interno del servidor: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MiAgendaView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        asistente = Asistente.objects.filter(id_persona=request.user).first()
        if not asistente:
            return Response([])
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT e.id_evento, e.nombre_evento, e.tipo_evento,
                       e.fecha_hora_inicio, e.fecha_hora_final, e.sinopsis,
                       c.nombre_congreso, c.id_congreso
                FROM asistente_evento ae
                JOIN evento e ON e.id_evento = ae.id_evento
                JOIN congreso c ON c.id_congreso = e.id_congreso
                WHERE ae.id_asistente = %s
                ORDER BY e.fecha_hora_inicio
            """, [asistente.id_asistente])
            rows = cursor.fetchall()
        result = []
        for r in rows:
            result.append({
                'id': r[0],
                'titulo': r[1] or '',
                'tipo': r[2] or '',
                'fecha_inicio': r[3].isoformat() if r[3] else None,
                'fecha_fin': r[4].isoformat() if r[4] else None,
                'sinopsis': r[5] or '',
                'congreso': r[6] or '',
                'id_congreso': r[7],
            })
        return Response(result)


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


class DictaminadoresDisponiblesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        persona_ids = DictaminadorCongreso.objects.filter(
            id_congreso_id=id_congreso
        ).values_list('id_persona_id', flat=True)
        dictaminadores = Dictaminador.objects.filter(id_persona_id__in=persona_ids).select_related('id_persona')
        data = [{
            'id_dictaminador': d.id_dictaminador,
            'nombre_completo': ' '.join(x for x in [
                d.id_persona.nombre, d.id_persona.primer_apellido, d.id_persona.segundo_apellido
            ] if x).strip(),
        } for d in dictaminadores]
        return Response(data)


class EvaluadoresDisponiblesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        persona_ids = EvaluadorCongreso.objects.filter(
            id_congreso_id=id_congreso
        ).values_list('id_persona_id', flat=True)
        evaluadores = Evaluador.objects.filter(id_persona_id__in=persona_ids).select_related('id_persona')
        data = [{
            'id_evaluador': e.id_evaluador,
            'nombre_completo': ' '.join(x for x in [
                e.id_persona.nombre, e.id_persona.primer_apellido, e.id_persona.segundo_apellido
            ] if x).strip(),
        } for e in evaluadores]
        return Response(data)


class AsignarDictaminadorView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            resumen = Resumen.objects.get(pk=pk)
        except Resumen.DoesNotExist:
            return Response({'detail': 'Resumen no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        id_dictaminador = request.data.get('id_dictaminador')
        resumen.id_dictaminador_id = id_dictaminador
        resumen.save(update_fields=['id_dictaminador'])
        return Response({'id_resumen': resumen.pk, 'id_dictaminador': id_dictaminador})


class AsignarEvaluadorView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            extenso = Extenso.objects.get(pk=pk)
        except Extenso.DoesNotExist:
            return Response({'detail': 'Extenso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        id_evaluador = request.data.get('id_evaluador')
        extenso.id_evaluador_id = id_evaluador
        extenso.save(update_fields=['id_evaluador'])
        return Response({'id_extenso': extenso.pk, 'id_evaluador': id_evaluador})


class ResumenesCongresoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as c:
            c.execute("""
                SELECT
                    p.id_ponencia,
                    p.id_resumen,
                    COALESCE(s.nombre, 'Ponencia ' || p.id_ponencia::text) AS titulo,
                    r.id_dictaminador,
                    r.revisado,
                    r.estatus,
                    r.retroalimentacion,
                    CASE WHEN d_per.id_persona IS NOT NULL
                        THEN d_per.nombre || ' ' || d_per.primer_apellido
                        ELSE NULL
                    END AS nombre_dictaminador
                FROM ponencia p
                JOIN evento e ON p.id_evento = e.id_evento
                JOIN resumen r ON p.id_resumen = r.id_resumen
                LEFT JOIN subareas s ON p.id_subarea = s.id_subareas
                LEFT JOIN dictaminador d ON r.id_dictaminador = d.id_dictaminador
                LEFT JOIN persona d_per ON d.id_persona = d_per.id_persona
                WHERE e.id_congreso = %s
                ORDER BY p.id_ponencia
            """, [id_congreso])
            rows = c.fetchall()
            cols = ['id_ponencia','id_resumen','titulo','id_dictaminador','revisado','estatus','retroalimentacion','nombre_dictaminador']
            ponencias = [dict(zip(cols, row)) for row in rows]

            if not ponencias:
                return Response([])

            ponencia_ids = [p['id_ponencia'] for p in ponencias]
            resumen_ids = [p['id_resumen'] for p in ponencias]

            c.execute("""
                SELECT php.id_ponencia,
                       per.nombre || ' ' || per.primer_apellido
                FROM ponente_has_ponencia php
                JOIN ponente po ON php.id_ponente = po.id_ponente
                JOIN persona per ON po.id_persona = per.id_persona
                WHERE php.id_ponencia = ANY(%s)
            """, [ponencia_ids])
            autores_map = {}
            for id_pon, nombre in c.fetchall():
                autores_map.setdefault(id_pon, []).append(nombre)

            c.execute("""
                SELECT dr.id_resumen, dp.descripcion, ep.cumplio, ep.comentario_especifico
                FROM dictamen_resumen dr
                JOIN evaluacion_pregunta ep ON ep.id_dictamen = dr.id_dictamen
                JOIN dictamen_pregunta dp ON ep.id_pregunta = dp.id_pregunta
                WHERE dr.id_resumen = ANY(%s)
            """, [resumen_ids])
            dictamen_map = {}
            for id_res, pregunta, cumplio, comentario in c.fetchall():
                dictamen_map.setdefault(id_res, []).append({
                    'pregunta': pregunta,
                    'cumplio': cumplio,
                    'comentario': comentario,
                })

        result = []
        for p in ponencias:
            result.append({
                'id': p['id_ponencia'],
                'id_resumen': p['id_resumen'],
                'title': p['titulo'],
                'autores': autores_map.get(p['id_ponencia'], []),
                'asignado': p['id_dictaminador'] is not None,
                'revisado': p['revisado'] or False,
                'aceptado': p['estatus'] == 'aceptado',
                'id_dictaminador': p['id_dictaminador'],
                'nombre_dictaminador': p['nombre_dictaminador'],
                'estatus': p['estatus'],
                'retroalimentacion': p['retroalimentacion'],
                'preguntas': dictamen_map.get(p['id_resumen'], []),
            })
        return Response(result)


class ExtensosCongresoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as c:
            # Nota: id_evaluador en extenso puede no existir aún (migración pendiente de permisos)
            # La query es resiliente: usa LEFT JOIN y solo falla si la columna no existe
            try:
                c.execute("""
                    SELECT
                        p.id_ponencia,
                        p.id_extenso,
                        ext.titulo,
                        ext.id_evaluador,
                        ext.revisado,
                        ev.id_evaluacion,
                        ev.estatus AS estatus_evaluacion,
                        ev.retroalimentacion_general,
                        CASE WHEN eval_per.id_persona IS NOT NULL
                            THEN eval_per.nombre || ' ' || eval_per.primer_apellido
                            ELSE NULL
                        END AS nombre_evaluador
                    FROM ponencia p
                    JOIN evento e ON p.id_evento = e.id_evento
                    JOIN extenso ext ON p.id_extenso = ext.id_extenso
                    LEFT JOIN evaluacion ev ON ev.id_extenso = ext.id_extenso
                    LEFT JOIN evaluador eval ON ext.id_evaluador = eval.id_evaluador
                    LEFT JOIN persona eval_per ON eval.id_persona = eval_per.id_persona
                    WHERE e.id_congreso = %s
                    ORDER BY p.id_ponencia
                """, [id_congreso])
            except Exception:
                # Si la columna id_evaluador no existe aún, query sin ella
                c.execute("""
                    SELECT
                        p.id_ponencia,
                        p.id_extenso,
                        ext.titulo,
                        NULL AS id_evaluador,
                        ext.revisado,
                        ev.id_evaluacion,
                        ev.estatus AS estatus_evaluacion,
                        ev.retroalimentacion_general,
                        NULL AS nombre_evaluador
                    FROM ponencia p
                    JOIN evento e ON p.id_evento = e.id_evento
                    JOIN extenso ext ON p.id_extenso = ext.id_extenso
                    LEFT JOIN evaluacion ev ON ev.id_extenso = ext.id_extenso
                    WHERE e.id_congreso = %s
                    ORDER BY p.id_ponencia
                """, [id_congreso])

            rows = c.fetchall()
            cols = ['id_ponencia','id_extenso','titulo','id_evaluador','revisado',
                    'id_evaluacion','estatus_evaluacion','retroalimentacion_general','nombre_evaluador']
            ponencias = [dict(zip(cols, row)) for row in rows]

            if not ponencias:
                return Response([])

            ponencia_ids = [p['id_ponencia'] for p in ponencias]
            evaluacion_ids = [p['id_evaluacion'] for p in ponencias if p['id_evaluacion']]

            c.execute("""
                SELECT php.id_ponencia,
                       per.nombre || ' ' || per.primer_apellido
                FROM ponente_has_ponencia php
                JOIN ponente po ON php.id_ponente = po.id_ponente
                JOIN persona per ON po.id_persona = per.id_persona
                WHERE php.id_ponencia = ANY(%s)
            """, [ponencia_ids])
            autores_map = {}
            for id_pon, nombre in c.fetchall():
                autores_map.setdefault(id_pon, []).append(nombre)

            criterios_map = {}
            if evaluacion_ids:
                c.execute("""
                    SELECT
                        ec.id_evaluacion,
                        rg.nombre_grupo,
                        rc.descripcion AS nombre_criterio,
                        rc.peso,
                        ec.puntaje,
                        ec.comentario_especifico
                    FROM evaluacion_criterio ec
                    JOIN rubrica_criterio rc ON ec.id_criterio = rc.id_criterio
                    JOIN rubrica_grupo rg ON rc.id_grupo = rg.id_grupo
                    WHERE ec.id_evaluacion = ANY(%s)
                    ORDER BY rg.id_grupo, rc.id_criterio
                """, [evaluacion_ids])
                for row in c.fetchall():
                    id_ev, nombre_grupo, nombre_criterio, peso, puntaje, comentario = row
                    grupos = criterios_map.setdefault(id_ev, {})
                    criterios = grupos.setdefault(nombre_grupo, [])
                    criterios.append({
                        'nombre_criterio': nombre_criterio,
                        'peso': float(peso) if peso else None,
                        'puntaje': puntaje,
                        'comentario_especifico': comentario,
                    })

        result = []
        for p in ponencias:
            evaluacion = None
            if p['id_evaluacion'] and p['id_evaluacion'] in criterios_map:
                grupos_dict = criterios_map[p['id_evaluacion']]
                evaluacion = {
                    'estatus': p['estatus_evaluacion'],
                    'retroalimentacion_general': p['retroalimentacion_general'],
                    'grupos': [
                        {'nombre_grupo': ng, 'criterios': crs}
                        for ng, crs in grupos_dict.items()
                    ],
                }
            estatus_ev = p.get('estatus_evaluacion') or ''
            result.append({
                'id': p['id_ponencia'],
                'id_extenso': p['id_extenso'],
                'title': p['titulo'],
                'autores': autores_map.get(p['id_ponencia'], []),
                'asignado': p['id_evaluador'] is not None,
                'revisado': p['revisado'] or False,
                'aceptado': estatus_ev == 'aceptado',
                'id_evaluador': p['id_evaluador'],
                'nombre_evaluador': p['nombre_evaluador'],
                'evaluacion': evaluacion,
            })
        return Response(result)
