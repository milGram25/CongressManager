from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.files.storage import FileSystemStorage
from django.db import connection, IntegrityError
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Persona, Asistente, Dictaminador, Evaluador, Ponente, Factura, Constancia, HistorialAcciones, DictaminadorCongreso, EvaluadorCongreso
from .serializers import RegisterSerializer, UserSerializer, ParticipantSerializer, FacturaSerializer, ConstanciaSerializer, HistorialAccionesSerializer
import os
import random
import string


def _get_rol_persona(persona):
    if DictaminadorCongreso.objects.filter(id_persona=persona).exists():
        return 'Dictaminador'
    if EvaluadorCongreso.objects.filter(id_persona=persona).exists():
        return 'Evaluador'
    try:
        persona.ponente
        return 'Ponente'
    except Exception:
        pass
    return 'Participante'


def _get_all_roles_persona(persona, id_congreso=None):
    roles = []
    dc_filter = {'id_persona': persona}
    ec_filter = {'id_persona': persona}
    if id_congreso:
        dc_filter['id_congreso_id'] = id_congreso
        ec_filter['id_congreso_id'] = id_congreso
    if DictaminadorCongreso.objects.filter(**dc_filter).exists():
        roles.append('Dictaminador')
    if EvaluadorCongreso.objects.filter(**ec_filter).exists():
        roles.append('Evaluador')
    try:
        persona.ponente
        roles.append('Ponente')
    except Exception:
        pass
    try:
        persona.asistente
        roles.append('Asistente')
    except Exception:
        pass
    if not roles:
        roles.append('Asistente')
    return roles


class UserActionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tipo = request.query_params.get('tipo', 'general')

        if tipo == 'facturas':
            items = Factura.objects.filter(estatus='enviada').order_by('-fecha_envio').select_related('id_persona', 'id_congreso')
            data = [{
                'id': f"inv-{f.id_factura}",
                'nombre': f"{f.id_persona.nombre} {f.id_persona.primer_apellido}",
                'fecha': f.fecha_envio.strftime("%Y-%m-%d %H:%M:%S") if f.fecha_envio else "",
                'rol': 'Participante',
                'accion': 'emisión de factura',
                'congreso': f.id_congreso.nombre_congreso if f.id_congreso else '',
                'rfc': f.rfc or '',
                'razon_social': f.razon_social or '',
                'archivo': f.ruta_pdf_xml or '',
                'archivo_xml': f.ruta_xml or '',
            } for f in items]
            return Response(data)

        if tipo == 'constancias':
            items = Constancia.objects.filter(estatus='enviada').order_by('-fecha_emision').select_related('id_persona')
            data = [{
                'id': f"const-{c.id_constancia}",
                'nombre': f"{c.id_persona.nombre} {c.id_persona.primer_apellido}",
                'fecha': c.fecha_emision.strftime("%Y-%m-%d %H:%M:%S") if c.fecha_emision else "",
                'rol': c.tipo_constancia or 'Participante',
                'accion': 'emisión de constancia',
                'congreso': c.id_congreso.nombre_congreso if c.id_congreso else '',
                'archivo': c.ruta_constancia or '',
            } for c in items]
            return Response(data)

        items = HistorialAcciones.objects.all().order_by('-fecha_accion').select_related('id_persona')
        data = [{
            'id': h.id_historial_acciones,
            'nombre': f"{h.id_persona.nombre} {h.id_persona.primer_apellido}",
            'fecha': h.fecha_accion.strftime("%Y-%m-%d %H:%M:%S"),
            'rol': h.rol,
            'accion': h.accion
        } for h in items]
        return Response(data)


