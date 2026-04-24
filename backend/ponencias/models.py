from django.db import models
from users.models import Dictaminador, Evaluador, Ponente

class Evento(models.Model):
    id_evento = models.AutoField(primary_key=True)
    nombre_evento = models.CharField(max_length=255)
    fecha_hora_inicio = models.DateTimeField()
    cupos = models.SmallIntegerField(default=0)

    class Meta:
        db_table = 'evento'
        managed = False

class Resumen(models.Model):
    id_resumen = models.AutoField(primary_key=True)
    id_dictaminador = models.ForeignKey(Dictaminador, on_delete=models.SET_NULL, null=True, blank=True, db_column='id_dictaminador')
    fecha_entrega = models.DateTimeField(auto_now_add=True)
    revisado = models.BooleanField(default=False)
    estatus = models.CharField(max_length=50, null=True, blank=True) # Aceptado, Rechazado
    retroalimentacion = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'resumen'
        managed = False

class Extenso(models.Model):
    id_extenso = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=255)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    revisado = models.BooleanField(default=False)
    version_numero = models.IntegerField(default=1)

    class Meta:
        db_table = 'extenso'
        managed = False

class Ponencia(models.Model):
    id_ponencia = models.AutoField(primary_key=True)
    id_evento = models.IntegerField(db_column='id_evento', null=True, blank=True)
    tipo_participacion = models.CharField(max_length=50, null=True, blank=True)
    id_subarea = models.IntegerField(db_column='id_subarea')
    
    id_resumen = models.ForeignKey(Resumen, on_delete=models.CASCADE, db_column='id_resumen')
    id_extenso = models.ForeignKey(Extenso, on_delete=models.SET_NULL, null=True, blank=True, db_column='id_extenso')
    id_multimedia = models.IntegerField(db_column='id_multimedia', null=True, blank=True)

    class Meta:
        db_table = 'ponencia'
        managed = False

class DictamenResumen(models.Model):
    id_dictamen = models.AutoField(primary_key=True)
    id_resumen = models.ForeignKey(Resumen, on_delete=models.CASCADE, db_column='id_resumen', related_name='dictamenes')
    id_dictaminador = models.ForeignKey(Dictaminador, on_delete=models.CASCADE, db_column='id_dictaminador')
    retroalimentacion_general = models.TextField(null=True, blank=True)
    estatus = models.CharField(max_length=50)
    fecha_de_revision = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'dictamen_resumen'
        managed = False

class Evaluacion(models.Model):
    id_evaluacion = models.AutoField(primary_key=True)
    id_extenso = models.ForeignKey(Extenso, on_delete=models.CASCADE, db_column='id_extenso', related_name='evaluaciones')
    id_evaluador = models.ForeignKey(Evaluador, on_delete=models.CASCADE, db_column='id_evaluador')
    retroalimentacion_general = models.TextField(null=True, blank=True)
    estatus = models.CharField(max_length=50)
    fecha_de_revision = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'evaluacion'
        managed = False

class PonenteHasPonencia(models.Model):
    id_ponente_has_ponencia = models.AutoField(primary_key=True)
    id_ponente = models.ForeignKey(Ponente, on_delete=models.CASCADE, db_column='id_ponente')
    id_ponencia = models.ForeignKey(Ponencia, on_delete=models.CASCADE, db_column='id_ponencia', related_name='autores')
    asistio = models.BooleanField(default=False)

    class Meta:
        db_table = 'ponente_has_ponencia'
        managed = False
