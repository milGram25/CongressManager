from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = (
        ('admin', 'Administrador'),
        ('asistente', 'Asistente'),
        ('revisor', 'Revisor'),
        ('dictaminador', 'Dictaminador'),
    )
    rol = models.CharField(max_length=20, choices=ROLES, default='asistente')
    institucion = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.username} - {self.rol}"