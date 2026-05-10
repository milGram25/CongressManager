-- =============================================================================
-- script_datos_completo.sql
-- Poblado integral de datos de prueba para CongressManager
-- Combina: script_datos_prueba.sql + script_datos_extra.sql
-- Seguro para re-ejecutar (usa IF NOT EXISTS / ON CONFLICT donde aplica)
-- =============================================================================

BEGIN;

-- =============================================================================
-- BLOQUE 1: Datos base (instituciones, sedes, áreas, congresos, personas, etc.)
-- =============================================================================
DO $$
DECLARE
    -- IDs base
v_id_institucion_1 INT;
    v_id_institucion_2 INT;
    v_id_sede_1 INT;
    v_id_sede_2 INT;
    v_id_area_cs INT;
    v_id_area_ing INT;
    v_id_sub_ia INT;
    v_id_sub_ds INT;
    v_id_sub_sw INT;
    v_id_sub_robotica INT;

    v_id_costos_1 INT;
    v_id_costos_2 INT;
    v_id_fechas_1 INT;
    v_id_fechas_2 INT;
    v_id_congreso_1 INT;
    v_id_congreso_2 INT;

    v_id_tipo_ponencia_1 INT;
    v_id_tipo_taller_1 INT;
    v_id_tipo_ponencia_2 INT;
    v_id_tipo_taller_2 INT;

    v_id_mesa_1 INT;
    v_id_mesa_2 INT;
    v_id_mesa_3 INT;

    -- Usuarios / roles
    v_id_persona_admin INT;
    v_id_persona_ponente_1 INT;
    v_id_persona_ponente_2 INT;
    v_id_persona_asistente_1 INT;
    v_id_persona_asistente_2 INT;
    v_id_persona_dict_1 INT;
    v_id_persona_eval_1 INT;

    v_id_ponente_1 INT;
    v_id_ponente_2 INT;
    v_id_asistente_1 INT;
    v_id_asistente_2 INT;
    v_id_dict_1 INT;
    v_id_eval_1 INT;

    -- Académico
    v_id_evento_p_1 INT;
    v_id_evento_p_2 INT;
    v_id_evento_t_1 INT;
    v_id_evento_t_2 INT;
    v_id_evento_p_3 INT;

    v_id_resumen_1 INT;
    v_id_resumen_2 INT;
    v_id_resumen_3 INT;

    v_id_extenso_1 INT;
    v_id_extenso_2 INT;
    v_id_extenso_3 INT;

    v_id_ponencia_1 INT;
    v_id_ponencia_2 INT;
    v_id_ponencia_3 INT;

    v_id_taller_1 INT;
    v_id_taller_2 INT;

    -- Rubricas y dictamen
    v_id_rubrica_1 INT;
    v_id_grupo_1 INT;
    v_id_grupo_2 INT;
    v_id_criterio_1 INT;
    v_id_criterio_2 INT;
    v_id_criterio_3 INT;

    v_id_dictamen_tpl INT;
    v_id_pregunta_1 INT;
    v_id_pregunta_2 INT;
    v_id_pregunta_3 INT;

    v_id_dictamen_resumen_1 INT;
    v_id_dictamen_resumen_2 INT;
    v_id_evaluacion_1 INT;
    v_id_evaluacion_2 INT;
    v_id_evaluacion_3 INT;

    -- Libros
    v_id_libro_1 INT;
    v_id_libro_2 INT;

    -- Tiempo
    v_now TIMESTAMP := NOW();
    v_inicio_1 TIMESTAMP := NOW() + INTERVAL '15 days';
    v_fin_1 TIMESTAMP := NOW() + INTERVAL '20 days';
    v_inicio_2 TIMESTAMP := NOW() + INTERVAL '45 days';
    v_fin_2 TIMESTAMP := NOW() + INTERVAL '50 days';
BEGIN
    ---------------------------------------------------------------------------
    -- 1) INSTITUCIONES
    ---------------------------------------------------------------------------
INSERT INTO institucion (nombre, ubicacion, pais)
VALUES ('Benemérita Universidad Autónoma de Puebla', 'Puebla, México', 'México')
    ON CONFLICT DO NOTHING;

INSERT INTO institucion (nombre, ubicacion, pais)
VALUES ('Universidad de Guadalajara', 'Jalisco, México', 'México')
    ON CONFLICT DO NOTHING;

SELECT id_institucion INTO v_id_institucion_1
FROM institucion
WHERE nombre = 'Benemérita Universidad Autónoma de Puebla'
    LIMIT 1;

SELECT id_institucion INTO v_id_institucion_2
FROM institucion
WHERE nombre = 'Universidad de Guadalajara'
    LIMIT 1;

---------------------------------------------------------------------------
-- 2) SEDES
---------------------------------------------------------------------------
INSERT INTO sede (nombre_sede, pais, estado, ciudad, calle, num_exterior, modulo_fisico)
SELECT 'Complejo Cultural Universitario BUAP', 'México', 'Puebla', 'Puebla', 'Vía Atlixcáyotl', 2299, 'Edificio Norte 1'
    WHERE NOT EXISTS (
        SELECT 1 FROM sede WHERE nombre_sede = 'Complejo Cultural Universitario BUAP'
    );

INSERT INTO sede (nombre_sede, pais, estado, ciudad, calle, num_exterior, modulo_fisico)
SELECT 'Centro Universitario de Ciencias Exactas', 'México', 'Jalisco', 'Guadalajara', 'Blvd. Marcelino García Barragán', 1421, 'Torre A'
    WHERE NOT EXISTS (
        SELECT 1 FROM sede WHERE nombre_sede = 'Centro Universitario de Ciencias Exactas'
    );

SELECT id_sede INTO v_id_sede_1 FROM sede WHERE nombre_sede = 'Complejo Cultural Universitario BUAP' LIMIT 1;
SELECT id_sede INTO v_id_sede_2 FROM sede WHERE nombre_sede = 'Centro Universitario de Ciencias Exactas' LIMIT 1;

---------------------------------------------------------------------------
-- 3) ÁREAS Y SUBÁREAS
---------------------------------------------------------------------------
INSERT INTO areas_generales (nombre)
SELECT 'Ciencias de la Computación'
    WHERE NOT EXISTS (SELECT 1 FROM areas_generales WHERE nombre = 'Ciencias de la Computación');

INSERT INTO areas_generales (nombre)
SELECT 'Ingeniería'
    WHERE NOT EXISTS (SELECT 1 FROM areas_generales WHERE nombre = 'Ingeniería');

SELECT id_areas_generales INTO v_id_area_cs FROM areas_generales WHERE nombre = 'Ciencias de la Computación' LIMIT 1;
SELECT id_areas_generales INTO v_id_area_ing FROM areas_generales WHERE nombre = 'Ingeniería' LIMIT 1;

INSERT INTO subareas (nombre, id_area_general)
SELECT 'Inteligencia Artificial', v_id_area_cs
    WHERE NOT EXISTS (SELECT 1 FROM subareas WHERE nombre = 'Inteligencia Artificial' AND id_area_general = v_id_area_cs);

INSERT INTO subareas (nombre, id_area_general)
SELECT 'Ciencia de Datos', v_id_area_cs
    WHERE NOT EXISTS (SELECT 1 FROM subareas WHERE nombre = 'Ciencia de Datos' AND id_area_general = v_id_area_cs);

INSERT INTO subareas (nombre, id_area_general)
SELECT 'Ingeniería de Software', v_id_area_ing
    WHERE NOT EXISTS (SELECT 1 FROM subareas WHERE nombre = 'Ingeniería de Software' AND id_area_general = v_id_area_ing);

INSERT INTO subareas (nombre, id_area_general)
SELECT 'Robótica', v_id_area_ing
    WHERE NOT EXISTS (SELECT 1 FROM subareas WHERE nombre = 'Robótica' AND id_area_general = v_id_area_ing);

SELECT id_subareas INTO v_id_sub_ia FROM subareas WHERE nombre = 'Inteligencia Artificial' LIMIT 1;
SELECT id_subareas INTO v_id_sub_ds FROM subareas WHERE nombre = 'Ciencia de Datos' LIMIT 1;
SELECT id_subareas INTO v_id_sub_sw FROM subareas WHERE nombre = 'Ingeniería de Software' LIMIT 1;
SELECT id_subareas INTO v_id_sub_robotica FROM subareas WHERE nombre = 'Robótica' LIMIT 1;

