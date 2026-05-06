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

from .models import Sede, Institucion, Congreso, Evento, MesasTrabajo, FechasCongreso, CostosCongreso, Rubrica, RubricaGrupo, RubricaCriterio, TipoTrabajo, Dictamen, DictamenPregunta, Subarea, Taller
from .serializers import SedeSerializer, InstitucionSerializer, CongresoSerializer, EventoSerializer, MesasTrabajoSerializer, RubricaSerializer, RubricaGrupoSerializer, RubricaCriterioSerializer, TipoTrabajoSerializer, DictamenSerializer, DictamenPreguntaSerializer, SubareaSerializer, TallerSerializer

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

class RubricaGrupoViewSet(viewsets.ModelViewSet):
    serializer_class = RubricaGrupoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = RubricaGrupo.objects.all()
        id_rubrica = self.request.query_params.get('id_rubrica')
        if id_rubrica:
            qs = qs.filter(id_rubrica_id=id_rubrica)
        return qs


class RubricaCriterioViewSet(viewsets.ModelViewSet):
    serializer_class = RubricaCriterioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = RubricaCriterio.objects.all()
        id_grupo = self.request.query_params.get('id_grupo')
        if id_grupo:
            qs = qs.filter(id_grupo_id=id_grupo)
        return qs


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
    serializer_class = DictamenSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Dictamen.objects.all()
        tipo_trabajo = self.request.query_params.get('tipo_trabajo')
        if tipo_trabajo:
            qs = qs.filter(tipo_trabajo_id=tipo_trabajo)
        return qs

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
        events = _fetch_events_between(start, start + timedelta(days=1), user=request.user)
        return Response({'date': today.isoformat(), 'events': events})

class AgendaCalendarioView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        month_value = request.query_params.get('month')
        year, month = _parse_month(month_value)
        if not year: return Response({'detail': 'Formato inválido.'}, status=status.HTTP_400_BAD_REQUEST)
        start = datetime(year, month, 1)
        _, days = monthrange(year, month)
        events = _fetch_events_between(start, start + timedelta(days=days), user=request.user)
        return Response({'month': f'{year:04d}-{month:02d}', 'events': events})

class PagosResumenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        id_congreso = request.query_params.get('id_congreso')
        summary = _build_payment_summary(request.user, id_congreso=id_congreso)
        if not summary:
            return Response(
                {'detail': 'No hay configuración de costos registrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(summary, status=status.HTTP_200_OK)


class RegistrarPagoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        id_congreso = request.data.get('id_congreso')
        summary = _build_payment_summary(request.user, id_congreso=id_congreso)
        if not summary:
            return Response(
                {'detail': 'No hay configuración de costos registrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        requires_invoice = bool(request.data.get('requiere_factura', False))
        role = summary['user_payment']['role']
        costos_id = summary['user_payment']['costos_id']
        base_price = summary['user_payment']['base_price']

        if role == 'ponente':
            pending_slots = int(summary['user_payment']['pending_slots'])
            paid_slots = int(summary['user_payment']['paid_slots'])
            overflow_ponencias = int(summary['user_payment']['overflow_ponencias_count'])

            if overflow_ponencias > 0:
                return Response(
                    {'detail': 'El máximo de ponencias pagables por ponente es 5.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if pending_slots <= 0:
                return Response(
                    {'detail': 'No hay pagos pendientes para este ponente.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with transaction.atomic():
                with connection.cursor() as cursor:
                    for slot in range(paid_slots + 1, paid_slots + pending_slots + 1):
                        cursor.execute(
                            "INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura) "
                            "VALUES (%s, %s, %s, %s, %s)",
                            [request.user.id_persona, base_price, _concept_for_slot(slot), costos_id, requires_invoice],
                        )

            updated_summary = _build_payment_summary(request.user, id_congreso=id_congreso)
            return Response(
                {'detail': 'Pagos de ponente registrados correctamente.', 'registered_slots': pending_slots, 'summary': updated_summary},
                status=status.HTTP_201_CREATED,
            )

        concept = f'inscripcion_{role}'
        already_paid = _has_role_payment(request.user.id_persona, concept, costos_id=costos_id)

        if already_paid:
            return Response(
                {'detail': 'Este usuario ya tiene un pago registrado para su rol.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw_monto = request.data.get('monto')
        monto = base_price
        if raw_monto is not None:
            try:
                monto = float(raw_monto)
            except (TypeError, ValueError):
                return Response({'detail': 'El monto enviado no es válido.'}, status=status.HTTP_400_BAD_REQUEST)
            if monto <= 0:
                return Response({'detail': 'El monto debe ser mayor a cero.'}, status=status.HTTP_400_BAD_REQUEST)

        if role == 'asistente':
            descuento_estudiante = base_price * 0.5
            if not (_is_close(monto, base_price) or _is_close(monto, descuento_estudiante)):
                return Response({'detail': 'Monto no válido para asistente.'}, status=status.HTTP_400_BAD_REQUEST)
        elif not _is_close(monto, base_price):
            return Response({'detail': 'Monto no válido para este rol.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura) "
                    "VALUES (%s, %s, %s, %s, %s)",
                    [request.user.id_persona, monto, concept, costos_id, requires_invoice],
                )

        updated_summary = _build_payment_summary(request.user, id_congreso=id_congreso)
        return Response(
            {'detail': 'Pago registrado correctamente.', 'summary': updated_summary},
            status=status.HTTP_201_CREATED,
        )


class CongresoEventosView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id_congreso):
        from ponencias.models import AsistenteEvento
        from users.models import Asistente
        asistente = Asistente.objects.filter(id_persona=request.user).first()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT e.id_evento, e.nombre_evento, e.tipo_evento,
                       e.fecha_hora_inicio, e.fecha_hora_final, e.sinopsis, e.cupos, e.enlace,
                       COALESCE(
                           t.tallerista,
                           (
                               SELECT NULLIF(
                                   TRIM(
                                       CONCAT(
                                           per2.nombre,
                                           ' ',
                                           per2.primer_apellido,
                                           COALESCE(' ' || per2.segundo_apellido, '')
                                       )
                                   ),
                                   ''
                               )
                               FROM ponente_has_ponencia php2
                               JOIN ponente po2 ON po2.id_ponente = php2.id_ponente
                               JOIN persona per2 ON per2.id_persona = po2.id_persona
                               WHERE php2.id_ponencia = p.id_ponencia
                               LIMIT 1
                           ),
                           'Por confirmar'
                       ) AS autor,
                       COALESCE(s.nombre_sede, 'Por confirmar') AS ubicacion,
                       COALESCE(sub.nombre, '') AS eje,
                       COALESCE(p.tipo_participacion::text, t.tipo_participacion::text, 'Presencial') AS modalidad
                FROM evento e
                LEFT JOIN taller t ON t.id_evento = e.id_evento
                LEFT JOIN ponencia p ON p.id_evento = e.id_evento
                LEFT JOIN mesas_trabajo mt ON mt.id_mesas_trabajo = e.id_mesas_trabajo
                LEFT JOIN sede s ON s.id_sede = mt.id_sede
                LEFT JOIN subareas sub ON sub.id_subareas = COALESCE(t.id_subarea, p.id_subarea)
                WHERE e.id_congreso = %s
                ORDER BY e.fecha_hora_inicio
            """, [id_congreso])
            rows = cursor.fetchall()
        result = []
        for r in rows:
            eid = r[0]
            cupos = r[6] or 0
            registrado = AsistenteEvento.objects.filter(id_asistente=asistente, id_evento_id=eid).exists() if asistente else False
            ocupados = AsistenteEvento.objects.filter(id_evento_id=eid).count()
            result.append({
                'id': eid,
                'titulo': r[1] or '',
                'tipo': r[2] or '',
                'fecha_inicio': r[3].isoformat() if r[3] else None,
                'fecha_fin': r[4].isoformat() if r[4] else None,
                'sinopsis': r[5] or '',
                'cupos': cupos,
                'cupos_ocupados': ocupados,
                'cupos_disponibles': max(0, cupos - ocupados) if cupos > 0 else None,
                'lleno': cupos > 0 and ocupados >= cupos,
                'enlace': r[7] or '',
                'autor': r[8] or 'Por confirmar',
                'ubicacion': r[9] or 'Por confirmar',
                'eje': r[10] or '',
                'modalidad': r[11] or 'Presencial',
                'registrado': registrado,
            })
        return Response(result)


class InscritesTallerView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id_evento):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT per.id_persona, per.nombre, per.primer_apellido, per.segundo_apellido,
                       per.correo_electronico, per.num_telefono, ae.fecha_inscripcion
                FROM asistente_evento ae
                JOIN asistente a ON a.id_asistente = ae.id_asistente
                JOIN persona per ON per.id_persona = a.id_persona
                WHERE ae.id_evento = %s
                ORDER BY ae.fecha_inscripcion
            """, [id_evento])
            rows = cursor.fetchall()
            cursor.execute("SELECT cupos FROM evento WHERE id_evento = %s", [id_evento])
            cupos_row = cursor.fetchone()
        cupos_max = cupos_row[0] if cupos_row else 0
        inscritos = [
            {
                'id': r[0], 'nombre': r[1] or '', 'primer_apellido': r[2] or '',
                'segundo_apellido': r[3] or '', 'correo': r[4] or '',
                'telefono': r[5] or '', 'fecha_inscripcion': r[6].isoformat() if r[6] else None,
            }
            for r in rows
        ]
        return Response({'cupos_max': cupos_max, 'inscritos': inscritos, 'ocupados': len(inscritos)})


class MisInscripcionesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT DISTINCT c.id_congreso, c.nombre_congreso
                FROM pagos p
                JOIN costos_congreso cc ON cc.id_costos_congreso = p.id_costos
                JOIN congreso c ON c.id_costos_congreso = cc.id_costos_congreso
                WHERE p.id_persona = %s
                ORDER BY c.id_congreso
            """, [request.user.pk])
            rows = cursor.fetchall()
        congresos = [{'id_congreso': r[0], 'nombre_congreso': r[1]} for r in rows]
        return Response({'inscripciones': [r['id_congreso'] for r in congresos], 'congresos': congresos})


class ListaPagosAdminView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        id_congreso = request.query_params.get('id_congreso')
        sql = """
            SELECT
                p.id_pagos,
                per.nombre,
                per.primer_apellido,
                per.segundo_apellido,
                per.num_telefono,
                per.curp,
                per.correo_electronico,
                p.monto,
                p.fecha_pago_realizado,
                p.requiere_factura,
                cc.cuenta_deposito,
                cc.descuento_prepago,
                c.nombre_congreso,
                s.nombre_sede,
                CASE
                    WHEN po.id_ponente IS NOT NULL THEN 'Ponente'
                    WHEN a.id_asistente IS NOT NULL THEN 'Asistente'
                    ELSE 'Asistente'
                END AS rol
            FROM pagos p
            JOIN persona per ON per.id_persona = p.id_persona
            LEFT JOIN costos_congreso cc ON cc.id_costos_congreso = p.id_costos
            LEFT JOIN congreso c ON c.id_costos_congreso = cc.id_costos_congreso
            LEFT JOIN sede s ON s.id_sede = c.id_sede
            LEFT JOIN asistente a ON a.id_persona = per.id_persona
            LEFT JOIN ponente po ON po.id_persona = per.id_persona
        """
        params = []
        if id_congreso:
            sql += " WHERE c.id_congreso = %s"
            params.append(id_congreso)
        sql += " ORDER BY p.id_pagos DESC"
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            rows = cursor.fetchall()
        result = []
        for r in rows:
            result.append({
                'orden': r[0],
                'nombre': r[1] or '',
                'primerApellido': r[2] or '',
                'segundoApellido': r[3] or '',
                'telefono': r[4] or '',
                'curp': r[5] or '',
                'correo': r[6] or '',
                'monto': float(r[7]) if r[7] is not None else 0,
                'fecha': r[8].isoformat() if r[8] else None,
                'requiere_factura': r[9],
                'cuentaDeposito': r[10] or '',
                'descuento': float(r[11]) if r[11] is not None else 0,
                'congreso': r[12] or '',
                'sede': r[13] or '',
                'rol': r[14] or 'Asistente',
                'estatus': 'Pagado',
            })
        return Response(result)

def _fetch_events_between(start, end, user=None):
    from users.models import Asistente, Ponente

    # "Mi agenda" es consistente entre roles:
    # - Inscrito: asistente_evento
    # - Ponente: autor por ponente_has_ponencia -> ponencia -> evento
    asistente = Asistente.objects.filter(id_persona=user).first() if user else None
    ponente = Ponente.objects.filter(id_persona=user).first() if user else None
    if not asistente and not ponente:
        return []

    union_parts = []
    params = []

    if asistente:
        union_parts.append(
            "SELECT ae.id_evento, 'Inscrito'::text AS source FROM asistente_evento ae WHERE ae.id_asistente = %s"
        )
        params.append(asistente.id_asistente)

    if ponente:
        union_parts.append(
            """
            SELECT p.id_evento, 'Ponente'::text AS source
            FROM ponente_has_ponencia php
            JOIN ponencia p ON p.id_ponencia = php.id_ponencia
            WHERE php.id_ponente = %s
            """.strip()
        )
        params.append(ponente.id_ponente)

    with connection.cursor() as cursor:
        cursor.execute(
            f"""
            WITH my_events AS (
                {' UNION ALL '.join(union_parts)}
            ),
            my_agg AS (
                SELECT id_evento, array_agg(DISTINCT source) AS sources
                FROM my_events
                GROUP BY id_evento
            )
            SELECT
                e.id_evento,
                e.nombre_evento,
                e.fecha_hora_inicio,
                e.fecha_hora_final,
                e.sinopsis,
                e.tipo_evento,
                e.enlace,
                c.id_congreso,
                c.nombre_congreso,
                COALESCE(
                    t.tallerista,
                    (
                        SELECT NULLIF(
                            TRIM(
                                CONCAT(
                                    per2.nombre,
                                    ' ',
                                    per2.primer_apellido,
                                    COALESCE(' ' || per2.segundo_apellido, '')
                                )
                            ),
                            ''
                        )
                        FROM ponente_has_ponencia php2
                        JOIN ponente po2 ON po2.id_ponente = php2.id_ponente
                        JOIN persona per2 ON per2.id_persona = po2.id_persona
                        WHERE php2.id_ponencia = p.id_ponencia
                        LIMIT 1
                    ),
                    'Por confirmar'
                ) AS autor,
                COALESCE(s.nombre_sede, 'Por confirmar') AS ubicacion,
                COALESCE(sub.nombre, '') AS eje,
                ma.sources
            FROM my_agg ma
            JOIN evento e ON e.id_evento = ma.id_evento
            JOIN congreso c ON c.id_congreso = e.id_congreso
            LEFT JOIN taller t ON t.id_evento = e.id_evento
            LEFT JOIN ponencia p ON p.id_evento = e.id_evento
            LEFT JOIN mesas_trabajo mt ON mt.id_mesas_trabajo = e.id_mesas_trabajo
            LEFT JOIN sede s ON s.id_sede = mt.id_sede
            LEFT JOIN subareas sub ON sub.id_subareas = COALESCE(t.id_subarea, p.id_subarea)
            WHERE e.fecha_hora_inicio >= %s AND e.fecha_hora_inicio < %s
            ORDER BY e.fecha_hora_inicio
            """,
            [*params, start, end],
        )
        rows = cursor.fetchall()

    result = []
    for r in rows:
        dt = r[2]
        dt_end = r[3]
        result.append(
            {
                'id': r[0],
                'title': r[1] or '',
                'start_iso': dt.isoformat() if dt else None,
                'end_iso': dt_end.isoformat() if dt_end else None,
                # El frontend espera "HH:MM am/pm" y hace split por espacio.
                'time': dt.strftime('%I:%M %p').lower() if dt else '--:--',
                'sinopsis': r[4] or '',
                'type': r[5] or '',
                'link': r[6] or '',
                'id_congreso': r[7],
                'congreso': r[8] or '',
                'author': r[9] or 'Por confirmar',
                'location': r[10] or 'Por confirmar',
                'eje': r[11] or '',
                'abstract': r[4] or '',
                'description': r[4] or '',
                'sources': list(r[12]) if r[12] else [],
            }
        )

    return result

def _parse_month(val):
    try:
        d = datetime.strptime(val, '%Y-%m') if val else timezone.localdate()
        return d.year, d.month
    except: return None, None

PONENTE_INCLUDED_PONENCIAS = 3
PONENTE_MAX_PONENCIAS = 5


def _get_user_role(user):
    if user.is_superuser or user.is_staff:
        return 'administrador'
    if hasattr(user, 'dictaminador'):
        return 'dictaminador'
    if hasattr(user, 'evaluador'):
        return 'revisor'
    if hasattr(user, 'ponente'):
        return 'ponente'
    return 'asistente'


def _get_costos_congreso(id_congreso=None):
    with connection.cursor() as cursor:
        if id_congreso:
            cursor.execute(
                """
                SELECT cc.id_costos_congreso,
                       cc.costo_congreso_asistente,
                       cc.costo_congreso_ponente,
                       cc.costo_congreso_comite,
                       cc.descuento_prepago,
                       cc.descuento_estudiante
                FROM costos_congreso cc
                JOIN congreso c ON c.id_costos_congreso = cc.id_costos_congreso
                WHERE c.id_congreso = %s
                LIMIT 1
                """,
                [id_congreso],
            )
        else:
            cursor.execute(
                """
                SELECT id_costos_congreso,
                       costo_congreso_asistente,
                       costo_congreso_ponente,
                       costo_congreso_comite,
                       descuento_prepago,
                       descuento_estudiante
                FROM costos_congreso
                ORDER BY id_costos_congreso DESC
                LIMIT 1
                """
            )
        row = cursor.fetchone()
    if not row:
        return None
    return {
        'id_costos_congreso': row[0],
        'costo_asistente': float(row[1]),
        'costo_ponente': float(row[2]),
        'costo_comite': float(row[3]),
        'descuento_prepago': float(row[4] or 0),
        'descuento_estudiante': float(row[5] or 0),
    }


def _get_ponente_id_for_user(user_id):
    with connection.cursor() as cursor:
        cursor.execute("SELECT id_ponente FROM ponente WHERE id_persona = %s LIMIT 1", [user_id])
        row = cursor.fetchone()
    return row[0] if row else None


def _count_ponente_ponencias(id_ponente, costos_id=None):
    with connection.cursor() as cursor:
        if costos_id:
            cursor.execute(
                """
                SELECT COUNT(*) FROM ponente_has_ponencia php
                JOIN ponencia pon ON pon.id_ponencia = php.id_ponencia
                JOIN evento e ON e.id_evento = pon.id_evento
                JOIN congreso c ON c.id_congreso = e.id_congreso
                WHERE php.id_ponente = %s AND c.id_costos_congreso = %s
                """,
                [id_ponente, costos_id],
            )
        else:
            cursor.execute("SELECT COUNT(*) FROM ponente_has_ponencia WHERE id_ponente = %s", [id_ponente])
        row = cursor.fetchone()
    return int(row[0]) if row else 0


def _count_paid_ponente_slots(user_id, costos_id=None):
    with connection.cursor() as cursor:
        if costos_id:
            cursor.execute(
                """
                SELECT COUNT(*) FROM pagos
                WHERE id_persona = %s
                  AND id_costos = %s
                  AND (concepto = 'inscripcion_ponente_base' OR concepto LIKE 'inscripcion_ponente_extra_%%')
                """,
                [user_id, costos_id],
            )
        else:
            cursor.execute(
                """
                SELECT COUNT(*) FROM pagos
                WHERE id_persona = %s
                  AND (concepto = 'inscripcion_ponente_base' OR concepto LIKE 'inscripcion_ponente_extra_%%')
                """,
                [user_id],
            )
        row = cursor.fetchone()
    return int(row[0]) if row else 0


def _has_role_payment(user_id, concept, costos_id=None):
    with connection.cursor() as cursor:
        if costos_id:
            cursor.execute(
                "SELECT 1 FROM pagos WHERE id_persona = %s AND concepto = %s AND id_costos = %s LIMIT 1",
                [user_id, concept, costos_id],
            )
        else:
            cursor.execute(
                "SELECT 1 FROM pagos WHERE id_persona = %s AND concepto = %s LIMIT 1",
                [user_id, concept],
            )
        return cursor.fetchone() is not None


def _build_payment_summary(user, id_congreso=None):
    costos = _get_costos_congreso(id_congreso=id_congreso)
    if not costos:
        return None

    role = _get_user_role(user)
    costos_id = costos['id_costos_congreso']

    payload = {
        'price_catalog': {
            'asistente': costos['costo_asistente'],
            'ponente': costos['costo_ponente'],
            'comite': costos['costo_comite'],
            'descuento_prepago_pct': costos['descuento_prepago'],
            'descuento_estudiante_pct': costos['descuento_estudiante'],
        },
        'user_payment': {
            'role': role,
            'costos_id': costos_id,
        },
    }

    if role == 'ponente':
        id_ponente = _get_ponente_id_for_user(user.id_persona)
        if not id_ponente:
            payload['user_payment'].update({
                'base_price': costos['costo_ponente'],
                'ponencias_count': 0,
                'included_ponencias': PONENTE_INCLUDED_PONENCIAS,
                'max_ponencias': PONENTE_MAX_PONENCIAS,
                'extra_ponencias_count': 0,
                'overflow_ponencias_count': 0,
                'required_slots': 1,
                'paid_slots': 0,
                'pending_slots': 1,
                'total_due': costos['costo_ponente'],
            })
            return payload

        ponencias_count = _count_ponente_ponencias(id_ponente, costos_id=costos_id)
        overflow_ponencias_count = max(ponencias_count - PONENTE_MAX_PONENCIAS, 0)
        capped_ponencias_count = min(ponencias_count, PONENTE_MAX_PONENCIAS)
        extra_ponencias_count = max(capped_ponencias_count - PONENTE_INCLUDED_PONENCIAS, 0)
        required_slots = 1 + extra_ponencias_count
        paid_slots = _count_paid_ponente_slots(user.id_persona, costos_id=costos_id)
        pending_slots = max(required_slots - paid_slots, 0)

        payload['user_payment'].update({
            'base_price': costos['costo_ponente'],
            'ponencias_count': ponencias_count,
            'included_ponencias': PONENTE_INCLUDED_PONENCIAS,
            'max_ponencias': PONENTE_MAX_PONENCIAS,
            'extra_ponencias_count': extra_ponencias_count,
            'overflow_ponencias_count': overflow_ponencias_count,
            'required_slots': required_slots,
            'paid_slots': paid_slots,
            'pending_slots': pending_slots,
            'total_due': pending_slots * costos['costo_ponente'],
        })
        return payload

    if role in ('dictaminador', 'revisor', 'administrador'):
        base_price = costos['costo_comite']
    else:
        base_price = costos['costo_asistente']

    concept = f'inscripcion_{role}'
    already_paid = _has_role_payment(user.id_persona, concept, costos_id=costos_id)

    payload['user_payment'].update({
        'concept': concept,
        'base_price': base_price,
        'already_paid': already_paid,
        'pending_slots': 0 if already_paid else 1,
        'total_due': 0 if already_paid else base_price,
    })
    return payload


def _concept_for_slot(slot):
    if slot == 1:
        return 'inscripcion_ponente_base'
    return f'inscripcion_ponente_extra_{slot + 1}'


def _is_close(value_a, value_b):
    return abs(float(value_a) - float(value_b)) < 0.01
