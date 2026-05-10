from django.db import models
from users.models import Asistente, Ponente, Dictaminador, Evaluador
from congresos.models import Evento, Subarea, RubricaCriterio, Congreso

class Ponencia(models.Model):
    id_ponencia = models.AutoField(primary_key=True)
    id_evento = models.ForeignKey(Evento, models.DO_NOTHING, db_column='id_evento')
    tipo_participacion = models.CharField(max_length=50) # 'presencial', 'virtual', etc.
    id_subarea = models.ForeignKey(Subarea, models.DO_NOTHING, db_column='id_subarea')
    id_resumen = models.IntegerField(blank=True, null=True) # O FK a Resumen si existe
    id_extenso = models.IntegerField(blank=True, null=True) # O FK a Extenso si existe
    id_multimedia = models.IntegerField(blank=True, null=True)

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


class Resumen(models.Model):
    id_resumen = models.AutoField(primary_key=True)
    id_dictaminador = models.ForeignKey(
        Dictaminador, models.SET_NULL, db_column='id_dictaminador', null=True, blank=True
    )
    fecha_entrega = models.DateTimeField(auto_now_add=True)
    revisado = models.BooleanField(default=False)
    estatus = models.CharField(max_length=50, null=True, blank=True)
    retroalimentacion = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'resumen'


class Extenso(models.Model):
    id_extenso = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=255)
    ruta_relativa = models.CharField(max_length=500, null=True, blank=True)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    revisado = models.BooleanField(default=False)
    version_numero = models.IntegerField(default=1)
    id_evaluador = models.ForeignKey(
        Evaluador, models.SET_NULL, db_column='id_evaluador',
        null=True, blank=True, related_name='extensos_r1'
    )
    id_evaluador_2 = models.ForeignKey(
        Evaluador, models.SET_NULL, db_column='id_evaluador_2',
        null=True, blank=True, related_name='extensos_r2'
    )
    id_evaluador_3 = models.ForeignKey(
        Evaluador, models.SET_NULL, db_column='id_evaluador_3',
        null=True, blank=True, related_name='extensos_r3'
    )

    class Meta:
        managed = False
        db_table = 'extenso'


class DictamenResumen(models.Model):
    id_dictamen = models.AutoField(primary_key=True)
    id_resumen = models.ForeignKey(Resumen, models.CASCADE, db_column='id_resumen')
    id_dictaminador = models.ForeignKey(Dictaminador, models.CASCADE, db_column='id_dictaminador')
    retroalimentacion_general = models.TextField(null=True, blank=True)
    estatus = models.CharField(max_length=50)
    fecha_de_revision = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'dictamen_resumen'


class EvaluacionPregunta(models.Model):
    id_evaluacion_pregunta = models.AutoField(primary_key=True)
    id_dictamen = models.ForeignKey(DictamenResumen, models.CASCADE, db_column='id_dictamen')
    id_pregunta_id = models.IntegerField(db_column='id_pregunta')
    cumplio = models.BooleanField(null=True)
    comentario_especifico = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'evaluacion_pregunta'


class Evaluacion(models.Model):
    id_evaluacion = models.AutoField(primary_key=True)
    id_extenso = models.ForeignKey(Extenso, models.CASCADE, db_column='id_extenso')
    id_evaluador = models.ForeignKey(Evaluador, models.CASCADE, db_column='id_evaluador')
    retroalimentacion_general = models.TextField(null=True, blank=True)
    estatus = models.CharField(max_length=100)
    fecha_de_revision = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'evaluacion'


class EvaluacionCriterio(models.Model):
    id_evaluacion_criterio = models.AutoField(primary_key=True)
    id_evaluacion = models.ForeignKey(Evaluacion, models.CASCADE, db_column='id_evaluacion')
    id_criterio = models.ForeignKey(RubricaCriterio, models.CASCADE, db_column='id_criterio')
    puntaje = models.IntegerField(null=True)
    comentario_especifico = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'evaluacion_criterio'


class PonenciaMagistral(models.Model):
    id_ponencia_magistral = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=255)
    tipo_participacion = models.CharField(max_length=50)  # 'presencial', 'virtual', 'hibrida'
    id_subarea = models.ForeignKey(Subarea, models.DO_NOTHING, db_column='id_subarea')
    fecha_inicio = models.DateTimeField(blank=True, null=True)
    fecha_fin = models.DateTimeField(blank=True, null=True)
    id_congreso = models.ForeignKey(Congreso, models.DO_NOTHING, db_column='id_congreso', related_name='ponencias_magistrales')
    id_multimedia = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ponencia_magistral'


class PonenciaMagistralHasPonentemagistral(models.Model):
    id_ponencia_magistral_has_ponente_magistral = models.AutoField(primary_key=True)
    nombre_persona = models.CharField(max_length=100)
    id_ponencia_magistral = models.ForeignKey(PonenciaMagistral, models.DO_NOTHING, db_column='id_ponencia_magistral', related_name='ponentes')

    class Meta:
        managed = False
        db_table = 'ponencia_magistral_has_ponente_magistral'
