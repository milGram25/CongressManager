from django.urls import path
from . import views

urlpatterns = [
    # ------------------ DICTAMINADORES ------------------
    path('dictaminador/resumenes-pendientes/', views.mis_resumenes_asignados, name='dictaminador-resumenes'),
    path('dictaminador/dictaminar/<int:id_resumen>/', views.dictaminar_resumen, name='dictaminar-resumen'),

    # ------------------ REVISORES (EVALUADORES) ------------------
    path('revisor/extensos-pendientes/', views.mis_extensos_asignados, name='revisor-extensos'),
    path('revisor/revisar/<int:id_extenso>/', views.revisar_extenso, name='revisar-extenso'),

    # ------------------ ASISTENTES ------------------
    path('mis-ponencias/', views.mis_ponencias_asistente, name='mis-ponencias-asistente'),
    path('subir-resumen/', views.subir_resumen_asistente, name='subir-resumen'),
    path('detalle-ponencia/<int:id_ponencia>/', views.get_detalle_ponencia, name='detalle-ponencia'),
    path('subir-extenso/<int:id_ponencia>/', views.subir_extenso_asistente, name='subir-extenso'),

    # ------------------ ADMINISTRADOR ------------------
    path('admin/dictaminadores/', views.admin_listar_dictaminadores, name='admin-dictaminadores'),
    path('admin/evaluadores/', views.admin_listar_evaluadores, name='admin-evaluadores'),
    path('admin/resumenes/', views.admin_listar_resumenes, name='admin-resumenes'),
    path('admin/asignar-dictaminador/<int:id_resumen>/', views.admin_asignar_dictaminador, name='admin-asignar-dictaminador'),
    path('admin/extensos/', views.admin_listar_extensos, name='admin-extensos'),
    path('admin/asignar-evaluador/<int:id_extenso>/', views.admin_asignar_evaluador, name='admin-asignar-evaluador'),
]
