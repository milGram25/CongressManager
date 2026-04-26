from django.db import models

class Institucion(models.Model):
    id_institucion = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    ubicacion = models.CharField(max_length=255, blank=True, null=True)
    pais = models.CharField(max_length=100, default='México')
    ruta_imagen = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'institucion'
    
    def __str__(self):
        return self.nombre

class Subarea(models.Model):
    id_subareas = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    id_area_general = models.ForeignKey('AreaGeneral', models.DO_NOTHING, db_column='id_area_general')

    class Meta:
        managed = False
        db_table = 'subareas'

class AreaGeneral(models.Model):
    id_areas_generales = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'areas_generales'

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
    
    def __str__(self):
        return self.nombre_sede

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
    
    class Meta:
        managed = False
        db_table = 'fechas_congreso'

class Congreso(models.Model):
    id_congreso = models.AutoField(primary_key=True)
    nombre_congreso = models.CharField(max_length=255)
    id_sede = models.ForeignKey(Sede, models.DO_NOTHING, db_column='id_sede')
    id_institucion = models.ForeignKey(Institucion, models.DO_NOTHING, db_column='id_institucion')
    id_fechas_congreso = models.ForeignKey(FechasCongreso, models.DO_NOTHING, db_column='id_fechas_congreso')
    id_costos_congreso = models.ForeignKey(CostosCongreso, models.DO_NOTHING, db_column='id_costos_congreso')
    id_rubrica_default = models.ForeignKey('Rubrica', models.DO_NOTHING, db_column='id_rubrica_default', blank=True, null=True)
    firma_organizador = models.CharField(max_length=255, blank=True, null=True)
    firma_secretaria = models.CharField(max_length=255, blank=True, null=True)
    firmas_bloqueadas = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = 'congreso'

class Rubrica(models.Model):
    id_rubrica = models.AutoField(primary_key=True)
    id_congreso = models.ForeignKey(Congreso, models.DO_NOTHING, db_column='id_congreso', blank=True, null=True, related_name='rubricas')
    nombre = models.CharField(max_length=255)
    
    class Meta:
        managed = False
        db_table = 'rubrica'
    
    def __str__(self):
        return self.nombre

class RubricaCriterio(models.Model):
    id_criterio = models.AutoField(primary_key=True)
    id_rubrica = models.ForeignKey(Rubrica, models.DO_NOTHING, db_column='id_rubrica', related_name='criterios')
    descripcion = models.TextField()
    puntaje_maximo = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'rubrica_criterio'

class TipoTrabajo(models.Model):
    id_tipo_trabajo = models.AutoField(primary_key=True)
    id_congreso = models.ForeignKey(Congreso, models.DO_NOTHING, db_column='id_congreso', blank=True, null=True, related_name='tipos_trabajo')
    tipo_trabajo = models.CharField(max_length=255)
    
    class Meta:
        managed = False
        db_table = 'tipo_trabajo'
    
    def __str__(self):
        return self.tipo_trabajo

class Dictamen(models.Model):
    id_dictamen = models.AutoField(primary_key=True)
    tipo_trabajo = models.ForeignKey(TipoTrabajo, models.DO_NOTHING, db_column='tipo_trabajo')
    nombre = models.CharField(max_length=255)
    esta_activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'dictamen'

    def __str__(self):
        return self.nombre

class DictamenPregunta(models.Model):
    id_pregunta = models.AutoField(primary_key=True)
    id_dictamen = models.ForeignKey(Dictamen, models.DO_NOTHING, db_column='id_dictamen', related_name='preguntas')
    descripcion = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'dictamen_pregunta'

class MesasTrabajo(models.Model):
    id_mesas_trabajo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    id_sede = models.ForeignKey(Sede, models.DO_NOTHING, db_column='id_sede')
    
    class Meta:
        managed = False
        db_table = 'mesas_trabajo'

class Evento(models.Model):
    id_evento = models.AutoField(primary_key=True)
    id_congreso = models.ForeignKey(Congreso, models.DO_NOTHING, db_column='id_congreso', related_name='eventos')
    nombre_evento = models.CharField(max_length=255)
    tipo_evento = models.CharField(max_length=50) # 'ponencia', 'taller', etc.
    id_tipo_trabajo = models.ForeignKey('TipoTrabajo', models.DO_NOTHING, db_column='id_tipo_trabajo')
    id_mesas_trabajo = models.ForeignKey(MesasTrabajo, models.DO_NOTHING, db_column='id_mesas_trabajo', blank=True, null=True)
    fecha_hora_inicio = models.DateTimeField()
    fecha_hora_final = models.DateTimeField()
    sinopsis = models.TextField(blank=True, null=True)
    cupos = models.SmallIntegerField(default=0)
    enlace = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        managed = False
        db_table = 'evento'

class Taller(models.Model):
    id_taller = models.AutoField(primary_key=True)
    tallerista = models.CharField(max_length=255)
    id_evento = models.ForeignKey(Evento, models.DO_NOTHING, db_column='id_evento')
    tipo_participacion = models.CharField(max_length=50)
    id_subarea = models.ForeignKey(Subarea, models.DO_NOTHING, db_column='id_subarea')
    id_multimedia = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'taller'