---------------------------------------------------------------------------
-- 4) COSTOS Y FECHAS
---------------------------------------------------------------------------
INSERT INTO costos_congreso (cuenta_deposito, descuento_prepago, descuento_estudiante, costo_congreso_asistente, costo_congreso_ponente, costo_congreso_comite)
VALUES ('0123456789', 10.0, 50.0, 500.0, 1000.0, 0.0)
    RETURNING id_costos_congreso INTO v_id_costos_1;

INSERT INTO costos_congreso (cuenta_deposito, descuento_prepago, descuento_estudiante, costo_congreso_asistente, costo_congreso_ponente, costo_congreso_comite)
VALUES ('9876543210', 15.0, 40.0, 650.0, 1200.0, 100.0)
    RETURNING id_costos_congreso INTO v_id_costos_2;

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
             v_inicio_1, v_fin_1,
             v_now - INTERVAL '30 days', v_now - INTERVAL '10 days',
             v_now - INTERVAL '9 days', v_now + INTERVAL '10 days',
             v_now - INTERVAL '20 days', v_now + INTERVAL '10 days',
             v_now - INTERVAL '20 days', v_now + INTERVAL '10 days',
             v_now - INTERVAL '25 days', v_now - INTERVAL '5 days',
             v_now - INTERVAL '5 days', v_now + INTERVAL '7 days',
             v_now + INTERVAL '8 days', v_now + INTERVAL '18 days',
             v_now + INTERVAL '19 days', v_now + INTERVAL '25 days',
             v_now + INTERVAL '19 days', v_now + INTERVAL '25 days'
         )
    RETURNING id_fechas_congreso INTO v_id_fechas_1;

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
             v_inicio_2, v_fin_2,
             v_now - INTERVAL '10 days', v_now + INTERVAL '10 days',
             v_now + INTERVAL '11 days', v_now + INTERVAL '30 days',
             v_now - INTERVAL '5 days', v_now + INTERVAL '20 days',
             v_now - INTERVAL '5 days', v_now + INTERVAL '20 days',
             v_now - INTERVAL '8 days', v_now + INTERVAL '5 days',
             v_now + INTERVAL '6 days', v_now + INTERVAL '15 days',
             v_now + INTERVAL '16 days', v_now + INTERVAL '25 days',
             v_now + INTERVAL '26 days', v_now + INTERVAL '35 days',
             v_now + INTERVAL '26 days', v_now + INTERVAL '35 days'
         )
    RETURNING id_fechas_congreso INTO v_id_fechas_2;

---------------------------------------------------------------------------
-- 5) CONGRESOS
---------------------------------------------------------------------------
INSERT INTO congreso (nombre_congreso, id_sede, id_institucion, id_fechas_congreso, id_costos_congreso, firma_organizador, firma_secretaria, firmas_bloqueadas)
SELECT 'Congreso Nacional de Tecnologías de la Información 2026', v_id_sede_1, v_id_institucion_1, v_id_fechas_1, v_id_costos_1, 'Dr. Organizador', 'Mtra. Secretaria', FALSE
    WHERE NOT EXISTS (
        SELECT 1 FROM congreso WHERE nombre_congreso = 'Congreso Nacional de Tecnologías de la Información 2026'
    );

INSERT INTO congreso (nombre_congreso, id_sede, id_institucion, id_fechas_congreso, id_costos_congreso, firma_organizador, firma_secretaria, firmas_bloqueadas)
SELECT 'Congreso Iberoamericano de Ingeniería 2026', v_id_sede_2, v_id_institucion_2, v_id_fechas_2, v_id_costos_2, 'Dr. Ibero', 'Mtra. Ibero', FALSE
    WHERE NOT EXISTS (
        SELECT 1 FROM congreso WHERE nombre_congreso = 'Congreso Iberoamericano de Ingeniería 2026'
    );

SELECT id_congreso INTO v_id_congreso_1 FROM congreso WHERE nombre_congreso = 'Congreso Nacional de Tecnologías de la Información 2026' LIMIT 1;
SELECT id_congreso INTO v_id_congreso_2 FROM congreso WHERE nombre_congreso = 'Congreso Iberoamericano de Ingeniería 2026' LIMIT 1;

---------------------------------------------------------------------------
-- 6) TIPOS DE TRABAJO
---------------------------------------------------------------------------
INSERT INTO tipo_trabajo (id_congreso, tipo_trabajo)
SELECT v_id_congreso_1, 'Ponencia'
    WHERE NOT EXISTS (SELECT 1 FROM tipo_trabajo WHERE id_congreso = v_id_congreso_1 AND lower(tipo_trabajo) = 'ponencia');

INSERT INTO tipo_trabajo (id_congreso, tipo_trabajo)
SELECT v_id_congreso_1, 'Taller'
    WHERE NOT EXISTS (SELECT 1 FROM tipo_trabajo WHERE id_congreso = v_id_congreso_1 AND lower(tipo_trabajo) = 'taller');

INSERT INTO tipo_trabajo (id_congreso, tipo_trabajo)
SELECT v_id_congreso_2, 'Ponencia'
    WHERE NOT EXISTS (SELECT 1 FROM tipo_trabajo WHERE id_congreso = v_id_congreso_2 AND lower(tipo_trabajo) = 'ponencia');

INSERT INTO tipo_trabajo (id_congreso, tipo_trabajo)
SELECT v_id_congreso_2, 'Taller'
    WHERE NOT EXISTS (SELECT 1 FROM tipo_trabajo WHERE id_congreso = v_id_congreso_2 AND lower(tipo_trabajo) = 'taller');

SELECT id_tipo_trabajo INTO v_id_tipo_ponencia_1 FROM tipo_trabajo WHERE id_congreso = v_id_congreso_1 AND lower(tipo_trabajo) = 'ponencia' LIMIT 1;
SELECT id_tipo_trabajo INTO v_id_tipo_taller_1 FROM tipo_trabajo WHERE id_congreso = v_id_congreso_1 AND lower(tipo_trabajo) = 'taller' LIMIT 1;
SELECT id_tipo_trabajo INTO v_id_tipo_ponencia_2 FROM tipo_trabajo WHERE id_congreso = v_id_congreso_2 AND lower(tipo_trabajo) = 'ponencia' LIMIT 1;
SELECT id_tipo_trabajo INTO v_id_tipo_taller_2 FROM tipo_trabajo WHERE id_congreso = v_id_congreso_2 AND lower(tipo_trabajo) = 'taller' LIMIT 1;

---------------------------------------------------------------------------
-- 7) MESAS
---------------------------------------------------------------------------
INSERT INTO mesas_trabajo (nombre, id_subarea, cupos_maximos, id_sede)
SELECT 'Mesa IA Aplicada', v_id_sub_ia, 50, v_id_sede_1
    WHERE NOT EXISTS (SELECT 1 FROM mesas_trabajo WHERE nombre = 'Mesa IA Aplicada');

INSERT INTO mesas_trabajo (nombre, id_subarea, cupos_maximos, id_sede)
SELECT 'Mesa Data Science', v_id_sub_ds, 40, v_id_sede_1
    WHERE NOT EXISTS (SELECT 1 FROM mesas_trabajo WHERE nombre = 'Mesa Data Science');

INSERT INTO mesas_trabajo (nombre, id_subarea, cupos_maximos, id_sede)
SELECT 'Mesa Ingeniería de Software', v_id_sub_sw, 60, v_id_sede_2
    WHERE NOT EXISTS (SELECT 1 FROM mesas_trabajo WHERE nombre = 'Mesa Ingeniería de Software');

SELECT id_mesas_trabajo INTO v_id_mesa_1 FROM mesas_trabajo WHERE nombre = 'Mesa IA Aplicada' LIMIT 1;
SELECT id_mesas_trabajo INTO v_id_mesa_2 FROM mesas_trabajo WHERE nombre = 'Mesa Data Science' LIMIT 1;
SELECT id_mesas_trabajo INTO v_id_mesa_3 FROM mesas_trabajo WHERE nombre = 'Mesa Ingeniería de Software' LIMIT 1;

