from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Columnas visibles en la lista de usuarios
    list_display = ('email', 'username', 'first_name', 'last_name', 'rol', 'institucion', 'is_staff')
    list_filter = ('rol', 'is_staff', 'is_active')
    search_fields = ('email', 'username', 'first_name', 'last_name')

    # Agregar los campos personalizados al formulario de edición
    fieldsets = UserAdmin.fieldsets + (
        ('Información del Congreso', {
            'fields': ('rol', 'institucion'),
        }),
    )

    # Agregar los campos personalizados al formulario de creación
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información del Congreso', {
            'fields': ('rol', 'institucion'),
        }),
    )
