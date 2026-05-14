from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction, connection
from .models import AsistenteEvento, Ponencia, Resumen, Extenso, PonenciaMagistral, PonenciaMagistralHasPonentemagistral
from .serializers import PonenciaSerializer, CatalogoEventoSerializer, AsistenteEventoSerializer, PonenciaMagistralSerializer, PonenciaMagistralCreateSerializer
from users.models import Dictaminador, Evaluador, DictaminadorCongreso, EvaluadorCongreso
import os
import json
import uuid
from datetime import datetime, timedelta
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


_MODS = ('aceptado con ligeras modificaciones', 'aceptado con modificaciones mayores')
_DEFINITIVOS = ('aceptado', 'rechazado')


def calcular_estado_extenso(ext, evaluaciones_por_eval):
    """
    ext: dict with id_evaluador, id_evaluador_2, id_evaluador_3, revisado
    evaluaciones_por_eval: dict {id_evaluador_int: estatus_str} — latest per evaluador
    """
    r1 = ext.get('id_evaluador')
    r2 = ext.get('id_evaluador_2')
    r3 = ext.get('id_evaluador_3')
    revisado = ext.get('revisado', False)

    if revisado:
        if r3 and r3 in evaluaciones_por_eval:
            estatus = evaluaciones_por_eval[r3]
        elif r1 and r1 in evaluaciones_por_eval:
            estatus = evaluaciones_por_eval[r1]
        elif r2 and r2 in evaluaciones_por_eval:
            estatus = evaluaciones_por_eval[r2]
        else:
            estatus = 'aceptado'
        return 'extenso_rechazado' if estatus == 'rechazado' else 'extenso_aceptado'

    if not r1 and not r2:
        return 'en_revision'

    ev1 = evaluaciones_por_eval.get(r1) if r1 else None
    ev2 = evaluaciones_por_eval.get(r2) if r2 else None

    if not r2:
        if ev1 in _MODS:
            return 'con_modificaciones'
        return 'en_revision'

    if ev1 and ev2:
        r1_rechazado = ev1 == 'rechazado'
        r2_rechazado = ev2 == 'rechazado'
        if r1_rechazado != r2_rechazado:
            return 'desacuerdo'
        if r1_rechazado and r2_rechazado:
            return 'en_revision'
        any_mods = any(e in _MODS for e in [ev1, ev2])
        return 'con_modificaciones' if any_mods else 'en_revision'

    ev = ev1 or ev2
    if ev in _MODS:
        return 'con_modificaciones'
    return 'en_revision'


def _finalizar_extenso_si_procede(cursor, pk, evaluador_id, r1, r2, r3, estatus_actual=None):
    """After inserting evaluation, mark extenso.revisado=TRUE if a final decision is reached."""
    if not r2:
        if estatus_actual in _DEFINITIVOS:
            cursor.execute("UPDATE extenso SET revisado = TRUE WHERE id_extenso = %s", [pk])
        return

    if r3 and evaluador_id == r3:
        cursor.execute("UPDATE extenso SET revisado = TRUE WHERE id_extenso = %s", [pk])
        return

    if evaluador_id not in (r1, r2):
        return

    cursor.execute("""
        SELECT DISTINCT ON (id_evaluador) id_evaluador, estatus
        FROM evaluacion
        WHERE id_extenso = %s AND id_evaluador = ANY(%s)
        ORDER BY id_evaluador, fecha_de_revision DESC
    """, [pk, [r1, r2]])
    evals = {row[0]: row[1] for row in cursor.fetchall()}

    if r1 not in evals or r2 not in evals:
        return

    s1, s2 = evals[r1], evals[r2]
    if (s1 == 'rechazado' and s2 == 'rechazado') or (s1 == 'aceptado' and s2 == 'aceptado'):
        cursor.execute("UPDATE extenso SET revisado = TRUE WHERE id_extenso = %s", [pk])


