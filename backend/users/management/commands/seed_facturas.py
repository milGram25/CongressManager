from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import Persona, Factura

FACTURAS_SEED = [
    {"email": "laura.hernandez@udg.mx",     "rfc": "HERL900101AAA", "razon": "Universidad de Guadalajara", "cp": "44100", "regimen": "601 - General Personas Morales"},
    {"email": "carlos.mendoza@unam.mx",     "rfc": "MECA850615BBB", "razon": "UNAM",                       "cp": "04510", "regimen": "601 - General Personas Morales"},
    {"email": "sofia.ramirez@tec.mx",       "rfc": "RASF920320CCC", "razon": "Tec de Monterrey",           "cp": "64849", "regimen": "601 - General Personas Morales"},
    {"email": "jorge.fuentes@udg.mx",       "rfc": "FUJG780910DDD", "razon": "Universidad de Guadalajara", "cp": "44100", "regimen": "612 - Personas Físicas con Actividades Empresariales"},
    {"email": "alejandro.jimenez@udg.mx",   "rfc": "JIEA880225EEE", "razon": "Universidad de Guadalajara", "cp": "44100", "regimen": "612 - Personas Físicas con Actividades Empresariales"},
    {"email": "elena.vazquez@unam.mx",      "rfc": "VAEE910714FFF", "razon": "UNAM",                       "cp": "04510", "regimen": "601 - General Personas Morales"},
]


class Command(BaseCommand):
    help = "Crea facturas pendientes de prueba para participantes del congreso 8"

    def handle(self, *args, **options):
        created = 0
        skipped = 0
        for f in FACTURAS_SEED:
            try:
                persona = Persona.objects.get(correo_electronico=f["email"])
            except Persona.DoesNotExist:
                self.stderr.write(f"  Usuario no encontrado: {f['email']} (corre seed_participants primero)")
                continue

            if Factura.objects.filter(id_persona=persona, id_congreso_id=8).exists():
                skipped += 1
                continue

            Factura.objects.create(
                id_persona=persona,
                id_congreso_id=8,
                rfc=f["rfc"],
                razon_social=f["razon"],
                codigo_postal=f["cp"],
                regimen_fiscal=f["regimen"],
                estatus="pendiente",
            )
            created += 1
            self.stdout.write(f"  Factura pendiente: {persona.nombre} {persona.primer_apellido}")

        self.stdout.write(self.style.SUCCESS(f"\n{created} facturas creadas, {skipped} ya existían."))
