# ponencias/views_detalle.py
# Agrega estas vistas a tu views.py existente (o importa desde aquí)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from django.shortcuts import get_object_or_404
from django.http import FileResponse
import os

from .models import (
    Resumen, Extenso, Ponencia, Evaluacion,
    Evaluador, EvaluadorCongreso,
)
from congresos.models import Congreso  # ajusta el import según tu estructura
from .serializers_detalle import ResumenDetalleSerializer, ExtensoDetalleSerializer


# ══════════════════════════════════════════════════════════
#  RESÚMENES
# ══════════════════════════════════════════════════════════

class ResumenDetalleView(APIView):
    """
    GET /api/ponencias/resumenes/<id_resumen>/detalle/
    Retorna el detalle completo de un resumen:
    datos base, dictaminador, dictamen con preguntas y calificación final.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id_resumen):
        resumen = get_object_or_404(Resumen, pk=id_resumen)
        serializer = ResumenDetalleSerializer(resumen)
        return Response(serializer.data)


class ResumenesPorCongresoView(APIView):
    """
    GET /api/ponencias/congresos/<id_congreso>/resumenes/
    Lista resumenes del congreso con datos enriquecidos para la vista de procesos.
    Incluye: título, autores, dictaminador, estatus, fecha_entrega.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id_congreso):
        congreso = get_object_or_404(Congreso, pk=id_congreso)

        # Ponencias del congreso que tienen resumen asignado
        ponencias = Ponencia.objects.filter(
            id_evento__id_congreso=congreso,
            id_resumen__isnull=False,
        ).select_related(
            'id_resumen',
            'id_resumen__id_dictaminador',
            'id_resumen__id_dictaminador__id_persona',
            'id_extenso',
        ).prefetch_related('ponentehasponencia_set__id_ponente__id_persona')

        result = []
        for ponencia in ponencias:
            r = ponencia.id_resumen
            # Nombre del dictaminador
            nombre_dict = None
            if r.id_dictaminador:
                p = r.id_dictaminador.id_persona
                nombre_dict = f"{p.nombre} {p.primer_apellido} {p.segundo_apellido or ''}".strip()

            # Autores
            autores = [
                f"{php.id_ponente.id_persona.nombre} {php.id_ponente.id_persona.primer_apellido}".strip()
                for php in ponencia.ponentehasponencia_set.all()
            ]

            # Título (viene del extenso si existe, si no cadena vacía)
            titulo = ponencia.id_extenso.titulo if ponencia.id_extenso else 'Sin título'

            # Calificación del dictamen (si existe)
            dictamen = r.dictamenresumen_set.first()
            cal = None
            if dictamen:
                preguntas = dictamen.evaluacion_pregunta_set.all()
                cal = {
                    'aprobadas': preguntas.filter(cumplio=True).count(),
                    'total': preguntas.count(),
                }

            result.append({
                'id_resumen':          r.id_resumen,
                'id_ponencia':         ponencia.id_ponencia,
                'title':               titulo,
                'autores':             autores,
                'fecha_entrega':       r.fecha_entrega,
                'revisado':            r.revisado,
                'estatus':             r.estatus,
                'retroalimentacion':   r.retroalimentacion,
                'id_dictaminador':     r.id_dictaminador_id,
                'nombre_dictaminador': nombre_dict,
                'asignado':            r.id_dictaminador_id is not None,
                'calificacion':        cal,
            })

        return Response(result)


# ══════════════════════════════════════════════════════════
#  EXTENSOS
# ══════════════════════════════════════════════════════════

