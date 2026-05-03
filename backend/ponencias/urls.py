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
    SubirExtensoAPIView,
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
    path('extensos/<int:pk>/asignar-evaluadores/', AsignarEvaluadoresView.as_view(), name='asignar-evaluadores'),
    path('extensos/<int:pk>/asignar-evaluador-3/', AsignarEvaluador3View.as_view(), name='asignar-evaluador-3'),
    path('resumenes/', ResumenesCongresoView.as_view(), name='resumenes-congreso'),
    path('extensos/', ExtensosCongresoView.as_view(), name='extensos-congreso'),
    path('mis-resumenes/', MisResumenesView.as_view(), name='mis-resumenes'),
    path('mis-extensos/', MisExtensosView.as_view(), name='mis-extensos'),
    path('resumenes/<int:pk>/preguntas/', PreguntasResumenView.as_view(), name='preguntas-resumen'),
    path('extensos/<int:pk>/rubrica/', RubricaExtensoView.as_view(), name='rubrica-extenso'),
    path('extensos/<int:pk>/evaluacion/', EnviarEvaluacionView.as_view(), name='enviar-evaluacion'),
    path('resumenes/<int:pk>/dictamen/', EnviarDictamenView.as_view(), name='enviar-dictamen'),
    path('ponente/mis-ponencias/', EstatusPonenteView.as_view(), name='estatus-ponente'),
    path('resumenes/<int:id_resumen>/subir-extenso/', SubirExtensoAPIView.as_view(), name='subir-extenso'),
]
