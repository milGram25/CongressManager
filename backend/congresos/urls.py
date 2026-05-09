from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AgendaCalendarioView,
    AgendaHoyView,
    PagosResumenView,
    RegistrarPagoView,
    ListaPagosAdminView,
    CongresoEventosView,
    InscritesTallerView,
    MisInscripcionesView,
    CongresoSignaturesView,
    SedeViewSet,
    SubareaViewSet,
    AreaGeneralViewSet,
    EventoViewSet,
    TallerViewSet,
    InstitucionViewSet,
    CongresoViewSet,
    RubricaViewSet,
    RubricaGrupoViewSet,
    RubricaCriterioViewSet,
    TipoTrabajoViewSet,
    DictamenViewSet,
    DictamenPreguntaViewSet,
    MesasTrabajoViewSet,
)

app_name = 'congresos'

router = DefaultRouter()
router.register(r'sedes', SedeViewSet, basename='sede')
router.register(r'areas', AreaGeneralViewSet, basename='area')
router.register(r'subareas', SubareaViewSet, basename='subarea')
router.register(r'eventos', EventoViewSet, basename='evento')
router.register(r'talleres', TallerViewSet, basename='taller')
router.register(r'instituciones', InstitucionViewSet, basename='institucion')
router.register(r'lista', CongresoViewSet, basename='congreso')
router.register(r'rubricas', RubricaViewSet, basename='rubrica')
router.register(r'rubrica-grupos', RubricaGrupoViewSet, basename='rubrica-grupo')
router.register(r'rubrica-criterios', RubricaCriterioViewSet, basename='rubrica-criterio')
router.register(r'tipos-trabajo', TipoTrabajoViewSet, basename='tipo-trabajo')
router.register(r'dictamenes', DictamenViewSet, basename='dictamen')
router.register(r'preguntas', DictamenPreguntaViewSet, basename='pregunta')
router.register(r'mesas', MesasTrabajoViewSet, basename='mesa')

urlpatterns = [
    path('', include(router.urls)),
    path('pagos/resumen/', PagosResumenView.as_view(), name='pagos_resumen'),
    path('pagos/registrar/', RegistrarPagoView.as_view(), name='pagos_registrar'),
    path('pagos/lista/', ListaPagosAdminView.as_view(), name='pagos_lista'),
    path('mis-inscripciones/', MisInscripcionesView.as_view(), name='mis_inscripciones'),
    path('agenda/hoy/', AgendaHoyView.as_view(), name='agenda_hoy'),
    path('agenda/calendario/', AgendaCalendarioView.as_view(), name='agenda_calendario'),
    path('<int:id_congreso>/eventos/', CongresoEventosView.as_view(), name='congreso_eventos'),
    path('eventos/<int:id_evento>/inscritos/', InscritesTallerView.as_view(), name='evento_inscritos'),
    path('<int:id_congreso>/signatures/', CongresoSignaturesView.as_view(), name='congreso_signatures'),
]
