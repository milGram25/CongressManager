from rest_framework import status, viewsets, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.db import connection, transaction
from django.utils import timezone
from datetime import datetime, timedelta
from calendar import monthrange
import os

from .models import Sede, Institucion, Congreso, Evento, MesasTrabajo, FechasCongreso, CostosCongreso, Rubrica, TipoTrabajo, Dictamen, DictamenPregunta, Subarea, Taller
from .serializers import SedeSerializer, InstitucionSerializer, CongresoSerializer, EventoSerializer, MesasTrabajoSerializer, RubricaSerializer, TipoTrabajoSerializer, DictamenSerializer, DictamenPreguntaSerializer, SubareaSerializer, TallerSerializer

def clean_date(val, default=None):
    if val is None or (isinstance(val, str) and val.strip() == ""):
        return default
    return val

class RubricaViewSet(viewsets.ModelViewSet):
    serializer_class = RubricaSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = Rubrica.objects.all()
        id_congreso = self.request.query_params.get('id_congreso')
        if id_congreso:
            queryset = queryset.filter(id_congreso_id=id_congreso)
        return queryset
    def perform_create(self, serializer):
        id_congreso = self.request.data.get('id_congreso')
        if id_congreso:
            serializer.save(id_congreso_id=id_congreso)
        else:
            serializer.save()

