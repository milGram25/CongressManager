from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import RegisterSerializer, UserSerializer


def get_tokens_for_user(user):
    """Genera el par de tokens JWT para un usuario."""
    refresh = RefreshToken.for_user(user)
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
        # Mapear campos del frontend al modelo de Django
        data = {
            'username': request.data.get('email', ''),
            'email': request.data.get('email', ''),
            'first_name': request.data.get('nombres', ''),
            'last_name': request.data.get('apellidos', ''),
            'password': request.data.get('password', ''),
            'confirmPassword': request.data.get('confirmPassword', ''),
            'institucion': request.data.get('institucion', ''),
        }
        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'user': UserSerializer(user).data,
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

        # Buscar usuario por email (el username es igual al email en el registro)
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Correo o contraseña incorrectos.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = authenticate(request, username=user_obj.username, password=password)
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