---------------------------------------------------------------------------
-- 8) PERSONAS Y ROLES (con correos únicos)
-- Nota: hashes de ejemplo tipo Django, válidos como string.
---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.upsert_persona(
        p_nombre VARCHAR,
        p_primer_apellido VARCHAR,
        p_segundo_apellido VARCHAR,
        p_correo VARCHAR,
        p_contrasena VARCHAR,
        p_curp VARCHAR,
        p_num_telefono VARCHAR,
        p_is_superuser BOOLEAN,
        p_is_staff BOOLEAN,
        p_is_active BOOLEAN
    ) RETURNS INT
    LANGUAGE plpgsql
    AS $f$
    DECLARE
v_id INT;
BEGIN
SELECT id_persona INTO v_id
FROM persona
WHERE correo_electronico = p_correo
    LIMIT 1;

IF v_id IS NULL THEN
SELECT id_persona INTO v_id
FROM persona
WHERE (p_num_telefono IS NOT NULL AND num_telefono = p_num_telefono)
   OR (p_curp IS NOT NULL AND curp = p_curp)
    LIMIT 1;
END IF;

        IF v_id IS NOT NULL THEN
UPDATE persona p
SET nombre = p_nombre,
    primer_apellido = p_primer_apellido,
    segundo_apellido = p_segundo_apellido,
    correo_electronico = CASE
                             WHEN EXISTS (
                                 SELECT 1 FROM persona p2
                                 WHERE p2.correo_electronico = p_correo
                                   AND p2.id_persona <> v_id
                             ) THEN p.correo_electronico
                             ELSE p_correo
        END,
    contrasena = p_contrasena,
    curp = CASE
               WHEN p_curp IS NULL THEN NULL
               WHEN EXISTS (
                   SELECT 1 FROM persona p2
                   WHERE p2.curp = p_curp
                     AND p2.id_persona <> v_id
               ) THEN p.curp
               ELSE p_curp
        END,
    num_telefono = CASE
                       WHEN p_num_telefono IS NULL THEN NULL
                       WHEN EXISTS (
                           SELECT 1 FROM persona p2
                           WHERE p2.num_telefono = p_num_telefono
                             AND p2.id_persona <> v_id
                       ) THEN p.num_telefono
                       ELSE p_num_telefono
        END,
    is_superuser = p_is_superuser,
    is_staff = p_is_staff,
    is_active = p_is_active
WHERE p.id_persona = v_id;

RETURN v_id;
END IF;

INSERT INTO persona (
    nombre, primer_apellido, segundo_apellido, correo_electronico,
    contrasena, curp, num_telefono, is_superuser, is_staff, is_active
)
VALUES (
           p_nombre, p_primer_apellido, p_segundo_apellido, p_correo,
           p_contrasena, p_curp, p_num_telefono, p_is_superuser, p_is_staff, p_is_active
       )
    RETURNING id_persona INTO v_id;

RETURN v_id;
END;
    $f$;

SELECT pg_temp.upsert_persona(
               'Administrador', 'Sistema', NULL,
               'admin@congreso.com',
               'pbkdf2_sha256$1200000$demo$hashdemo',
               'ADMIN0000000000000',
               '2220000000',
               TRUE, TRUE, TRUE
       ) INTO v_id_persona_admin;

SELECT pg_temp.upsert_persona(
               'Miguel', 'Ponente', 'Lopez',
               'ponente1@congreso.com',
               'pbkdf2_sha256$1200000$demo$hash1',
               'PONE10000000000000',
               '2220000003',
               FALSE, FALSE, TRUE
       ) INTO v_id_persona_ponente_1;

SELECT pg_temp.upsert_persona(
               'Laura', 'Ponente', 'Garcia',
               'ponente2@congreso.com',
               'pbkdf2_sha256$1200000$demo$hash2',
               'PONE20000000000000',
               '2220000013',
               FALSE, FALSE, TRUE
       ) INTO v_id_persona_ponente_2;

SELECT pg_temp.upsert_persona(
               'Ana', 'Asistente', 'Perez',
               'asistente1@congreso.com',
               'pbkdf2_sha256$1200000$demo$hash3',
               'ASIS10000000000000',
               '2220000004',
               FALSE, FALSE, TRUE
       ) INTO v_id_persona_asistente_1;

SELECT pg_temp.upsert_persona(
               'Diego', 'Asistente', 'Ruiz',
               'asistente2@congreso.com',
               'pbkdf2_sha256$1200000$demo$hash4',
               'ASIS20000000000000',
               '2220000014',
               FALSE, FALSE, TRUE
       ) INTO v_id_persona_asistente_2;

SELECT pg_temp.upsert_persona(
               'Daniela', 'Dictaminadora', 'Soto',
               'dictaminador1@congreso.com',
               'pbkdf2_sha256$1200000$demo$hash5',
               'DICT10000000000000',
               '2220000002',
               FALSE, FALSE, TRUE
       ) INTO v_id_persona_dict_1;

SELECT pg_temp.upsert_persona(
               'Carlos', 'Evaluador', 'Mena',
               'evaluador1@congreso.com',
               'pbkdf2_sha256$1200000$demo$hash6',
               'EVAL10000000000000',
               '2220000001',
               FALSE, FALSE, TRUE
       ) INTO v_id_persona_eval_1;

INSERT INTO ponente (id_persona)
SELECT v_id_persona_ponente_1
    WHERE NOT EXISTS (SELECT 1 FROM ponente WHERE id_persona = v_id_persona_ponente_1);

INSERT INTO ponente (id_persona)
SELECT v_id_persona_ponente_2
    WHERE NOT EXISTS (SELECT 1 FROM ponente WHERE id_persona = v_id_persona_ponente_2);

INSERT INTO asistente (id_persona, institucion_procedencia, es_estudiante_validado, email_institucional)
SELECT v_id_persona_asistente_1, 'UNAM', TRUE, 'ana@alumno.unam.mx'
    WHERE NOT EXISTS (SELECT 1 FROM asistente WHERE id_persona = v_id_persona_asistente_1);

INSERT INTO asistente (id_persona, institucion_procedencia, es_estudiante_validado, email_institucional)
SELECT v_id_persona_asistente_2, 'BUAP', FALSE, NULL
    WHERE NOT EXISTS (SELECT 1 FROM asistente WHERE id_persona = v_id_persona_asistente_2);

INSERT INTO dictaminador (id_persona)
SELECT v_id_persona_dict_1
    WHERE NOT EXISTS (SELECT 1 FROM dictaminador WHERE id_persona = v_id_persona_dict_1);

INSERT INTO evaluador (id_persona)
SELECT v_id_persona_eval_1
    WHERE NOT EXISTS (SELECT 1 FROM evaluador WHERE id_persona = v_id_persona_eval_1);

SELECT id_ponente INTO v_id_ponente_1 FROM ponente WHERE id_persona = v_id_persona_ponente_1 LIMIT 1;
SELECT id_ponente INTO v_id_ponente_2 FROM ponente WHERE id_persona = v_id_persona_ponente_2 LIMIT 1;
SELECT id_asistente INTO v_id_asistente_1 FROM asistente WHERE id_persona = v_id_persona_asistente_1 LIMIT 1;
SELECT id_asistente INTO v_id_asistente_2 FROM asistente WHERE id_persona = v_id_persona_asistente_2 LIMIT 1;
SELECT id_dictaminador INTO v_id_dict_1 FROM dictaminador WHERE id_persona = v_id_persona_dict_1 LIMIT 1;
SELECT id_evaluador INTO v_id_eval_1 FROM evaluador WHERE id_persona = v_id_persona_eval_1 LIMIT 1;

INSERT INTO dictaminador_congreso (id_persona, id_congreso)
SELECT v_id_persona_dict_1, v_id_congreso_1
    WHERE NOT EXISTS (
      SELECT 1 FROM dictaminador_congreso WHERE id_persona = v_id_persona_dict_1 AND id_congreso = v_id_congreso_1
    );

INSERT INTO evaluador_congreso (id_persona, id_congreso)
SELECT v_id_persona_eval_1, v_id_congreso_1
    WHERE NOT EXISTS (
      SELECT 1 FROM evaluador_congreso WHERE id_persona = v_id_persona_eval_1 AND id_congreso = v_id_congreso_1
    );

