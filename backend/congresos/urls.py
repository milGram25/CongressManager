from django.urls import path
from .views import (
    AgendaCalendarioView,
    AgendaHoyView,
    PagosResumenView,
    RegistrarPagoView,
)

app_name = 'congresos'

urlpatterns = [
    path('pagos/resumen/', PagosResumenView.as_view(), name='pagos_resumen'),
    path('pagos/registrar/', RegistrarPagoView.as_view(), name='pagos_registrar'),
    path('agenda/hoy/', AgendaHoyView.as_view(), name='agenda_hoy'),
    path('agenda/calendario/', AgendaCalendarioView.as_view(), name='agenda_calendario'),
]
