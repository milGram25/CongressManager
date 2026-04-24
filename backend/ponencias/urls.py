from django.urls import path
from . import views

urlpatterns = [
    # ------------------ DICTAMINADORES ------------------
    # Ruta: GET /api/ponencias/dictaminador/resumenes-pendientes/
    path('dictaminador/resumenes-pendientes/', views.mis_resumenes_asignados, name='dictaminador-resumenes'),
    
    # Ruta: POST /api/ponencias/dictaminador/dictaminar/<id_resumen>/
    path('dictaminador/dictaminar/<int:id_resumen>/', views.dictaminar_resumen, name='dictaminar-resumen'),
    
    # ------------------ REVISORES (EVALUADORES) ------------------
    # Ruta: GET /api/ponencias/revisor/extensos-pendientes/
    path('revisor/extensos-pendientes/', views.mis_extensos_asignados, name='revisor-extensos'),
    
    # Ruta: POST /api/ponencias/revisor/revisar/<id_extenso>/
    path('revisor/revisar/<int:id_extenso>/', views.revisar_extenso, name='revisar-extenso'),

    # Asistentes
    path('mis-ponencias/', views.mis_ponencias_asistente, name='mis-ponencias-asistente'),
    path('subir-resumen/', views.subir_resumen_asistente, name='subir-resumen'),
]