---------------------------------------------------------------------------
-- 9) RUBRICA + DICTAMEN TEMPLATE
---------------------------------------------------------------------------
INSERT INTO rubrica (id_congreso, tipo_trabajo, nombre, esta_activo)
SELECT v_id_congreso_1, v_id_tipo_ponencia_1, 'Rúbrica de Ponencias CNTI 2026', TRUE
    WHERE NOT EXISTS (SELECT 1 FROM rubrica WHERE nombre = 'Rúbrica de Ponencias CNTI 2026')
    RETURNING id_rubrica INTO v_id_rubrica_1;

IF v_id_rubrica_1 IS NULL THEN
SELECT id_rubrica INTO v_id_rubrica_1 FROM rubrica WHERE nombre = 'Rúbrica de Ponencias CNTI 2026' LIMIT 1;
END IF;

INSERT INTO rubrica_grupo (id_rubrica, nombre_grupo)
SELECT v_id_rubrica_1, 'Contenido'
    WHERE NOT EXISTS (SELECT 1 FROM rubrica_grupo WHERE id_rubrica = v_id_rubrica_1 AND nombre_grupo = 'Contenido')
    RETURNING id_grupo INTO v_id_grupo_1;

IF v_id_grupo_1 IS NULL THEN
SELECT id_grupo INTO v_id_grupo_1 FROM rubrica_grupo WHERE id_rubrica = v_id_rubrica_1 AND nombre_grupo = 'Contenido' LIMIT 1;
END IF;

INSERT INTO rubrica_grupo (id_rubrica, nombre_grupo)
SELECT v_id_rubrica_1, 'Presentación'
    WHERE NOT EXISTS (SELECT 1 FROM rubrica_grupo WHERE id_rubrica = v_id_rubrica_1 AND nombre_grupo = 'Presentación')
    RETURNING id_grupo INTO v_id_grupo_2;

IF v_id_grupo_2 IS NULL THEN
SELECT id_grupo INTO v_id_grupo_2 FROM rubrica_grupo WHERE id_rubrica = v_id_rubrica_1 AND nombre_grupo = 'Presentación' LIMIT 1;
END IF;

INSERT INTO rubrica_criterio (id_grupo, descripcion, peso)
SELECT v_id_grupo_1, 'Originalidad del trabajo', 0.40
    WHERE NOT EXISTS (SELECT 1 FROM rubrica_criterio WHERE id_grupo = v_id_grupo_1 AND descripcion = 'Originalidad del trabajo')
    RETURNING id_criterio INTO v_id_criterio_1;

INSERT INTO rubrica_criterio (id_grupo, descripcion, peso)
SELECT v_id_grupo_1, 'Rigor metodológico', 0.35
    WHERE NOT EXISTS (SELECT 1 FROM rubrica_criterio WHERE id_grupo = v_id_grupo_1 AND descripcion = 'Rigor metodológico')
    RETURNING id_criterio INTO v_id_criterio_2;

INSERT INTO rubrica_criterio (id_grupo, descripcion, peso)
SELECT v_id_grupo_2, 'Claridad de redacción', 0.25
    WHERE NOT EXISTS (SELECT 1 FROM rubrica_criterio WHERE id_grupo = v_id_grupo_2 AND descripcion = 'Claridad de redacción')
    RETURNING id_criterio INTO v_id_criterio_3;

INSERT INTO dictamen (tipo_trabajo, nombre, esta_activo)
SELECT v_id_tipo_ponencia_1, 'Plantilla Dictamen Resumen CNTI', TRUE
    WHERE NOT EXISTS (SELECT 1 FROM dictamen WHERE nombre = 'Plantilla Dictamen Resumen CNTI')
    RETURNING id_dictamen INTO v_id_dictamen_tpl;

IF v_id_dictamen_tpl IS NULL THEN
SELECT id_dictamen INTO v_id_dictamen_tpl FROM dictamen WHERE nombre = 'Plantilla Dictamen Resumen CNTI' LIMIT 1;
END IF;

INSERT INTO dictamen_pregunta (id_dictamen, descripcion)
SELECT v_id_dictamen_tpl, '¿El resumen cumple con la estructura requerida?'
    WHERE NOT EXISTS (SELECT 1 FROM dictamen_pregunta WHERE id_dictamen = v_id_dictamen_tpl AND descripcion = '¿El resumen cumple con la estructura requerida?')
    RETURNING id_pregunta INTO v_id_pregunta_1;

INSERT INTO dictamen_pregunta (id_dictamen, descripcion)
SELECT v_id_dictamen_tpl, '¿La metodología está claramente descrita?'
    WHERE NOT EXISTS (SELECT 1 FROM dictamen_pregunta WHERE id_dictamen = v_id_dictamen_tpl AND descripcion = '¿La metodología está claramente descrita?')
    RETURNING id_pregunta INTO v_id_pregunta_2;

INSERT INTO dictamen_pregunta (id_dictamen, descripcion)
SELECT v_id_dictamen_tpl, '¿Las conclusiones son consistentes con los resultados?'
    WHERE NOT EXISTS (SELECT 1 FROM dictamen_pregunta WHERE id_dictamen = v_id_dictamen_tpl AND descripcion = '¿Las conclusiones son consistentes con los resultados?')
    RETURNING id_pregunta INTO v_id_pregunta_3;

---------------------------------------------------------------------------
-- 10) EVENTOS + RESUMENES + EXTENSOS + PONENCIAS + TALLERES
---------------------------------------------------------------------------
INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
VALUES (v_id_congreso_1, 'Ponencias IA - Sesión 1', 'ponencia', v_id_tipo_ponencia_1, v_id_mesa_1, v_inicio_1 + INTERVAL '2 hours', v_inicio_1 + INTERVAL '4 hours', 'Presentaciones de IA aplicada.', 80, 'https://meet.example.com/ia1')
    RETURNING id_evento INTO v_id_evento_p_1;

INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
VALUES (v_id_congreso_1, 'Ponencias Data Science - Sesión 1', 'ponencia', v_id_tipo_ponencia_1, v_id_mesa_2, v_inicio_1 + INTERVAL '5 hours', v_inicio_1 + INTERVAL '7 hours', 'Presentaciones de ciencia de datos.', 60, 'https://meet.example.com/ds1')
    RETURNING id_evento INTO v_id_evento_p_2;

INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
VALUES (v_id_congreso_1, 'Taller de MLOps', 'taller', v_id_tipo_taller_1, v_id_mesa_1, v_inicio_1 + INTERVAL '8 hours', v_inicio_1 + INTERVAL '10 hours', 'Automatización de pipelines ML.', 35, 'https://meet.example.com/mlops')
    RETURNING id_evento INTO v_id_evento_t_1;

INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
VALUES (v_id_congreso_2, 'Taller de Ingeniería de Software Moderna', 'taller', v_id_tipo_taller_2, v_id_mesa_3, v_inicio_2 + INTERVAL '2 hours', v_inicio_2 + INTERVAL '4 hours', 'Arquitecturas y buenas prácticas.', 45, 'https://meet.example.com/isw')
    RETURNING id_evento INTO v_id_evento_t_2;

INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
VALUES (v_id_congreso_2, 'Ponencias Ingeniería - Sesión 1', 'ponencia', v_id_tipo_ponencia_2, v_id_mesa_3, v_inicio_2 + INTERVAL '5 hours', v_inicio_2 + INTERVAL '7 hours', 'Ponencias de ingeniería.', 70, 'https://meet.example.com/ing1')
    RETURNING id_evento INTO v_id_evento_p_3;

-- Resúmenes
INSERT INTO resumen (id_dictaminador, revisado, estatus, retroalimentacion, fecha_entrega)
VALUES (v_id_dict_1, TRUE, 'aceptado', 'Buen enfoque y objetivos claros.', v_now - INTERVAL '4 days')
    RETURNING id_resumen INTO v_id_resumen_1;

INSERT INTO resumen (id_dictaminador, revisado, estatus, retroalimentacion, fecha_entrega)
VALUES (v_id_dict_1, TRUE, 'aceptado', 'Metodología sólida.', v_now - INTERVAL '3 days')
    RETURNING id_resumen INTO v_id_resumen_2;

INSERT INTO resumen (id_dictaminador, revisado, estatus, retroalimentacion, fecha_entrega)
VALUES (v_id_dict_1, FALSE, NULL, NULL, v_now - INTERVAL '1 days')
    RETURNING id_resumen INTO v_id_resumen_3;

