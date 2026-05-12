"""
Seed: 50 asistentes de prueba para el congreso Cualtos (id=12)
Ejecutar desde la carpeta backend/:
    python ../database/seed_asistentes_cualtos.py
"""

import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

import random
from django.db import connection
from users.models import Persona, Asistente

ID_CONGRESO = 12   # Cualtos
ID_EVENTO   = 20   # Basquetbol (primer evento del congreso)

INSTITUCIONES = [
    'Universidad de Guadalajara',
    'UNAM',
    'IPN',
    'ITESM',
    'UAM',
    'BUAP',
    'Universidad de Colima',
    'UDLAP',
]

NOMBRES = [
    'Carlos', 'María', 'Juan', 'Ana', 'Luis', 'Laura', 'Pedro', 'Rosa',
    'Sergio', 'Elena', 'Miguel', 'Carmen', 'Pablo', 'Sofía', 'Diego',
    'Valentina', 'Andrés', 'Isabella', 'Fernando', 'Camila', 'Ricardo',
    'Daniela', 'Jorge', 'Paulina', 'Roberto', 'Adriana', 'Antonio',
    'Gabriela', 'Eduardo', 'Natalia', 'Francisco', 'Alejandra', 'Héctor',
    'Verónica', 'Javier', 'Mariana', 'Ernesto', 'Patricia', 'Arturo', 'Lorena',
]

APELLIDOS = [
    'García', 'Martínez', 'López', 'González', 'Rodríguez', 'Hernández',
    'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez',
    'Díaz', 'Reyes', 'Cruz', 'Morales', 'Jiménez', 'Ruiz', 'Núñez',
    'Castillo', 'Ramos', 'Herrera', 'Mendoza', 'Vargas', 'Aguilar',
    'Medina', 'Ortega', 'Gutiérrez', 'Muñoz',
]

PASSWORD = 'Test1234!'


def run():
    creados = 0
    omitidos = 0

    for i in range(1, 51):
        email = f'test.asistente{i:02d}@cualtos-test.mx'

        if Persona.objects.filter(correo_electronico=email).exists():
            omitidos += 1
            continue

        nombre = random.choice(NOMBRES)
        ap1    = random.choice(APELLIDOS)
        ap2    = random.choice(APELLIDOS)
        tel    = f'331{random.randint(1_000_000, 9_999_999)}'
        inst   = random.choice(INSTITUCIONES)

        persona = Persona.objects.create_user(
            nombre=nombre,
            primer_apellido=ap1,
            segundo_apellido=ap2,
            correo_electronico=email,
            num_telefono=tel,
            contrasena=PASSWORD,
            pais='México',
        )

        asistente = Asistente.objects.create(
            id_persona=persona,
            institucion_procedencia=inst,
        )

        with connection.cursor() as cur:
            cur.execute(
                'INSERT INTO asistente_evento (id_asistente, id_evento, fecha_inscripcion) '
                'VALUES (%s, %s, NOW())',
                [asistente.id_asistente, ID_EVENTO],
            )

        creados += 1

    print(f'Listo — creados: {creados}, omitidos (ya existían): {omitidos}')
    print(f'Correos: test.asistente01@cualtos-test.mx ... test.asistente50@cualtos-test.mx')
    print(f'Contraseña: {PASSWORD}')


if __name__ == '__main__':
    run()
