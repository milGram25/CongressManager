from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import registrar_ponencia, listar_catalogo_ponencias, PonenciaViewSet

app_name = 'ponencias'

router = DefaultRouter()
router.register(r'lista', PonenciaViewSet, basename='ponencia')

urlpatterns = [
    path('', include(router.urls)),
    path('registrar/', registrar_ponencia, name='registrar_ponencia'),
    path('catalogo/', listar_catalogo_ponencias, name='listar_catalogo'),
]
