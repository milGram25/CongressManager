import os
import sys
import django
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.hashers import make_password
from django.db import connection

# 1. Configuración de entorno Django
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if base_dir not in sys.path:
    sys.path.append(base_dir)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

def populate_ridmae():
    print("Iniciando población de datos para el congreso RIDMAE en CUALTOS UDG...")

    pass_hash = make_password("password123")
    now = timezone.now()
    now_str = now.strftime("%Y-%m-%d %H:%M:%S")

    # Fechas dinámicas
    f_inicio_evento = (now + timedelta(days=30)).replace(hour=9, minute=0, second=0).strftime("%Y-%m-%d %H:%M:%S")
    f_final_evento = (now + timedelta(days=33)).replace(hour=18, minute=0, second=0).strftime("%Y-%m-%d %H:%M:%S")
    
    # Fechas de procesos (todas abiertas hoy para pruebas)
    f_ayer = (now - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
    f_proximo_mes = (now + timedelta(days=30)).strftime("%Y-%m-%d %H:%M:%S")

    with connection.cursor() as cursor:
        # Limpiar tablas para un flujo limpio (Opcional, pero recomendado para pruebas de flujo completo)
        print("Limpiando datos previos...")
        cursor.execute("""
            TRUNCATE TABLE 
                asistente_evento, ponente_has_ponencia, evaluacion_criterio, evaluacion, 
                ponencia, extenso, resumen, evento, mesas_trabajo, 
                dictamen_pregunta, dictamen, rubrica_criterio, rubrica_grupo, rubrica, 
                tipo_trabajo_formato, tipo_trabajo, congreso, fechas_congreso, 
                costos_congreso, sede, institucion, subareas, areas_generales,
                asistente, ponente, dictaminador_congreso, dictaminador, 
                evaluador_congreso, evaluador, persona
            RESTART IDENTITY CASCADE;
        """)
        # 1. Institución
        cursor.execute("""
            INSERT INTO institucion (nombre, ubicacion, pais) 
            VALUES ('Centro Universitario de los Altos (CUALTOS UDG)', 'Tepatitlán de Morelos, Jalisco', 'México') 
            RETURNING id_institucion;
        """)
        id_inst = cursor.fetchone()[0]

        # 2. Sede
        cursor.execute("""
            INSERT INTO sede (nombre_sede, pais, estado, ciudad, calle, num_exterior, modulo_fisico) 
            VALUES ('CUALTOS UDG', 'México', 'Jalisco', 'Tepatitlán de Morelos', 'Av. Universidad', 450, 'Edificio de Investigación')
            RETURNING id_sede;
        """)
        id_sede = cursor.fetchone()[0]

        # 3. Costos
        cursor.execute("""
            INSERT INTO costos_congreso (cuenta_deposito, descuento_prepago, descuento_estudiante, costo_congreso_asistente, costo_congreso_ponente, costo_congreso_comite) 
            VALUES ('0011223344', 15.0, 50.0, 600.0, 1200.0, 0.0)
            RETURNING id_costos_congreso;
        """)
        id_costos = cursor.fetchone()[0]

        # 4. Fechas
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
                '{f_ayer}', '{f_proximo_mes}', '{f_ayer}', '{f_proximo_mes}',
                '{f_ayer}', '{f_proximo_mes}', '{f_ayer}', '{f_proximo_mes}',
                '{f_ayer}', '{f_proximo_mes}', '{f_ayer}', '{f_proximo_mes}',
                '{f_ayer}', '{f_proximo_mes}', '{f_ayer}', '{f_proximo_mes}',
                '{f_ayer}', '{f_proximo_mes}'
            ) RETURNING id_fechas_congreso;
        """)
        id_fechas = cursor.fetchone()[0]

        # 5. Congreso RIDMAE
        cursor.execute(f"""
            INSERT INTO congreso (nombre_congreso, id_sede, id_institucion, id_fechas_congreso, id_costos_congreso, firma_organizador, firma_secretaria)
            VALUES ('Congreso RIDMAE 2026', {id_sede}, {id_inst}, {id_fechas}, {id_costos}, 'Dr. Investigador Principal', 'Mtra. Secretaria Académica')
            RETURNING id_congreso;
        """)
        id_congreso = cursor.fetchone()[0]

        # 6. Areas y Subareas
        cursor.execute("INSERT INTO areas_generales (nombre) VALUES ('Educación y Tecnología') RETURNING id_areas_generales;")
        id_area = cursor.fetchone()[0]
        
        cursor.execute(f"INSERT INTO subareas (nombre, id_area_general) VALUES ('Entornos Virtuales de Aprendizaje', {id_area}) RETURNING id_subareas;")
        id_subarea = cursor.fetchone()[0]

        # 7. Tipo de Trabajo y Formato
        cursor.execute(f"INSERT INTO tipo_trabajo (id_congreso, tipo_trabajo) VALUES ({id_congreso}, 'Ponencia Oral') RETURNING id_tipo_trabajo;")
        id_tipo = cursor.fetchone()[0]
        
        cursor.execute(f"INSERT INTO tipo_trabajo_formato (id_tipo_trabajo, ruta_formato) VALUES ({id_tipo}, 'formatos/ponencia_template.docx');")

        # 8. Rubrica
        cursor.execute(f"""
            INSERT INTO rubrica (id_congreso, tipo_trabajo, nombre, esta_activo)
            VALUES ({id_congreso}, {id_tipo}, 'Rúbrica de Evaluación de Ponencias RIDMAE', true)
            RETURNING id_rubrica;
        """)
        id_rubrica = cursor.fetchone()[0]
        
        # Grupo y Criterio de Rubrica
        cursor.execute(f"INSERT INTO rubrica_grupo (id_rubrica, nombre_grupo) VALUES ({id_rubrica}, 'Calidad Académica') RETURNING id_grupo;")
        id_grupo = cursor.fetchone()[0]
        cursor.execute(f"INSERT INTO rubrica_criterio (id_grupo, descripcion, peso) VALUES ({id_grupo}, 'Originalidad y aporte al conocimiento', 0.50);")
        cursor.execute(f"INSERT INTO rubrica_criterio (id_grupo, descripcion, peso) VALUES ({id_grupo}, 'Claridad en la metodología', 0.50);")

        # 9. Dictamen (para resúmenes)
        cursor.execute(f"INSERT INTO dictamen (tipo_trabajo, nombre, esta_activo) VALUES ({id_tipo}, 'Dictamen de Resumen RIDMAE', true) RETURNING id_dictamen;")
        id_dict_temp = cursor.fetchone()[0]
        cursor.execute(f"INSERT INTO dictamen_pregunta (id_dictamen, descripcion) VALUES ({id_dict_temp}, '¿El resumen cumple con la extensión solicitada?');")
        cursor.execute(f"INSERT INTO dictamen_pregunta (id_dictamen, descripcion) VALUES ({id_dict_temp}, '¿La temática es pertinente al congreso?');")

        # 10. Mesas y Eventos
        cursor.execute(f"""
            INSERT INTO mesas_trabajo (nombre, id_subarea, cupos_maximos, id_sede) 
            VALUES ('Mesa A: Innovación Educativa', {id_subarea}, 30, {id_sede})
            RETURNING id_mesas_trabajo;
        """)
        id_mesa = cursor.fetchone()[0]

        cursor.execute(f"""
            INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos)
            VALUES ({id_congreso}, 'Inauguración y Sesión 1 RIDMAE', 'ponencia', {id_tipo}, {id_mesa}, '{f_inicio_evento}', '{f_final_evento}', 'Apertura del congreso y primeras ponencias.', 30)
            RETURNING id_evento;
        """)
        id_evento = cursor.fetchone()[0]

        # 11. Usuarios de prueba
        usuarios = [
            ('admin_ridmae', 'Admin', 'admin@ridmae.com', True, True, 'superuser'),
            ('evaluador_ridmae', 'Carlos', 'eval@ridmae.com', False, False, 'evaluador'),
            ('evaluador_ridmae', 'Eduardo', 'eval1@ridmae.com', False, False, 'evaluador'),
            ('dictaminador_ridmae', 'Laura', 'dict@ridmae.com', False, False, 'dictaminador'),
            ('ponente_ridmae', 'Miguel', 'ponente@ridmae.com', False, False, 'ponente'),
            ('asistente_ridmae', 'Ana', 'asistente@ridmae.com', False, False, 'asistente')
        ]

        for username, nombre, email, is_super, is_staff, role in usuarios:
            cursor.execute(f"""
                INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, is_superuser, is_staff, is_active)
                VALUES ('{nombre}', 'RIDMAE', '{email}', '{pass_hash}', {is_super}, {is_staff}, true)
                ON CONFLICT (correo_electronico) DO UPDATE SET is_active = true
                RETURNING id_persona;
            """)
            uid = cursor.fetchone()[0]

            if role == 'evaluador':
                cursor.execute(f"INSERT INTO evaluador (id_persona) VALUES ({uid}) ON CONFLICT DO NOTHING;")
                cursor.execute(f"INSERT INTO evaluador_congreso (id_persona, id_congreso) VALUES ({uid}, {id_congreso}) ON CONFLICT DO NOTHING;")
            elif role == 'dictaminador':
                cursor.execute(f"INSERT INTO dictaminador (id_persona) VALUES ({uid}) ON CONFLICT DO NOTHING;")
                cursor.execute(f"INSERT INTO dictaminador_congreso (id_persona, id_congreso) VALUES ({uid}, {id_congreso}) ON CONFLICT DO NOTHING;")
            elif role == 'ponente':
                cursor.execute(f"INSERT INTO ponente (id_persona) VALUES ({uid}) ON CONFLICT DO NOTHING;")
            elif role == 'asistente':
                cursor.execute(f"INSERT INTO asistente (id_persona, institucion_procedencia) VALUES ({uid}, 'CUALTOS UDG') ON CONFLICT DO NOTHING;")
                id_asistente = uid # Guardar para inscripción

        # 12. Simulando Flujo Completo: Una Ponencia
        print("Simulando flujo de ponencia...")
        
        # Obtener IDs necesarios
        cursor.execute("SELECT id_ponente FROM ponente WHERE id_persona = (SELECT id_persona FROM persona WHERE correo_electronico = 'ponente@ridmae.com');")
        id_ponente = cursor.fetchone()[0]
        
        cursor.execute("SELECT id_dictaminador FROM dictaminador WHERE id_persona = (SELECT id_persona FROM persona WHERE correo_electronico = 'dict@ridmae.com');")
        id_dictaminador = cursor.fetchone()[0]
        
        cursor.execute("SELECT id_evaluador FROM evaluador WHERE id_persona = (SELECT id_persona FROM persona WHERE correo_electronico = 'eval@ridmae.com');")
        id_evaluador = cursor.fetchone()[0]

        # 12.1 Resumen
        cursor.execute(f"""
            INSERT INTO resumen (id_dictaminador, fecha_entrega, revisado, estatus, retroalimentacion)
            VALUES ({id_dictaminador}, '{now_str}', true, 'aceptado', 'El resumen cumple con los requisitos.')
            RETURNING id_resumen;
        """)
        id_resumen = cursor.fetchone()[0]

        # 12.2 Extenso
        cursor.execute(f"""
            INSERT INTO extenso (titulo, fecha_subida, revisado, id_evaluador, ruta_relativa)
            VALUES ('Impacto de la IA en CUALTOS', '{now_str}', true, {id_evaluador}, 'trabajos/extenso_test.pdf')
            RETURNING id_extenso;
        """)
        id_extenso = cursor.fetchone()[0]

        # 12.3 Ponencia
        cursor.execute(f"""
            INSERT INTO ponencia (id_evento, tipo_participacion, id_subarea, id_resumen, id_extenso)
            VALUES ({id_evento}, 'presencial', {id_subarea}, {id_resumen}, {id_extenso})
            RETURNING id_ponencia;
        """)
        id_ponencia = cursor.fetchone()[0]
        
        # Relación Ponente-Ponencia
        cursor.execute(f"INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia) VALUES ({id_ponente}, {id_ponencia});")

        # 12.4 Evaluación del Extenso
        cursor.execute(f"""
            INSERT INTO evaluacion (id_extenso, id_evaluador, retroalimentacion_general, estatus)
            VALUES ({id_extenso}, {id_evaluador}, 'Excelente trabajo de investigación.', 'aceptado')
            RETURNING id_evaluacion;
        """)
        id_evaluacion = cursor.fetchone()[0]
        
        # Puntajes de criterios
        cursor.execute("SELECT id_criterio FROM rubrica_criterio WHERE id_grupo = (SELECT id_grupo FROM rubrica_grupo WHERE id_rubrica = %s LIMIT 1);", [id_rubrica])
        criterios = cursor.fetchall()
        for c in criterios:
            cursor.execute(f"INSERT INTO evaluacion_criterio (id_evaluacion, id_criterio, puntaje, comentario_especifico) VALUES ({id_evaluacion}, {c[0]}, 5, 'Muy bien.');")

        # 12.5 Inscripción de Asistente a Evento
        cursor.execute("SELECT id_asistente FROM asistente WHERE id_persona = (SELECT id_persona FROM persona WHERE correo_electronico = 'asistente@ridmae.com');")
        id_asis_real = cursor.fetchone()[0]
        cursor.execute(f"INSERT INTO asistente_evento (id_asistente, id_evento) VALUES ({id_asis_real}, {id_evento}) ON CONFLICT DO NOTHING;")

    print(f"¡Congreso RIDMAE en CUALTOS UDG creado exitosamente con ID {id_congreso}!")
    print("Usuarios creados (password: password123):")
    for _, _, email, _, _, role in usuarios:
        print(f"- {email} ({role})")

if __name__ == "__main__":
    populate_ridmae()
