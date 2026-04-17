from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import Persona, Asistente

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer para registro de nuevos usuarios."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirmPassword = serializers.CharField(write_only=True, required=True)
    
    # Campos extra del frontend
    nombres = serializers.CharField(source='nombre', required=True)
    apellidos = serializers.CharField(source='primer_apellido', required=True)
    email = serializers.EmailField(source='correo_electronico', required=True)
    telefono = serializers.CharField(source='num_telefono', required=True)
    institucion = serializers.CharField(write_only=True, required=False, allow_blank=True)
    genero = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    pais = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    discapacidad = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    # Ignoramos estos del modelo Persona porque los manejaremos en 'create' con alias
    class Meta:
        model = Persona
        fields = (
            'nombres', 'apellidos', 'email', 'telefono', 
            'password', 'confirmPassword', 'institucion',
            'genero', 'pais', 'discapacidad'
        )

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirmPassword'):
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        
        # Validar unicidad explícita porque usamos source=''
        correo = attrs.get('correo_electronico')
        if Persona.objects.filter(correo_electronico=correo).exists():
            raise serializers.ValidationError({"email": "Un usuario con este correo electrónico ya existe."})
            
        telefono = attrs.get('num_telefono')
        if telefono and Persona.objects.filter(num_telefono=telefono).exists():
            raise serializers.ValidationError({"telefono": "Un usuario con este teléfono ya existe."})
            
        return attrs

    def create(self, validated_data):
        institucion = validated_data.pop('institucion', '')
        password = validated_data.pop('password')
        # confirmPassword ya se validó en 'validate()', se saca para no enviarlo a create_user
        validated_data.pop('confirmPassword', None)
        
        # Separar apellidos si llegan ambos en el mismo campo
        apellidos_str = validated_data.get('primer_apellido', '')
        partes_apellido = apellidos_str.split(' ', 1)
        if len(partes_apellido) > 1:
            validated_data['primer_apellido'] = partes_apellido[0]
            validated_data['segundo_apellido'] = partes_apellido[1]
            
        with transaction.atomic():
            user = Persona.objects.create_user(contrasena=password, **validated_data)
            # Todo el que se registra por primera vez es asistente por defecto
            Asistente.objects.create(
                id_persona=user,
                institucion_procedencia=institucion
            )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer para devolver los datos del usuario autenticado."""
    rol = serializers.SerializerMethodField()
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = Persona
        fields = ('id_persona', 'correo_electronico', 'nombre', 'primer_apellido', 'segundo_apellido', 'rol', 'nombre_completo')

    def get_rol(self, obj):
        # Determinar rol verificando relaciones
        if obj.is_superuser or obj.is_staff:
            return 'administrador'
        if hasattr(obj, 'dictaminador'):
            return 'dictaminador'
        if hasattr(obj, 'evaluador'):
            return 'revisor'
        if hasattr(obj, 'ponente'):
            return 'ponente'
        if hasattr(obj, 'asistente'):
            return 'asistente'
        return 'asistente' # Por defecto

    def get_nombre_completo(self, obj):
        nombres = [obj.nombre, obj.primer_apellido, obj.segundo_apellido]
        return " ".join([n for n in nombres if n]).strip()
