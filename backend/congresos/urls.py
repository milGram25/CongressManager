from django.urls import path
from .views import PagosResumenView, RegistrarPagoView

app_name = 'congresos'

urlpatterns = [
    path('pagos/resumen/', PagosResumenView.as_view(), name='pagos_resumen'),
    path('pagos/registrar/', RegistrarPagoView.as_view(), name='pagos_registrar'),
]