-- Extensos
INSERT INTO extenso (titulo, ruta_relativa, revisado, version_numero, id_evaluador, id_evaluador_2, id_evaluador_3, fecha_subida)
VALUES ('Extenso IA Aplicada', 'extensos/ia_aplicada_v1.pdf', TRUE, 1, v_id_eval_1, NULL, NULL, v_now - INTERVAL '2 days')
    RETURNING id_extenso INTO v_id_extenso_1;

INSERT INTO extenso (titulo, ruta_relativa, revisado, version_numero, id_evaluador, id_evaluador_2, id_evaluador_3, fecha_subida)
VALUES ('Extenso Data Science', 'extensos/ds_v1.pdf', TRUE, 1, v_id_eval_1, NULL, NULL, v_now - INTERVAL '2 days')
    RETURNING id_extenso INTO v_id_extenso_2;

INSERT INTO extenso (titulo, ruta_relativa, revisado, version_numero, id_evaluador, id_evaluador_2, id_evaluador_3, fecha_subida)
VALUES ('Extenso Ingeniería SW', 'extensos/isw_v1.pdf', FALSE, 1, v_id_eval_1, NULL, NULL, v_now - INTERVAL '1 day')
    RETURNING id_extenso INTO v_id_extenso_3;

-- Ponencias
INSERT INTO ponencia (id_evento, tipo_participacion, id_subarea, id_resumen, id_extenso, id_multimedia)
VALUES (v_id_evento_p_1, 'presencial', v_id_sub_ia, v_id_resumen_1, v_id_extenso_1, NULL)
    RETURNING id_ponencia INTO v_id_ponencia_1;

INSERT INTO ponencia (id_evento, tipo_participacion, id_subarea, id_resumen, id_extenso, id_multimedia)
VALUES (v_id_evento_p_2, 'virtual', v_id_sub_ds, v_id_resumen_2, v_id_extenso_2, NULL)
    RETURNING id_ponencia INTO v_id_ponencia_2;

INSERT INTO ponencia (id_evento, tipo_participacion, id_subarea, id_resumen, id_extenso, id_multimedia)
VALUES (v_id_evento_p_3, 'hibrida', v_id_sub_sw, v_id_resumen_3, v_id_extenso_3, NULL)
    RETURNING id_ponencia INTO v_id_ponencia_3;

-- Relación ponente-ponencia
INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
VALUES (v_id_ponente_1, v_id_ponencia_1, TRUE)
    ON CONFLICT (id_ponente, id_ponencia) DO NOTHING;

INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
VALUES (v_id_ponente_1, v_id_ponencia_2, FALSE)
    ON CONFLICT (id_ponente, id_ponencia) DO NOTHING;

INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
VALUES (v_id_ponente_2, v_id_ponencia_3, FALSE)
    ON CONFLICT (id_ponente, id_ponencia) DO NOTHING;

-- Talleres
INSERT INTO taller (tallerista, id_evento, tipo_participacion, id_subarea, id_multimedia)
SELECT 'Mtro. Rafael Torres', v_id_evento_t_1, 'presencial', v_id_sub_ia, NULL
    WHERE NOT EXISTS (SELECT 1 FROM taller WHERE tallerista = 'Mtro. Rafael Torres' AND id_evento = v_id_evento_t_1)
    RETURNING id_taller INTO v_id_taller_1;

IF v_id_taller_1 IS NULL THEN
SELECT id_taller INTO v_id_taller_1 FROM taller WHERE tallerista = 'Mtro. Rafael Torres' AND id_evento = v_id_evento_t_1 LIMIT 1;
END IF;

INSERT INTO taller (tallerista, id_evento, tipo_participacion, id_subarea, id_multimedia)
SELECT 'Dra. Fernanda Luna', v_id_evento_t_2, 'virtual', v_id_sub_sw, NULL
    WHERE NOT EXISTS (SELECT 1 FROM taller WHERE tallerista = 'Dra. Fernanda Luna' AND id_evento = v_id_evento_t_2)
    RETURNING id_taller INTO v_id_taller_2;

IF v_id_taller_2 IS NULL THEN
SELECT id_taller INTO v_id_taller_2 FROM taller WHERE tallerista = 'Dra. Fernanda Luna' AND id_evento = v_id_evento_t_2 LIMIT 1;
END IF;

    -- Asistentes inscritos a eventos
INSERT INTO asistente_evento (id_asistente, id_evento, fecha_inscripcion)
VALUES (v_id_asistente_1, v_id_evento_t_1, v_now - INTERVAL '2 days')
    ON CONFLICT (id_asistente, id_evento) DO NOTHING;

INSERT INTO asistente_evento (id_asistente, id_evento, fecha_inscripcion)
VALUES (v_id_asistente_2, v_id_evento_p_1, v_now - INTERVAL '1 day')
    ON CONFLICT (id_asistente, id_evento) DO NOTHING;

INSERT INTO asistente_evento (id_asistente, id_evento, fecha_inscripcion)
VALUES (v_id_asistente_2, v_id_evento_t_2, v_now - INTERVAL '1 day')
    ON CONFLICT (id_asistente, id_evento) DO NOTHING;

---------------------------------------------------------------------------
-- 11) EVALUACIONES DE RESUMEN Y EXTENSO
---------------------------------------------------------------------------
INSERT INTO dictamen_resumen (id_resumen, id_dictaminador, retroalimentacion_general, estatus, fecha_de_revision)
VALUES (v_id_resumen_1, v_id_dict_1, 'Resumen aceptado con buena justificación.', 'aceptado', v_now - INTERVAL '2 days')
    RETURNING id_dictamen INTO v_id_dictamen_resumen_1;

INSERT INTO dictamen_resumen (id_resumen, id_dictaminador, retroalimentacion_general, estatus, fecha_de_revision)
VALUES (v_id_resumen_2, v_id_dict_1, 'Resumen aceptado; mejorar redacción.', 'aceptado', v_now - INTERVAL '1 day')
    RETURNING id_dictamen INTO v_id_dictamen_resumen_2;

-- Preguntas dictamen para resumen 1
INSERT INTO evaluacion_pregunta (id_dictamen, id_pregunta, cumplio, comentario_especifico)
VALUES (v_id_dictamen_resumen_1, v_id_pregunta_1, TRUE, 'Cumple formato.')
    ON CONFLICT (id_dictamen, id_pregunta) DO NOTHING;

INSERT INTO evaluacion_pregunta (id_dictamen, id_pregunta, cumplio, comentario_especifico)
VALUES (v_id_dictamen_resumen_1, v_id_pregunta_2, TRUE, 'Método claro.')
    ON CONFLICT (id_dictamen, id_pregunta) DO NOTHING;

INSERT INTO evaluacion_pregunta (id_dictamen, id_pregunta, cumplio, comentario_especifico)
VALUES (v_id_dictamen_resumen_1, v_id_pregunta_3, TRUE, 'Conclusiones consistentes.')
    ON CONFLICT (id_dictamen, id_pregunta) DO NOTHING;

-- Evaluaciones de extensos
INSERT INTO evaluacion (id_extenso, id_evaluador, retroalimentacion_general, estatus, fecha_de_revision)
VALUES (v_id_extenso_1, v_id_eval_1, 'Trabajo sólido y bien estructurado.', 'aceptado', v_now - INTERVAL '1 day')
    RETURNING id_evaluacion INTO v_id_evaluacion_1;

INSERT INTO evaluacion (id_extenso, id_evaluador, retroalimentacion_general, estatus, fecha_de_revision)
VALUES (v_id_extenso_2, v_id_eval_1, 'Se acepta con ligeras modificaciones.', 'aceptado con ligeras modificaciones', v_now - INTERVAL '1 day')
    RETURNING id_evaluacion INTO v_id_evaluacion_2;

INSERT INTO evaluacion (id_extenso, id_evaluador, retroalimentacion_general, estatus, fecha_de_revision)
VALUES (v_id_extenso_3, v_id_eval_1, 'Requiere cambios mayores en resultados.', 'aceptado con modificaciones mayores', v_now)
    RETURNING id_evaluacion INTO v_id_evaluacion_3;

