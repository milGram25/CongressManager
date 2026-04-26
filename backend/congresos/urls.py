from django.urls import path
from .views import (
    AgendaCalendarioView,
    AgendaHoyView,
    PagosResumenView,
    RegistrarPagoView,
    ListarInstitucionesView,
    ListarCongresosView,
    DetalleCongresoView,
    CrearCongresoView,
    ActualizarCongresoView,
    EliminarCongresoView,
    ListarTiposTrabajoView,
    ListarRubricasView,
)

app_name = 'congresos'

urlpatterns = [
    path('pagos/resumen/', PagosResumenView.as_view(), name='pagos_resumen'),
    path('pagos/registrar/', RegistrarPagoView.as_view(), name='pagos_registrar'),
    path('agenda/hoy/', AgendaHoyView.as_view(), name='agenda_hoy'),
    path('agenda/calendario/', AgendaCalendarioView.as_view(), name='agenda_calendario'),

    path('instituciones/', ListarInstitucionesView.as_view(), name='instituciones_lista'),
    path('lista/', ListarCongresosView.as_view(), name='congresos_lista'),
    path('detalle/<int:id_congreso>/', DetalleCongresoView.as_view(), name='congreso_detalle'),
    path('crear/', CrearCongresoView.as_view(), name='congreso_crear'),
    path('actualizar/<int:id_congreso>/', ActualizarCongresoView.as_view(), name='congreso_actualizar'),
    path('eliminar/<int:id_congreso>/', EliminarCongresoView.as_view(), name='congreso_eliminar'),
    path('tipos-trabajo/', ListarTiposTrabajoView.as_view(), name='tipos_trabajo_lista'),
    path('rubricas/', ListarRubricasView.as_view(), name='rubricas_lista'),
]
