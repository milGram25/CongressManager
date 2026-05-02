from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PonenciaViewSet, registrar_ponencia, listar_catalogo_ponencias,
    EnviarPonenciaAPIView, MiAgendaView,
    DictaminadoresDisponiblesView, EvaluadoresDisponiblesView,
    AsignarDictaminadorView, AsignarEvaluadorView,
)

app_name = 'ponencias'

router = DefaultRouter()
router.register(r'lista', PonenciaViewSet, basename='ponencia')

urlpatterns = [
    path('', include(router.urls)),
    path('registrar/', registrar_ponencia, name='registrar_ponencia'),
    path('catalogo/', listar_catalogo_ponencias, name='listar_catalogo'),
    path('enviar/', EnviarPonenciaAPIView.as_view(), name='enviar-ponencia'),
    path('mi-agenda/', MiAgendaView.as_view(), name='mi_agenda'),
    path('dictaminadores-disponibles/', DictaminadoresDisponiblesView.as_view(), name='dictaminadores-disponibles'),
    path('evaluadores-disponibles/', EvaluadoresDisponiblesView.as_view(), name='evaluadores-disponibles'),
    path('resumenes/<int:pk>/asignar/', AsignarDictaminadorView.as_view(), name='asignar-dictaminador'),
    path('extensos/<int:pk>/asignar/', AsignarEvaluadorView.as_view(), name='asignar-evaluador'),
]
