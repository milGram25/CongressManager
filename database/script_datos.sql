-- Script de población de datos para PostgreSQL
-- Nota: Se asume que las tablas ya existen en el esquema public.
-- Este script incluye datos completos para todas las tablas del nuevo schema
-- Incluye múltiples congresos, instituciones, eventos, talleres y extensos

DO $$
DECLARE
    -- Variables para instituciones
    v_id_institucion INT;
    v_id_institucion_2 INT;
    v_id_institucion_3 INT;
    v_id_institucion_4 INT;

    -- Variables para sedes
    v_id_sede INT;
    v_id_sede_2 INT;
    v_id_sede_3 INT;

    -- Variables para áreas y subáreas
    v_id_area_cs INT;
    v_id_area_ing INT;
    v_id_area_admin INT;
    v_id_subarea_ia INT;
    v_id_subarea_ml INT;
    v_id_subarea_ing_soft INT;
    v_id_subarea_seguridad INT;

    -- Variables para costos y fechas
    v_id_costos INT;
    v_id_costos_2 INT;
    v_id_fechas INT;
    v_id_fechas_2 INT;

    -- Variables para congresos
    v_id_congreso INT;
    v_id_congreso_2 INT;
    v_id_congreso_3 INT;

    -- Variables para tipos de trabajo
    v_id_tipo_ponencia INT;
    v_id_tipo_taller INT;
    v_id_tipo_ponencia_2 INT;

    -- Variables para mesas de trabajo
    v_id_mesas_trabajo INT;
    v_id_mesas_trabajo_2 INT;
    v_id_mesas_trabajo_3 INT;

    -- Variables para personas
    v_id_persona INT;
    v_id_persona_temp INT;
    v_id_evaluador INT;
    v_id_evaluador_2 INT;
    v_id_dictaminador INT;
    v_id_asistente INT;
    v_id_ponente INT;

    -- Variables para eventos
    v_id_evento INT;
    v_id_evento_2 INT;
    v_id_evento_3 INT;
    v_id_evento_4 INT;
    v_id_evento_5 INT;
    v_id_evento_6 INT;
    v_id_evento_7 INT;
    v_id_evento_8 INT;

    -- Variables para multimedia
    v_id_multimedia INT;
    v_id_multimedia_2 INT;

    -- Variables para rúbricas
    v_id_rubrica INT;
    v_id_rubrica_2 INT;
    v_id_rubrica_grupo INT;
    v_id_rubrica_criterio INT;

    -- Variables para dictamen
    v_id_dictamen INT;
    v_id_dictamen_pregunta INT;

    -- Variables para trabajos
    v_id_resumen INT;
    v_id_resumen_2 INT;
    v_id_extenso INT;
    v_id_extenso_2 INT;
    v_id_extenso_3 INT;

    -- Variables para evaluaciones y ponencias
    v_id_evaluacion INT;
    v_id_ponencia INT;
    v_id_ponencia_magistral INT;
    v_id_libro INT;

    -- Timestamps
    v_now TIMESTAMP := NOW();
    v_f_inicio TIMESTAMP := NOW() + INTERVAL '1 day';
    v_f_final TIMESTAMP := NOW() + INTERVAL '76 days';
