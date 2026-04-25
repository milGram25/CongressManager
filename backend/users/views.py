from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.files.storage import FileSystemStorage
from django.utils import timezone
from .models import Persona, Factura, Constancia, HistorialAcciones
from .serializers import RegisterSerializer, UserSerializer, ParticipantSerializer, FacturaSerializer, ConstanciaSerializer, HistorialAccionesSerializer
import os

class UserActionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tipo = request.query_params.get('tipo', 'general') # 'facturas', 'constancias', 'general'
        
        if tipo == 'facturas':
            items = Factura.objects.filter(estatus='enviada').order_by('-fecha_envio')
            data = [{
                'id': f"inv-{f.id_factura}",
                'nombre': f"{f.id_persona.nombre} {f.id_persona.primer_apellido}",
                'fecha': f.fecha_envio.strftime("%Y-%m-%d %H:%M:%S") if f.fecha_envio else "",
                'rol': 'Participante',
                'accion': 'emisión de factura'
            } for f in items]
            return Response(data)

        if tipo == 'constancias':
            items = Constancia.objects.filter(estatus='enviada').order_by('-fecha_emision')
            data = [{
                'id': f"const-{f.id_constancia}",
                'nombre': f"{f.id_persona.nombre} {f.id_persona.primer_apellido}",
                'fecha': f.fecha_emision.strftime("%Y-%m-%d %H:%M:%S") if f.fecha_emision else "",
                'rol': f.tipo_constancia,
                'accion': 'emisión de constancia'
            } for f in items]
            return Response(data)

        items = HistorialAcciones.objects.all().order_by('-fecha_accion')
        data = [{
            'id': h.id_historial_acciones,
            'nombre': f"{h.id_persona.nombre} {h.id_persona.primer_apellido}",
            'fecha': h.fecha_accion.strftime("%Y-%m-%d %H:%M:%S"),
            'rol': h.rol,
            'accion': h.accion
        } for h in items]
        return Response(data)

# ... (get_tokens_for_user)

class ParticipantsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Opcional: filtrar por congreso si se pasa id_congreso
        id_congreso = request.query_params.get('id_congreso')
        users = Persona.objects.all()
        serializer = ParticipantSerializer(users, many=True)
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
            id_congreso_id=id_congreso,
            defaults={'ruta_constancia': file_url, 'tipo_constancia': tipo, 'estatus': 'generada'}
        )

        if not created:
            constancia.ruta_constancia = file_url
            constancia.tipo_constancia = tipo
            constancia.estatus = 'generada'
            constancia.save()

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

        factura = Factura.objects.filter(id_persona_id=id_persona, id_congreso_id=id_congreso).first()
        if not factura:
             factura = Factura.objects.create(
                id_persona_id=id_persona,
                id_congreso_id=id_congreso,
                ruta_pdf_xml=file_url,
                estatus='enviada',
                fecha_envio=timezone.now()
            )
        else:
            factura.ruta_pdf_xml = file_url
            factura.estatus = 'enviada'
            factura.fecha_envio = timezone.now()
            factura.save()

        return Response(FacturaSerializer(factura).data, status=status.HTTP_200_OK)

class BulkConstanciaActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        action = request.data.get('action') # 'generate' o 'send'
        id_congreso = request.data.get('id_congreso')
        user_ids = request.data.get('user_ids', [])

        if action == 'send':
            Constancia.objects.filter(id_persona_id__in=user_ids, id_congreso_id=id_congreso).update(
                estatus='enviada'
            )
            return Response({'detail': 'Constancias marcadas como enviadas.'})
        
        # Para 'generate', usualmente el frontend genera el PDF y lo sube uno por uno,
        # pero aquí podríamos marcar que están "listas para enviar" si fuera el caso.
        return Response({'detail': 'Acción completada.'})


def get_tokens_for_user(user):
    """Genera el par de tokens JWT para un usuario."""
    refresh = RefreshToken.for_user(user)
    # inyectar el rol en el token
    if user.is_superuser or user.is_staff:
        rol = 'administrador'
    else:
        rol = 'asistente'
        try:
            if user.dictaminador: rol = 'dictaminador'
        except Exception:
            try:
                if user.evaluador: rol = 'revisor'
            except Exception:
                try:
                    if user.ponente: rol = 'ponente'
                except Exception:
                    pass
    
    refresh['rol'] = rol

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    """
    POST /api/users/register/
    Crea un usuario nuevo y devuelve los tokens JWT + datos del usuario.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            user_data = UserSerializer(user).data
            return Response({
                'user': user_data,
                **tokens,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/users/login/
    Autentica con email + password y devuelve los tokens JWT + datos del usuario.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'detail': 'El correo y la contraseña son obligatorios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_obj = Persona.objects.get(correo_electronico=email)
        except Persona.DoesNotExist:
            return Response(
                {'detail': 'Correo o contraseña incorrectos.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = authenticate(request, username=user_obj.correo_electronico, password=password)
        if user is None:
            return Response(
                {'detail': 'Correo o contraseña incorrectos.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        tokens = get_tokens_for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            **tokens,
        }, status=status.HTTP_200_OK)


class UserMeView(APIView):
    """
    GET /api/users/me/
    Devuelve los datos del usuario autenticado (requiere token Bearer).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
