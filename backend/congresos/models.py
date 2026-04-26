from django.db import models


class Institucion(models.Model):
    id_institucion = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    ruta_imagen = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'institucion'


class Sede(models.Model):
    id_sede = models.AutoField(primary_key=True)
    nombre_sede = models.CharField(max_length=255)
    pais = models.CharField(max_length=100)
    estado = models.CharField(max_length=100)
    ciudad = models.CharField(max_length=100)
    calle = models.CharField(max_length=255)
    num_exterior = models.IntegerField()
    num_interior = models.IntegerField(blank=True, null=True)
    modulo_fisico = models.CharField(max_length=255, blank=True, null=True)

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
    tipo_evento = models.CharField(max_length=50)
    id_mesas_trabajo = models.ForeignKey(MesasTrabajo, models.DO_NOTHING, db_column='id_mesas_trabajo', blank=True, null=True)
    fecha_hora_inicio = models.DateTimeField()
    fecha_hora_final = models.DateTimeField()
    sinopsis = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'evento'


class TipoTrabajo(models.Model):
    id_tipo_trabajo = models.AutoField(primary_key=True)
    tipo_trabajo = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'tipo_trabajo'


class Rubrica(models.Model):
    id_rubrica = models.AutoField(primary_key=True)
    tipo_trabajo = models.ForeignKey(TipoTrabajo, models.DO_NOTHING, db_column='tipo_trabajo')
    nombre = models.CharField(max_length=255)
    esta_activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'rubrica'


class FechasCongreso(models.Model):
    id_fechas_congreso = models.AutoField(primary_key=True)
    fecha_inicio_evento = models.DateTimeField()
    fecha_final_evento = models.DateTimeField()
    fecha_inicio_prepago = models.DateTimeField(blank=True, null=True)
    fecha_fin_prepago = models.DateTimeField(blank=True, null=True)
    fecha_inicio_pago_normal = models.DateTimeField()
    fecha_fin_pago_normal = models.DateTimeField()
    fecha_inicio_inscribir_dictaminador = models.DateTimeField()
    fecha_fin_inscribir_dictaminador = models.DateTimeField()
    fecha_inicio_inscribir_evaluador = models.DateTimeField()
    fecha_fin_inscribir_evaluador = models.DateTimeField()
    fecha_inicio_subida_ponencias = models.DateTimeField()
    fecha_fin_subida_ponencias = models.DateTimeField()
    fecha_inicio_evaluar_resumenes = models.DateTimeField()
    fecha_final_evaluar_resumenes = models.DateTimeField()
    fecha_inicio_evaluar_extensos = models.DateTimeField()
    fecha_fin_evaluar_extensos = models.DateTimeField()
    fecha_inicio_subir_multimedia = models.DateTimeField()
    fecha_fin_subir_multimedia = models.DateTimeField()
    fecha_inicio_subir_extenso_final = models.DateTimeField()
    fecha_fin_subir_extenso_final = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'fechas_congreso'


class CostosCongreso(models.Model):
    id_costos_congreso = models.AutoField(primary_key=True)
    cuenta_deposito = models.CharField(max_length=255)
    descuento_prepago = models.FloatField(default=0)
    descuento_estudiante = models.FloatField(default=0)
    costo_congreso_asistente = models.FloatField()
    costo_congreso_ponente = models.FloatField()
    costo_congreso_comite = models.FloatField()

    class Meta:
        managed = False
        db_table = 'costos_congreso'


class Congreso(models.Model):
    id_congreso = models.AutoField(primary_key=True)
    nombre_congreso = models.CharField(max_length=255)
    id_sede = models.ForeignKey(Sede, models.DO_NOTHING, db_column='id_sede')
    id_institucion = models.ForeignKey(Institucion, models.DO_NOTHING, db_column='id_institucion')
    id_fechas_congreso = models.ForeignKey(FechasCongreso, models.DO_NOTHING, db_column='id_fechas_congreso')
    id_costos_congreso = models.ForeignKey(CostosCongreso, models.DO_NOTHING, db_column='id_costos_congreso')
    id_rubrica_default = models.ForeignKey(Rubrica, models.DO_NOTHING, db_column='id_rubrica_default', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'congreso'
