from django.core.management.base import BaseCommand
from django.db import transaction, connection
from django.utils import timezone
from users.models import Persona, Asistente, Dictaminador, Evaluador, Ponente


PARTICIPANTES = [
    {"nombre": "Laura", "apellido": "Hernández", "email": "laura.hernandez@udg.mx", "tel": "3311100001", "inst": "Universidad de Guadalajara", "rol": "asistente"},
    {"nombre": "Carlos", "apellido": "Mendoza", "email": "carlos.mendoza@unam.mx", "tel": "5511100001", "inst": "UNAM", "rol": "asistente"},
    {"nombre": "Sofía", "apellido": "Ramírez", "email": "sofia.ramirez@tec.mx", "tel": "8111100001", "inst": "Tec de Monterrey", "rol": "asistente"},
    {"nombre": "Miguel", "apellido": "Torres", "email": "miguel.torres@udg.mx", "tel": "3311100002", "inst": "Universidad de Guadalajara", "rol": "asistente"},
    {"nombre": "Valentina", "apellido": "Cruz", "email": "valentina.cruz@uam.mx", "tel": "5511100002", "inst": "UAM Iztapalapa", "rol": "asistente"},
    {"nombre": "Jorge", "apellido": "Fuentes", "email": "jorge.fuentes@udg.mx", "tel": "3311100003", "inst": "Universidad de Guadalajara", "rol": "dictaminador"},
    {"nombre": "Gabriela", "apellido": "Sánchez", "email": "gabriela.sanchez@unam.mx", "tel": "5511100003", "inst": "UNAM", "rol": "dictaminador"},
    {"nombre": "Roberto", "apellido": "Pérez", "email": "roberto.perez@tec.mx", "tel": "8111100002", "inst": "Tec de Monterrey", "rol": "dictaminador"},
    {"nombre": "Elena", "apellido": "Vázquez", "email": "elena.vazquez@unam.mx", "tel": "5511100004", "inst": "UNAM", "rol": "revisor"},
    {"nombre": "Fernando", "apellido": "López", "email": "fernando.lopez@udg.mx", "tel": "3311100004", "inst": "Universidad de Guadalajara", "rol": "revisor"},
    {"nombre": "Patricia", "apellido": "Morales", "email": "patricia.morales@uam.mx", "tel": "5511100005", "inst": "UAM Iztapalapa", "rol": "revisor"},
    {"nombre": "Alejandro", "apellido": "Jiménez", "email": "alejandro.jimenez@udg.mx", "tel": "3311100005", "inst": "Universidad de Guadalajara", "rol": "ponente"},
    {"nombre": "Claudia", "apellido": "García", "email": "claudia.garcia@tec.mx", "tel": "8111100003", "inst": "Tec de Monterrey", "rol": "ponente"},
    {"nombre": "Ricardo", "apellido": "Ortega", "email": "ricardo.ortega@unam.mx", "tel": "5511100006", "inst": "UNAM", "rol": "ponente"},
]


def _seed_enrollment(stdout):
    """Link participants to congress 8 (which has events 16 and 13)."""
    with connection.cursor() as cursor:
        # Check if congress 8 exists
        cursor.execute("SELECT id_congreso FROM congreso WHERE id_congreso = 8")
        if not cursor.fetchone():
            stdout.write("  Congreso 8 no encontrado, saltando inscripciones.")
            return

        # Link asistentes (personas with asistente role) to evento 16 of congress 8
        asistentes = list(Asistente.objects.select_related('id_persona').filter(
            id_persona__correo_electronico__in=[
                'laura.hernandez@udg.mx', 'carlos.mendoza@unam.mx',
                'sofia.ramirez@tec.mx', 'miguel.torres@udg.mx', 'valentina.cruz@uam.mx'
            ]
        ))

        for a in asistentes:
            # Avoid duplicate inscription
            cursor.execute(
                "SELECT 1 FROM asistente_evento WHERE id_asistente = %s AND id_evento = 16",
                [a.id_asistente]
            )
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO asistente_evento (id_asistente, id_evento, fecha_inscripcion) VALUES (%s, 16, %s)",
                    [a.id_asistente, timezone.now()]
                )
                stdout.write(f"  Inscrito asistente {a.id_persona.nombre} en evento 16 (congreso 8)")

        # Link ponentes to ponencia 6 (event 16, congress 8)
        ponentes = list(Ponente.objects.select_related('id_persona').filter(
            id_persona__correo_electronico__in=[
                'alejandro.jimenez@udg.mx', 'claudia.garcia@tec.mx', 'ricardo.ortega@unam.mx'
            ]
        ))

        for p in ponentes:
            cursor.execute(
                "SELECT 1 FROM ponente_has_ponencia WHERE id_ponente = %s AND id_ponencia = 6",
                [p.id_ponente]
            )
            if not cursor.fetchone():
                cursor.execute(
                    "INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio) VALUES (%s, 6, %s)",
                    [p.id_ponente, False]
                )
                stdout.write(f"  Vinculado ponente {p.id_persona.nombre} a ponencia 6 (congreso 8)")


class Command(BaseCommand):
    help = "Crea participantes de prueba con diferentes roles e inscripciones al congreso 8"

    def handle(self, *args, **options):
        created = 0
        skipped = 0
        for p in PARTICIPANTES:
            if Persona.objects.filter(correo_electronico=p["email"]).exists():
                skipped += 1
                continue
            try:
                with transaction.atomic():
                    persona = Persona.objects.create_user(
                        correo_electronico=p["email"],
                        contrasena="Test1234!",
                        nombre=p["nombre"],
                        primer_apellido=p["apellido"],
                        num_telefono=p["tel"],
                    )
                    if p["rol"] == "asistente":
                        Asistente.objects.create(id_persona=persona, institucion_procedencia=p["inst"])
                    elif p["rol"] == "dictaminador":
                        Asistente.objects.create(id_persona=persona, institucion_procedencia=p["inst"])
                        Dictaminador.objects.create(id_persona=persona)
                    elif p["rol"] == "revisor":
                        Asistente.objects.create(id_persona=persona, institucion_procedencia=p["inst"])
                        Evaluador.objects.create(id_persona=persona)
                    elif p["rol"] == "ponente":
                        Asistente.objects.create(id_persona=persona, institucion_procedencia=p["inst"])
                        Ponente.objects.create(id_persona=persona)
                    created += 1
                    self.stdout.write(f"  Creado: {p['nombre']} ({p['rol']})")
            except Exception as e:
                self.stderr.write(f"  Error con {p['email']}: {e}")

        self.stdout.write(f"\n{created} participantes creados, {skipped} ya existían.")
        self.stdout.write("\nAgregando inscripciones al congreso 8...")
        _seed_enrollment(self.stdout)
        self.stdout.write(self.style.SUCCESS("\nSeed completado."))
