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

from .models import Sede, Institucion, Congreso, Evento, MesasTrabajo, FechasCongreso, CostosCongreso, Rubrica, TipoTrabajo, Dictamen, DictamenPregunta
from .serializers import SedeSerializer, InstitucionSerializer, CongresoSerializer, EventoSerializer, MesasTrabajoSerializer, RubricaSerializer, TipoTrabajoSerializer, DictamenSerializer, DictamenPreguntaSerializer

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

class InstitucionViewSet(viewsets.ModelViewSet):
    queryset = Institucion.objects.all()
    serializer_class = InstitucionSerializer
    permission_classes = [IsAuthenticated]

class CongresoViewSet(viewsets.ModelViewSet):
    queryset = Congreso.objects.all()
    serializer_class = CongresoSerializer
    permission_classes = [IsAuthenticated]
    def create(self, request, *args, **kwargs):
        data = request.data
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
                    fecha_inicio_evento=clean_date(data.get('congreso_inicio'), now),
                    fecha_final_evento=clean_date(data.get('congreso_fin'), now),
                    fecha_inicio_pago_normal=clean_date(data.get('pagos_normales_inicio'), now),
                    fecha_fin_pago_normal=clean_date(data.get('pagos_normales_fin'), now),
                    fecha_inicio_inscribir_dictaminador=clean_date(data.get('inscripcion_dictaminadores_inicio'), now),
                    fecha_fin_inscribir_dictaminador=clean_date(data.get('inscripcion_dictaminadores_fin'), now),
                    fecha_inicio_inscribir_evaluador=clean_date(data.get('inscripcion_evaluadores_inicio'), now),
                    fecha_fin_inscribir_evaluador=clean_date(data.get('inscripcion_evaluadores_fin'), now),
                    fecha_inicio_subida_ponencias=clean_date(data.get('envio_ponencias_inicio'), now),
                    fecha_fin_subida_ponencias=clean_date(data.get('envio_ponencias_fin'), now),
                    fecha_inicio_evaluar_resumenes=clean_date(data.get('revision_resumenes_inicio'), now),
                    fecha_final_evaluar_resumenes=clean_date(data.get('revision_resumenes_fin'), now),
                    fecha_inicio_evaluar_extensos=clean_date(data.get('revision_extensos_inicio'), now),
                    fecha_fin_evaluar_extensos=clean_date(data.get('revision_extensos_fin'), now),
                    fecha_inicio_subir_multimedia=clean_date(data.get('subir_multimedia_inicio'), now),
                    fecha_fin_subir_multimedia=clean_date(data.get('subir_multimedia_fin'), now)
                )
                costos = CostosCongreso.objects.create(
                    cuenta_deposito=clean_date(data.get('cuenta_deposito'), ''),
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
                fe.save()
                co = instance.id_costos_congreso
                co.cuenta_deposito = clean_date(data.get('cuenta_deposito'), co.cuenta_deposito)
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
                return Response(self.get_serializer(instance).data)
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
