from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer para registro de nuevos usuarios."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirmPassword = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'confirmPassword',
            'first_name', 'last_name', 'institucion',
        )
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirmPassword']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Este correo ya está registrado."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmPassword')
        # Usar el email como username si no se especifica uno
        if not validated_data.get('username'):
            validated_data['username'] = validated_data['email']
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            institucion=validated_data.get('institucion', ''),
            rol='asistente',
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer para devolver los datos del usuario autenticado."""
    nombre = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'rol', 'institucion', 'nombre')

    def get_nombre(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name if full_name else obj.username