class PonenciaViewSet(viewsets.ModelViewSet):
    serializer_class = PonenciaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Ponencia.objects.all().select_related('id_evento', 'id_subarea', 'id_evento__id_congreso', 'id_evento__id_congreso__id_institucion', 'id_evento__id_tipo_trabajo')
        id_congreso = self.request.query_params.get('id_congreso')
        if id_congreso:
            # Filtramos por el ID del congreso a través del evento usando el campo id_congreso
            queryset = queryset.filter(id_evento__id_congreso_id=id_congreso)
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        data['id'] = instance.id_ponencia
        if instance.id_evento_id:
            data['id_congreso'] = instance.id_evento.id_congreso_id
        else:
            data['id_congreso'] = None
        data['id_subarea'] = instance.id_subarea_id
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT enlace_multimedia FROM ponencia_meta WHERE id_ponencia = %s",
                [instance.id_ponencia]
            )
            row = cursor.fetchone()
            data['enlace_multimedia'] = row[0] if row else None
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
                # Manejo seguro de cupos (puede venir vacio o ""), evita crash de int("")
                try:
                    cupos_val = int(data.get('cupos')) if data.get('cupos') not in (None, '') else instance.id_evento.cupos
                except (ValueError, TypeError):
                    cupos_val = instance.id_evento.cupos

                # id_congreso: permitir cambiarlo si viene en el payload
                id_congreso_raw = data.get('id_congreso')
                try:
                    id_congreso_nuevo = int(id_congreso_raw) if id_congreso_raw not in (None, '') else instance.id_evento.id_congreso_id
                except (ValueError, TypeError):
                    id_congreso_nuevo = instance.id_evento.id_congreso_id

                with connection.cursor() as cursor:
                    # 1. Actualizar Evento (incluye id_congreso)
                    cursor.execute("""
                        UPDATE evento SET
                            id_congreso = %s,
                            nombre_evento = %s, id_mesas_trabajo = %s,
                            fecha_hora_inicio = %s, fecha_hora_final = %s,
                            sinopsis = %s, cupos = %s, enlace = %s
                        WHERE id_evento = %s
                    """, [
                        id_congreso_nuevo,
                        data.get('nombre_evento', instance.id_evento.nombre_evento),
                        clean_date(data.get('id_mesas_trabajo'), instance.id_evento.id_mesas_trabajo_id),
                        clean_date(data.get('fecha_hora_inicio'), instance.id_evento.fecha_hora_inicio),
                        clean_date(data.get('fecha_hora_final'), instance.id_evento.fecha_hora_final),
                        data.get('sinopsis', instance.id_evento.sinopsis),
                        cupos_val,
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

                    # 4. Actualizar ponente principal y coautores (solo si vienen en el payload)
                    if 'ponente_principal' in data or 'coautores' in data:
                        # Borrar relaciones existentes para rehacerlas en el orden correcto
                        cursor.execute("DELETE FROM ponente_has_ponencia WHERE id_ponencia = %s", [instance.id_ponencia])

                        def _find_ponente_by_nombre(nombre_completo):
                            """Busca id_ponente por nombre completo. Si la persona existe pero no es ponente, lo registra como ponente. Si la persona no existe, retorna None (se ignora)."""
                            nombre_clean = (nombre_completo or '').strip()
                            if not nombre_clean:
                                return None
                            cursor.execute("""
                                SELECT id_persona FROM persona
                                WHERE TRIM(CONCAT_WS(' ', nombre, primer_apellido, COALESCE(segundo_apellido, ''))) ILIKE %s
                                LIMIT 1
                            """, [nombre_clean])
                            persona_row = cursor.fetchone()
                            if not persona_row:
                                return None
                            id_persona = persona_row[0]
                            cursor.execute("SELECT id_ponente FROM ponente WHERE id_persona = %s", [id_persona])
                            ponente_row = cursor.fetchone()
                            if ponente_row:
                                return ponente_row[0]
                            cursor.execute("INSERT INTO ponente (id_persona) VALUES (%s) RETURNING id_ponente", [id_persona])
                            return cursor.fetchone()[0]

                        # Insertar primero al ponente principal (queda como el "first" en queries del serializer)
                        ponente_principal_nombre = (data.get('ponente_principal') or '').strip() if isinstance(data.get('ponente_principal'), str) else ''
                        if ponente_principal_nombre:
                            id_ponente = _find_ponente_by_nombre(ponente_principal_nombre)
                            if id_ponente:
                                cursor.execute("""
                                    INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
                                    VALUES (%s, %s, FALSE)
                                    ON CONFLICT (id_ponente, id_ponencia) DO NOTHING
                                """, [id_ponente, instance.id_ponencia])

                        # Insertar coautores
                        coautores_list = data.get('coautores') or []
                        if isinstance(coautores_list, list):
                            for nombre in coautores_list:
                                if isinstance(nombre, str):
                                    id_ponente = _find_ponente_by_nombre(nombre)
                                    if id_ponente:
                                        cursor.execute("""
                                            INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
                                            VALUES (%s, %s, FALSE)
                                            ON CONFLICT (id_ponente, id_ponencia) DO NOTHING
                                        """, [id_ponente, instance.id_ponencia])

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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        titulo = data.get('titulo')
        autor = data.get('autor')
        coautores = data.get('coautores', [])
        tipo_participacion = data.get('tipoParticipacion')
        eje_tematico_nombre = data.get('ejeTematico')
        id_tipo_trabajo_raw = data.get('tipoTrabajo')  # puede ser ID int o nombre legacy
        palabras_clave = data.get('palabrasClave')
        resumen_texto = data.get('resumen')
        id_congreso = data.get('id_congreso')

        if not all([titulo, autor, tipo_participacion, eje_tematico_nombre, id_tipo_trabajo_raw, palabras_clave, resumen_texto]):
            return Response({'detail': 'Faltan campos obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        if not id_congreso:
            return Response({'detail': 'Debes seleccionar un congreso.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    # Verificar que el usuario pagó ese congreso
                    cursor.execute("""
                        SELECT 1 FROM pagos p
                        JOIN costos_congreso cc ON cc.id_costos_congreso = p.id_costos
                        JOIN congreso c ON c.id_costos_congreso = cc.id_costos_congreso
                        WHERE p.id_persona = %s AND c.id_congreso = %s
                        LIMIT 1
                    """, [request.user.id_persona, id_congreso])
                    if not cursor.fetchone():
                        return Response({'detail': 'No tienes inscripción pagada en ese congreso.'}, status=status.HTTP_403_FORBIDDEN)

                    # Verificar cuota de ponencias extras filtrado por congreso
                    PONENTE_INCLUDED = 3
                    cursor.execute("SELECT id_ponente FROM ponente WHERE id_persona = %s LIMIT 1", [request.user.id_persona])
                    ponente_row = cursor.fetchone()
                    if ponente_row:
                        id_ponente_check = ponente_row[0]
                        # Contar ponencias del ponente solo en este congreso
                        cursor.execute("""
                            SELECT COUNT(*) FROM ponente_has_ponencia php
                            JOIN ponencia pon ON pon.id_ponencia = php.id_ponencia
                            JOIN ponencia_meta pm ON pm.id_ponencia = pon.id_ponencia
                            WHERE php.id_ponente = %s AND pm.id_congreso = %s
                        """, [id_ponente_check, id_congreso])
                        current_count = int(cursor.fetchone()[0])
                        # Las primeras 3 ponencias están incluidas; solo se cobran extras a partir de la 4a
                        extra_slots_needed = max((current_count + 1) - PONENTE_INCLUDED, 0)
                        if extra_slots_needed > 0:
                            cursor.execute("""
                                SELECT id_costos_congreso FROM congreso WHERE id_congreso = %s LIMIT 1
                            """, [id_congreso])
                            costos_row = cursor.fetchone()
                            costos_id_check = costos_row[0] if costos_row else None
                            cursor.execute("""
                                SELECT COUNT(*) FROM pagos
                                WHERE id_persona = %s
                                  AND id_costos = %s
                                  AND concepto LIKE 'inscripcion_ponente_extra_%%'
                            """, [request.user.id_persona, costos_id_check])
                            paid_extras = int(cursor.fetchone()[0])
                            if paid_extras < extra_slots_needed:
                                return Response(
                                    {'detail': 'Para enviar una ponencia adicional debes pagar la cuota de ponencias extras.', 'redirect': 'pagos'},
                                    status=status.HTTP_402_PAYMENT_REQUIRED
                                )

                    # Resolver id_tipo_trabajo — acepta ID directo o nombre legacy
                    try:
                        id_tipo_trabajo = int(id_tipo_trabajo_raw)
                        cursor.execute("SELECT id_tipo_trabajo FROM tipo_trabajo WHERE id_tipo_trabajo = %s", [id_tipo_trabajo])
                        if not cursor.fetchone():
                            return Response({'detail': 'Tipo de trabajo no válido.'}, status=status.HTTP_400_BAD_REQUEST)
                    except (ValueError, TypeError):
                        first_words = " ".join(str(id_tipo_trabajo_raw).split()[:2])
                        cursor.execute("SELECT id_tipo_trabajo FROM tipo_trabajo WHERE tipo_trabajo ILIKE %s AND id_congreso = %s LIMIT 1", [f"%{first_words}%", id_congreso])
                        tipo_trabajo_row = cursor.fetchone()
                        if not tipo_trabajo_row:
                            cursor.execute("INSERT INTO tipo_trabajo (tipo_trabajo, id_congreso) VALUES (%s, %s) RETURNING id_tipo_trabajo", [str(id_tipo_trabajo_raw), id_congreso])
                            id_tipo_trabajo = cursor.fetchone()[0]
                        else:
                            id_tipo_trabajo = tipo_trabajo_row[0]

                    # Obtener nombre legible del tipo de trabajo
                    cursor.execute("SELECT tipo_trabajo FROM tipo_trabajo WHERE id_tipo_trabajo = %s", [id_tipo_trabajo])
                    tt_row = cursor.fetchone()
                    tipo_trabajo_str = tt_row[0] if tt_row else str(id_tipo_trabajo_raw)

                    # Resolver id_subarea
                    cursor.execute("SELECT id_subareas FROM subareas WHERE nombre ILIKE %s LIMIT 1", [f"%{eje_tematico_nombre}%"])
                    subarea_row = cursor.fetchone()
                    if not subarea_row:
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

                    # Crear archivo de resumen con todo el contenido
                    media_dir = os.path.join(settings.MEDIA_ROOT, 'resumenes')
                    os.makedirs(media_dir, exist_ok=True)
                    safe_titulo = "".join([c if c.isalnum() else "_" for c in titulo])[:50]
                    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                    unique_id = uuid.uuid4().hex[:6]
                    filename = f"resumen_{safe_titulo}_{timestamp}_{unique_id}.txt"
                    filepath = os.path.join(media_dir, filename)
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(f"Título: {titulo}\n")
                        f.write(f"Autor: {autor}\n")
                        f.write(f"Tipo de trabajo: {tipo_trabajo_str}\n")
                        f.write(f"Palabras Clave: {palabras_clave}\n")
                        f.write("-" * 50 + "\n")
                        f.write(resumen_texto)

                    # Registrar archivo en multimedia
                    ruta_relativa = os.path.join('resumenes', filename)
                    cursor.execute("""
                        INSERT INTO multimedia (nombre, ruta_relativa) VALUES (%s, %s) RETURNING id_material
                    """, [titulo, ruta_relativa])
                    id_material = cursor.fetchone()[0]

                    # Crear registro de resumen (solo tracking de estado, contenido va en multimedia)
                    cursor.execute("""
                        INSERT INTO resumen (revisado) VALUES (FALSE) RETURNING id_resumen
                    """)
                    id_resumen = cursor.fetchone()[0]

                    # Crear ponencia sin evento (se publicará cuando sea aceptada)
                    cursor.execute("""
                        INSERT INTO ponencia (tipo_participacion, id_subarea, id_resumen, id_multimedia)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id_ponencia
                    """, [tipo_participacion, id_subarea, id_resumen, id_material])
                    id_ponencia = cursor.fetchone()[0]

                    cursor.execute("""
                        INSERT INTO ponencia_meta (id_ponencia, id_congreso, id_tipo_trabajo)
                        VALUES (%s, %s, %s)
                    """, [id_ponencia, id_congreso, id_tipo_trabajo])

                    # Asegurar que el usuario sea ponente
                    id_persona = request.user.id_persona
                    cursor.execute("SELECT id_ponente FROM ponente WHERE id_persona = %s", [id_persona])
                    ponente_row = cursor.fetchone()
                    if not ponente_row:
                        cursor.execute("INSERT INTO ponente (id_persona) VALUES (%s) RETURNING id_ponente", [id_persona])
                        id_ponente = cursor.fetchone()[0]
                    else:
                        id_ponente = ponente_row[0]

                    cursor.execute("""
                        INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
                        VALUES (%s, %s, FALSE)
                        ON CONFLICT (id_ponente, id_ponencia) DO NOTHING
                    """, [id_ponente, id_ponencia])

                    # Vincular coautores
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
                                        INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
                                        VALUES (%s, %s, FALSE)
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
            return Response({"error": "El usuario no es un participante."}, status=status.HTTP_400_BAD_REQUEST)
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
        if not (request.user.is_staff):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT d.id_dictaminador,
                       TRIM(CONCAT_WS(' ', per.nombre, per.primer_apellido, per.segundo_apellido)),
                       d.id_persona
                FROM dictaminador d
                JOIN persona per ON per.id_persona = d.id_persona
                JOIN dictaminador_congreso dc ON dc.id_persona = d.id_persona AND dc.id_congreso = %s
                ORDER BY per.primer_apellido, per.nombre
            """, [id_congreso])
            data = [{'id_dictaminador': r[0], 'nombre_completo': r[1], 'id_persona': r[2]} for r in cursor.fetchall()]
        return Response(data)


class EvaluadoresDisponiblesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT e.id_evaluador,
                       TRIM(CONCAT_WS(' ', per.nombre, per.primer_apellido, per.segundo_apellido)),
                       e.id_persona
                FROM evaluador e
                JOIN persona per ON per.id_persona = e.id_persona
                JOIN evaluador_congreso ec ON ec.id_persona = e.id_persona AND ec.id_congreso = %s
                ORDER BY per.primer_apellido, per.nombre
            """, [id_congreso])
            data = [{'id_evaluador': r[0], 'nombre_completo': r[1], 'id_persona': r[2]} for r in cursor.fetchall()]
        return Response(data)


class AsignarDictaminadorView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not (request.user.is_staff):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            resumen = Resumen.objects.get(pk=pk)
        except Resumen.DoesNotExist:
            return Response({'detail': 'Resumen no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        if resumen.revisado:
            return Response({'detail': 'No es posible cambiar al dictaminador porque ya realizó la revisión.'}, status=status.HTTP_400_BAD_REQUEST)
        id_dictaminador = request.data.get('id_dictaminador')
        if not id_dictaminador:
            return Response({'detail': 'id_dictaminador es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT po.id_persona
                FROM ponencia p
                JOIN ponente_has_ponencia php ON php.id_ponencia = p.id_ponencia
                JOIN ponente po ON po.id_ponente = php.id_ponente
                WHERE p.id_resumen = %s
            """, [pk])
            ponentes_personas = {row[0] for row in cursor.fetchall()}
            cursor.execute("""
                SELECT id_persona FROM dictaminador WHERE id_dictaminador = %s
            """, [int(id_dictaminador)])
            row = cursor.fetchone()
            if row and row[0] in ponentes_personas:
                return Response(
                    {'detail': 'Un dictaminador no puede revisar su propia ponencia.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        resumen.id_dictaminador_id = id_dictaminador
        resumen.save(update_fields=['id_dictaminador'])
        return Response({'id_resumen': resumen.pk, 'id_dictaminador': id_dictaminador})


class AsignarEvaluadorView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not (request.user.is_staff):
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
        if not (request.user.is_staff):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as c:
            c.execute("""
                SELECT
                    p.id_ponencia,
                    p.id_resumen,
                    COALESCE(mult.nombre, e.nombre_evento, s.nombre, 'Ponencia ' || p.id_ponencia::text) AS titulo,
                    r.id_dictaminador,
                    r.revisado,
                    r.estatus,
                    r.retroalimentacion,
                    CASE WHEN d_per.id_persona IS NOT NULL
                        THEN d_per.nombre || ' ' || d_per.primer_apellido
                        ELSE NULL
                    END AS nombre_dictaminador
                FROM ponencia p
                JOIN ponencia_meta pm ON pm.id_ponencia = p.id_ponencia
                LEFT JOIN evento e ON p.id_evento = e.id_evento
                JOIN resumen r ON p.id_resumen = r.id_resumen
                LEFT JOIN subareas s ON p.id_subarea = s.id_subareas
                LEFT JOIN multimedia mult ON p.id_multimedia = mult.id_material
                LEFT JOIN dictaminador d ON r.id_dictaminador = d.id_dictaminador
                LEFT JOIN persona d_per ON d.id_persona = d_per.id_persona
                WHERE pm.id_congreso = %s
                ORDER BY p.id_ponencia
            """, [id_congreso])
            rows = c.fetchall()
            cols = ['id_ponencia','id_resumen','titulo','id_dictaminador','revisado','estatus','retroalimentacion','nombre_dictaminador']
            ponencias = [dict(zip(cols, row)) for row in rows]

            if not ponencias:
                return Response([])

            ponencia_ids = [p['id_ponencia'] for p in ponencias]
            resumen_ids = [p['id_resumen'] for p in ponencias]

            format_strings = ','.join(['%s'] * len(ponencia_ids))

            c.execute(f"""
                SELECT php.id_ponencia,
                    per.nombre || ' ' || per.primer_apellido,
                    po.id_persona
                FROM ponente_has_ponencia php
                LEFT JOIN ponente po ON php.id_ponente = po.id_ponente
                LEFT JOIN persona per ON po.id_persona = per.id_persona
                WHERE php.id_ponencia IN ({format_strings})
            """, ponencia_ids)
            autores_map = {}
            ponentes_personas_map = {}
            for id_pon, nombre, id_persona in c.fetchall():
                autores_map.setdefault(id_pon, []).append(nombre)
                ponentes_personas_map.setdefault(id_pon, []).append(id_persona)

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
                'ponentes_personas_ids': ponentes_personas_map.get(p['id_ponencia'], []),
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
        if not (request.user.is_staff):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as c:
            c.execute("""
                SELECT
                    p.id_ponencia,
                    p.id_extenso,
                    p.id_subarea,
                    COALESCE(mult.nombre, e.nombre_evento, ext.titulo, 'Ponencia ' || p.id_ponencia::text) AS titulo,
                    ext.ruta_relativa,
                    ext.id_evaluador,
                    ext.id_evaluador_2,
                    ext.id_evaluador_3,
                    ext.revisado,
                    e.tipo_evento AS tipo_ponencia,
                    e.id_congreso,
                    CASE WHEN e1_per.id_persona IS NOT NULL
                        THEN e1_per.nombre || ' ' || e1_per.primer_apellido ELSE NULL
                    END AS nombre_evaluador,
                    CASE WHEN e2_per.id_persona IS NOT NULL
                        THEN e2_per.nombre || ' ' || e2_per.primer_apellido ELSE NULL
                    END AS nombre_evaluador_2,
                    CASE WHEN e3_per.id_persona IS NOT NULL
                        THEN e3_per.nombre || ' ' || e3_per.primer_apellido ELSE NULL
                    END AS nombre_evaluador_3,
                    (p.id_evento IS NOT NULL) AS publicado
                FROM ponencia p
                JOIN ponencia_meta pm ON pm.id_ponencia = p.id_ponencia
                LEFT JOIN evento e ON p.id_evento = e.id_evento
                JOIN extenso ext ON p.id_extenso = ext.id_extenso
                LEFT JOIN multimedia mult ON p.id_multimedia = mult.id_material
                LEFT JOIN evaluador ev1 ON ext.id_evaluador = ev1.id_evaluador
                LEFT JOIN persona e1_per ON ev1.id_persona = e1_per.id_persona
                LEFT JOIN evaluador ev2 ON ext.id_evaluador_2 = ev2.id_evaluador
                LEFT JOIN persona e2_per ON ev2.id_persona = e2_per.id_persona
                LEFT JOIN evaluador ev3 ON ext.id_evaluador_3 = ev3.id_evaluador
                LEFT JOIN persona e3_per ON ev3.id_persona = e3_per.id_persona
                WHERE pm.id_congreso = %s
                ORDER BY p.id_ponencia
            """, [id_congreso])
            cols = ['id_ponencia','id_extenso','id_subarea','titulo','ruta_relativa',
                    'id_evaluador','id_evaluador_2','id_evaluador_3','revisado',
                    'tipo_ponencia','id_congreso',
                    'nombre_evaluador','nombre_evaluador_2','nombre_evaluador_3',
                    'publicado']
            ponencias = [dict(zip(cols, row)) for row in c.fetchall()]

            if not ponencias:
                return Response([])

            ponencia_ids = [p['id_ponencia'] for p in ponencias]
            extenso_ids = [p['id_extenso'] for p in ponencias]

            c.execute("""
                SELECT php.id_ponencia,
                       per.nombre || ' ' || per.primer_apellido,
                       po.id_persona
                FROM ponente_has_ponencia php
                JOIN ponente po ON php.id_ponente = po.id_ponente
                JOIN persona per ON po.id_persona = per.id_persona
                WHERE php.id_ponencia = ANY(%s)
            """, [ponencia_ids])
            autores_map = {}
            ponentes_personas_map = {}
            for id_pon, nombre, id_persona in c.fetchall():
                autores_map.setdefault(id_pon, []).append(nombre)
                ponentes_personas_map.setdefault(id_pon, []).append(id_persona)

            c.execute("""
                SELECT DISTINCT ON (id_extenso, id_evaluador)
                    id_extenso, id_evaluador, estatus, retroalimentacion_general, id_evaluacion
                FROM evaluacion
                WHERE id_extenso = ANY(%s)
                ORDER BY id_extenso, id_evaluador, fecha_de_revision DESC
            """, [extenso_ids])
            evals_map = {}
            all_ev_ids = []
            for id_ext, id_eval, estatus, retro, id_ev in c.fetchall():
                evals_map.setdefault(id_ext, {})[id_eval] = {
                    'id_evaluacion': id_ev,
                    'estatus': estatus,
                    'retro': retro,
                }
                all_ev_ids.append(id_ev)

            criterios_map = {}
            if all_ev_ids:
                c.execute("""
                    SELECT ec.id_evaluacion, rg.nombre_grupo, rc.descripcion, rc.peso, ec.puntaje, ec.comentario_especifico
                    FROM evaluacion_criterio ec
                    JOIN rubrica_criterio rc ON ec.id_criterio = rc.id_criterio
                    JOIN rubrica_grupo rg ON rc.id_grupo = rg.id_grupo
                    WHERE ec.id_evaluacion = ANY(%s)
                    ORDER BY rg.id_grupo, rc.id_criterio
                """, [all_ev_ids])
                for row in c.fetchall():
                    id_ev, nombre_grupo, nombre_criterio, peso, puntaje, comentario = row
                    grupos = criterios_map.setdefault(id_ev, {})
                    grupos.setdefault(nombre_grupo, []).append({
                        'nombre_criterio': nombre_criterio,
                        'peso': float(peso) if peso else None,
                        'puntaje': puntaje,
                        'comentario_especifico': comentario,
                    })

        def _build_evaluacion(id_evaluador, id_extenso, evals_map, criterios_map):
            if not id_evaluador:
                return None
            reviewer_data = evals_map.get(id_extenso, {}).get(id_evaluador)
            if not reviewer_data:
                return None
            id_ev = reviewer_data['id_evaluacion']
            grupos_dict = criterios_map.get(id_ev, {})
            if not grupos_dict:
                return None
            return {
                'estatus': reviewer_data['estatus'],
                'retroalimentacion_general': reviewer_data['retro'],
                'grupos': [{'nombre_grupo': ng, 'criterios': crs} for ng, crs in grupos_dict.items()],
            }

        result = []
        for p in ponencias:
            ev_por_eval = {id_eval: d['estatus'] for id_eval, d in evals_map.get(p['id_extenso'], {}).items()}
            estado_derivado = calcular_estado_extenso(p, ev_por_eval)

            result.append({
                'id': p['id_ponencia'],
                'id_extenso': p['id_extenso'],
                'id_subarea': p['id_subarea'],
                'id_congreso': p['id_congreso'],
                'tipo_ponencia': p['tipo_ponencia'],
                'title': p['titulo'],
                'ruta_extenso': p['ruta_relativa'],
                'autores': autores_map.get(p['id_ponencia'], []),
                'ponentes_personas_ids': ponentes_personas_map.get(p['id_ponencia'], []),
                'asignado': p['id_evaluador'] is not None and p['id_evaluador_2'] is not None,
                'revisado': p['revisado'] or False,
                'aceptado': estado_derivado == 'extenso_aceptado',
                'estado_derivado': estado_derivado,
                'publicado': p['publicado'] or False,
                'id_evaluador': p['id_evaluador'],
                'id_evaluador_2': p['id_evaluador_2'],
                'id_evaluador_3': p['id_evaluador_3'],
                'nombre_evaluador': p['nombre_evaluador'],
                'nombre_evaluador_2': p['nombre_evaluador_2'],
                'nombre_evaluador_3': p['nombre_evaluador_3'],
                'evaluador_1_revisado': p['id_evaluador'] in ev_por_eval if p['id_evaluador'] else False,
                'evaluador_2_revisado': p['id_evaluador_2'] in ev_por_eval if p['id_evaluador_2'] else False,
                'evaluacion_1': _build_evaluacion(p['id_evaluador'], p['id_extenso'], evals_map, criterios_map),
                'evaluacion_2': _build_evaluacion(p['id_evaluador_2'], p['id_extenso'], evals_map, criterios_map),
            })
        return Response(result)


class MisResumenesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from users.models import Dictaminador
        dictaminador = Dictaminador.objects.filter(id_persona=request.user).first()
        if not dictaminador:
            return Response([])
        with connection.cursor() as c:
            c.execute("""
                SELECT p.id_ponencia, p.id_resumen,
                       COALESCE(mult.nombre, e.nombre_evento, s.nombre, 'Ponencia ' || p.id_ponencia::text) AS titulo,
                       r.revisado, r.estatus, cong.nombre_congreso,
                       COALESCE(e.id_congreso, pm.id_congreso) AS id_congreso
                FROM ponencia p
                JOIN ponencia_meta pm ON pm.id_ponencia = p.id_ponencia
                LEFT JOIN evento e ON p.id_evento = e.id_evento
                JOIN congreso cong ON cong.id_congreso = COALESCE(e.id_congreso, pm.id_congreso)
                JOIN resumen r ON p.id_resumen = r.id_resumen
                LEFT JOIN subareas s ON p.id_subarea = s.id_subareas
                LEFT JOIN multimedia mult ON p.id_multimedia = mult.id_material
                WHERE r.id_dictaminador = %s
                ORDER BY r.revisado, p.id_ponencia
            """, [dictaminador.id_dictaminador])
            rows = c.fetchall()
            result = []
            for id_ponencia, id_resumen, titulo, revisado, estatus, nombre_congreso, id_congreso in rows:
                c.execute("SELECT id_dictamen FROM dictamen_resumen WHERE id_resumen = %s LIMIT 1", [id_resumen])
                dr = c.fetchone()
                result.append({
                    'id': id_ponencia,
                    'id_resumen': id_resumen,
                    'titulo': titulo,
                    'revisado': revisado or False,
                    'estatus': estatus,
                    'congreso': nombre_congreso,
                    'id_congreso': id_congreso,
                    'tiene_dictamen': dr is not None,
                })
        return Response(result)


class MisExtensosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from users.models import Evaluador
        evaluador = Evaluador.objects.filter(id_persona=request.user).first()
        if not evaluador:
            return Response([])
        eid = evaluador.id_evaluador
        with connection.cursor() as c:
            c.execute("""
                SELECT p.id_ponencia, p.id_extenso,
                       COALESCE(mult.nombre, e.nombre_evento, ext.titulo, 'Ponencia ' || p.id_ponencia::text) AS titulo,
                       ext.ruta_relativa,
                       ext.revisado, cong.nombre_congreso,
                       COALESCE(e.id_congreso, pm.id_congreso) AS id_congreso,
                       ev.id_evaluacion, ev.estatus AS estatus_evaluacion
                FROM ponencia p
                JOIN ponencia_meta pm ON pm.id_ponencia = p.id_ponencia
                LEFT JOIN evento e ON p.id_evento = e.id_evento
                JOIN congreso cong ON cong.id_congreso = COALESCE(e.id_congreso, pm.id_congreso)
                JOIN extenso ext ON p.id_extenso = ext.id_extenso
                LEFT JOIN multimedia mult ON p.id_multimedia = mult.id_material
                LEFT JOIN evaluacion ev ON ev.id_extenso = ext.id_extenso AND ev.id_evaluador = %s
                WHERE ext.id_evaluador = %s OR ext.id_evaluador_2 = %s OR ext.id_evaluador_3 = %s
                ORDER BY ev.id_evaluacion NULLS FIRST, p.id_ponencia
            """, [eid, eid, eid, eid])
            rows = c.fetchall()
            result = []
            seen = set()
            for id_ponencia, id_extenso, titulo, ruta_relativa, revisado, nombre_congreso, id_congreso, id_evaluacion, estatus_evaluacion in rows:
                if id_extenso in seen:
                    continue
                seen.add(id_extenso)
                result.append({
                    'id': id_ponencia,
                    'id_extenso': id_extenso,
                    'titulo': titulo,
                    'ruta_extenso': ruta_relativa,
                    'revisado': id_evaluacion is not None,
                    'tiene_evaluacion': id_evaluacion is not None,
                    'estatus_evaluacion': estatus_evaluacion,
                    'congreso': nombre_congreso,
                    'id_congreso': id_congreso,
                })
        return Response(result)


class RubricaExtensoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        with connection.cursor() as c:
            c.execute("SELECT ruta_relativa, titulo FROM extenso WHERE id_extenso = %s", [pk])
            ext_row = c.fetchone()
            ruta_extenso = ext_row[0] if ext_row else None
            titulo_extenso = ext_row[1] if ext_row else None

            c.execute("""
                SELECT rg.id_grupo, rg.nombre_grupo, rc.id_criterio, rc.descripcion, rc.peso
                FROM ponencia p
                JOIN ponencia_meta pm ON pm.id_ponencia = p.id_ponencia
                LEFT JOIN evento e ON p.id_evento = e.id_evento
                JOIN rubrica r ON r.tipo_trabajo = COALESCE(e.id_tipo_trabajo, pm.id_tipo_trabajo)
                             AND r.id_congreso   = COALESCE(e.id_congreso,    pm.id_congreso)
                JOIN rubrica_grupo rg ON rg.id_rubrica = r.id_rubrica
                JOIN rubrica_criterio rc ON rc.id_grupo = rg.id_grupo
                WHERE p.id_extenso = %s
                ORDER BY rg.id_grupo, rc.id_criterio
            """, [pk])
            rows = c.fetchall()
        grupos = {}
        for id_grupo, nombre_grupo, id_criterio, descripcion, peso in rows:
            if id_grupo not in grupos:
                grupos[id_grupo] = {'id_grupo': id_grupo, 'nombre_grupo': nombre_grupo, 'criterios': []}
            grupos[id_grupo]['criterios'].append({
                'id_criterio': id_criterio,
                'descripcion': descripcion,
                'peso': float(peso) if peso else 1.0,
            })
        return Response({
            'grupos': list(grupos.values()),
            'ruta_extenso': ruta_extenso,
            'titulo_extenso': titulo_extenso,
        })


class PreguntasResumenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        with connection.cursor() as c:
            c.execute("""
                SELECT dp.id_pregunta, dp.descripcion
                FROM ponencia p
                JOIN ponencia_meta pm ON pm.id_ponencia = p.id_ponencia
                LEFT JOIN evento e ON p.id_evento = e.id_evento
                JOIN dictamen d ON d.tipo_trabajo = COALESCE(e.id_tipo_trabajo, pm.id_tipo_trabajo)
                JOIN dictamen_pregunta dp ON dp.id_dictamen = d.id_dictamen
                WHERE p.id_resumen = %s
                ORDER BY dp.id_pregunta
            """, [pk])
            rows = c.fetchall()
        if not rows:
            return Response({'detail': 'Sin preguntas configuradas.'}, status=status.HTTP_404_NOT_FOUND)
        return Response([{'id_pregunta': r[0], 'descripcion': r[1]} for r in rows])


class EnviarEvaluacionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        from users.models import Evaluador
        evaluador = Evaluador.objects.filter(id_persona=request.user).first()
        if not evaluador:
            return Response({'detail': 'No eres evaluador.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            extenso = Extenso.objects.get(pk=pk)
        except Extenso.DoesNotExist:
            return Response({'detail': 'Extenso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        if extenso.revisado:
            return Response({'detail': 'El extenso ya fue revisado definitivamente.'}, status=status.HTTP_400_BAD_REQUEST)

        eid = evaluador.id_evaluador
        r1 = extenso.id_evaluador_id
        r2 = extenso.id_evaluador_2_id
        r3 = extenso.id_evaluador_3_id

        if eid not in [r for r in [r1, r2, r3] if r]:
            return Response({'detail': 'No estás asignado a este extenso.'}, status=status.HTTP_403_FORBIDDEN)

        criterios = request.data.get('criterios', [])
        retroalimentacion = request.data.get('retroalimentacion_general', '')
        estatus_ev = request.data.get('estatus', 'aceptado')
        with connection.cursor() as c:
            c.execute("""
                INSERT INTO evaluacion (id_extenso, id_evaluador, retroalimentacion_general, estatus)
                VALUES (%s, %s, %s, %s) RETURNING id_evaluacion
            """, [pk, eid, retroalimentacion, estatus_ev])
            id_evaluacion = c.fetchone()[0]
            for criterio in criterios:
                c.execute("""
                    INSERT INTO evaluacion_criterio (id_evaluacion, id_criterio, puntaje, comentario_especifico)
                    VALUES (%s, %s, %s, %s)
                """, [id_evaluacion, criterio['id_criterio'], criterio['puntaje'], criterio.get('comentario', '')])
            _finalizar_extenso_si_procede(c, pk, eid, r1, r2, r3, estatus_actual=estatus_ev)
        return Response({'id_evaluacion': id_evaluacion}, status=status.HTTP_201_CREATED)


class EnviarDictamenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        from users.models import Dictaminador
        dictaminador = Dictaminador.objects.filter(id_persona=request.user).first()
        if not dictaminador:
            return Response({'detail': 'No eres dictaminador.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            Resumen.objects.get(pk=pk)
        except Resumen.DoesNotExist:
            return Response({'detail': 'Resumen no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        respuestas = request.data.get('respuestas', [])
        retroalimentacion = request.data.get('retroalimentacion_general', '')
        estatus_dict = request.data.get('estatus', 'aceptado')
        with connection.cursor() as c:
            c.execute("""
                INSERT INTO dictamen_resumen (id_resumen, id_dictaminador, retroalimentacion_general, estatus)
                VALUES (%s, %s, %s, %s) RETURNING id_dictamen
            """, [pk, dictaminador.id_dictaminador, retroalimentacion, estatus_dict])
            id_dictamen = c.fetchone()[0]
            for resp in respuestas:
                c.execute("""
                    INSERT INTO evaluacion_pregunta (id_dictamen, id_pregunta, cumplio, comentario_especifico)
                    VALUES (%s, %s, %s, %s)
                """, [id_dictamen, resp['id_pregunta'], resp['cumplio'], resp.get('comentario', '')])
            c.execute("UPDATE resumen SET revisado = TRUE, estatus = %s WHERE id_resumen = %s", [estatus_dict, pk])
        return Response({'id_dictamen': id_dictamen}, status=status.HTTP_201_CREATED)


class AsignarEvaluadoresView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not (request.user.is_staff):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_evaluador = request.data.get('id_evaluador')
        id_evaluador_2 = request.data.get('id_evaluador_2')
        if not id_evaluador or not id_evaluador_2:
            return Response({'detail': 'id_evaluador e id_evaluador_2 son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
        if int(id_evaluador) == int(id_evaluador_2):
            return Response({'detail': 'El Revisor 1 y el Revisor 2 no pueden ser la misma persona.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            extenso = Extenso.objects.get(pk=pk)
        except Extenso.DoesNotExist:
            return Response({'detail': 'Extenso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        if extenso.revisado:
            return Response({'detail': 'No es posible cambiar a los revisores porque ya realizaron su revisión.'}, status=status.HTTP_400_BAD_REQUEST)
        existing = [e for e in [extenso.id_evaluador_id, extenso.id_evaluador_2_id] if e]
        if existing:
            with connection.cursor() as c:
                c.execute("SELECT 1 FROM evaluacion WHERE id_extenso = %s AND id_evaluador = ANY(%s) LIMIT 1", [pk, existing])
                if c.fetchone():
                    return Response({'detail': 'No es posible cambiar a los revisores porque ya realizaron su revisión.'}, status=status.HTTP_400_BAD_REQUEST)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT po.id_persona
                FROM ponencia p
                JOIN ponente_has_ponencia php ON php.id_ponencia = p.id_ponencia
                JOIN ponente po ON po.id_ponente = php.id_ponente
                WHERE p.id_extenso = %s
            """, [pk])
            ponentes_personas = {row[0] for row in cursor.fetchall()}
            cursor.execute("""
                SELECT id_evaluador, id_persona FROM evaluador
                WHERE id_evaluador = ANY(%s)
            """, [[int(id_evaluador), int(id_evaluador_2)]])
            for eval_id, id_persona in cursor.fetchall():
                if id_persona in ponentes_personas:
                    return Response(
                        {'detail': 'Un evaluador no puede revisar su propia ponencia.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        extenso.id_evaluador_id = id_evaluador
        extenso.id_evaluador_2_id = id_evaluador_2
        extenso.save(update_fields=['id_evaluador', 'id_evaluador_2'])
        return Response({'id_extenso': pk, 'id_evaluador': id_evaluador, 'id_evaluador_2': id_evaluador_2})


class AsignarEvaluador3View(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not (request.user.is_staff):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_evaluador_3 = request.data.get('id_evaluador_3')
        if not id_evaluador_3:
            return Response({'detail': 'id_evaluador_3 es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            extenso = Extenso.objects.get(pk=pk)
        except Extenso.DoesNotExist:
            return Response({'detail': 'Extenso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        with connection.cursor() as c:
            c.execute("""
                SELECT DISTINCT ON (id_evaluador) id_evaluador, estatus
                FROM evaluacion
                WHERE id_extenso = %s AND id_evaluador = ANY(%s)
                ORDER BY id_evaluador, fecha_de_revision DESC
            """, [pk, [extenso.id_evaluador_id, extenso.id_evaluador_2_id]])
            evals = {row[0]: row[1] for row in c.fetchall()}

        r1, r2 = extenso.id_evaluador_id, extenso.id_evaluador_2_id
        if not r1 or not r2 or r1 not in evals or r2 not in evals:
            return Response({'detail': 'Ambos revisores deben haber evaluado antes de asignar un tercero.'}, status=status.HTTP_400_BAD_REQUEST)

        s1, s2 = evals[r1], evals[r2]
        if (s1 == 'rechazado') == (s2 == 'rechazado'):
            return Response({'detail': 'No hay desacuerdo entre los revisores.'}, status=status.HTTP_400_BAD_REQUEST)

        extenso.id_evaluador_3_id = id_evaluador_3
        extenso.save(update_fields=['id_evaluador_3'])
        return Response({'id_extenso': pk, 'id_evaluador_3': id_evaluador_3})


class EstatusPonenteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        with connection.cursor() as c:
            c.execute("SELECT id_ponente FROM ponente WHERE id_persona = %s", [request.user.pk])
            row = c.fetchone()
            if not row:
                return Response([])
            id_ponente = row[0]

            c.execute("""
                SELECT DISTINCT
                    p.id_ponencia,
                    COALESCE(mult.nombre, e.nombre_evento, s.nombre, 'Ponencia ' || p.id_ponencia::text) AS titulo,
                    e.tipo_evento AS tipo_ponencia,
                    p.id_resumen,
                    r.revisado AS resumen_revisado,
                    r.estatus AS resumen_estatus,
                    r.retroalimentacion AS resumen_retroalimentacion,
                    p.id_extenso,
                    p.id_evento,
                    ext.revisado AS extenso_revisado,
                    ext.id_evaluador,
                    ext.id_evaluador_2,
                    ext.id_evaluador_3,
                    e.nombre_evento,
                    e.fecha_hora_inicio,
                    e.fecha_hora_final,
                    e.sinopsis,
                    e.cupos,
                    e.enlace,
                    cong.nombre_congreso,
                    p.tipo_participacion,
                    m.nombre AS lugar,
                    ttf.ruta_formato,
                    pm.enlace_multimedia
                FROM ponente_has_ponencia php
                JOIN ponencia p ON php.id_ponencia = p.id_ponencia
                LEFT JOIN ponencia_meta pm ON pm.id_ponencia = p.id_ponencia
                LEFT JOIN evento e ON p.id_evento = e.id_evento
                LEFT JOIN mesas_trabajo m ON e.id_mesas_trabajo = m.id_mesas_trabajo
                LEFT JOIN multimedia mult ON p.id_multimedia = mult.id_material
                LEFT JOIN congreso cong ON COALESCE(e.id_congreso, pm.id_congreso) = cong.id_congreso
                LEFT JOIN subareas s ON p.id_subarea = s.id_subareas
                LEFT JOIN resumen r ON p.id_resumen = r.id_resumen
                LEFT JOIN extenso ext ON p.id_extenso = ext.id_extenso
                LEFT JOIN tipo_trabajo_formato ttf ON COALESCE(e.id_tipo_trabajo, pm.id_tipo_trabajo) = ttf.id_tipo_trabajo
                WHERE php.id_ponente = %s
                ORDER BY p.id_ponencia
            """, [id_ponente])
            cols = ['id_ponencia','titulo','tipo_ponencia','id_resumen','resumen_revisado',
                    'resumen_estatus','resumen_retroalimentacion','id_extenso','id_evento','extenso_revisado',
                    'id_evaluador','id_evaluador_2','id_evaluador_3',
                    'nombre_evento','fecha_hora_inicio','fecha_hora_final','sinopsis','cupos','enlace','nombre_congreso','tipo_participacion','lugar','ruta_formato','enlace_multimedia']
            ponencias = [dict(zip(cols, row)) for row in c.fetchall()]

            if not ponencias:
                return Response([])

            extenso_ids = [p['id_extenso'] for p in ponencias if p['id_extenso']]
            evals_map = {}
            criterios_mods_map = {}
            if extenso_ids:
                c.execute("""
                    SELECT DISTINCT ON (id_extenso, id_evaluador) id_extenso, id_evaluador, estatus, retroalimentacion_general
                    FROM evaluacion
                    WHERE id_extenso = ANY(%s)
                    ORDER BY id_extenso, id_evaluador, fecha_de_revision DESC
                """, [extenso_ids])
                for id_ext, id_eval, estatus, retro in c.fetchall():
                    if id_ext not in evals_map:
                        evals_map[id_ext] = {'por_eval': {}, 'retroalimentacion': None}
                    evals_map[id_ext]['por_eval'][id_eval] = estatus
                    if estatus in _MODS:
                        evals_map[id_ext]['retroalimentacion'] = retro

                c.execute("""
                    WITH latest_mods AS (
                        SELECT DISTINCT ON (id_extenso) id_extenso, id_evaluacion
                        FROM evaluacion
                        WHERE id_extenso = ANY(%s) AND estatus::text = ANY(%s)
                        ORDER BY id_extenso, fecha_de_revision DESC
                    )
                    SELECT lm.id_extenso, rc.descripcion, ec.comentario_especifico
                    FROM latest_mods lm
                    JOIN evaluacion_criterio ec ON ec.id_evaluacion = lm.id_evaluacion
                    JOIN rubrica_criterio rc ON ec.id_criterio = rc.id_criterio
                    WHERE ec.comentario_especifico IS NOT NULL AND TRIM(ec.comentario_especifico) != ''
                    ORDER BY lm.id_extenso, rc.id_criterio
                """, [extenso_ids, list(_MODS)])
                for id_ext, descripcion, comentario in c.fetchall():
                    criterios_mods_map.setdefault(id_ext, []).append({
                        'criterio': descripcion,
                        'comentario': comentario,
                    })

        result = []
        for p in ponencias:
            if not p['id_resumen']:
                continue
            resumen_revisado = p['resumen_revisado'] or False
            if not resumen_revisado:
                estado = 'pendiente_dictaminacion'
                retroalimentacion = None
            elif p['resumen_estatus'] == 'rechazado':
                estado = 'resumen_rechazado'
                retroalimentacion = p['resumen_retroalimentacion']
            elif not p['id_extenso']:
                estado = 'pendiente_extenso'
                retroalimentacion = None
            else:
                ext_data = {
                    'id_evaluador': p['id_evaluador'],
                    'id_evaluador_2': p['id_evaluador_2'],
                    'id_evaluador_3': p['id_evaluador_3'],
                    'revisado': p['extenso_revisado'] or False,
                }
                ev_map = evals_map.get(p['id_extenso'], {}).get('por_eval', {})
                estado = calcular_estado_extenso(ext_data, ev_map)
                if estado == 'desacuerdo':
                    estado = 'en_revision'
                retroalimentacion = evals_map.get(p['id_extenso'], {}).get('retroalimentacion')

            fecha_inicio = p['fecha_hora_inicio']
            fecha_fin = p['fecha_hora_final']
            result.append({
                'id_ponencia': p['id_ponencia'],
                'id_evento': p['id_evento'],
                'titulo': p['titulo'],
                'tipo_ponencia': p['tipo_ponencia'],
                'estado': estado,
                'publicado': p['id_evento'] is not None,
                'retroalimentacion': retroalimentacion,
                'criterio_comentarios': criterios_mods_map.get(p['id_extenso'], []) if estado == 'con_modificaciones' else [],
                'id_resumen': p['id_resumen'],
                'id_extenso': p['id_extenso'],
                'tipo_participacion': p['tipo_participacion'],
                'ruta_formato': p['ruta_formato'],
                'enlace_multimedia': p['enlace_multimedia'],
                'evento': {
                    'nombre': p['nombre_evento'],
                    'fecha_inicio': fecha_inicio.isoformat() if fecha_inicio else None,
                    'fecha_fin': fecha_fin.isoformat() if fecha_fin else None,
                    'sinopsis': p['sinopsis'],
                    'cupos': p['cupos'],
                    'enlace': p['enlace'],
                    'congreso': p['nombre_congreso'],
                    'lugar': p['lugar'],
                },
            })
        return Response(result)


class SubirExtensoAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, id_resumen):
        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response({'detail': 'Se requiere un archivo.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT p.id_ponencia, p.id_extenso, s.nombre
                        FROM ponencia p
                        JOIN ponente_has_ponencia php ON php.id_ponencia = p.id_ponencia
                        JOIN ponente po ON po.id_ponente = php.id_ponente
                        LEFT JOIN subareas s ON p.id_subarea = s.id_subareas
                        WHERE p.id_resumen = %s AND po.id_persona = %s
                        LIMIT 1
                    """, [id_resumen, request.user.id_persona])
                    row = cursor.fetchone()
                    if not row:
                        return Response({'detail': 'No autorizado o resumen no encontrado.'}, status=status.HTTP_403_FORBIDDEN)
                    id_ponencia, id_extenso_existente, subarea_nombre = row
                    
                    titulo = subarea_nombre if subarea_nombre else f"Extenso de Ponencia {id_ponencia}"

                    media_dir = os.path.join(settings.MEDIA_ROOT, 'extensos')
                    os.makedirs(media_dir, exist_ok=True)
                    safe = "".join(c if c.isalnum() else "_" for c in titulo)[:50]
                    ts = datetime.now().strftime("%Y%m%d%H%M%S")
                    uid = uuid.uuid4().hex[:6]
                    ext = os.path.splitext(archivo.name)[1].lower() or '.pdf'
                    filename = f"extenso_{safe}_{ts}_{uid}{ext}"
                    filepath = os.path.join(media_dir, filename)
                    with open(filepath, 'wb+') as dest:
                        for chunk in archivo.chunks():
                            dest.write(chunk)
                    ruta_relativa = os.path.join('extensos', filename)

                    if id_extenso_existente:
                        cursor.execute("""
                            UPDATE extenso
                            SET titulo = %s, ruta_relativa = %s, fecha_subida = NOW(),
                                revisado = FALSE, version_numero = version_numero + 1
                            WHERE id_extenso = %s
                        """, [titulo, ruta_relativa, id_extenso_existente])
                        id_extenso = id_extenso_existente
                    else:
                        cursor.execute("""
                            INSERT INTO extenso (titulo, ruta_relativa, revisado, version_numero)
                            VALUES (%s, %s, FALSE, 1) RETURNING id_extenso
                        """, [titulo, ruta_relativa])
                        id_extenso = cursor.fetchone()[0]
                        cursor.execute("""
                            UPDATE ponencia SET id_extenso = %s WHERE id_ponencia = %s
                        """, [id_extenso, id_ponencia])

            return Response({'detail': 'Extenso subido correctamente.', 'id_extenso': id_extenso}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PonenciaMagistralViewSet(viewsets.ModelViewSet):
    serializer_class = PonenciaMagistralSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = PonenciaMagistral.objects.all().select_related('id_subarea', 'id_congreso', 'id_congreso__id_institucion').prefetch_related('ponentes')
        id_congreso = self.request.query_params.get('id_congreso')
        if id_congreso:
            queryset = queryset.filter(id_congreso_id=id_congreso)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = PonenciaMagistralCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(PonenciaMagistralSerializer(instance).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    tipo_p = str(data.get('tipo_participacion', instance.tipo_participacion)).lower()
                    if 'híbrido' in tipo_p or 'hibrido' in tipo_p:
                        tipo_p = 'hibrida'

                    cursor.execute("""
                        UPDATE ponencia_magistral SET
                            titulo = %s, tipo_participacion = %s, id_subarea = %s,
                            fecha_inicio = %s, fecha_fin = %s, enlace_multimedia = %s
                        WHERE id_ponencia_magistral = %s
                    """, [
                        data.get('titulo', instance.titulo),
                        tipo_p,
                        data.get('id_subarea', instance.id_subarea_id),
                        data.get('fecha_inicio', instance.fecha_inicio),
                        data.get('fecha_fin', instance.fecha_fin),
                        data.get('enlace_multimedia', instance.enlace_multimedia or ''),
                        instance.id_ponencia_magistral
                    ])

                    # Rebuild ponentes
                    cursor.execute("DELETE FROM ponencia_magistral_has_ponente_magistral WHERE id_ponencia_magistral = %s", [instance.id_ponencia_magistral])

                    ponente_principal = data.get('ponente_principal', '').strip()
                    if ponente_principal:
                        cursor.execute("""
                            INSERT INTO ponencia_magistral_has_ponente_magistral
                            (id_ponencia_magistral, nombre_persona, es_principal)
                            VALUES (%s, %s, TRUE)
                        """, [instance.id_ponencia_magistral, ponente_principal])

                    coautores = data.get('coautores', [])
                    for nombre in coautores:
                        nombre = nombre.strip() if isinstance(nombre, str) else str(nombre).strip()
                        if nombre:
                            cursor.execute("""
                                INSERT INTO ponencia_magistral_has_ponente_magistral
                                (id_ponencia_magistral, nombre_persona, es_principal)
                                VALUES (%s, %s, FALSE)
                            """, [instance.id_ponencia_magistral, nombre])

                instance.refresh_from_db()
                return Response(PonenciaMagistralSerializer(instance).data)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute("DELETE FROM ponencia_magistral_has_ponente_magistral WHERE id_ponencia_magistral = %s", [instance.id_ponencia_magistral])
                    cursor.execute("DELETE FROM ponencia_magistral WHERE id_ponencia_magistral = %s", [instance.id_ponencia_magistral])
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PonentesNombresView(APIView):
    """Retorna lista de nombres de personas para autocompletado y sin repetidos (útil para el administrador)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT DISTINCT TRIM(CONCAT_WS(' ', nombre, primer_apellido, segundo_apellido))
                FROM persona
                WHERE nombre IS NOT NULL
                ORDER BY 1
            """)
            nombres = [row[0] for row in cursor.fetchall() if row[0]]
        return Response(nombres)


class PublicarPonenciaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.id_ponencia, p.id_extenso, p.id_evento,
                       pm.id_congreso, pm.id_tipo_trabajo,
                       COALESCE(mult.nombre, ext.titulo, 'Ponencia ' || p.id_ponencia::text) AS titulo,
                       ext.revisado
                FROM ponencia p
                JOIN ponencia_meta pm ON pm.id_ponencia = p.id_ponencia
                JOIN extenso ext ON p.id_extenso = ext.id_extenso
                LEFT JOIN multimedia mult ON p.id_multimedia = mult.id_material
                WHERE p.id_extenso = %s
            """, [pk])
            row = cursor.fetchone()
            if not row:
                return Response({'detail': 'Extenso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

            id_ponencia, id_extenso, id_evento_existente, id_congreso, id_tipo_trabajo, titulo, revisado = row

            if id_evento_existente:
                return Response({'detail': 'Esta ponencia ya fue publicada.'}, status=status.HTTP_400_BAD_REQUEST)

            if not revisado:
                return Response({'detail': 'El extenso aún no ha sido marcado como revisado.'}, status=status.HTTP_400_BAD_REQUEST)

            # Read event fields from form data; fall back to congress dates if missing
            fecha_inicio = request.data.get('fecha_hora_inicio') or None
            fecha_fin = request.data.get('fecha_hora_final') or None

            if not fecha_inicio or not fecha_fin:
                cursor.execute("""
                    SELECT fc.fecha_inicio_evento, fc.fecha_final_evento
                    FROM congreso c
                    JOIN fechas_congreso fc ON c.id_fechas_congreso = fc.id_fechas_congreso
                    WHERE c.id_congreso = %s
                """, [id_congreso])
                dates_row = cursor.fetchone()
                if not fecha_inicio:
                    fecha_inicio = dates_row[0] if dates_row else None
                if not fecha_fin:
                    fecha_fin = dates_row[1] if dates_row else None

            try:
                cupos = int(request.data.get('cupos', 0) or 0)
            except (ValueError, TypeError):
                cupos = 0
            sinopsis = request.data.get('sinopsis', '') or ''
            enlace = request.data.get('enlace', '') or ''
            id_mesas_trabajo = request.data.get('id_mesas_trabajo') or None
            tipo_participacion = str(request.data.get('tipo_participacion', 'presencial') or 'presencial').lower()

            with transaction.atomic():
                cursor.execute("""
                    INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo,
                                        id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final,
                                        sinopsis, cupos, enlace)
                    VALUES (%s, %s, 'ponencia', %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id_evento
                """, [id_congreso, titulo, id_tipo_trabajo, id_mesas_trabajo,
                      fecha_inicio, fecha_fin, sinopsis, cupos, enlace])
                id_evento = cursor.fetchone()[0]

                cursor.execute(
                    "UPDATE ponencia SET id_evento = %s, tipo_participacion = %s WHERE id_ponencia = %s",
                    [id_evento, tipo_participacion, id_ponencia]
                )

        return Response({'detail': 'Ponencia publicada correctamente.', 'id_evento': id_evento}, status=status.HTTP_201_CREATED)


class ActualizarEnlacePonenciaView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        enlace = request.data.get('enlace', '').strip()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.id_evento
                FROM ponencia p
                JOIN ponente_has_ponencia php ON php.id_ponencia = p.id_ponencia
                JOIN ponente po ON po.id_ponente = php.id_ponente
                WHERE p.id_ponencia = %s AND po.id_persona = %s
                LIMIT 1
            """, [pk, request.user.pk])
            row = cursor.fetchone()
            if not row:
                return Response({'detail': 'Ponencia no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
            id_evento = row[0]
            if not id_evento:
                return Response({'detail': 'La ponencia aún no ha sido publicada.'}, status=status.HTTP_400_BAD_REQUEST)
            cursor.execute(
                "UPDATE ponencia_meta SET enlace_multimedia = %s WHERE id_ponencia = %s",
                [enlace, pk]
            )
        return Response({'detail': 'Enlace actualizado.', 'enlace': enlace})