-- Criterios de evaluación para extenso 1
IF v_id_criterio_1 IS NULL THEN
SELECT id_criterio INTO v_id_criterio_1 FROM rubrica_criterio WHERE descripcion = 'Originalidad del trabajo' LIMIT 1;
END IF;
    IF v_id_criterio_2 IS NULL THEN
SELECT id_criterio INTO v_id_criterio_2 FROM rubrica_criterio WHERE descripcion = 'Rigor metodológico' LIMIT 1;
END IF;
    IF v_id_criterio_3 IS NULL THEN
SELECT id_criterio INTO v_id_criterio_3 FROM rubrica_criterio WHERE descripcion = 'Claridad de redacción' LIMIT 1;
END IF;

INSERT INTO evaluacion_criterio (id_evaluacion, id_criterio, puntaje, comentario_especifico)
VALUES (v_id_evaluacion_1, v_id_criterio_1, 5, 'Muy original.')
    ON CONFLICT (id_evaluacion, id_criterio) DO NOTHING;

INSERT INTO evaluacion_criterio (id_evaluacion, id_criterio, puntaje, comentario_especifico)
VALUES (v_id_evaluacion_1, v_id_criterio_2, 4, 'Buen método.')
    ON CONFLICT (id_evaluacion, id_criterio) DO NOTHING;

INSERT INTO evaluacion_criterio (id_evaluacion, id_criterio, puntaje, comentario_especifico)
VALUES (v_id_evaluacion_1, v_id_criterio_3, 4, 'Redacción clara.')
    ON CONFLICT (id_evaluacion, id_criterio) DO NOTHING;

---------------------------------------------------------------------------
-- 12) PAGOS + FACTURAS + CONSTANCIAS + HISTORIAL
---------------------------------------------------------------------------
-- pagos de asistentes/ponente en congreso 1
INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura, fecha_pago_realizado)
VALUES (v_id_persona_asistente_1, 250.0, 'inscripcion_asistente', v_id_costos_1, TRUE, v_now - INTERVAL '2 days');

INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura, fecha_pago_realizado)
VALUES (v_id_persona_asistente_2, 500.0, 'inscripcion_asistente', v_id_costos_1, FALSE, v_now - INTERVAL '1 day');

INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura, fecha_pago_realizado)
VALUES (v_id_persona_ponente_1, 1000.0, 'inscripcion_ponente_base', v_id_costos_1, TRUE, v_now - INTERVAL '1 day');

INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura, fecha_pago_realizado)
VALUES (v_id_persona_ponente_1, 1000.0, 'inscripcion_ponente_extra_3', v_id_costos_1, FALSE, v_now);

-- factura
INSERT INTO factura (id_persona, id_congreso, rfc, razon_social, codigo_postal, regimen_fiscal, estatus, fecha_solicitud)
VALUES (v_id_persona_asistente_1, v_id_congreso_1, 'XAXX010101000', 'Ana Perez SA de CV', '72000', 'General de Ley Personas Morales', 'pendiente', v_now - INTERVAL '1 day');

-- constancias
INSERT INTO constancia (id_persona, id_congreso, ruta_constancia, tipo_constancia, estatus, fecha_emision)
VALUES (v_id_persona_asistente_2, v_id_congreso_1, 'constancias/asistente2_cnti.pdf', 'Asistente', 'generada', v_now);

INSERT INTO constancia (id_persona, id_congreso, ruta_constancia, tipo_constancia, estatus, fecha_emision)
VALUES (v_id_persona_ponente_1, v_id_congreso_1, 'constancias/ponente1_cnti.pdf', 'Ponente', 'generada', v_now);

-- historial
INSERT INTO historial_acciones (id_persona, rol, fecha_accion, accion)
VALUES (v_id_persona_admin, 'comite academico', v_now - INTERVAL '3 days', 'crear congreso');

INSERT INTO historial_acciones (id_persona, rol, fecha_accion, accion)
VALUES (v_id_persona_ponente_1, 'ponente', v_now - INTERVAL '2 days', 'solicitar ponencia');

INSERT INTO historial_acciones (id_persona, rol, fecha_accion, accion)
VALUES (v_id_persona_asistente_1, 'asistente', v_now - INTERVAL '2 days', 'realizar pago');

---------------------------------------------------------------------------
-- 13) LIBROS
---------------------------------------------------------------------------
INSERT INTO libros (titulo, descripcion, fecha_publicacion, id_congreso)
SELECT 'Avances en IA 2026', 'Compilación de trabajos destacados de IA.', CURRENT_DATE, v_id_congreso_1
    WHERE NOT EXISTS (SELECT 1 FROM libros WHERE titulo = 'Avances en IA 2026' AND id_congreso = v_id_congreso_1)
    RETURNING id_libro INTO v_id_libro_1;

IF v_id_libro_1 IS NULL THEN
SELECT id_libro INTO v_id_libro_1 FROM libros WHERE titulo = 'Avances en IA 2026' AND id_congreso = v_id_congreso_1 LIMIT 1;
END IF;

INSERT INTO libros (titulo, descripcion, fecha_publicacion, id_congreso)
SELECT 'Memorias de Ingeniería 2026', 'Memorias técnicas del congreso iberoamericano.', CURRENT_DATE, v_id_congreso_2
    WHERE NOT EXISTS (SELECT 1 FROM libros WHERE titulo = 'Memorias de Ingeniería 2026' AND id_congreso = v_id_congreso_2)
    RETURNING id_libro INTO v_id_libro_2;

IF v_id_libro_2 IS NULL THEN
SELECT id_libro INTO v_id_libro_2 FROM libros WHERE titulo = 'Memorias de Ingeniería 2026' AND id_congreso = v_id_congreso_2 LIMIT 1;
END IF;

INSERT INTO libro_has_ponencia (id_libro, id_ponencia)
VALUES (v_id_libro_1, v_id_ponencia_1)
    ON CONFLICT (id_libro, id_ponencia) DO NOTHING;

INSERT INTO libro_has_ponencia (id_libro, id_ponencia)
VALUES (v_id_libro_1, v_id_ponencia_2)
    ON CONFLICT (id_libro, id_ponencia) DO NOTHING;

INSERT INTO libro_has_ponencia (id_libro, id_ponencia)
VALUES (v_id_libro_2, v_id_ponencia_3)
    ON CONFLICT (id_libro, id_ponencia) DO NOTHING;

RAISE NOTICE 'BLOQUE 1: Poblado integral de prueba completado correctamente.';
END $$;


-- =============================================================================
-- BLOQUE 2: Datos extra (personas/ponencias/pagos adicionales para congreso
--           "Congreso Iberoamericano de Ingeniería 2026")
-- =============================================================================
DO $$
DECLARE
v_id_congreso INT;
  v_id_costos INT;
  v_id_subarea INT;
  v_now TIMESTAMP := NOW();

  -- personas extra
  v_persona_pon1 INT;
  v_persona_pon2 INT;
  v_persona_asis1 INT;
  v_persona_dict1 INT;
  v_persona_eval1 INT;

  -- roles extra
  v_id_ponente_pon1 INT;
  v_id_ponente_pon2 INT;
  v_id_asistente_asis1 INT;
  v_id_dictaminador_1 INT;
  v_id_evaluador_1 INT;

  -- eventos/ponencias/extensos/resumenes extra
  v_evento_a INT;
  v_evento_b INT;
  v_resumen_a INT;
  v_resumen_b INT;
  v_extenso_a INT;
  v_extenso_b INT;
  v_ponencia_a INT;
  v_ponencia_b INT;

BEGIN
  -- 1) Elegir congreso objetivo: preferir "Congreso Iberoamericano de Ingeniería 2026"
SELECT id_congreso INTO v_id_congreso
FROM congreso
WHERE nombre_congreso ILIKE 'Congreso Iberoamericano de Ingeniería 2026'
  LIMIT 1;

IF v_id_congreso IS NULL THEN
    -- si no existe, usar el primer congreso disponible
SELECT id_congreso INTO v_id_congreso FROM congreso ORDER BY id_congreso LIMIT 1;
END IF;

  IF v_id_congreso IS NULL THEN
    RAISE NOTICE 'No se encontró ningún congreso en la base de datos. Abortando bloque 2.';
    RETURN;
END IF;

  -- obtener costos asociados al congreso