class TipoTrabajoViewSet(viewsets.ModelViewSet):
    serializer_class = TipoTrabajoSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = TipoTrabajo.objects.all()
        id_congreso = self.request.query_params.get('id_congreso')
        if id_congreso:
            queryset = queryset.filter(id_congreso_id=id_congreso)
        return queryset
    def create(self, request, *args, **kwargs):
        data = request.data
        id_congreso = data.get('id_congreso')
        nombre = data.get('nombre')
        if not nombre:
            return Response({'detail': 'El nombre es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO tipo_trabajo (tipo_trabajo, id_congreso) VALUES (%s, %s) RETURNING id_tipo_trabajo", [nombre, id_congreso])
                new_id = cursor.fetchone()[0]
            tipo = TipoTrabajo.objects.get(id_tipo_trabajo=new_id)
            return Response(self.get_serializer(tipo).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM tipo_trabajo WHERE id_tipo_trabajo = %s", [instance.id_tipo_trabajo])
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class DictamenViewSet(viewsets.ModelViewSet):
    queryset = Dictamen.objects.all()
    serializer_class = DictamenSerializer
    permission_classes = [IsAuthenticated]

class DictamenPreguntaViewSet(viewsets.ModelViewSet):
    queryset = DictamenPregunta.objects.all()
    serializer_class = DictamenPreguntaSerializer
    permission_classes = [IsAuthenticated]

class MesasTrabajoViewSet(viewsets.ModelViewSet):
    queryset = MesasTrabajo.objects.all()
    serializer_class = MesasTrabajoSerializer
    permission_classes = [IsAuthenticated]

class SedeViewSet(viewsets.ModelViewSet):
    queryset = Sede.objects.all()
    serializer_class = SedeSerializer
    permission_classes = [IsAuthenticated]

class SubareaViewSet(viewsets.ModelViewSet):
    queryset = Subarea.objects.all()
    serializer_class = SubareaSerializer
    permission_classes = [IsAuthenticated]

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]

class TallerViewSet(viewsets.ModelViewSet):
    serializer_class = TallerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Taller.objects.all().select_related('id_evento', 'id_subarea', 'id_evento__id_congreso')
        id_congreso = self.request.query_params.get('id_congreso')
        if id_congreso:
            queryset = queryset.filter(id_evento__id_congreso_id=id_congreso)
        return queryset

    def list(self, request, *args, **kwargs):
        id_congreso = self.request.query_params.get('id_congreso')
        with connection.cursor() as cursor:
            sql = """
                SELECT t.id_taller, t.tallerista, t.tipo_participacion, 
                       e.nombre_evento, e.fecha_hora_inicio, e.fecha_hora_final, e.cupos, e.enlace, e.sinopsis,
                       c.nombre_congreso, c.id_congreso
                FROM taller t
                JOIN evento e ON t.id_evento = e.id_evento
                JOIN congreso c ON e.id_congreso = c.id_congreso
            """
            params = []
            if id_congreso:
                sql += " WHERE c.id_congreso = %s"
                params.append(id_congreso)
            
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            
            data = []
            for r in rows:
                data.append({
                    'id': r[0],
                    'id_taller': r[0],
                    'tallerista': r[1],
                    'tipo_participacion': r[2],
                    'nombre_evento': r[3],
                    'fecha_hora_inicio': r[4].isoformat() if r[4] else None,
                    'fecha_hora_final': r[5].isoformat() if r[5] else None,
                    'cupos': r[6],
                    'enlace': r[7],
                    'sinopsis': r[8],
                    'nombre_congreso': r[9],
                    'id_congreso': r[10]
                })
        return Response(data)

    def get_object(self):
        pk = self.kwargs.get('pk')
        return Taller.objects.get(id_taller=pk)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        data['id'] = instance.id_taller
        data['id_congreso'] = instance.id_evento.id_congreso_id
        return Response(data)

    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    # 1. Asegurar que exista id_tipo_trabajo para 'taller' en ESTE congreso
                    id_congreso = data.get('id_congreso')
                    cursor.execute("SELECT id_tipo_trabajo FROM tipo_trabajo WHERE id_congreso = %s AND tipo_trabajo ILIKE 'taller' LIMIT 1", [id_congreso])
                    row = cursor.fetchone()
                    
                    if row:
                        id_tipo_id = row[0]
                    else:
                        # Si no existe, lo creamos dinámicamente para este congreso
                        cursor.execute("INSERT INTO tipo_trabajo (tipo_trabajo, id_congreso) VALUES ('Taller', %s) RETURNING id_tipo_trabajo", [id_congreso])
                        id_tipo_id = cursor.fetchone()[0]

                    # 2. Insertar Evento base
                    cursor.execute("""
                        INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id_evento
                    """, [
                        data.get('id_congreso'), data.get('nombre_evento'), 'taller', id_tipo_id,
                        data.get('id_mesas_trabajo') if data.get('id_mesas_trabajo') else None,
                        clean_date(data.get('fecha_hora_inicio')), clean_date(data.get('fecha_hora_final')),
                        data.get('sinopsis', ''), int(data.get('cupos', 0)), data.get('enlace', '')
                    ])
                    id_evento = cursor.fetchone()[0]

                    # 3. Normalizar tipo participación
                    tipo_p = str(data.get('tipo_participacion', 'presencial')).lower()
                    if 'híbrido' in tipo_p or 'hibrido' in tipo_p: tipo_p = 'hibrida'
                    elif 'virtual' in tipo_p: tipo_p = 'virtual'
                    else: tipo_p = 'presencial'

                    # 4. Insertar Taller
                    cursor.execute("""
                        INSERT INTO taller (tallerista, id_evento, tipo_participacion, id_subarea, id_multimedia)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING id_taller
                    """, [
                        data.get('tallerista', 'Sin nombre'), id_evento, tipo_p,
                        data.get('id_subarea') if data.get('id_subarea') else None,
                        data.get('id_multimedia') if data.get('id_multimedia') else None
                    ])
                    id_taller = cursor.fetchone()[0]
                    
                    taller = Taller.objects.get(id_taller=id_taller)
                    data_resp = self.get_serializer(taller).data
                    data_resp['id'] = id_taller
                    return Response(data_resp, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    # 1. Actualizar Evento
                    cursor.execute("""
                        UPDATE evento SET 
                            nombre_evento = %s, id_mesas_trabajo = %s, 
                            fecha_hora_inicio = %s, fecha_hora_final = %s, 
                            sinopsis = %s, cupos = %s, enlace = %s
                        WHERE id_evento = %s
                    """, [
                        data.get('nombre_evento', instance.id_evento.nombre_evento),
                        clean_date(data.get('id_mesas_trabajo'), instance.id_evento.id_mesas_trabajo_id),
                        clean_date(data.get('fecha_hora_inicio'), instance.id_evento.fecha_hora_inicio),
                        clean_date(data.get('fecha_hora_final'), instance.id_evento.fecha_hora_final),
                        data.get('sinopsis', instance.id_evento.sinopsis),
                        int(data.get('cupos', instance.id_evento.cupos)),
                        data.get('enlace', instance.id_evento.enlace),
                        instance.id_evento_id
                    ])

                    # 2. Normalizar tipo participación
                    tipo_p = str(data.get('tipo_participacion', instance.tipo_participacion)).lower()
                    if 'híbrido' in tipo_p or 'hibrido' in tipo_p: tipo_p = 'hibrida'
                    elif 'virtual' in tipo_p: tipo_p = 'virtual'
                    else: tipo_p = 'presencial'

                    # 3. Actualizar Taller
                    cursor.execute("""
                        UPDATE taller SET 
                            tallerista = %s, id_subarea = %s, tipo_participacion = %s
                        WHERE id_taller = %s
                    """, [
                        data.get('tallerista', instance.tallerista),
                        clean_date(data.get('id_subarea'), instance.id_subarea_id),
                        tipo_p, instance.id_taller
                    ])
                
                instance.refresh_from_db()
                res_data = self.get_serializer(instance).data
                res_data['id'] = instance.id_taller
                res_data['id_congreso'] = instance.id_evento.id_congreso_id
                return Response(res_data)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            with transaction.atomic():
                id_evento = instance.id_evento_id
                with connection.cursor() as cursor:
                    cursor.execute("DELETE FROM taller WHERE id_taller = %s", [instance.id_taller])
                    cursor.execute("DELETE FROM evento WHERE id_evento = %s", [id_evento])
                return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class InstitucionViewSet(viewsets.ModelViewSet):
    queryset = Institucion.objects.all()
    serializer_class = InstitucionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        image_file = request.FILES.get('image')
        
        # Guardar imagen si existe
        ruta_imagen = None
        if image_file:
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'instituciones')
            os.makedirs(upload_dir, exist_ok=True)
            fs = FileSystemStorage(location=upload_dir, base_url='/media/instituciones/')
            filename = fs.save(image_file.name, image_file)
            ruta_imagen = f"/media/instituciones/{filename}"

        # Usar SQL directo ya que managed=False y para asegurar consistencia con el estilo del proyecto
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO institucion (nombre, ubicacion, pais, ruta_imagen) VALUES (%s, %s, %s, %s) RETURNING id_institucion",
                    [data.get('nombre'), data.get('ubicacion'), data.get('pais', 'México'), ruta_imagen]
                )
                new_id = cursor.fetchone()[0]
            
            inst = Institucion.objects.get(id_institucion=new_id)
            return Response(self.get_serializer(inst).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        image_file = request.FILES.get('image')

        ruta_imagen = instance.ruta_imagen
        if image_file:
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'instituciones')
            os.makedirs(upload_dir, exist_ok=True)
            fs = FileSystemStorage(location=upload_dir, base_url='/media/instituciones/')
            filename = fs.save(image_file.name, image_file)
            ruta_imagen = f"/media/instituciones/{filename}"

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE institucion SET nombre=%s, ubicacion=%s, pais=%s, ruta_imagen=%s WHERE id_institucion=%s",
                    [data.get('nombre', instance.nombre), data.get('ubicacion', instance.ubicacion), 
                     data.get('pais', instance.pais), ruta_imagen, instance.id_institucion]
                )
            
            instance.refresh_from_db()
            return Response(self.get_serializer(instance).data)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CongresoViewSet(viewsets.ModelViewSet):
    serializer_class = CongresoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Congreso.objects.all().select_related('id_sede', 'id_fechas_congreso', 'id_costos_congreso', 'id_institucion')
        id_institucion = self.request.query_params.get('id_institucion')
        if id_institucion:
            queryset = queryset.filter(id_institucion_id=id_institucion)
        return queryset

    def _validate_dates(self, data, is_update=False):
        required_dates = [
            'congreso_inicio', 'congreso_fin',
            'envio_ponencias_inicio', 'envio_ponencias_fin',
            'revision_resumenes_inicio', 'revision_resumenes_fin',
            'inscripcion_dictaminadores_inicio', 'inscripcion_dictaminadores_fin',
            'inscripcion_evaluadores_inicio', 'inscripcion_evaluadores_fin',
            'subir_multimedia_inicio', 'subir_multimedia_fin'
        ]
        errors = {}
        if not is_update:
            for field in required_dates:
                val = data.get(field)
                if val is None or (isinstance(val, str) and val.strip() == ""):
                    errors[field] = "Este campo es obligatorio."
        return errors

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        data = request.data
        date_errors = self._validate_dates(data, is_update=False)
        if date_errors:
            return Response({'detail': 'Faltan fechas obligatorias', 'errors': date_errors}, status=status.HTTP_400_BAD_REQUEST)
        
        now = timezone.now()
        try:
            with transaction.atomic():
                sede = Sede.objects.create(
                    nombre_sede=clean_date(data.get('nombre_sede'), 'Sin nombre'),
                    pais=clean_date(data.get('pais'), 'México'),
                    estado=clean_date(data.get('estado'), ''),
                    ciudad=clean_date(data.get('ciudad'), ''),
                    calle=clean_date(data.get('calle'), ''),
                    num_exterior=int(clean_date(data.get('numero_exterior'), 0)),
                    num_interior=int(data.get('numero_interior')) if clean_date(data.get('numero_interior')) else None,
                    modulo_fisico=clean_date(data.get('modulo_fisico'))
                )
                fechas = FechasCongreso.objects.create(
                    fecha_inicio_evento=data.get('congreso_inicio'),
                    fecha_final_evento=data.get('congreso_fin'),
                    fecha_inicio_pago_normal=data.get('pagos_normales_inicio', now),
                    fecha_fin_pago_normal=data.get('pagos_normales_fin', now),
                    fecha_inicio_inscribir_dictaminador=data.get('inscripcion_dictaminadores_inicio'),
                    fecha_fin_inscribir_dictaminador=data.get('inscripcion_dictaminadores_fin'),
                    fecha_inicio_inscribir_evaluador=data.get('inscripcion_evaluadores_inicio'),
                    fecha_fin_inscribir_evaluador=data.get('inscripcion_evaluadores_fin'),
                    fecha_inicio_subida_ponencias=data.get('envio_ponencias_inicio'),
                    fecha_fin_subida_ponencias=data.get('envio_ponencias_fin'),
                    fecha_inicio_evaluar_resumenes=data.get('revision_resumenes_inicio'),
                    fecha_final_evaluar_resumenes=data.get('revision_resumenes_fin'),
                    fecha_inicio_evaluar_extensos=data.get('revision_extensos_inicio', now),
                    fecha_fin_evaluar_extensos=data.get('revision_extensos_fin', now),
                    fecha_inicio_subir_multimedia=data.get('subir_multimedia_inicio'),
                    fecha_fin_subir_multimedia=data.get('subir_multimedia_fin'),
                    fecha_inicio_subir_extenso_final=data.get('envio_extensos_inicio'),
                    fecha_fin_subir_extenso_final=data.get('envio_extensos_fin')
                )
                costos = CostosCongreso.objects.create(
                    cuenta_deposito=clean_date(data.get('cuenta_deposito'), ''),
                    descuento_prepago=float(clean_date(data.get('descuento_prepago'), 0)),
                    descuento_estudiante=float(clean_date(data.get('descuento_estudiante'), 0)),
                    costo_congreso_asistente=float(clean_date(data.get('costo_asistente'), 0)),
                    costo_congreso_ponente=float(clean_date(data.get('costo_ponente'), 0)),
                    costo_congreso_comite=float(clean_date(data.get('costo_miembro_comite'), 0))
                )
                inst_nombre = clean_date(data.get('nombre_institucion'))
                if not inst_nombre:
                    return Response({'detail': 'La institución es obligatoria.'}, status=status.HTTP_400_BAD_REQUEST)
                institucion, _ = Institucion.objects.get_or_create(nombre=inst_nombre)
                congreso = Congreso.objects.create(
                    nombre_congreso=clean_date(data.get('nombre_congreso'), 'Nuevo Congreso'),
                    id_sede=sede, id_institucion=institucion, id_fechas_congreso=fechas, id_costos_congreso=costos
                )
                return Response(self.get_serializer(congreso).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        date_errors = self._validate_dates(data, is_update=True)
        if date_errors:
            return Response({'detail': 'Faltan fechas obligatorias', 'errors': date_errors}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                sede = instance.id_sede
                sede.nombre_sede = clean_date(data.get('nombre_sede'), sede.nombre_sede)
                sede.pais = clean_date(data.get('pais'), sede.pais)
                sede.estado = clean_date(data.get('estado'), sede.estado)
                sede.ciudad = clean_date(data.get('ciudad'), sede.ciudad)
                sede.calle = clean_date(data.get('calle'), sede.calle)
                sede.num_exterior = int(clean_date(data.get('numero_exterior'), sede.num_exterior))
                sede.num_interior = int(data.get('numero_interior')) if clean_date(data.get('numero_interior')) else None
                sede.modulo_fisico = clean_date(data.get('modulo_fisico'), sede.modulo_fisico)
                sede.save()
                
                fe = instance.id_fechas_congreso
                fe.fecha_inicio_evento = clean_date(data.get('congreso_inicio'), fe.fecha_inicio_evento)
                fe.fecha_final_evento = clean_date(data.get('congreso_fin'), fe.fecha_final_evento)
                fe.fecha_inicio_pago_normal = clean_date(data.get('pagos_normales_inicio'), fe.fecha_inicio_pago_normal)
                fe.fecha_fin_pago_normal = clean_date(data.get('pagos_normales_fin'), fe.fecha_fin_pago_normal)
                fe.fecha_inicio_inscribir_dictaminador = clean_date(data.get('inscripcion_dictaminadores_inicio'), fe.fecha_inicio_inscribir_dictaminador)
                fe.fecha_fin_inscribir_dictaminador = clean_date(data.get('inscripcion_dictaminadores_fin'), fe.fecha_fin_inscribir_dictaminador)
                fe.fecha_inicio_inscribir_evaluador = clean_date(data.get('inscripcion_evaluadores_inicio'), fe.fecha_inicio_inscribir_evaluador)
                fe.fecha_fin_inscribir_evaluador = clean_date(data.get('inscripcion_evaluadores_fin'), fe.fecha_fin_inscribir_evaluador)
                fe.fecha_inicio_subida_ponencias = clean_date(data.get('envio_ponencias_inicio'), fe.fecha_inicio_subida_ponencias)
                fe.fecha_fin_subida_ponencias = clean_date(data.get('envio_ponencias_fin'), fe.fecha_fin_subida_ponencias)
                fe.fecha_inicio_evaluar_resumenes = clean_date(data.get('revision_resumenes_inicio'), fe.fecha_inicio_evaluar_resumenes)
                fe.fecha_final_evaluar_resumenes = clean_date(data.get('revision_resumenes_fin'), fe.fecha_final_evaluar_resumenes)
                fe.fecha_inicio_evaluar_extensos = clean_date(data.get('revision_extensos_inicio'), fe.fecha_inicio_evaluar_extensos)
                fe.fecha_fin_evaluar_extensos = clean_date(data.get('revision_extensos_fin'), fe.fecha_fin_evaluar_extensos)
                fe.fecha_inicio_subir_multimedia = clean_date(data.get('subir_multimedia_inicio'), fe.fecha_inicio_subir_multimedia)
                fe.fecha_fin_subir_multimedia = clean_date(data.get('subir_multimedia_fin'), fe.fecha_fin_subir_multimedia)
                fe.fecha_inicio_subir_extenso_final = clean_date(data.get('envio_extensos_inicio'), fe.fecha_inicio_subir_extenso_final)
                fe.fecha_fin_subir_extenso_final = clean_date(data.get('envio_extensos_fin'), fe.fecha_fin_subir_extenso_final)
                fe.save()
                
                co = instance.id_costos_congreso
                co.cuenta_deposito = clean_date(data.get('cuenta_deposito'), co.cuenta_deposito)
                co.descuento_prepago = float(clean_date(data.get('descuento_prepago'), co.descuento_prepago))
                co.descuento_estudiante = float(clean_date(data.get('descuento_estudiante'), co.descuento_estudiante))
                co.costo_congreso_asistente = float(clean_date(data.get('costo_asistente'), co.costo_congreso_asistente))
                co.costo_congreso_ponente = float(clean_date(data.get('costo_ponente'), co.costo_congreso_ponente))
                co.costo_congreso_comite = float(clean_date(data.get('costo_miembro_comite'), co.costo_congreso_comite))
                co.save()
                
                inst_nombre = clean_date(data.get('nombre_institucion'))
                if inst_nombre:
                    institucion, _ = Institucion.objects.get_or_create(nombre=inst_nombre)
                    instance.id_institucion = institucion
                instance.nombre_congreso = clean_date(data.get('nombre_congreso'), instance.nombre_congreso)
                instance.save()
                data_resp = self.get_serializer(instance).data
                data_resp['id'] = instance.id_congreso
                return Response(data_resp)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CongresoSignaturesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id_congreso):
        try:
            congreso = Congreso.objects.get(id_congreso=id_congreso)
            return Response(CongresoSerializer(congreso).data)
        except Congreso.DoesNotExist:
            return Response({'detail': 'Congreso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    def post(self, request, id_congreso):
        try:
            congreso = Congreso.objects.get(id_congreso=id_congreso)
            if congreso.firmas_bloqueadas and str(request.data.get('lock', '')).lower() != 'false':
                return Response({'detail': 'Firmas bloqueadas.'}, status=status.HTTP_400_BAD_REQUEST)
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'firmas')
            os.makedirs(upload_dir, exist_ok=True)
            fs = FileSystemStorage(location=upload_dir, base_url='/media/firmas/')
            if request.FILES.get('firma_organizador'):
                filename = fs.save(f"f_org_{id_congreso}_{request.FILES['firma_organizador'].name}", request.FILES['firma_organizador'])
                congreso.firma_organizador = f"{settings.MEDIA_URL}firmas/{filename}"
            if request.FILES.get('firma_secretaria'):
                filename = fs.save(f"f_sec_{id_congreso}_{request.FILES['firma_secretaria'].name}", request.FILES['firma_secretaria'])
                congreso.firma_secretaria = f"{settings.MEDIA_URL}firmas/{filename}"
            if request.data.get('lock') is not None:
                congreso.firmas_bloqueadas = str(request.data['lock']).lower() == 'true'
            congreso.save()
            return Response(CongresoSerializer(congreso).data)
        except Congreso.DoesNotExist:
            return Response({'detail': 'Congreso no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

class AgendaHoyView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        today = timezone.localdate()
        start = datetime.combine(today, datetime.min.time())
        events = _fetch_events_between(start, start + timedelta(days=1))
        return Response({'date': today.isoformat(), 'events': events})

class AgendaCalendarioView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        month_value = request.query_params.get('month')
        year, month = _parse_month(month_value)
        if not year: return Response({'detail': 'Formato inválido.'}, status=status.HTTP_400_BAD_REQUEST)
        start = datetime(year, month, 1)
        _, days = monthrange(year, month)
        events = _fetch_events_between(start, start + timedelta(days=days))
        return Response({'month': f'{year:04d}-{month:02d}', 'events': events})

class PagosResumenView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        summary = _build_payment_summary(request.user)
        if not summary: return Response({'detail': 'Sin costos.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(summary)

class RegistrarPagoView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        summary = _build_payment_summary(request.user)
        if not summary: return Response({'detail': 'Sin costos.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'detail': 'Pago registrado.'}, status=status.HTTP_201_CREATED)

def _fetch_events_between(start, end):
    with connection.cursor() as cursor:
        cursor.execute("SELECT e.id_evento, e.nombre_evento FROM evento e WHERE e.fecha_hora_inicio >= %s AND e.fecha_hora_inicio < %s", [start, end])
        rows = cursor.fetchall()
    return [{'id': r[0], 'title': r[1]} for r in rows]

def _parse_month(val):
    try:
        d = datetime.strptime(val, '%Y-%m') if val else timezone.localdate()
        return d.year, d.month
    except: return None, None

def _get_user_role(u):
    if u.is_superuser: return 'administrador'
    return 'asistente'

def _get_latest_costos_congreso():
    with connection.cursor() as cursor:
        cursor.execute("SELECT id_costos_congreso, costo_congreso_asistente, costo_congreso_ponente, costo_congreso_comite FROM costos_congreso ORDER BY id_costos_congreso DESC LIMIT 1")
        row = cursor.fetchone()
    if not row: return None
    return {'id_costos_congreso': row[0], 'costo_asistente': float(row[1]), 'costo_ponente': float(row[2]), 'costo_comite': float(row[3])}

def _build_payment_summary(u):
    costos = _get_latest_costos_congreso()
    if not costos: return None
    return {'price_catalog': {'asistente': costos['costo_asistente'], 'ponente': costos['costo_ponente'], 'comite': costos['costo_comite']}, 'user_payment': {'role': 'asistente', 'costos_id': costos['id_costos_congreso'], 'total_due': 0}}

def _has_role_payment(u_id, c): return False