class ExtensoDetalleView(APIView):
    """
    GET /api/ponencias/extensos/<id_extenso>/detalle/
    Retorna el detalle completo de un extenso:
    metadatos, evaluadores asignados, grupos/criterios evaluados y calificación final.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id_extenso):
        extenso = get_object_or_404(Extenso, pk=id_extenso)
        serializer = ExtensoDetalleSerializer(extenso)
        return Response(serializer.data)


class ExtensosPorCongresoView(APIView):
    """
    GET /api/ponencias/congresos/<id_congreso>/extensos/
    Lista extensos del congreso con datos enriquecidos.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id_congreso):
        congreso = get_object_or_404(Congreso, pk=id_congreso)

        ponencias = Ponencia.objects.filter(
            id_evento__id_congreso=congreso,
            id_extenso__isnull=False,
        ).select_related(
            'id_extenso',
            'id_extenso__id_evaluador__id_persona',
            'id_extenso__id_evaluador_2__id_persona',
            'id_extenso__id_evaluador_3__id_persona',
        ).prefetch_related('ponentehasponencia_set__id_ponente__id_persona')

        result = []
        for ponencia in ponencias:
            e = ponencia.id_extenso

            def _nombre(ev):
                if not ev:
                    return None
                p = ev.id_persona
                return f"{p.nombre} {p.primer_apellido} {p.segundo_apellido or ''}".strip()

            autores = [
                f"{php.id_ponente.id_persona.nombre} {php.id_ponente.id_persona.primer_apellido}".strip()
                for php in ponencia.ponentehasponencia_set.all()
            ]

            # Calificación consolidada
            evals = e.evaluacion_set.all()
            cal = None
            if evals.exists():
                totales = []
                for ev in evals:
                    criterios  = ev.evaluacioncriterio_set.all()
                    total_peso = sum(float(c.id_criterio.peso) for c in criterios)
                    puntaje    = sum((c.puntaje or 0) * float(c.id_criterio.peso) for c in criterios)
                    max_pos    = total_peso * 5
                    if max_pos:
                        totales.append(puntaje / max_pos * 100)
                if totales:
                    cal = {
                        'promedio_porcentaje': round(sum(totales) / len(totales), 1),
                        'num_evaluaciones':    len(totales),
                    }

            result.append({
                'id_extenso':          e.id_extenso,
                'id_ponencia':         ponencia.id_ponencia,
                'titulo':              e.titulo,
                'autores':             autores,
                'fecha_subida':        e.fecha_subida,
                'version_numero':      e.version_numero,
                'revisado':            e.revisado,
                'ruta_relativa':       e.ruta_relativa,
                'id_evaluador':        e.id_evaluador_id,
                'nombre_evaluador_1':  _nombre(e.id_evaluador),
                'id_evaluador_2':      e.id_evaluador_2_id,
                'nombre_evaluador_2':  _nombre(e.id_evaluador_2),
                'id_evaluador_3':      e.id_evaluador_3_id,
                'nombre_evaluador_3':  _nombre(e.id_evaluador_3),
                'asignado':            e.id_evaluador_id is not None,
                'calificacion':        cal,
            })

        return Response(result)


class AsignarEvaluadorExtensoView(APIView):
    """
    PATCH /api/ponencias/extensos/<id_extenso>/asignar-evaluador/
    Body: { "id_evaluador": <int>, "slot": 1|2|3 }
    Asigna un evaluador al slot indicado (1, 2 o 3) del extenso.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, id_extenso):
        extenso      = get_object_or_404(Extenso, pk=id_extenso)
        id_evaluador = request.data.get('id_evaluador')
        slot         = request.data.get('slot', 1)

        if not id_evaluador:
            return Response(
                {'error': 'Se requiere id_evaluador.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from .models import Evaluador
        evaluador = get_object_or_404(Evaluador, pk=id_evaluador)

        slot = int(slot)
        if slot == 1:
            extenso.id_evaluador = evaluador
        elif slot == 2:
            extenso.id_evaluador_2 = evaluador
        elif slot == 3:
            extenso.id_evaluador_3 = evaluador
        else:
            return Response(
                {'error': 'slot debe ser 1, 2 o 3.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        extenso.save()
        p = evaluador.id_persona
        nombre = f"{p.nombre} {p.primer_apellido} {p.segundo_apellido or ''}".strip()
        return Response({
            'ok': True,
            'slot': slot,
            'id_evaluador': evaluador.id_evaluador,
            'nombre_evaluador': nombre,
        })


class DescargarExtensoView(APIView):
    """
    GET /api/ponencias/extensos/<id_extenso>/descargar/
    Descarga el archivo PDF del extenso usando su ruta_relativa.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id_extenso):
        extenso = get_object_or_404(Extenso, pk=id_extenso)

        if not extenso.ruta_relativa:
            return Response(
                {'error': 'Este extenso no tiene archivo asociado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # BASE_DIR debe apuntar a la raíz donde se almacenan los archivos.
        # Ajusta esta ruta según tu configuración de MEDIA_ROOT.
        from django.conf import settings
        ruta_absoluta = os.path.join(settings.MEDIA_ROOT, extenso.ruta_relativa)

        if not os.path.exists(ruta_absoluta):
            return Response(
                {'error': 'Archivo no encontrado en el servidor.'},
                status=status.HTTP_404_NOT_FOUND
            )

        return FileResponse(
            open(ruta_absoluta, 'rb'),
            as_attachment=True,
            filename=os.path.basename(ruta_absoluta),
        )
