from django.db import models

class Sede(models.Model):
    id_sede = models.AutoField(primary_key=True)
    nombre_sede = models.CharField(max_length=255)
    
    class Meta:
        managed = False
        db_table = 'sede'

class MesasTrabajo(models.Model):
    id_mesas_trabajo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    id_sede = models.ForeignKey(Sede, models.DO_NOTHING, db_column='id_sede')
    
    class Meta:
        managed = False
        db_table = 'mesas_trabajo'

class Evento(models.Model):
    id_evento = models.AutoField(primary_key=True)
    nombre_evento = models.CharField(max_length=255)
    tipo_evento = models.CharField(max_length=50) # 'ponencia', 'taller'
    id_mesas_trabajo = models.ForeignKey(MesasTrabajo, models.DO_NOTHING, db_column='id_mesas_trabajo', blank=True, null=True)
    fecha_hora_inicio = models.DateTimeField()
    fecha_hora_final = models.DateTimeField()
    sinopsis = models.TextField(blank=True, null=True)
    
    class Meta:
        managed = False
        db_table = 'evento'
