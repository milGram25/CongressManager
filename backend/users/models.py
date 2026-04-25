from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from congresos.models import Congreso

class PersonaManager(BaseUserManager):
    def create_user(self, correo_electronico, contrasena=None, **extra_fields):
        if not correo_electronico:
            raise ValueError('El correo electrónico es obligatorio')
        email = self.normalize_email(correo_electronico)
        user = self.model(correo_electronico=email, **extra_fields)
        user.set_password(contrasena)
        user.save(using=self._db)
        return user

    def create_superuser(self, correo_electronico, contrasena=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(correo_electronico, contrasena, **extra_fields)

class Persona(AbstractBaseUser, PermissionsMixin):
    id_persona = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    primer_apellido = models.CharField(max_length=255)
    segundo_apellido = models.CharField(max_length=255, blank=True, null=True)
    correo_electronico = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255, db_column='contrasena')
    num_telefono = models.CharField(max_length=20, unique=True, blank=True, null=True)
    curp = models.CharField(max_length=18, unique=True, blank=True, null=True)
    genero = models.CharField(max_length=50, blank=True, null=True)
    pais = models.CharField(max_length=100, blank=True, null=True)
    discapacidad = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    objects = PersonaManager()
    USERNAME_FIELD = 'correo_electronico'
    REQUIRED_FIELDS = ['nombre', 'primer_apellido']

    class Meta:
        db_table = 'persona'
        managed = False

    def __str__(self):
        return f"{self.nombre} {self.primer_apellido}"

class Evaluador(models.Model):
    id_evaluador = models.AutoField(primary_key=True)
    id_persona = models.OneToOneField(Persona, on_delete=models.CASCADE, db_column='id_persona')
    class Meta:
        db_table = 'evaluador'
        managed = False

class Dictaminador(models.Model):
    id_dictaminador = models.AutoField(primary_key=True)
    id_persona = models.OneToOneField(Persona, on_delete=models.CASCADE, db_column='id_persona')
    class Meta:
        db_table = 'dictaminador'
        managed = False

class Ponente(models.Model):
    id_ponente = models.AutoField(primary_key=True)
    id_persona = models.OneToOneField(Persona, on_delete=models.CASCADE, db_column='id_persona')
    class Meta:
        db_table = 'ponente'
        managed = False

class Asistente(models.Model):
    id_asistente = models.AutoField(primary_key=True)
    id_persona = models.OneToOneField(Persona, on_delete=models.CASCADE, db_column='id_persona')
    institucion_procedencia = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        db_table = 'asistente'
        managed = False

class Factura(models.Model):
    id_factura = models.AutoField(primary_key=True)
    id_persona = models.ForeignKey(Persona, models.DO_NOTHING, db_column='id_persona')
    id_congreso = models.ForeignKey(Congreso, models.DO_NOTHING, db_column='id_congreso', blank=True, null=True)
    rfc = models.CharField(max_length=13, blank=True, null=True)
    razon_social = models.CharField(max_length=255, blank=True, null=True)
    codigo_postal = models.CharField(max_length=10, blank=True, null=True)
    regimen_fiscal = models.CharField(max_length=255, blank=True, null=True)
    ruta_pdf_xml = models.CharField(max_length=255, blank=True, null=True)
    estatus = models.CharField(max_length=20, default='pendiente')
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    fecha_envio = models.DateTimeField(blank=True, null=True)
    class Meta:
        db_table = 'factura'
        managed = False

class Constancia(models.Model):
    id_constancia = models.AutoField(primary_key=True)
    id_persona = models.ForeignKey(Persona, models.DO_NOTHING, db_column='id_persona')
    id_congreso = models.ForeignKey(Congreso, models.DO_NOTHING, db_column='id_congreso', blank=True, null=True)
    ruta_constancia = models.CharField(max_length=255, blank=True, null=True)
    tipo_constancia = models.CharField(max_length=50, blank=True, null=True)
    estatus = models.CharField(max_length=20, default='generada')
    fecha_emision = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'constancia'
        managed = False

class HistorialAcciones(models.Model):
    id_historial_acciones = models.AutoField(primary_key=True)
    id_persona = models.ForeignKey(Persona, models.DO_NOTHING, db_column='id_persona')
    rol = models.CharField(max_length=50, blank=True, null=True)
    fecha_accion = models.DateTimeField(auto_now_add=True)
    accion = models.CharField(max_length=255)
    class Meta:
        db_table = 'historial_acciones'
        managed = False