def _get_congress_participant_ids(id_congreso):
    """Return set of persona PKs enrolled in the given congress."""
    enrolled = set()
    with connection.cursor() as cursor:
        # Asistentes inscribed to any event of this congress
        cursor.execute("""
            SELECT DISTINCT a.id_persona
            FROM asistente a
            JOIN asistente_evento ae ON a.id_asistente = ae.id_asistente
            JOIN evento e ON ae.id_evento = e.id_evento
            WHERE e.id_congreso = %s
        """, [id_congreso])
        enrolled |= {r[0] for r in cursor.fetchall()}

        # Ponentes who presented at this congress
        cursor.execute("""
            SELECT DISTINCT p.id_persona
            FROM ponente p
            JOIN ponente_has_ponencia php ON p.id_ponente = php.id_ponente
            JOIN ponencia po ON php.id_ponencia = po.id_ponencia
            JOIN evento e ON po.id_evento = e.id_evento
            WHERE e.id_congreso = %s
        """, [id_congreso])
        enrolled |= {r[0] for r in cursor.fetchall()}

        # Users who paid for this congress (may not be in any event yet)
        cursor.execute("""
            SELECT DISTINCT p.id_persona
            FROM pagos p
            JOIN costos_congreso cc ON cc.id_costos_congreso = p.id_costos
            JOIN congreso c ON c.id_costos_congreso = cc.id_costos_congreso
            WHERE c.id_congreso = %s
        """, [id_congreso])
        enrolled |= {r[0] for r in cursor.fetchall()}

    # Committee members (global + congress-specific)
    enrolled |= set(Dictaminador.objects.values_list('id_persona_id', flat=True))
    enrolled |= set(Evaluador.objects.values_list('id_persona_id', flat=True))
    enrolled |= set(DictaminadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True))
    enrolled |= set(EvaluadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True))

    return enrolled


class ParticipantsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        id_congreso = request.query_params.get('id_congreso')
        rol_filter = request.query_params.get('rol', '').lower()
        institucion = request.query_params.get('institucion', '').strip()

        users = Persona.objects.filter(is_staff=False, is_superuser=False)

        if id_congreso:
            enrolled_ids = _get_congress_participant_ids(id_congreso)
            if not enrolled_ids:
                return Response([])
            users = users.filter(pk__in=enrolled_ids)

        if institucion:
            ids = Asistente.objects.filter(
                institucion_procedencia__icontains=institucion
            ).values_list('id_persona_id', flat=True)
            users = users.filter(pk__in=ids)

        if id_congreso:
            dc_ids = set(DictaminadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True))
            ec_ids = set(EvaluadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True))
        else:
            dc_ids = set(DictaminadorCongreso.objects.values_list('id_persona_id', flat=True))
            ec_ids = set(EvaluadorCongreso.objects.values_list('id_persona_id', flat=True))
        pon_ids = set(Ponente.objects.values_list('id_persona_id', flat=True))
        asi_ids = set(Asistente.objects.values_list('id_persona_id', flat=True))

        constancias_map = {}
        constancia_qs = Constancia.objects.filter(id_congreso_id=id_congreso) if id_congreso else Constancia.objects.filter(id_congreso__isnull=True)
        for c in constancia_qs:
            constancias_map[(c.id_persona_id, c.tipo_constancia)] = c

        result = []
        for user in users:
            all_roles = []
            if user.pk in dc_ids:
                all_roles.append('Dictaminador')
            if user.pk in ec_ids:
                all_roles.append('Evaluador')
            if user.pk in pon_ids:
                all_roles.append('Ponente')
            if user.pk in asi_ids:
                all_roles.append('Asistente')
            if not all_roles:
                all_roles.append('Participante')

            if rol_filter:
                filtered = []
                for r in all_roles:
                    if rol_filter == r.lower() or (rol_filter in ('evaluador', 'revisor') and r.lower() == 'evaluador'):
                        filtered.append(r)
                if not filtered:
                    continue
                all_roles = filtered

            institucion_nombre = 'N/A'
            try:
                inst = user.asistente.institucion_procedencia
                institucion_nombre = inst if inst else 'N/A'
            except Exception:
                pass

            nombre = ' '.join(x for x in [user.nombre, user.primer_apellido, user.segundo_apellido] if x).strip()

            for rol in all_roles:
                constancia = constancias_map.get((user.pk, rol))
                constancia_data = None
                if constancia:
                    constancia_data = {
                        'id_constancia': constancia.id_constancia,
                        'estatus': constancia.estatus,
                        'ruta_constancia': constancia.ruta_constancia,
                        'tipo_constancia': constancia.tipo_constancia,
                        'fecha_emision': constancia.fecha_emision.isoformat() if constancia.fecha_emision else None,
                    }
                result.append({
                    'id_persona': user.id_persona,
                    'nombre_completo': nombre,
                    'correo_electronico': user.correo_electronico,
                    'rol': rol,
                    'institucion': institucion_nombre,
                    'constancia': constancia_data,
                })

        return Response(result)


class ConstanciaUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id_persona):
        file = request.FILES.get('file')
        id_congreso = request.data.get('id_congreso')
        tipo = request.data.get('tipo', 'Asistente')

        if not file:
            return Response({'detail': 'No se proporcionó ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)

        fs = FileSystemStorage(location='media/constancias/')
        filename = fs.save(f"constancia_{id_persona}_{id_congreso}_{file.name}", file)
        file_url = f"/media/constancias/{filename}"

        constancia, created = Constancia.objects.get_or_create(
            id_persona_id=id_persona,
            id_congreso_id=id_congreso if id_congreso else None,
            tipo_constancia=tipo,
            defaults={'ruta_constancia': file_url, 'estatus': 'enviada'}
        )

        if not created:
            constancia.ruta_constancia = file_url
            constancia.estatus = 'enviada'
            constancia.save()

        try:
            persona = Persona.objects.get(pk=id_persona)
            HistorialAcciones.objects.create(
                id_persona=persona,
                rol=tipo.lower(),
                accion='emisión de constancia'
            )
        except Exception:
            pass

        return Response(ConstanciaSerializer(constancia).data, status=status.HTTP_200_OK)


class FacturaUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id_persona):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        pdf_file = request.FILES.get('pdf_file')
        xml_file = request.FILES.get('xml_file')
        id_congreso = request.data.get('id_congreso')

        if not pdf_file or not xml_file:
            return Response(
                {'detail': 'Se requieren ambos archivos: pdf_file y xml_file.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pdf_ok = pdf_file.content_type == 'application/pdf' or pdf_file.name.lower().endswith('.pdf')
        xml_ok = xml_file.content_type in ('text/xml', 'application/xml') or xml_file.name.lower().endswith('.xml')
        if not pdf_ok:
            return Response({'detail': 'El archivo PDF no tiene un formato válido.'}, status=status.HTTP_400_BAD_REQUEST)
        if not xml_ok:
            return Response({'detail': 'El archivo XML no tiene un formato válido.'}, status=status.HTTP_400_BAD_REQUEST)

        fs = FileSystemStorage(location='media/facturas/')
        pdf_filename = fs.save(f"factura_{id_persona}_{id_congreso}_{pdf_file.name}", pdf_file)
        pdf_url = f"/media/facturas/{pdf_filename}"
        xml_filename = fs.save(f"factura_{id_persona}_{id_congreso}_{xml_file.name}", xml_file)
        xml_url = f"/media/facturas/{xml_filename}"

        factura = Factura.objects.filter(
            id_persona_id=id_persona,
            id_congreso_id=id_congreso if id_congreso else None
        ).first()
        if not factura:
            factura = Factura.objects.create(
                id_persona_id=id_persona,
                id_congreso_id=id_congreso if id_congreso else None,
                ruta_pdf_xml=pdf_url,
                ruta_xml=xml_url,
                estatus='enviada',
                fecha_envio=timezone.now(),
            )
        else:
            factura.ruta_pdf_xml = pdf_url
            factura.ruta_xml = xml_url
            factura.estatus = 'enviada'
            factura.fecha_envio = timezone.now()
            factura.save()

        try:
            persona = Persona.objects.get(pk=id_persona)
            HistorialAcciones.objects.create(
                id_persona=persona,
                rol=_get_rol_persona(persona).lower(),
                accion='emisión de factura'
            )
        except Exception:
            pass

        return Response(FacturaSerializer(factura).data, status=status.HTTP_200_OK)


class BulkFacturaActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        id_congreso = request.data.get('id_congreso')
        user_ids = request.data.get('user_ids', [])

        if not user_ids:
            return Response({'detail': 'No se especificaron usuarios.'}, status=status.HTTP_400_BAD_REQUEST)

        Factura.objects.filter(
            id_persona_id__in=user_ids,
            id_congreso_id=id_congreso if id_congreso else None,
            estatus='pendiente'
        ).update(estatus='enviada', fecha_envio=timezone.now())

        personas = Persona.objects.filter(pk__in=user_ids)
        for persona in personas:
            try:
                HistorialAcciones.objects.create(
                    id_persona=persona,
                    rol=_get_rol_persona(persona).lower(),
                    accion='emisión de factura'
                )
            except Exception:
                pass

        return Response({'detail': f'{len(user_ids)} facturas procesadas.'})


class SolicitarFacturaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        id_congreso = request.data.get('id_congreso')
        rfc = request.data.get('rfc', '')
        razon_social = request.data.get('razon_social', '')
        codigo_postal = request.data.get('codigo_postal', '')
        regimen_fiscal = request.data.get('regimen_fiscal', '')
        constancia_file = request.FILES.get('constancia_fiscal')

        file_url = None
        if constancia_file:
            fs = FileSystemStorage(location='media/constancias_fiscales/')
            filename = fs.save(f"csf_{request.user.id_persona}_{id_congreso}_{constancia_file.name}", constancia_file)
            file_url = f"/media/constancias_fiscales/{filename}"

        factura = Factura.objects.filter(
            id_persona=request.user,
            id_congreso_id=id_congreso if id_congreso else None
        ).first()

        if factura and factura.estatus == 'enviada':
            return Response({'detail': 'Ya tienes una factura procesada para este congreso.'}, status=status.HTTP_400_BAD_REQUEST)

        if factura:
            factura.rfc = rfc
            factura.razon_social = razon_social
            factura.codigo_postal = codigo_postal
            factura.regimen_fiscal = regimen_fiscal
            if file_url:
                factura.ruta_constancia_fiscal = file_url
            factura.save()
        else:
            factura = Factura.objects.create(
                id_persona=request.user,
                id_congreso_id=id_congreso if id_congreso else None,
                rfc=rfc,
                razon_social=razon_social,
                codigo_postal=codigo_postal,
                regimen_fiscal=regimen_fiscal,
                ruta_constancia_fiscal=file_url,
                estatus='pendiente',
            )

        return Response(FacturaSerializer(factura).data, status=status.HTTP_200_OK)


class MisFacturasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        facturas = Factura.objects.filter(
            id_persona=request.user
        ).select_related('id_congreso').order_by('-fecha_solicitud')

        result = []
        for f in facturas:
            result.append({
                'id_factura': f.id_factura,
                'rfc': f.rfc,
                'razon_social': f.razon_social,
                'codigo_postal': f.codigo_postal,
                'regimen_fiscal': f.regimen_fiscal,
                'ruta_pdf_xml': f.ruta_pdf_xml,
                'ruta_xml': f.ruta_xml,
                'ruta_constancia_fiscal': f.ruta_constancia_fiscal,
                'estatus': f.estatus,
                'fecha_solicitud': f.fecha_solicitud.isoformat() if f.fecha_solicitud else None,
                'fecha_envio': f.fecha_envio.isoformat() if f.fecha_envio else None,
                'nombre_congreso': f.id_congreso.nombre_congreso if f.id_congreso else None,
                'id_congreso': f.id_congreso.id_congreso if f.id_congreso else None,
            })

        return Response(result)


class MisConstanciasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        constancias = Constancia.objects.filter(
            id_persona=request.user
        ).select_related('id_congreso', 'id_congreso__id_sede').order_by('-fecha_emision')

        result = []
        for c in constancias:
            estatus_frontend = 'disponible' if c.estatus == 'enviada' else 'en_proceso'
            congreso = c.id_congreso
            result.append({
                'id': f"CONST-{c.id_constancia}",
                'congreso': congreso.nombre_congreso if congreso else '—',
                'fechaEmision': c.fecha_emision.strftime('%Y-%m-%d') if c.fecha_emision else None,
                'tipo': c.tipo_constancia or 'Participante',
                'estatus': estatus_frontend,
                'pdfUrl': c.ruta_constancia or None,
                'sede': congreso.id_sede.nombre_sede if congreso and congreso.id_sede else None,
                'firmaOrganizador': congreso.firma_organizador if congreso else None,
                'firmaSecretaria': congreso.firma_secretaria if congreso else None,
            })

        return Response(result)


class FacturasPendientesAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        id_congreso = request.query_params.get('id_congreso')

        facturas = (
            Factura.objects
            .filter(estatus='pendiente')
            .select_related('id_persona', 'id_congreso')
            .order_by('fecha_solicitud')
        )
        if id_congreso:
            facturas = facturas.filter(id_congreso_id=id_congreso)

        result = []
        with connection.cursor() as cursor:
            for f in facturas:
                persona = f.id_persona
                nombre = ' '.join(
                    x for x in [persona.nombre, persona.primer_apellido, persona.segundo_apellido] if x
                ).strip()

                monto = 0
                if f.id_congreso_id:
                    cursor.execute("""
                        SELECT COALESCE(SUM(p.monto), 0)
                        FROM pagos p
                        JOIN costos_congreso cc ON cc.id_costos_congreso = p.id_costos
                        WHERE p.id_persona = %s AND cc.id_costos_congreso = (
                            SELECT id_costos_congreso FROM congreso WHERE id_congreso = %s LIMIT 1
                        )
                    """, [persona.id_persona, f.id_congreso_id])
                    row = cursor.fetchone()
                    monto = float(row[0]) if row else 0

                result.append({
                    'id_factura': f.id_factura,
                    'id_persona': persona.id_persona,
                    'nombre_completo': nombre,
                    'correo_electronico': persona.correo_electronico,
                    'rfc': f.rfc,
                    'razon_social': f.razon_social,
                    'regimen_fiscal': f.regimen_fiscal,
                    'codigo_postal': f.codigo_postal,
                    'ruta_constancia_fiscal': f.ruta_constancia_fiscal,
                    'nombre_congreso': f.id_congreso.nombre_congreso if f.id_congreso else None,
                    'id_congreso': f.id_congreso_id,
                    'fecha_solicitud': f.fecha_solicitud,
                    'monto_pagado': monto,
                })

        return Response(result)


class BulkConstanciaActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        action = request.data.get('action')
        id_congreso = request.data.get('id_congreso')
        user_ids = request.data.get('user_ids', [])

        if not user_ids:
            return Response({'detail': 'No se especificaron usuarios.'}, status=status.HTTP_400_BAD_REQUEST)

        if action != 'send':
            return Response({'detail': 'Acción no reconocida.'}, status=status.HTTP_400_BAD_REQUEST)

        personas = Persona.objects.filter(pk__in=user_ids)
        sent_count = 0

        for persona in personas:
            roles = _get_all_roles_persona(persona, id_congreso)
            for rol in roles:
                constancia, created = Constancia.objects.get_or_create(
                    id_persona=persona,
                    id_congreso_id=id_congreso if id_congreso else None,
                    tipo_constancia=rol,
                    defaults={'estatus': 'enviada'}
                )
                if not created and constancia.estatus != 'enviada':
                    constancia.estatus = 'enviada'
                    constancia.save()
                sent_count += 1

            try:
                HistorialAcciones.objects.create(
                    id_persona=persona,
                    rol=_get_rol_persona(persona).lower(),
                    accion='emisión de constancia'
                )
            except Exception:
                pass

        return Response({'detail': f'{sent_count} constancias enviadas.'})


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    rol = 'asistente'
    if user.is_superuser or user.is_staff:
        rol = 'administrador'
    else:
        if DictaminadorCongreso.objects.filter(id_persona=user).exists():
            rol = 'dictaminador'
        elif EvaluadorCongreso.objects.filter(id_persona=user).exists():
            rol = 'revisor'
        else:
            try:
                user.ponente; rol = 'ponente'
            except Exception:
                pass
    refresh['rol'] = rol
    refresh['es_dictaminador'] = DictaminadorCongreso.objects.filter(id_persona=user).exists()
    refresh['es_evaluador'] = EvaluadorCongreso.objects.filter(id_persona=user).exists()
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            user_data = UserSerializer(user).data
            return Response({'user': user_data, **tokens}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({'detail': 'El correo y la contraseña son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_obj = Persona.objects.get(correo_electronico=email)
        except Persona.DoesNotExist:
            return Response({'detail': 'Correo o contraseña incorrectos.'}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, username=user_obj.correo_electronico, password=password)
        if user is None:
            return Response({'detail': 'Correo o contraseña incorrectos.'}, status=status.HTTP_401_UNAUTHORIZED)

        tokens = get_tokens_for_user(user)
        return Response({'user': UserSerializer(user).data, **tokens}, status=status.HTTP_200_OK)


class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class AllUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        id_congreso = request.query_params.get('id_congreso')
        if not id_congreso:
            return Response({'detail': 'id_congreso es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        personas = Persona.objects.all().order_by('nombre', 'primer_apellido')
        dict_ids = set(DictaminadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True))
        eval_ids = set(EvaluadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True))

        data = []
        for p in personas:
            nombre_completo = ' '.join(x for x in [p.nombre, p.primer_apellido, p.segundo_apellido] if x).strip()
            data.append({
                'id_persona': p.id_persona,
                'nombre_completo': nombre_completo,
                'correo_electronico': p.correo_electronico,
                'num_telefono': p.num_telefono or '',
                'genero': p.genero or '',
                'pais': p.pais or '',
                'roles': {
                    'dictaminador': p.id_persona in dict_ids,
                    'evaluador': p.id_persona in eval_ids,
                    'administrador': p.is_staff or p.is_superuser,
                },
            })
        return Response(data)


class RoleAssignView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id_persona):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        rol = request.data.get('rol')
        id_congreso = request.data.get('id_congreso')
        password = request.data.get('password', '')

        if rol not in ('dictaminador', 'evaluador', 'administrador'):
            return Response({'detail': 'Rol no válido.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            persona = Persona.objects.get(pk=id_persona)
        except Persona.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if rol == 'administrador':
            if not password:
                return Response({'detail': 'Se requiere contraseña.'}, status=status.HTTP_400_BAD_REQUEST)
            user = authenticate(request, username=request.user.correo_electronico, password=password)
            if user is None:
                return Response({'detail': 'Contraseña incorrecta.'}, status=status.HTTP_401_UNAUTHORIZED)
            persona.is_staff = True
            persona.is_superuser = True
            persona.save()
        else:
            if not id_congreso:
                return Response({'detail': 'id_congreso es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
            if rol == 'dictaminador':
                try:
                    DictaminadorCongreso.objects.get_or_create(id_persona=persona, id_congreso_id=id_congreso)
                    Dictaminador.objects.get_or_create(id_persona=persona)
                except IntegrityError:
                    return Response({'detail': 'Congreso no válido.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                try:
                    EvaluadorCongreso.objects.get_or_create(id_persona=persona, id_congreso_id=id_congreso)
                    Evaluador.objects.get_or_create(id_persona=persona)
                except IntegrityError:
                    return Response({'detail': 'Congreso no válido.'}, status=status.HTTP_400_BAD_REQUEST)

        dict_ids = set(DictaminadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True)) if id_congreso else set()
        eval_ids = set(EvaluadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True)) if id_congreso else set()

        return Response({
            'dictaminador': persona.id_persona in dict_ids,
            'evaluador': persona.id_persona in eval_ids,
            'administrador': persona.is_staff or persona.is_superuser,
        })


class RoleRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id_persona):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        rol = request.data.get('rol')
        id_congreso = request.data.get('id_congreso')
        password = request.data.get('password', '')

        if rol not in ('dictaminador', 'evaluador', 'administrador'):
            return Response({'detail': 'Rol no válido.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            persona = Persona.objects.get(pk=id_persona)
        except Persona.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if rol == 'administrador':
            if not password:
                return Response({'detail': 'Se requiere contraseña.'}, status=status.HTTP_400_BAD_REQUEST)
            user = authenticate(request, username=request.user.correo_electronico, password=password)
            if user is None:
                return Response({'detail': 'Contraseña incorrecta.'}, status=status.HTTP_401_UNAUTHORIZED)
            if persona.pk == request.user.pk:
                return Response(
                    {'detail': 'No puedes quitarte el rol de administrador a ti mismo.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            persona.is_staff = False
            persona.is_superuser = False
            persona.save()
        else:
            if not id_congreso:
                return Response({'detail': 'id_congreso es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
            if rol == 'dictaminador':
                from ponencias.models import Resumen, Ponencia
                dictaminadores = Dictaminador.objects.filter(id_persona=persona)
                if dictaminadores.exists():
                    resumen_ids = list(
                        Ponencia.objects.filter(
                            id_evento__id_congreso=id_congreso,
                            id_resumen__isnull=False
                        ).values_list('id_resumen', flat=True)
                    )
                    if Resumen.objects.filter(
                        id_dictaminador__in=dictaminadores,
                        revisado=False,
                        id_resumen__in=resumen_ids
                    ).exists():
                        return Response(
                            {'detail': 'No se puede quitar el rol: el usuario tiene dictaminaciones pendientes.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                DictaminadorCongreso.objects.filter(id_persona=persona, id_congreso_id=id_congreso).delete()
            else:
                from ponencias.models import Extenso, Ponencia
                from django.db.models import Q
                evaluadores = Evaluador.objects.filter(id_persona=persona)
                if evaluadores.exists():
                    extenso_ids = list(
                        Ponencia.objects.filter(
                            id_evento__id_congreso=id_congreso,
                            id_extenso__isnull=False
                        ).values_list('id_extenso', flat=True)
                    )
                    if Extenso.objects.filter(
                        revisado=False,
                        id_extenso__in=extenso_ids
                    ).filter(
                        Q(id_evaluador__in=evaluadores) |
                        Q(id_evaluador_2__in=evaluadores) |
                        Q(id_evaluador_3__in=evaluadores)
                    ).exists():
                        return Response(
                            {'detail': 'No se puede quitar el rol: el usuario tiene revisiones pendientes.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                EvaluadorCongreso.objects.filter(id_persona=persona, id_congreso_id=id_congreso).delete()

        dict_ids = set(DictaminadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True)) if id_congreso else set()
        eval_ids = set(EvaluadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True)) if id_congreso else set()

        return Response({
            'dictaminador': persona.id_persona in dict_ids,
            'evaluador': persona.id_persona in eval_ids,
            'administrador': persona.is_staff or persona.is_superuser,
        })


class EnviarCodigoVerificacionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email_institucional = request.data.get('email_institucional')
        if not email_institucional:
            return Response({'detail': 'Email institucional es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validar dominio simple
        allowed_domains = [".edu", ".edu.mx", "alumnos.udg.mx", "alumno.udg.mx"]
        email_institucional = email_institucional.strip().lower()
        if not any(email_institucional.endswith(domain) for domain in allowed_domains):
            return Response({'detail': 'El dominio del correo no es válido para descuento de estudiante.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            asistente = Asistente.objects.get(id_persona=request.user)
        except Asistente.DoesNotExist:
            return Response({'detail': 'El usuario no tiene un perfil de asistente.'}, status=status.HTTP_404_NOT_FOUND)

        # Generar código de 6 dígitos
        codigo = ''.join(random.choices(string.digits, k=6))
        asistente.codigo_verificacion = codigo
        asistente.email_institucional = email_institucional
        asistente.fecha_envio_codigo = timezone.now()
        asistente.save()

        # Enviar correo (Se imprimirá en consola según settings)
        subject = 'Código de Verificación - Descuento Estudiante CIENU 2026'
        message = f'Hola {request.user.nombre},\n\nTu código de verificación para obtener el descuento de estudiante es: {codigo}\n\nSi no solicitaste este código, puedes ignorar este mensaje.'
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@cienu2026.com',
                [email_institucional],
                fail_silently=False,
            )
        except Exception as e:
            return Response({'detail': f'Error al enviar el correo: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'Código enviado con éxito.'}, status=status.HTTP_200_OK)


class VerificarCodigoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        codigo = request.data.get('codigo')
        if not codigo:
            return Response({'detail': 'El código es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            asistente = Asistente.objects.get(id_persona=request.user)
        except Asistente.DoesNotExist:
            return Response({'detail': 'El usuario no tiene un perfil de asistente.'}, status=status.HTTP_404_NOT_FOUND)

        if asistente.codigo_verificacion == codigo:
            asistente.es_estudiante_validado = True
            asistente.save()
            return Response({
                'detail': 'Estudiante validado con éxito.',
                'es_estudiante_validado': True
            }, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Código incorrecto.'}, status=status.HTTP_400_BAD_REQUEST)
