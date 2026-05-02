from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.files.storage import FileSystemStorage
from django.db import connection, IntegrityError
from django.utils import timezone
from .models import Persona, Asistente, Dictaminador, Evaluador, Ponente, Factura, Constancia, HistorialAcciones, DictaminadorCongreso, EvaluadorCongreso
from .serializers import RegisterSerializer, UserSerializer, ParticipantSerializer, FacturaSerializer, ConstanciaSerializer, HistorialAccionesSerializer
import os


def _get_rol_persona(persona):
    try:
        persona.dictaminador
        return 'Dictaminador'
    except Exception:
        pass
    try:
        persona.evaluador
        return 'Evaluador'
    except Exception:
        pass
    try:
        persona.ponente
        return 'Ponente'
    except Exception:
        pass
    return 'Asistente'


class UserActionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tipo = request.query_params.get('tipo', 'general')

        if tipo == 'facturas':
            items = Factura.objects.filter(estatus='enviada').order_by('-fecha_envio').select_related('id_persona')
            data = [{
                'id': f"inv-{f.id_factura}",
                'nombre': f"{f.id_persona.nombre} {f.id_persona.primer_apellido}",
                'fecha': f.fecha_envio.strftime("%Y-%m-%d %H:%M:%S") if f.fecha_envio else "",
                'rol': 'Participante',
                'accion': 'emisión de factura'
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

    # Dictaminadores and evaluadores are committee members — always included
    enrolled |= set(Dictaminador.objects.values_list('id_persona_id', flat=True))
    enrolled |= set(Evaluador.objects.values_list('id_persona_id', flat=True))

    return enrolled


class ParticipantsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        id_congreso = request.query_params.get('id_congreso')
        rol = request.query_params.get('rol', '').lower()
        institucion = request.query_params.get('institucion', '').strip()

        users = Persona.objects.filter(is_staff=False, is_superuser=False)

        if id_congreso:
            enrolled_ids = _get_congress_participant_ids(id_congreso)
            if not enrolled_ids:
                return Response([])
            users = users.filter(pk__in=enrolled_ids)

        dict_ids = set(Dictaminador.objects.values_list('id_persona_id', flat=True))
        eval_ids = set(Evaluador.objects.values_list('id_persona_id', flat=True))
        pon_ids  = set(Ponente.objects.values_list('id_persona_id', flat=True))
        asi_ids  = set(Asistente.objects.values_list('id_persona_id', flat=True))

        if rol == 'dictaminador':
            users = users.filter(pk__in=dict_ids)
        elif rol in ('evaluador', 'revisor'):
            users = users.filter(pk__in=eval_ids).exclude(pk__in=dict_ids)
        elif rol == 'ponente':
            users = users.filter(pk__in=pon_ids).exclude(pk__in=dict_ids).exclude(pk__in=eval_ids)
        elif rol == 'asistente':
            users = users.filter(pk__in=asi_ids).exclude(pk__in=dict_ids).exclude(pk__in=eval_ids).exclude(pk__in=pon_ids)

        if institucion:
            ids = Asistente.objects.filter(
                institucion_procedencia__icontains=institucion
            ).values_list('id_persona_id', flat=True)
            users = users.filter(pk__in=ids)

        serializer = ParticipantSerializer(users, many=True, context={'id_congreso': id_congreso})
        return Response(serializer.data)


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
            defaults={'ruta_constancia': file_url, 'tipo_constancia': tipo, 'estatus': 'enviada'}
        )

        if not created:
            constancia.ruta_constancia = file_url
            constancia.tipo_constancia = tipo
            constancia.estatus = 'enviada'
            constancia.save()

        try:
            persona = Persona.objects.get(pk=id_persona)
            HistorialAcciones.objects.create(
                id_persona=persona,
                rol=tipo,
                accion='emisión de constancia'
            )
        except Exception:
            pass

        return Response(ConstanciaSerializer(constancia).data, status=status.HTTP_200_OK)


class FacturaUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id_persona):
        file = request.FILES.get('file')
        id_congreso = request.data.get('id_congreso')

        if not file:
            return Response({'detail': 'No se proporcionó ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)

        fs = FileSystemStorage(location='media/facturas/')
        filename = fs.save(f"factura_{id_persona}_{id_congreso}_{file.name}", file)
        file_url = f"/media/facturas/{filename}"

        factura = Factura.objects.filter(
            id_persona_id=id_persona,
            id_congreso_id=id_congreso if id_congreso else None
        ).first()
        if not factura:
            factura = Factura.objects.create(
                id_persona_id=id_persona,
                id_congreso_id=id_congreso if id_congreso else None,
                ruta_pdf_xml=file_url,
                estatus='enviada',
                fecha_envio=timezone.now()
            )
        else:
            factura.ruta_pdf_xml = file_url
            factura.estatus = 'enviada'
            factura.fecha_envio = timezone.now()
            factura.save()

        try:
            persona = Persona.objects.get(pk=id_persona)
            rol = _get_rol_persona(persona)
            HistorialAcciones.objects.create(
                id_persona=persona,
                rol=rol,
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
            HistorialAcciones.objects.create(
                id_persona=persona,
                rol=_get_rol_persona(persona),
                accion='emisión de factura'
            )

        return Response({'detail': f'{len(user_ids)} facturas procesadas.'})


class BulkConstanciaActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        action = request.data.get('action')
        id_congreso = request.data.get('id_congreso')
        user_ids = request.data.get('user_ids', [])

        if not user_ids:
            return Response({'detail': 'No se especificaron usuarios.'}, status=status.HTTP_400_BAD_REQUEST)

        personas = Persona.objects.filter(pk__in=user_ids)

        if action == 'generate':
            created_count = 0
            for persona in personas:
                rol = _get_rol_persona(persona)
                _, created = Constancia.objects.get_or_create(
                    id_persona=persona,
                    id_congreso_id=id_congreso if id_congreso else None,
                    defaults={'tipo_constancia': rol, 'estatus': 'generada'}
                )
                if created:
                    created_count += 1
            return Response({'detail': f'{created_count} constancias generadas.'})

        if action == 'send':
            Constancia.objects.filter(
                id_persona_id__in=user_ids,
                id_congreso_id=id_congreso if id_congreso else None
            ).update(estatus='enviada')

            for persona in personas:
                rol = _get_rol_persona(persona)
                HistorialAcciones.objects.create(
                    id_persona=persona,
                    rol=rol,
                    accion='emisión de constancia'
                )
            return Response({'detail': f'{len(user_ids)} constancias enviadas.'})

        return Response({'detail': 'Acción no reconocida.'}, status=status.HTTP_400_BAD_REQUEST)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    rol = 'asistente'
    if user.is_superuser or user.is_staff:
        rol = 'administrador'
    else:
        try:
            user.dictaminador; rol = 'dictaminador'
        except Exception:
            try:
                user.evaluador; rol = 'revisor'
            except Exception:
                try:
                    user.ponente; rol = 'ponente'
                except Exception:
                    pass
    refresh['rol'] = rol
    refresh['es_dictaminador'] = (
        Dictaminador.objects.filter(id_persona=user).exists() or
        DictaminadorCongreso.objects.filter(id_persona=user).exists()
    )
    refresh['es_evaluador'] = (
        Evaluador.objects.filter(id_persona=user).exists() or
        EvaluadorCongreso.objects.filter(id_persona=user).exists()
    )
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
                except IntegrityError:
                    return Response({'detail': 'Congreso no válido.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                try:
                    EvaluadorCongreso.objects.get_or_create(id_persona=persona, id_congreso_id=id_congreso)
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
                DictaminadorCongreso.objects.filter(id_persona=persona, id_congreso_id=id_congreso).delete()
            else:
                EvaluadorCongreso.objects.filter(id_persona=persona, id_congreso_id=id_congreso).delete()

        dict_ids = set(DictaminadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True)) if id_congreso else set()
        eval_ids = set(EvaluadorCongreso.objects.filter(id_congreso_id=id_congreso).values_list('id_persona_id', flat=True)) if id_congreso else set()

        return Response({
            'dictaminador': persona.id_persona in dict_ids,
            'evaluador': persona.id_persona in eval_ids,
            'administrador': persona.is_staff or persona.is_superuser,
        })
