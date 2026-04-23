from django.db import models
from users.models import Asistente, Ponente
from congresos.models import Evento

class Ponencia(models.Model):
    id_ponencia = models.AutoField(primary_key=True)
    id_evento = models.ForeignKey(Evento, models.DO_NOTHING, db_column='id_evento')
    tipo_participacion = models.CharField(max_length=50) # 'presencial', 'virtual', etc.
    
    class Meta:
        managed = False
        db_table = 'ponencia'

class PonenteHasPonencia(models.Model):
    id_ponente_has_ponencia = models.AutoField(primary_key=True)
    id_ponente = models.ForeignKey(Ponente, models.DO_NOTHING, db_column='id_ponente')
    id_ponencia = models.ForeignKey(Ponencia, models.DO_NOTHING, db_column='id_ponencia')
    
    class Meta:
        managed = False
        db_table = 'ponente_has_ponencia'

class AsistenteEvento(models.Model):
    id_asistente_evento = models.AutoField(primary_key=True)
    id_asistente = models.ForeignKey(Asistente, models.DO_NOTHING, db_column='id_asistente')
    id_evento = models.ForeignKey(Evento, models.DO_NOTHING, db_column='id_evento')
    fecha_inscripcion = models.DateTimeField(blank=True, null=True, auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'asistente_evento'
        unique_together = (('id_asistente', 'id_evento'),)
