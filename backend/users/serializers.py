from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import Persona, Asistente, Dictaminador, Evaluador, Ponente, Factura, Constancia, HistorialAcciones


class FacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = '__all__'


class ConstanciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Constancia
        fields = '__all__'


class HistorialAccionesSerializer(serializers.ModelSerializer):
    nombre_persona = serializers.CharField(source='id_persona.nombre', read_only=True)
    fecha = serializers.DateTimeField(source='fecha_accion', format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = HistorialAcciones
        fields = ('id_historial_acciones', 'nombre_persona', 'fecha', 'rol', 'accion')


class ParticipantSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()
    rol = serializers.SerializerMethodField()
    institucion = serializers.SerializerMethodField()
    factura = serializers.SerializerMethodField()
    constancia = serializers.SerializerMethodField()

    class Meta:
        model = Persona
        fields = ('id_persona', 'nombre_completo', 'correo_electronico', 'rol', 'institucion', 'factura', 'constancia')

    def get_nombre_completo(self, obj):
        partes = [obj.nombre, obj.primer_apellido, obj.segundo_apellido]
        return " ".join([n for n in partes if n]).strip()

    def get_rol(self, obj):
        from .models import DictaminadorCongreso, EvaluadorCongreso
        if DictaminadorCongreso.objects.filter(id_persona=obj).exists():
            return 'Dictaminador'
        if EvaluadorCongreso.objects.filter(id_persona=obj).exists():
            return 'Evaluador'
        try:
            obj.ponente
            return 'Ponente'
        except Exception:
            pass
        try:
            obj.asistente
            return 'Asistente'
        except Exception:
            pass
        return 'Participante'

    def get_institucion(self, obj):
        try:
            inst = obj.asistente.institucion_procedencia
            return inst if inst else "N/A"
        except Exception:
            return "N/A"

    def get_factura(self, obj):
        id_congreso = self.context.get('id_congreso')
        query = Factura.objects.filter(id_persona=obj)
        if id_congreso:
            query = query.filter(id_congreso_id=id_congreso)
        factura = query.order_by('-fecha_solicitud').first()
        return FacturaSerializer(factura).data if factura else None

    def get_constancia(self, obj):
        id_congreso = self.context.get('id_congreso')
        query = Constancia.objects.filter(id_persona=obj)
        if id_congreso:
            query = query.filter(id_congreso_id=id_congreso)
        constancia = query.order_by('-fecha_emision').first()
        return ConstanciaSerializer(constancia).data if constancia else None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirmPassword = serializers.CharField(write_only=True, required=True)
    nombres = serializers.CharField(source='nombre', required=True)
    apellidos = serializers.CharField(source='primer_apellido', required=True)
    email = serializers.EmailField(source='correo_electronico', required=True)
    telefono = serializers.CharField(source='num_telefono', required=True)
    institucion = serializers.CharField(write_only=True, required=False, allow_blank=True)
    genero = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    pais = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    discapacidad = serializers.CharField(required=False, allow_blank=True, allow_null=True)

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
        
        # Validación personalizada de constraseña para mensajes en español
        password = attrs.get('password')
        try:
            validate_password(password)
        except Exception:
            # Here you catch "too common", "numeric", or "too short" errors
            # and return your custom Spanish message.
            raise serializers.ValidationError({
                "password": "La contraseña es muy común, solo numérica o no cumple con los requisitos de seguridad."
            })
        
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
        validated_data.pop('confirmPassword', None)
        apellidos_str = validated_data.get('primer_apellido', '')
        partes = apellidos_str.split(' ', 1)
        if len(partes) > 1:
            validated_data['primer_apellido'] = partes[0]
            validated_data['segundo_apellido'] = partes[1]
        with transaction.atomic():
            user = Persona.objects.create_user(contrasena=password, **validated_data)
            Asistente.objects.create(id_persona=user, institucion_procedencia=institucion)
        return user


class UserSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()
    nombre_completo = serializers.SerializerMethodField()
    es_dictaminador = serializers.SerializerMethodField()
    es_evaluador = serializers.SerializerMethodField()
    es_estudiante_validado = serializers.SerializerMethodField()
    email_institucional = serializers.SerializerMethodField()

    class Meta:
        model = Persona
        fields = (
            'id_persona', 'correo_electronico', 'nombre', 'primer_apellido',
            'segundo_apellido', 'rol', 'nombre_completo',
            'es_dictaminador', 'es_evaluador', 'es_estudiante_validado',
            'email_institucional'
        )

    def get_es_estudiante_validado(self, obj):
        try:
            return obj.asistente.es_estudiante_validado
        except Exception:
            return False

    def get_email_institucional(self, obj):
        try:
            return obj.asistente.email_institucional
        except Exception:
            return None

    def get_rol(self, obj):
        if obj.is_superuser or obj.is_staff:
            return 'administrador'
        from .models import DictaminadorCongreso, EvaluadorCongreso
        if DictaminadorCongreso.objects.filter(id_persona=obj).exists():
            return 'dictaminador'
        if EvaluadorCongreso.objects.filter(id_persona=obj).exists():
            return 'revisor'
        try:
            obj.ponente; return 'ponente'
        except Exception:
            pass
        return 'asistente'

    def get_nombre_completo(self, obj):
        return ' '.join(x for x in [obj.nombre, obj.primer_apellido, obj.segundo_apellido] if x).strip()

    def get_es_dictaminador(self, obj):
        from .models import DictaminadorCongreso
        return DictaminadorCongreso.objects.filter(id_persona=obj).exists()

    def get_es_evaluador(self, obj):
        from .models import EvaluadorCongreso
        return EvaluadorCongreso.objects.filter(id_persona=obj).exists()
