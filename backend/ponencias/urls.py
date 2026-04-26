from django.urls import path
from .views import registrar_ponencia, listar_catalogo_ponencias
from .views import EnviarPonenciaAPIView

app_name = 'ponencias'

urlpatterns = [
    path('registrar/', registrar_ponencia, name='registrar_ponencia'),
    path('catalogo/', listar_catalogo_ponencias, name='listar_catalogo'),
    path('enviar/', EnviarPonenciaAPIView.as_view(), name='enviar-ponencia'),
]
