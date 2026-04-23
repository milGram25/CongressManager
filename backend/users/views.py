from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Persona
from .serializers import RegisterSerializer, UserSerializer


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
            # Asegurarse de retornar el 'user' como lo espera el frontend y con el rol mapeado
            user_data['rol'] = tokens.get('access_dict', {}).get('rol') or 'asistente' 

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

        user = authenticate(request, correo_electronico=user_obj.correo_electronico, password=password)
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