SELECT id_costos_congreso INTO v_id_costos FROM congreso WHERE id_congreso = v_id_congreso LIMIT 1;

-- obtener una subarea válida (para ponencias)
SELECT id_subareas INTO v_id_subarea FROM subareas LIMIT 1;

---------------------------------------------------------------------
-- 2) Crear personas adicionales (ponentes/asistente/dictaminador/evaluador)
--    Usando ON CONFLICT sobre correo_electronico para idempotencia.
---------------------------------------------------------------------
INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
VALUES ('Pablo', 'Ponente', 'Extra', 'ponente_extra1@congreso.com', 'pbkdf2_sha256$1200000$demo$hash', 'PONEX100000000000', '3330000001', FALSE, FALSE, TRUE)
    ON CONFLICT (correo_electronico) DO NOTHING;

SELECT id_persona INTO v_persona_pon1 FROM persona WHERE correo_electronico = 'ponente_extra1@congreso.com' LIMIT 1;

INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
VALUES ('María', 'Ponente', 'Extra', 'ponente_extra2@congreso.com', 'pbkdf2_sha256$1200000$demo$hash', 'PONEX200000000000', '3330000002', FALSE, FALSE, TRUE)
    ON CONFLICT (correo_electronico) DO NOTHING;

SELECT id_persona INTO v_persona_pon2 FROM persona WHERE correo_electronico = 'ponente_extra2@congreso.com' LIMIT 1;

INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
VALUES ('Luis', 'Asistente', 'Extra', 'asistente_extra1@congreso.com', 'pbkdf2_sha256$1200000$demo$hash', 'ASISX100000000000', '3330000003', FALSE, FALSE, TRUE)
    ON CONFLICT (correo_electronico) DO NOTHING;

SELECT id_persona INTO v_persona_asis1 FROM persona WHERE correo_electronico = 'asistente_extra1@congreso.com' LIMIT 1;

INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
VALUES ('Diana', 'Dictaminador', 'Extra', 'dictaminador_extra1@congreso.com', 'pbkdf2_sha256$1200000$demo$hash', 'DICTEX100000000000', '3330000004', FALSE, FALSE, TRUE)
    ON CONFLICT (correo_electronico) DO NOTHING;

SELECT id_persona INTO v_persona_dict1 FROM persona WHERE correo_electronico = 'dictaminador_extra1@congreso.com' LIMIT 1;

INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
VALUES ('Eduardo', 'Evaluador', 'Extra', 'evaluador_extra1@congreso.com', 'pbkdf2_sha256$1200000$demo$hash', 'EVALEX100000000000', '3330000005', FALSE, FALSE, TRUE)
    ON CONFLICT (correo_electronico) DO NOTHING;

SELECT id_persona INTO v_persona_eval1 FROM persona WHERE correo_electronico = 'evaluador_extra1@congreso.com' LIMIT 1;

-- 3) Insertar roles relacionados si no existen
IF v_persona_pon1 IS NOT NULL THEN
    INSERT INTO ponente (id_persona)
SELECT v_persona_pon1
    WHERE NOT EXISTS (SELECT 1 FROM ponente WHERE id_persona = v_persona_pon1);
SELECT id_ponente INTO v_id_ponente_pon1 FROM ponente WHERE id_persona = v_persona_pon1 LIMIT 1;
END IF;

  IF v_persona_pon2 IS NOT NULL THEN
    INSERT INTO ponente (id_persona)
SELECT v_persona_pon2
    WHERE NOT EXISTS (SELECT 1 FROM ponente WHERE id_persona = v_persona_pon2);
SELECT id_ponente INTO v_id_ponente_pon2 FROM ponente WHERE id_persona = v_persona_pon2 LIMIT 1;
END IF;

  IF v_persona_asis1 IS NOT NULL THEN
    INSERT INTO asistente (id_persona, institucion_procedencia, es_estudiante_validado, email_institucional)
SELECT v_persona_asis1, 'Universidad de Prueba', FALSE, NULL
    WHERE NOT EXISTS (SELECT 1 FROM asistente WHERE id_persona = v_persona_asis1);
SELECT id_asistente INTO v_id_asistente_asis1 FROM asistente WHERE id_persona = v_persona_asis1 LIMIT 1;
END IF;

  IF v_persona_dict1 IS NOT NULL THEN
    INSERT INTO dictaminador (id_persona)
SELECT v_persona_dict1
    WHERE NOT EXISTS (SELECT 1 FROM dictaminador WHERE id_persona = v_persona_dict1);
SELECT id_dictaminador INTO v_id_dictaminador_1 FROM dictaminador WHERE id_persona = v_persona_dict1 LIMIT 1;
END IF;

  IF v_persona_eval1 IS NOT NULL THEN
    INSERT INTO evaluador (id_persona)
SELECT v_persona_eval1
    WHERE NOT EXISTS (SELECT 1 FROM evaluador WHERE id_persona = v_persona_eval1);
SELECT id_evaluador INTO v_id_evaluador_1 FROM evaluador WHERE id_persona = v_persona_eval1 LIMIT 1;
END IF;

  ---------------------------------------------------------------------
  -- 4) Crear dos eventos adicionales para el congreso seleccionado
  ---------------------------------------------------------------------
INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
SELECT v_id_congreso, 'Sesión Extra - Ponencias Aplicadas', 'ponencia',
       (SELECT id_tipo_trabajo FROM tipo_trabajo WHERE id_congreso = v_id_congreso AND lower(tipo_trabajo) = 'ponencia' LIMIT 1),
         NULL, v_now + INTERVAL '7 days', v_now + INTERVAL '7 days' + INTERVAL '2 hours',
         'Sesión adicional de ponencias de prueba.', 50, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM evento WHERE id_congreso = v_id_congreso AND nombre_evento = 'Sesión Extra - Ponencias Aplicadas'
    )
    RETURNING id_evento INTO v_evento_a;

IF v_evento_a IS NULL THEN
SELECT id_evento INTO v_evento_a FROM evento WHERE id_congreso = v_id_congreso AND nombre_evento = 'Sesión Extra - Ponencias Aplicadas' LIMIT 1;
END IF;

INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos, enlace)
SELECT v_id_congreso, 'Sesión Extra - Talleres y Demostraciones', 'taller',
       (SELECT id_tipo_trabajo FROM tipo_trabajo WHERE id_congreso = v_id_congreso AND lower(tipo_trabajo) = 'taller' LIMIT 1),
         NULL, v_now + INTERVAL '8 days', v_now + INTERVAL '8 days' + INTERVAL '3 hours',
         'Taller de demostración para pruebas.', 30, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM evento WHERE id_congreso = v_id_congreso AND nombre_evento = 'Sesión Extra - Talleres y Demostraciones'
    )
    RETURNING id_evento INTO v_evento_b;

IF v_evento_b IS NULL THEN
SELECT id_evento INTO v_evento_b FROM evento WHERE id_congreso = v_id_congreso AND nombre_evento = 'Sesión Extra - Talleres y Demostraciones' LIMIT 1;
END IF;

  ---------------------------------------------------------------------
  -- 5) Insertar resúmenes y extensos adicionales (sin duplicados)
  ---------------------------------------------------------------------
INSERT INTO resumen (id_dictaminador, revisado, estatus, retroalimentacion, fecha_entrega)
SELECT v_id_dictaminador_1, TRUE, 'aceptado', 'Resumen extra de prueba - bien estructurado.', v_now - INTERVAL '1 day'
WHERE v_id_dictaminador_1 IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM resumen
    WHERE id_dictaminador = v_id_dictaminador_1
  AND fecha_entrega::date = (v_now - INTERVAL '1 day')::date
  AND estatus = 'aceptado'
    )
    RETURNING id_resumen INTO v_resumen_a;

IF v_resumen_a IS NULL AND v_id_dictaminador_1 IS NOT NULL THEN
SELECT id_resumen INTO v_resumen_a FROM resumen
WHERE id_dictaminador = v_id_dictaminador_1 AND estatus = 'aceptado'
ORDER BY fecha_entrega DESC LIMIT 1;
END IF;

INSERT INTO resumen (id_dictaminador, revisado, estatus, retroalimentacion, fecha_entrega)
SELECT v_id_dictaminador_1, FALSE, NULL, NULL, v_now
    WHERE v_id_dictaminador_1 IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM resumen
      WHERE id_dictaminador = v_id_dictaminador_1
        AND fecha_entrega::date = v_now::date
        AND revisado = FALSE
    )
  RETURNING id_resumen INTO v_resumen_b;

