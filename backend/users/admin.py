from django.contrib import admin
from .models import Persona

@admin.register(Persona)
class PersonaAdmin(admin.ModelAdmin):
    list_display = ('correo_electronico', 'nombre', 'primer_apellido', 'is_staff', 'is_superuser')
    search_fields = ('correo_electronico', 'nombre', 'primer_apellido')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'genero', 'pais')
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('nombre', 'primer_apellido', 'segundo_apellido', 'correo_electronico', 'password', 'num_telefono', 'curp')
        }),
        ('Información de Perfil', {
            'fields': ('genero', 'pais', 'discapacidad')
        }),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser')
        }),
        ('Fechas Importantes', {
            'fields': ('last_login',)
        }),
    )
