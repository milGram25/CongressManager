from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

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
    # Mapear el atributo interno password de Django a la columna contrasena
    password = models.CharField(max_length=255, db_column='contrasena')
    num_telefono = models.CharField(max_length=20, unique=True, blank=True, null=True)
    curp = models.CharField(max_length=18, unique=True, blank=True, null=True)
    genero = models.CharField(max_length=50, blank=True, null=True)
    pais = models.CharField(max_length=100, blank=True, null=True)
    discapacidad = models.CharField(max_length=255, blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    # is_superuser y last_login provienen de PermissionsMixin y AbstractBaseUser

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