BEGIN
    RAISE NOTICE 'Iniciando población completa de la base de datos...';

    -- ============================================
    -- 1. INSTITUCIONES
    -- ============================================
    INSERT INTO institucion (nombre, ubicacion, pais, ruta_imagen)
    VALUES ('Benemérita Universidad Autónoma de Puebla', 'Puebla, México', 'México', '/media/instituciones/buap.png')
    RETURNING id_institucion INTO v_id_institucion;

    INSERT INTO institucion (nombre, ubicacion, pais, ruta_imagen)
    VALUES ('Universidad Nacional Autónoma de México', 'Ciudad de México, México', 'México', '/media/instituciones/unam.png')
    RETURNING id_institucion INTO v_id_institucion_2;

    INSERT INTO institucion (nombre, ubicacion, pais, ruta_imagen)
    VALUES ('Tecnológico de Monterrey', 'Monterrey, México', 'México', '/media/instituciones/itesm.png')
    RETURNING id_institucion INTO v_id_institucion_3;

    INSERT INTO institucion (nombre, ubicacion, pais, ruta_imagen)
    VALUES ('Universidad de Guadalajara', 'Guadalajara, México', 'México', '/media/instituciones/ugto.png')
    RETURNING id_institucion INTO v_id_institucion_4;

    -- ============================================
    -- 2. SEDES
    -- ============================================
    INSERT INTO sede (nombre_sede, pais, estado, ciudad, calle, num_exterior, num_interior, modulo_fisico)
    VALUES ('Complejo Cultural Universitario BUAP', 'México', 'Puebla', 'Puebla', 'Vía Atlixcáyotl', 2299, 100, 'Edificio Norte 1')
    RETURNING id_sede INTO v_id_sede;

    INSERT INTO sede (nombre_sede, pais, estado, ciudad, calle, num_exterior, num_interior, modulo_fisico)
    VALUES ('Instituto de Investigaciones en Matemáticas Aplicadas UNAM', 'México', 'Ciudad de México', 'México', 'Circuito Escolar', 3000, NULL, 'Auditorio Principal')
    RETURNING id_sede INTO v_id_sede_2;

    INSERT INTO sede (nombre_sede, pais, estado, ciudad, calle, num_exterior, num_interior, modulo_fisico)
    VALUES ('Campus Monterrey ITESM', 'México', 'Nuevo León', 'Monterrey', 'Avenida Eugenio Garza Sada', 2501, NULL, 'Salón de Conferencias A')
    RETURNING id_sede INTO v_id_sede_3;

    -- ============================================
    -- 3. ÁREAS GENERALES Y SUBÁREAS
    -- ============================================
    INSERT INTO areas_generales (nombre) VALUES ('Ciencias de la Computación') RETURNING id_areas_generales INTO v_id_area_cs;
    INSERT INTO areas_generales (nombre) VALUES ('Ingeniería de Software') RETURNING id_areas_generales INTO v_id_area_ing;
    INSERT INTO areas_generales (nombre) VALUES ('Administración') RETURNING id_areas_generales INTO v_id_area_admin;

    INSERT INTO subareas (nombre, id_area_general) VALUES ('Inteligencia Artificial', v_id_area_cs) RETURNING id_subareas INTO v_id_subarea_ia;
    INSERT INTO subareas (nombre, id_area_general) VALUES ('Machine Learning', v_id_area_cs) RETURNING id_subareas INTO v_id_subarea_ml;
    INSERT INTO subareas (nombre, id_area_general) VALUES ('Ingeniería de Software', v_id_area_ing) RETURNING id_subareas INTO v_id_subarea_ing_soft;
    INSERT INTO subareas (nombre, id_area_general) VALUES ('Seguridad Informática', v_id_area_cs) RETURNING id_subareas INTO v_id_subarea_seguridad;

    -- ============================================
    -- 4. MULTIMEDIA
    -- ============================================
    INSERT INTO multimedia (nombre, ruta_relativa) VALUES ('Presentación IA 2026', '/media/multimedia/ia_2026.pptx') RETURNING id_material INTO v_id_multimedia;
    INSERT INTO multimedia (nombre, ruta_relativa) VALUES ('Video ML Tutorial', '/media/multimedia/ml_tutorial.mp4') RETURNING id_material INTO v_id_multimedia_2;

    -- ============================================
    -- 5. COSTOS
    -- ============================================
    INSERT INTO costos_congreso (cuenta_deposito, descuento_prepago, descuento_estudiante, costo_congreso_asistente, costo_congreso_ponente, costo_congreso_comite)
    VALUES ('BUAP0123456789', 10.0, 50.0, 500.0, 1000.0, 0.0)
    RETURNING id_costos_congreso INTO v_id_costos;

    INSERT INTO costos_congreso (cuenta_deposito, descuento_prepago, descuento_estudiante, costo_congreso_asistente, costo_congreso_ponente, costo_congreso_comite)
    VALUES ('ITESM0987654321', 15.0, 40.0, 600.0, 1200.0, 0.0)
    RETURNING id_costos_congreso INTO v_id_costos_2;

    -- ============================================
    -- 6. FECHAS DEL CONGRESO
    -- ============================================
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
        v_f_inicio, v_f_final,
        v_now - INTERVAL '30 days', v_now - INTERVAL '15 days',
        v_now - INTERVAL '15 days', v_now + INTERVAL '10 days',
        v_now - INTERVAL '45 days', v_now - INTERVAL '40 days',
        v_now - INTERVAL '40 days', v_now - INTERVAL '35 days',
        v_now - INTERVAL '60 days', v_now - INTERVAL '30 days',
        v_now - INTERVAL '25 days', v_now - INTERVAL '10 days',
        v_now - INTERVAL '15 days', v_now + INTERVAL '10 days',
        v_now + INTERVAL '5 days', v_now + INTERVAL '15 days',
        v_now + INTERVAL '20 days', v_now + INTERVAL '30 days'
    ) RETURNING id_fechas_congreso INTO v_id_fechas;

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
        v_f_inicio + INTERVAL '20 days', v_f_final,
        v_now - INTERVAL '20 days', v_now - INTERVAL '10 days',
        v_now - INTERVAL '10 days', v_now + INTERVAL '40 days',
        v_now - INTERVAL '35 days', v_now - INTERVAL '30 days',
        v_now - INTERVAL '30 days', v_now - INTERVAL '25 days',
        v_now - INTERVAL '50 days', v_now - INTERVAL '20 days',
        v_now - INTERVAL '15 days', v_now + INTERVAL '5 days',
        v_now - INTERVAL '5 days', v_now + INTERVAL '20 days',
        v_now + INTERVAL '15 days', v_now + INTERVAL '25 days',
        v_now + INTERVAL '30 days', v_now + INTERVAL '40 days'
    ) RETURNING id_fechas_congreso INTO v_id_fechas_2;

    -- ============================================
    -- 7. CONGRESOS
    -- ============================================
    INSERT INTO congreso (nombre_congreso, id_sede, id_institucion, id_fechas_congreso, id_costos_congreso, firma_organizador, firma_secretaria, firmas_bloqueadas)
    VALUES ('Congreso Nacional de Tecnologías de la Información 2026', v_id_sede, v_id_institucion, v_id_fechas, v_id_costos, 'Dr. Juan Pérez García', 'Dra. María López Rodríguez', false)
    RETURNING id_congreso INTO v_id_congreso;

    INSERT INTO congreso (nombre_congreso, id_sede, id_institucion, id_fechas_congreso, id_costos_congreso, firma_organizador, firma_secretaria, firmas_bloqueadas)
    VALUES ('Foro Internacional de Innovación Tecnológica 2026', v_id_sede_2, v_id_institucion_2, v_id_fechas, v_id_costos, 'Dr. Luis Fernández Sánchez', 'Dra. Carmen García López', false)
    RETURNING id_congreso INTO v_id_congreso_2;

    INSERT INTO congreso (nombre_congreso, id_sede, id_institucion, id_fechas_congreso, id_costos_congreso, firma_organizador, firma_secretaria, firmas_bloqueadas)
    VALUES ('Simposio de Seguridad en Cómputo 2026', v_id_sede_3, v_id_institucion_3, v_id_fechas_2, v_id_costos_2, 'Ing. Pablo Rojas Martínez', 'Lic. Sofía Hernández García', false)
    RETURNING id_congreso INTO v_id_congreso_3;

    -- ============================================
    -- 8. TIPOS DE TRABAJO
    -- ============================================
    INSERT INTO tipo_trabajo (id_congreso, tipo_trabajo) VALUES (v_id_congreso, 'Ponencia') RETURNING id_tipo_trabajo INTO v_id_tipo_ponencia;
    INSERT INTO tipo_trabajo (id_congreso, tipo_trabajo) VALUES (v_id_congreso, 'Taller') RETURNING id_tipo_trabajo INTO v_id_tipo_taller;
    INSERT INTO tipo_trabajo (id_congreso, tipo_trabajo) VALUES (v_id_congreso_2, 'Ponencia') RETURNING id_tipo_trabajo INTO v_id_tipo_ponencia_2;

    -- ============================================
    -- 9. RÚBRICAS DE EVALUACIÓN
    -- ============================================
    INSERT INTO rubrica (id_congreso, tipo_trabajo, nombre, esta_activo)
    VALUES (v_id_congreso, v_id_tipo_ponencia, 'Rúbrica Estándar de Ponencias', true)
    RETURNING id_rubrica INTO v_id_rubrica;

    INSERT INTO rubrica_grupo (id_rubrica, nombre_grupo)
    VALUES (v_id_rubrica, 'Contenido y Originalidad')
    RETURNING id_grupo INTO v_id_rubrica_grupo;

    INSERT INTO rubrica_criterio (id_grupo, descripcion, peso)
    VALUES (v_id_rubrica_grupo, 'Claridad y organización del trabajo', 1.0)
    RETURNING id_criterio INTO v_id_rubrica_criterio;

    INSERT INTO rubrica_criterio (id_grupo, descripcion, peso)
    VALUES (v_id_rubrica_grupo, 'Novedad y aporte científico', 1.0);

    INSERT INTO rubrica_criterio (id_grupo, descripcion, peso)
    VALUES (v_id_rubrica_grupo, 'Calidad de la investigación', 1.0);

    -- ============================================
    -- 10. DICTAMEN DE EVALUACIÓN
    -- ============================================
    INSERT INTO dictamen (tipo_trabajo, nombre, esta_activo)
    VALUES (v_id_tipo_ponencia, 'Dictamen de Resumen de Ponencia', true)
    RETURNING id_dictamen INTO v_id_dictamen;

    INSERT INTO dictamen_pregunta (id_dictamen, descripcion)
    VALUES (v_id_dictamen, '¿El resumen describe claramente el propósito del trabajo?')
    RETURNING id_pregunta INTO v_id_dictamen_pregunta;

    INSERT INTO dictamen_pregunta (id_dictamen, descripcion)
    VALUES (v_id_dictamen, '¿La metodología propuesta es adecuada?');

    INSERT INTO dictamen_pregunta (id_dictamen, descripcion)
    VALUES (v_id_dictamen, '¿Los resultados anticipados son relevantes para el congreso?');

    -- ============================================
    -- 9. MESAS DE TRABAJO
    -- ============================================
    INSERT INTO mesas_trabajo (nombre, id_subarea, cupos_maximos, id_sede)
    VALUES ('Mesa 1: Avances en Inteligencia Artificial', v_id_subarea_ia, 50, v_id_sede)
    RETURNING id_mesas_trabajo INTO v_id_mesas_trabajo;

    INSERT INTO mesas_trabajo (nombre, id_subarea, cupos_maximos, id_sede)
    VALUES ('Mesa 2: Aplicaciones de Machine Learning', v_id_subarea_ml, 45, v_id_sede)
    RETURNING id_mesas_trabajo INTO v_id_mesas_trabajo_2;

    INSERT INTO mesas_trabajo (nombre, id_subarea, cupos_maximos, id_sede)
    VALUES ('Mesa 3: Seguridad en Sistemas', v_id_subarea_seguridad, 40, v_id_sede_2)
    RETURNING id_mesas_trabajo INTO v_id_mesas_trabajo_3;

    -- ============================================
    -- 12. EVENTOS
    -- ============================================
    INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
    VALUES (v_id_congreso, 'Sesión de Ponencias: Machine Learning Aplicado', 'ponencia', v_id_tipo_ponencia, v_id_mesas_trabajo, v_f_inicio, v_f_inicio + INTERVAL '4 hours', 'Presentación de trabajos recientes en aplicaciones prácticas de ML.', 50, NULL)
    RETURNING id_evento INTO v_id_evento;

    INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
    VALUES (v_id_congreso, 'Taller: Introducción a Redes Neuronales', 'taller', v_id_tipo_taller, v_id_mesas_trabajo_2, v_f_inicio + INTERVAL '1 day', v_f_inicio + INTERVAL '1 day 3 hours', 'Taller práctico sobre redes neuronales modernas', 35, 'https://zoom.us/j/12345678')
    RETURNING id_evento INTO v_id_evento_2;

    -- Eventos adicionales (6 nuevos eventos)
    INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
    VALUES (v_id_congreso, 'Conferencia: Seguridad en IA', 'ponencia'::tipo_evento_enum, v_id_tipo_ponencia, v_id_mesas_trabajo_3, v_f_inicio + INTERVAL '9 hours', v_f_inicio + INTERVAL '11 hours', 'Evento de prueba', 50, NULL)
    RETURNING id_evento INTO v_id_evento_3;

    INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
    VALUES (v_id_congreso, 'Panel: Ética en tecnología', 'ponencia'::tipo_evento_enum, v_id_tipo_ponencia, v_id_mesas_trabajo, v_f_inicio + INTERVAL '13 hours', v_f_inicio + INTERVAL '14 hours', 'Evento de prueba', 50, NULL)
    RETURNING id_evento INTO v_id_evento_4;

    INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
    VALUES (v_id_congreso, 'Taller: Python avanzado', 'taller'::tipo_evento_enum, v_id_tipo_taller, v_id_mesas_trabajo_2, v_f_inicio + INTERVAL '1 day 9 hours', v_f_inicio + INTERVAL '1 day 12 hours', 'Evento de prueba', 50, NULL)
    RETURNING id_evento INTO v_id_evento_5;

    INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
    VALUES (v_id_congreso_2, 'Seminario: Cloud Computing', 'ponencia'::tipo_evento_enum, v_id_tipo_ponencia_2, v_id_mesas_trabajo_2, v_f_inicio + INTERVAL '1 day 14 hours', v_f_inicio + INTERVAL '1 day 15 hours', 'Evento de prueba', 50, NULL)
    RETURNING id_evento INTO v_id_evento_6;

    INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
    VALUES (v_id_congreso, 'Demo: IoT en práctica', 'taller'::tipo_evento_enum, v_id_tipo_taller, v_id_mesas_trabajo, v_f_inicio + INTERVAL '2 days 10 hours', v_f_inicio + INTERVAL '2 days 13 hours', 'Evento de prueba', 50, NULL)
    RETURNING id_evento INTO v_id_evento_7;

    INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
    VALUES (v_id_congreso_2, 'Charla: Blockchain', 'ponencia'::tipo_evento_enum, v_id_tipo_ponencia_2, v_id_mesas_trabajo_3, v_f_inicio + INTERVAL '2 days 15 hours', v_f_inicio + INTERVAL '2 days 16 hours', 'Evento de prueba', 50, NULL)
    RETURNING id_evento INTO v_id_evento_8;

    -- ============================================
    -- 13. PERSONAS Y ROLES
    -- ============================================
    -- Admin
    INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, genero, pais, is_superuser, is_staff, is_active)
    VALUES ('Administrador', 'Sistema', 'BUAP', 'admin@congreso.com', 'pbkdf2_sha256$1200000$zeTKPSA0TAyymKCpW7c50d$Ewxmr4iaAO2U/5nlrHFJ509a6coDskJYne3kqhKymgA=', 'ADMIN0000000000000', '2220000000', 'M', 'México', true, true, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id_persona INTO v_id_persona;

    -- Evaluadores
    INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, genero, pais, is_superuser, is_staff, is_active)
    VALUES ('Carlos', 'Evaluador', 'García', 'evaluador1@congreso.com', 'pbkdf2_sha256$1200000$3gUODcjT4Jqh8i5Zctoqj1$UiRM2X/3TbzArwVJbGjW3eTXsQkB9juQzxak3zqAlsQ=', 'EVAL00000000000001', '2220000001', 'M', 'México', false, false, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id_persona INTO v_id_persona;

    IF v_id_persona IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM evaluador WHERE id_persona = v_id_persona) THEN
            INSERT INTO evaluador (id_persona) VALUES (v_id_persona);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM evaluador_congreso WHERE id_persona = v_id_persona AND id_congreso = v_id_congreso) THEN
            INSERT INTO evaluador_congreso (id_persona, id_congreso) VALUES (v_id_persona, v_id_congreso);
        END IF;
    END IF;

    INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, genero, pais, is_superuser, is_staff, is_active)
    VALUES ('Sofía', 'Evaluadora', 'Martínez', 'evaluador2@congreso.com', 'pbkdf2_sha256$1200000$abc123def456ghi789jk0$evaluation2hash1234567890abcdefghij', 'EVAL00000000000002', '2220000011', 'F', 'México', false, false, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id_persona INTO v_id_persona_temp;

    IF v_id_persona_temp IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM evaluador WHERE id_persona = v_id_persona_temp) THEN
            INSERT INTO evaluador (id_persona) VALUES (v_id_persona_temp);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM evaluador_congreso WHERE id_persona = v_id_persona_temp AND id_congreso = v_id_congreso) THEN
            INSERT INTO evaluador_congreso (id_persona, id_congreso) VALUES (v_id_persona_temp, v_id_congreso);
        END IF;
    END IF;

    -- Dictaminadores
    INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, genero, pais, is_superuser, is_staff, is_active)
    VALUES ('Laura', 'Dictaminadora', 'Rodríguez', 'dictaminador1@congreso.com', 'pbkdf2_sha256$1200000$XB3HCGOBph5Cs2NNpX8GhE$XdwIlti4t7B7HmlFO0fIrHXt7QDH4DrTctjDw1odPDo=', 'DICT00000000000001', '2220000002', 'F', 'México', false, false, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id_persona INTO v_id_persona;

    IF v_id_persona IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM dictaminador WHERE id_persona = v_id_persona) THEN
            INSERT INTO dictaminador (id_persona) VALUES (v_id_persona);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM dictaminador_congreso WHERE id_persona = v_id_persona AND id_congreso = v_id_congreso) THEN
            INSERT INTO dictaminador_congreso (id_persona, id_congreso) VALUES (v_id_persona, v_id_congreso);
        END IF;
    END IF;

    INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, genero, pais, is_superuser, is_staff, is_active)
    VALUES ('Roberto', 'Dictaminador', 'López', 'dictaminador2@congreso.com', 'pbkdf2_sha256$1200000$xyz789uvw012abc345def6$dictaminador2hash123456789abcdefgh', 'DICT00000000000002', '2220000012', 'M', 'México', false, false, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id_persona INTO v_id_persona_temp;

    IF v_id_persona_temp IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM dictaminador WHERE id_persona = v_id_persona_temp) THEN
            INSERT INTO dictaminador (id_persona) VALUES (v_id_persona_temp);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM dictaminador_congreso WHERE id_persona = v_id_persona_temp AND id_congreso = v_id_congreso) THEN
            INSERT INTO dictaminador_congreso (id_persona, id_congreso) VALUES (v_id_persona_temp, v_id_congreso);
        END IF;
    END IF;

    -- Ponentes
    INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, genero, pais, is_superuser, is_staff, is_active)
    VALUES ('Miguel', 'Ponente', 'García', 'ponente1@congreso.com', 'pbkdf2_sha256$1200000$IsfjZjTB8e9d2CRP95ond0$6rBjfz2lsplx1IVbKXfnGZSp4tpGBfQI9ehVq1oJa9k=', 'PONE00000000000001', '2220000003', 'M', 'México', false, false, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id_persona INTO v_id_persona;

    IF v_id_persona IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM ponente WHERE id_persona = v_id_persona) THEN
            INSERT INTO ponente (id_persona) VALUES (v_id_persona) RETURNING id_ponente INTO v_id_ponente;
        END IF;
    END IF;

    INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, genero, pais, is_superuser, is_staff, is_active)
    VALUES ('Patricia', 'Ponente', 'Martínez', 'ponente2@congreso.com', 'pbkdf2_sha256$1200000$qwe456rty789uio012pas3$ponente2hash1234567890abcdefghijkl', 'PONE00000000000002', '2220000013', 'F', 'México', false, false, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id_persona INTO v_id_persona_temp;

    IF v_id_persona_temp IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM ponente WHERE id_persona = v_id_persona_temp) THEN
            INSERT INTO ponente (id_persona) VALUES (v_id_persona_temp);
        END IF;
    END IF;

    -- Asistentes
    INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, genero, pais, is_superuser, is_staff, is_active)
    VALUES ('Ana', 'Asistente', 'López', 'asistente1@congreso.com', 'pbkdf2_sha256$1200000$0bpyzsPAUENRgyyAF0L85d$zjpy9GsuE8C4o1wRx3pUo0FYU192UINr6reAE1sICQg=', 'ASIS00000000000001', '2220000004', 'F', 'México', false, false, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id_persona INTO v_id_persona;

    IF v_id_persona IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM asistente WHERE id_persona = v_id_persona) THEN
            INSERT INTO asistente (id_persona, institucion_procedencia, es_estudiante_validado, email_institucional)
            VALUES (v_id_persona, 'BUAP', true, 'ana.lopez@correo.buap.mx')
            RETURNING id_asistente INTO v_id_asistente;
        END IF;
    END IF;

    INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, genero, pais, is_superuser, is_staff, is_active)
    VALUES ('David', 'Asistente', 'Rodríguez', 'asistente2@congreso.com', 'pbkdf2_sha256$1200000$asd789fgh012jkl345mno6$asistente2hash123456789abcdefghijkl', 'ASIS00000000000002', '2220000014', 'M', 'México', false, false, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id_persona INTO v_id_persona_temp;

    IF v_id_persona_temp IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM asistente WHERE id_persona = v_id_persona_temp) THEN
            INSERT INTO asistente (id_persona, institucion_procedencia, es_estudiante_validado, email_institucional)
            VALUES (v_id_persona_temp, 'UNAM', false, 'david.rodriguez@correo.unam.mx');
        END IF;
    END IF;

    -- ============================================
    -- 14. INSCRIPCIÓN A EVENTOS
    -- ============================================
    IF v_id_asistente IS NOT NULL THEN
        INSERT INTO asistente_evento (id_asistente, id_evento, fecha_inscripcion)
        VALUES (v_id_asistente, v_id_evento, v_now)
        ON CONFLICT DO NOTHING;
    END IF;

    -- ============================================
    -- 15. TRABAJOS (Resúmenes y Extensos)
    -- ============================================
    -- Obtener IDs de evaluador y dictaminador para las referencias
    SELECT id_evaluador INTO v_id_evaluador FROM evaluador LIMIT 1;
    SELECT id_dictaminador INTO v_id_dictaminador FROM dictaminador LIMIT 1;

    -- Crear resúmenes
    INSERT INTO resumen (id_dictaminador, fecha_entrega, revisado, estatus, retroalimentacion)
    VALUES (v_id_dictaminador, v_now - INTERVAL '5 days', true, 'aceptado', 'Excelente trabajo, con pequeñas correcciones.')
    RETURNING id_resumen INTO v_id_resumen;

    INSERT INTO resumen (id_dictaminador, fecha_entrega, revisado, estatus, retroalimentacion)
    VALUES (v_id_dictaminador, v_now - INTERVAL '6 days', true, 'aceptado', 'Muy buen aporte científico.')
    RETURNING id_resumen INTO v_id_resumen_2;

    -- Crear un extenso
    INSERT INTO extenso (titulo, fecha_subida, revisado, version_numero, id_evaluador, id_evaluador_2, ruta_relativa)
    VALUES ('Aplicaciones de Deep Learning en Diagnóstico Médico', v_now - INTERVAL '10 days', true, 1, v_id_evaluador, NULL, '/media/extensos/deep_learning_diagnostico.pdf')
    RETURNING id_extenso INTO v_id_extenso;

    -- Crear más extensos
    INSERT INTO extenso (titulo, fecha_subida, revisado, version_numero, id_evaluador, id_evaluador_2, ruta_relativa)
    VALUES ('Optimización de Redes Neuronales con Técnicas Modernas', v_now - INTERVAL '8 days', true, 2, v_id_evaluador, NULL, '/media/extensos/optimizacion_redes.pdf')
    RETURNING id_extenso INTO v_id_extenso_2;

    INSERT INTO extenso (titulo, fecha_subida, revisado, version_numero, id_evaluador, id_evaluador_2, ruta_relativa)
    VALUES ('Ciberseguridad en Sistemas Distribuidos', v_now - INTERVAL '7 days', true, 1, v_id_evaluador, NULL, '/media/extensos/ciberseguridad_distribuido.pdf')
    RETURNING id_extenso INTO v_id_extenso_3;

    -- ============================================
    -- 16. PONENCIAS
    -- ============================================
    INSERT INTO ponencia (id_evento, tipo_participacion, id_subarea, id_resumen, id_extenso, id_multimedia)
    VALUES (v_id_evento, 'presencial', v_id_subarea_ml, v_id_resumen, v_id_extenso, v_id_multimedia)
    RETURNING id_ponencia INTO v_id_ponencia;

    -- Relación ponente-ponencia
    INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
    VALUES (v_id_ponente, v_id_ponencia, true)
    ON CONFLICT DO NOTHING;

    -- Metadatos de la ponencia
    INSERT INTO ponencia_meta (id_ponencia, id_congreso, id_tipo_trabajo, enlace_multimedia)
    VALUES (v_id_ponencia, v_id_congreso, v_id_tipo_ponencia, 'https://youtube.com/watch?v=example')
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- 17. EVALUACIONES
    -- ============================================
    INSERT INTO evaluacion (id_extenso, id_evaluador, retroalimentacion_general, estatus, fecha_de_revision)
    VALUES (v_id_extenso, v_id_evaluador, 'Trabajo de alta calidad con metodología sólida.', 'aceptado', v_now - INTERVAL '3 days')
    RETURNING id_evaluacion INTO v_id_evaluacion;

    -- Criterios de evaluación específicos
    INSERT INTO evaluacion_criterio (id_evaluacion, id_criterio, puntaje, comentario_especifico)
    VALUES (v_id_evaluacion, v_id_rubrica_criterio, 5, 'Excelente organización y presentación del contenido.');

    -- ============================================
    -- 18. TALLERES
    -- ============================================
    INSERT INTO taller (tallerista, id_evento, tipo_participacion, id_subarea, id_multimedia)
    VALUES ('Dr. Fernando Gutiérrez Flores', v_id_evento_2, 'presencial', v_id_subarea_ia, v_id_multimedia);

    -- ============================================
    -- 19. LIBROS Y PONENCIAS MAGISTRALES
    -- ============================================
    INSERT INTO libros (titulo, descripcion, fecha_publicacion, id_congreso)
    VALUES ('Avances en Inteligencia Artificial 2026', 'Compilación de las mejores ponencias del congreso', NOW()::DATE, v_id_congreso)
    RETURNING id_libro INTO v_id_libro;

    -- Relación libro-ponencia
    INSERT INTO libro_has_ponencia (id_libro, id_ponencia)
    VALUES (v_id_libro, v_id_ponencia)
    ON CONFLICT DO NOTHING;

    -- Ponencia magistral
    INSERT INTO ponencia_magistral (titulo, tipo_participacion, id_subarea, fecha_inicio, fecha_fin, id_congreso, id_multimedia)
    VALUES ('El Futuro de la IA: Perspectivas y Desafíos', 'presencial', v_id_subarea_ia, v_f_inicio, v_f_inicio + INTERVAL '2 hours', v_id_congreso, v_id_multimedia)
    RETURNING id_ponencia_magistral INTO v_id_ponencia_magistral;

    INSERT INTO ponencia_magistral_has_ponente_magistral (nombre_persona, id_ponencia_magistral, es_principal)
    VALUES ('Dr. Juan Manuel García Ruiz', v_id_ponencia_magistral, true);

    INSERT INTO ponencia_magistral_has_ponente_magistral (nombre_persona, id_ponencia_magistral, es_principal)
    VALUES ('Dra. María Isabel Flores López', v_id_ponencia_magistral, false);

    -- ============================================
    -- 20. HISTORIAL DE ACCIONES
    -- ============================================
    INSERT INTO historial_acciones (id_persona, rol, fecha_accion, accion)
    SELECT id_persona, 'asistente'::rol_enum, v_now, 'iniciar sesion'::accion_enum FROM persona WHERE correo_electronico = 'asistente1@congreso.com';

    INSERT INTO historial_acciones (id_persona, rol, fecha_accion, accion)
    SELECT id_persona, 'ponente'::rol_enum, v_now - INTERVAL '5 days', 'solicitar ponencia'::accion_enum FROM persona WHERE correo_electronico = 'ponente1@congreso.com';

    -- ============================================
    -- 21. CONSTANCIAS
    -- ============================================
    INSERT INTO constancia (id_persona, id_congreso, tipo_constancia, estatus, fecha_emision)
    SELECT id_persona, v_id_congreso, 'Asistente', 'generada', v_now FROM persona WHERE correo_electronico = 'asistente1@congreso.com';

    RAISE NOTICE '¡Base de datos poblada completamente con éxito!';
END $$;
