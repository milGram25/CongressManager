from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PonenciaViewSet, registrar_ponencia, listar_catalogo_ponencias,
    EnviarPonenciaAPIView, MiAgendaView,
    DictaminadoresDisponiblesView, EvaluadoresDisponiblesView,
    AsignarDictaminadorView, AsignarEvaluadorView,
    ResumenesCongresoView, ExtensosCongresoView,
    MisResumenesView, MisExtensosView,
    RubricaExtensoView, PreguntasResumenView,
    EnviarEvaluacionView, EnviarDictamenView,
    AsignarEvaluadoresView, AsignarEvaluador3View, EstatusPonenteView,
    SubirExtensoAPIView, ResumenDetalleView,
    # ── Nuevas vistas de detalle ──────────────────────────
    ResumenesPorCongresoView,
    ExtensoDetalleView,
    ExtensosPorCongresoView,
    AsignarEvaluadorExtensoView,
    DescargarExtensoView,
)

app_name = 'ponencias'

router = DefaultRouter()
router.register(r'lista', PonenciaViewSet, basename='ponencia')

urlpatterns = [
    path('', include(router.urls)),

    # ── Ponencias generales ───────────────────────────────
    path('registrar/',                        registrar_ponencia,                name='registrar_ponencia'),
    path('catalogo/',                         listar_catalogo_ponencias,         name='listar_catalogo'),
    path('enviar/',                           EnviarPonenciaAPIView.as_view(),   name='enviar-ponencia'),
    path('mi-agenda/',                        MiAgendaView.as_view(),            name='mi_agenda'),

    # ── Disponibles ───────────────────────────────────────
    path('dictaminadores-disponibles/',       DictaminadoresDisponiblesView.as_view(),  name='dictaminadores-disponibles'),
    path('evaluadores-disponibles/',          EvaluadoresDisponiblesView.as_view(),     name='evaluadores-disponibles'),

    # ── Asignaciones (rutas existentes) ──────────────────
    path('resumenes/<int:pk>/asignar/',                AsignarDictaminadorView.as_view(),  name='asignar-dictaminador'),
    path('extensos/<int:pk>/asignar/',                 AsignarEvaluadorView.as_view(),     name='asignar-evaluador'),
    path('extensos/<int:pk>/asignar-evaluadores/',     AsignarEvaluadoresView.as_view(),   name='asignar-evaluadores'),
    path('extensos/<int:pk>/asignar-evaluador-3/',     AsignarEvaluador3View.as_view(),    name='asignar-evaluador-3'),

    # ── Listas por congreso (existentes) ──────────────────
    path('resumenes/',                        ResumenesCongresoView.as_view(),   name='resumenes-congreso'),
    path('extensos/',                         ExtensosCongresoView.as_view(),    name='extensos-congreso'),

    # ── Mis trabajos ──────────────────────────────────────
    path('mis-resumenes/',                    MisResumenesView.as_view(),        name='mis-resumenes'),
    path('mis-extensos/',                     MisExtensosView.as_view(),         name='mis-extensos'),

    # ── Evaluación / Dictamen ─────────────────────────────
    path('resumenes/<int:pk>/preguntas/',     PreguntasResumenView.as_view(),    name='preguntas-resumen'),
    path('extensos/<int:pk>/rubrica/',        RubricaExtensoView.as_view(),      name='rubrica-extenso'),
    path('extensos/<int:pk>/evaluacion/',     EnviarEvaluacionView.as_view(),    name='enviar-evaluacion'),
    path('resumenes/<int:pk>/dictamen/',      EnviarDictamenView.as_view(),      name='enviar-dictamen'),

    # ── Ponente ───────────────────────────────────────────
    path('ponente/mis-ponencias/',            EstatusPonenteView.as_view(),      name='estatus-ponente'),

    # ── Subir extenso ─────────────────────────────────────
    path('resumenes/<int:id_resumen>/subir-extenso/', SubirExtensoAPIView.as_view(), name='subir-extenso'),

    # ── NUEVOS: Detalle completo resúmenes ────────────────
    # Lista enriquecida por congreso (título, autores, dictaminador, calificación parcial)
    path('congresos/<int:id_congreso>/resumenes/',     ResumenesPorCongresoView.as_view(),  name='resumenes-por-congreso'),
    # Detalle completo: preguntas del dictamen, comentarios, calificación final
    path('resumenes/<int:id_resumen>/detalle/',        ResumenDetalleView.as_view(),        name='resumen-detalle'),

    # ── NUEVOS: Detalle completo extensos ─────────────────
    # Lista enriquecida por congreso (título, autores, evaluadores, calificación parcial)
    path('congresos/<int:id_congreso>/extensos/',      ExtensosPorCongresoView.as_view(),   name='extensos-por-congreso'),
    # Detalle completo: grupos de rúbrica, criterios, puntajes, calificación final
    path('extensos/<int:id_extenso>/detalle/',         ExtensoDetalleView.as_view(),        name='extenso-detalle'),
    # Asignar evaluador a slot 1, 2 o 3  →  body: { "id_evaluador": N, "slot": 1|2|3 }
    path('extensos/<int:id_extenso>/asignar-evaluador/', AsignarEvaluadorExtensoView.as_view(), name='extenso-asignar-evaluador'),
    # Descargar PDF del extenso
    path('extensos/<int:id_extenso>/descargar/',       DescargarExtensoView.as_view(),      name='extenso-descargar'),
]