IF v_resumen_b IS NULL AND v_id_dictaminador_1 IS NOT NULL THEN
SELECT id_resumen INTO v_resumen_b FROM resumen
WHERE id_dictaminador = v_id_dictaminador_1 AND revisado = FALSE
ORDER BY fecha_entrega DESC LIMIT 1;
END IF;

  -- extensos adicionales
INSERT INTO extenso (titulo, ruta_relativa, revisado, version_numero, id_evaluador, id_evaluador_2, id_evaluador_3, fecha_subida)
SELECT 'Extenso Extra - Aplicaciones', 'extensos/ext_extra_aplicaciones.pdf', TRUE, 1, v_id_evaluador_1, NULL, NULL, v_now - INTERVAL '1 day'
WHERE NOT EXISTS (
    SELECT 1 FROM extenso WHERE titulo = 'Extenso Extra - Aplicaciones' AND fecha_subida::date = (v_now - INTERVAL '1 day')::date
    )
    RETURNING id_extenso INTO v_extenso_a;

IF v_extenso_a IS NULL THEN
SELECT id_extenso INTO v_extenso_a FROM extenso WHERE titulo = 'Extenso Extra - Aplicaciones' LIMIT 1;
END IF;

INSERT INTO extenso (titulo, ruta_relativa, revisado, version_numero, id_evaluador, id_evaluador_2, id_evaluador_3, fecha_subida)
SELECT 'Extenso Extra - Ingeniería', 'extensos/ext_extra_ingenieria.pdf', FALSE, 1, v_id_evaluador_1, NULL, NULL, v_now
    WHERE NOT EXISTS (
    SELECT 1 FROM extenso WHERE titulo = 'Extenso Extra - Ingeniería' AND fecha_subida::date = v_now::date
  )
  RETURNING id_extenso INTO v_extenso_b;

IF v_extenso_b IS NULL THEN
SELECT id_extenso INTO v_extenso_b FROM extenso WHERE titulo = 'Extenso Extra - Ingeniería' LIMIT 1;
END IF;

  ---------------------------------------------------------------------
  -- 6) Insertar ponencias adicionales vinculadas a los resúmenes/extensos
  ---------------------------------------------------------------------
INSERT INTO ponencia (id_evento, tipo_participacion, id_subarea, id_resumen, id_extenso, id_multimedia)
SELECT v_evento_a, 'presencial', COALESCE(v_id_subarea, (SELECT id_subareas FROM subareas LIMIT 1)), v_resumen_a, v_extenso_a, NULL
    WHERE NOT EXISTS (
    SELECT 1 FROM ponencia p JOIN evento e ON e.id_evento = p.id_evento
    WHERE p.id_resumen = v_resumen_a AND e.id_congreso = v_id_congreso
  )
  RETURNING id_ponencia INTO v_ponencia_a;

IF v_ponencia_a IS NULL THEN
SELECT id_ponencia INTO v_ponencia_a FROM ponencia WHERE id_resumen = v_resumen_a LIMIT 1;
END IF;

INSERT INTO ponencia (id_evento, tipo_participacion, id_subarea, id_resumen, id_extenso, id_multimedia)
SELECT v_evento_a, 'virtual', COALESCE(v_id_subarea, (SELECT id_subareas FROM subareas LIMIT 1)), v_resumen_b, v_extenso_b, NULL
    WHERE NOT EXISTS (
    SELECT 1 FROM ponencia p JOIN evento e ON e.id_evento = p.id_evento
    WHERE p.id_resumen = v_resumen_b AND e.id_congreso = v_id_congreso
  )
  RETURNING id_ponencia INTO v_ponencia_b;

IF v_ponencia_b IS NULL THEN
SELECT id_ponencia INTO v_ponencia_b FROM ponencia WHERE id_resumen = v_resumen_b LIMIT 1;
END IF;

  -- vincular ponentes a ponencias
  IF v_ponencia_a IS NOT NULL AND v_id_ponente_pon1 IS NOT NULL THEN
    INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
    VALUES (v_id_ponente_pon1, v_ponencia_a, FALSE)
    ON CONFLICT (id_ponente, id_ponencia) DO NOTHING;
END IF;

  IF v_ponencia_b IS NOT NULL AND v_id_ponente_pon2 IS NOT NULL THEN
    INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
    VALUES (v_id_ponente_pon2, v_ponencia_b, FALSE)
    ON CONFLICT (id_ponente, id_ponencia) DO NOTHING;
END IF;

  ---------------------------------------------------------------------
  -- 7) Insertar pagos adicionales asociados al congreso
  ---------------------------------------------------------------------
  IF v_id_costos IS NOT NULL THEN
    -- pago asistente extra
    INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura, fecha_pago_realizado)
SELECT v_persona_asis1, 300.0, 'inscripcion_asistente_extra', v_id_costos, FALSE, v_now - INTERVAL '3 days'
WHERE NOT EXISTS (
    SELECT 1 FROM pagos WHERE id_persona = v_persona_asis1 AND monto = 300.0 AND concepto = 'inscripcion_asistente_extra'
  AND fecha_pago_realizado::date = (v_now - INTERVAL '3 days')::date
    );

-- pago ponente extra 1
INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura, fecha_pago_realizado)
SELECT v_persona_pon1, 1200.0, 'inscripcion_ponente_extra', v_id_costos, TRUE, v_now - INTERVAL '2 days'
WHERE NOT EXISTS (
    SELECT 1 FROM pagos WHERE id_persona = v_persona_pon1 AND monto = 1200.0 AND concepto = 'inscripcion_ponente_extra'
  AND fecha_pago_realizado::date = (v_now - INTERVAL '2 days')::date
    );

-- pago ponente extra 2
INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura, fecha_pago_realizado)
SELECT v_persona_pon2, 1200.0, 'inscripcion_ponente_extra2', v_id_costos, FALSE, v_now - INTERVAL '1 day'
WHERE NOT EXISTS (
    SELECT 1 FROM pagos WHERE id_persona = v_persona_pon2 AND monto = 1200.0 AND concepto = 'inscripcion_ponente_extra2'
  AND fecha_pago_realizado::date = (v_now - INTERVAL '1 day')::date
    );

-- pago por material o adicional
INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura, fecha_pago_realizado)
SELECT v_persona_asis1, 100.0, 'material_congreso', v_id_costos, FALSE, v_now - INTERVAL '1 day'
WHERE NOT EXISTS (
    SELECT 1 FROM pagos WHERE id_persona = v_persona_asis1 AND monto = 100.0 AND concepto = 'material_congreso'
  AND fecha_pago_realizado::date = (v_now - INTERVAL '1 day')::date
    );

-- otro pago reciente
INSERT INTO pagos (id_persona, monto, concepto, id_costos, requiere_factura, fecha_pago_realizado)
SELECT v_persona_pon1, 250.0, 'pago_extra_inscripcion', v_id_costos, FALSE, v_now
    WHERE NOT EXISTS (
      SELECT 1 FROM pagos WHERE id_persona = v_persona_pon1 AND monto = 250.0 AND concepto = 'pago_extra_inscripcion'
        AND fecha_pago_realizado::date = v_now::date
    );
END IF;

  RAISE NOTICE 'BLOQUE 2: Inserción extra de pruebas completada (pagos/ponencias/extensos/resumenes) para congreso id=%', v_id_congreso;
END;
$$;

COMMIT;

-- ---------------------------------------------------------------------------
-- VERIFICACIONES RÁPIDAS (ejecuta estas consultas después)
-- ---------------------------------------------------------------------------
-- SELECT COUNT(*) FROM congreso;
-- SELECT COUNT(*) FROM evento;
-- SELECT COUNT(*) FROM ponencia;
-- SELECT COUNT(*) FROM taller;
-- SELECT COUNT(*) FROM resumen;
-- SELECT COUNT(*) FROM extenso;
-- SELECT COUNT(*) FROM evaluacion;
-- SELECT COUNT(*) FROM pagos;
-- SELECT COUNT(*) FROM libros;
-- SELECT COUNT(*) FROM libro_has_ponencia;