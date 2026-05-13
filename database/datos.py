import os
import sys
import django
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.hashers import make_password
from django.db import connection

# 1. Get the absolute path to the 'backend' directory
# Since you are in /database/datos.py, the backend is likely at ../backend
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))

# 2. Add the backend directory to sys.path so 'core' can be found
if base_dir not in sys.path:
    sys.path.append(base_dir)

# 3. Point to your settings (replace 'core.settings' if your folder name is different)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

# 4. Initialize Django
django.setup()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()


def populate():
    print("Iniciando población de la base de datos mediante SQL crudo...")

    password_hash_admin = make_password("admin123")
    password_hash_evaluador = make_password("evaluador123")
    password_hash_dictaminador = make_password("dictaminador123")
    password_hash_ponente = make_password("ponente123")
    password_hash_asistente = make_password("asistente123")

    now = timezone.now()
    now_str = now.strftime("%Y-%m-%d %H:%M:%S")

    with connection.cursor() as cursor:
        # 1. Institucion
        cursor.execute("""
            INSERT INTO institucion (nombre, ubicacion, pais) 
            VALUES ('Benemérita Universidad Autónoma de Puebla', 'Puebla, México', 'México') 
            RETURNING id_institucion;
        """)
        id_institucion = cursor.fetchone()[0]

        # 2. Sede
        cursor.execute("""
            INSERT INTO sede (nombre_sede, pais, estado, ciudad, calle, num_exterior, modulo_fisico) 
            VALUES ('Complejo Cultural Universitario BUAP', 'México', 'Puebla', 'Puebla', 'Vía Atlixcáyotl', 2299, 'Edificio Norte 1')
            RETURNING id_sede;
        """)
        id_sede = cursor.fetchone()[0]

        # 3. Areas Generales y Subareas
        cursor.execute(
            "INSERT INTO areas_generales (nombre) VALUES ('Ciencias de la Computación') RETURNING id_areas_generales;"
        )
        id_area_cs = cursor.fetchone()[0]

        cursor.execute(
            "INSERT INTO areas_generales (nombre) VALUES ('Ingeniería') RETURNING id_areas_generales;"
        )
        id_area_ing = cursor.fetchone()[0]

        cursor.execute(
            f"INSERT INTO subareas (nombre, id_area_general) VALUES ('Inteligencia Artificial', {id_area_cs}) RETURNING id_subareas;"
        )
        id_subarea_ia = cursor.fetchone()[0]

        # 4. Costos
        cursor.execute("""
            INSERT INTO costos_congreso (cuenta_deposito, descuento_prepago, descuento_estudiante, costo_congreso_asistente, costo_congreso_ponente, costo_congreso_comite) 
            VALUES ('0123456789', 10.0, 50.0, 500.0, 1000.0, 0.0)
            RETURNING id_costos_congreso;
        """)
        id_costos = cursor.fetchone()[0]

        # 5. Fechas
        f_inicio_evento = (now + timedelta(days=60)).strftime("%Y-%m-%d %H:%M:%S")
        f_final_evento = (now + timedelta(days=65)).strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute(f"""
            INSERT INTO fechas_congreso (
                fecha_inicio_evento, fecha_final_evento, 
                fecha_inicio_prepago, fecha_fin_prepago,
                fecha_inicio_pago_normal, fecha_fin_pago_normal,
                fecha_inicio_inscribir_dictaminador, fecha_fin_inscribir_dictaminador,
                fecha_inicio_inscribir_evaluador, fecha_fin_inscribir_evaluador,
                fecha_inicio_subida_ponencias, fecha_fin_subida_ponencias,
                fecha_inicio_evaluar_resumenes, fecha_final_evaluar_resumenes,
                fecha_inicio_evaluar_extensos, fecha_fin_evaluar_extensos,
                fecha_inicio_subir_multimedia, fecha_fin_subir_multimedia,
                fecha_inicio_subir_extenso_final, fecha_fin_subir_extenso_final
            ) VALUES (
                '{f_inicio_evento}', '{f_final_evento}',
                '{now_str}', '{now_str}', '{now_str}', '{now_str}',
                '{now_str}', '{now_str}', '{now_str}', '{now_str}',
                '{now_str}', '{now_str}', '{now_str}', '{now_str}',
                '{now_str}', '{now_str}', '{now_str}', '{now_str}',
                '{now_str}', '{now_str}'
            ) RETURNING id_fechas_congreso;
        """)
        id_fechas = cursor.fetchone()[0]

        # 6. Congreso
        cursor.execute(f"""
            INSERT INTO congreso (nombre_congreso, id_sede, id_institucion, id_fechas_congreso, id_costos_congreso, firma_organizador, firma_secretaria, firmas_bloqueadas)
            VALUES ('Congreso Nacional de Tecnologías de la Información 2026', {id_sede}, {id_institucion}, {id_fechas}, {id_costos}, 'Dr. Organizador', 'Mtra. Secretaria', false)
            RETURNING id_congreso;
        """)
        id_congreso = cursor.fetchone()[0]

        # 7. Tipo de Trabajo
        cursor.execute(
            f"INSERT INTO tipo_trabajo (id_congreso, tipo_trabajo) VALUES ({id_congreso}, 'Ponencia') RETURNING id_tipo_trabajo;"
        )
        id_tipo_ponencia = cursor.fetchone()[0]

        # 8. Mesas de Trabajo
        cursor.execute(f"""
            INSERT INTO mesas_trabajo (nombre, id_subarea, cupos_maximos, id_sede) 
            VALUES ('Mesa 1: Avances en Inteligencia Artificial', {id_subarea_ia}, 50, {id_sede})
            RETURNING id_mesas_trabajo;
        """)
        id_mesas_trabajo = cursor.fetchone()[0]

        # 9. Eventos
        cursor.execute(f"""
            INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos)
            VALUES ({id_congreso}, 'Sesión de Ponencias: Machine Learning', 'ponencia', {id_tipo_ponencia}, {id_mesas_trabajo}, '{f_inicio_evento}', '{f_final_evento}', 'Presentación de trabajos recientes en ML.', 50)
            RETURNING id_evento;
        """)

        # 10. Personas y Roles
        # Admin
        cursor.execute(f"""
            INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
            VALUES ('Administrador', 'Sistema', 'admin@congreso.com', '{password_hash_admin}', 'ADMIN0000000000000', '2220000000', true, true, true)
            ON CONFLICT (correo_electronico) DO NOTHING RETURNING id_persona;
        """)
        # Evaluador
        cursor.execute(f"""
            INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
            VALUES ('Carlos', 'Evaluador', 'evaluador@congreso.com', '{password_hash_evaluador}', 'EVAL00000000000000', '2220000001', false, false, true)
            ON CONFLICT (correo_electronico) DO NOTHING RETURNING id_persona;
        """)
        res = cursor.fetchone()
        if res:
            cursor.execute(f"INSERT INTO evaluador (id_persona) VALUES ({res[0]});")
            cursor.execute(
                f"INSERT INTO evaluador_congreso (id_persona, id_congreso) VALUES ({res[0]}, {id_congreso});"
            )

        # Dictaminador
        cursor.execute(f"""
            INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
            VALUES ('Laura', 'Dictaminadora', 'dictaminador@congreso.com', '{password_hash_dictaminador}', 'DICT00000000000000', '2220000002', false, false, true)
            ON CONFLICT (correo_electronico) DO NOTHING RETURNING id_persona;
        """)
        res = cursor.fetchone()
        if res:
            cursor.execute(f"INSERT INTO dictaminador (id_persona) VALUES ({res[0]});")
            cursor.execute(
                f"INSERT INTO dictaminador_congreso (id_persona, id_congreso) VALUES ({res[0]}, {id_congreso});"
            )

        # Ponente
        cursor.execute(f"""
            INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
            VALUES ('Miguel', 'Ponente', 'ponente@congreso.com', '{password_hash_ponente}', 'PONE00000000000000', '2220000003', false, false, true)
            ON CONFLICT (correo_electronico) DO NOTHING RETURNING id_persona;
        """)
        res = cursor.fetchone()
        if res:
            cursor.execute(f"INSERT INTO ponente (id_persona) VALUES ({res[0]});")

        # Asistente
        cursor.execute(f"""
            INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
            VALUES ('Ana', 'Asistente', 'asistente@congreso.com', '{password_hash_asistente}', 'ASIS00000000000000', '2220000004', false, false, true)
            ON CONFLICT (correo_electronico) DO NOTHING RETURNING id_persona;
        """)
        res = cursor.fetchone()
        if res:
            cursor.execute(
                f"INSERT INTO asistente (id_persona, institucion_procedencia) VALUES ({res[0]}, 'UNAM');"
            )

    print("¡Base de datos poblada exitosamente con datos de prueba!")
    print("Usuarios creados:")
    print("- admin@congreso.com / admin123")
    print("- evaluador@congreso.com / evaluador123")
    print("- dictaminador@congreso.com / dictaminador123")
    print("- ponente@congreso.com / ponente123")
    print("- asistente@congreso.com / asistente123")


if __name__ == "__main__":
    populate()
