-- Script de población de datos para PostgreSQL
-- Nota: Se asume que las tablas ya existen en el esquema public.

DO $$
DECLARE
    -- Variables para capturar IDs
    v_id_institucion INT;
    v_id_sede INT;
    v_id_area_cs INT;
    v_id_area_ing INT;
    v_id_subarea_ia INT;
    v_id_costos INT;
    v_id_fechas INT;
    v_id_congreso INT;
    v_id_tipo_ponencia INT;
    v_id_mesas_trabajo INT;
    v_id_persona INT;
    
    -- Timestamps
    v_now TIMESTAMP := NOW();
    v_f_inicio TIMESTAMP := NOW() + INTERVAL '60 days';
    v_f_final TIMESTAMP := NOW() + INTERVAL '65 days';
BEGIN
    RAISE NOTICE 'Iniciando población de la base de datos...';

    -- 1. Institución
    INSERT INTO institucion (nombre, ubicacion, pais) 
    VALUES ('Benemérita Universidad Autónoma de Puebla', 'Puebla, México', 'México') 
    RETURNING id_institucion INTO v_id_institucion;

    -- 2. Sede
    INSERT INTO sede (nombre_sede, pais, estado, ciudad, calle, num_exterior, modulo_fisico) 
    VALUES ('Complejo Cultural Universitario BUAP', 'México', 'Puebla', 'Puebla', 'Vía Atlixcáyotl', 2299, 'Edificio Norte 1')
    RETURNING id_sede INTO v_id_sede;

    -- 3. Áreas Generales y Subáreas
    INSERT INTO areas_generales (nombre) VALUES ('Ciencias de la Computación') RETURNING id_areas_generales INTO v_id_area_cs;
    INSERT INTO areas_generales (nombre) VALUES ('Ingeniería') RETURNING id_areas_generales INTO v_id_area_ing;
    
    INSERT INTO subareas (nombre, id_area_general) VALUES ('Inteligencia Artificial', v_id_area_cs) RETURNING id_subareas INTO v_id_subarea_ia;

    -- 4. Costos
    INSERT INTO costos_congreso (cuenta_deposito, descuento_prepago, descuento_estudiante, costo_congreso_asistente, costo_congreso_ponente, costo_congreso_comite) 
    VALUES ('0123456789', 10.0, 50.0, 500.0, 1000.0, 0.0)
    RETURNING id_costos_congreso INTO v_id_costos;

    -- 5. Fechas
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
        v_now, v_now, v_now, v_now,
        v_now, v_now, v_now, v_now,
        v_now, v_now, v_now, v_now,
        v_now, v_now, v_now, v_now,
        v_now, v_now
    ) RETURNING id_fechas_congreso INTO v_id_fechas;

    -- 6. Congreso
    INSERT INTO congreso (nombre_congreso, id_sede, id_institucion, id_fechas_congreso, id_costos_congreso, firma_organizador, firma_secretaria, firmas_bloqueadas)
    VALUES ('Congreso Nacional de Tecnologías de la Información 2026', v_id_sede, v_id_institucion, v_id_fechas, v_id_costos, 'Dr. Organizador', 'Mtra. Secretaria', false)
    RETURNING id_congreso INTO v_id_congreso;

    -- 7. Tipo de Trabajo
    INSERT INTO tipo_trabajo (id_congreso, tipo_trabajo) VALUES (v_id_congreso, 'Ponencia') RETURNING id_tipo_trabajo INTO v_id_tipo_ponencia;

    -- 8. Mesas de Trabajo
    INSERT INTO mesas_trabajo (nombre, id_subarea, cupos_maximos, id_sede) 
    VALUES ('Mesa 1: Avances en Inteligencia Artificial', v_id_subarea_ia, 50, v_id_sede)
    RETURNING id_mesas_trabajo INTO v_id_mesas_trabajo;

    -- 9. Eventos
    INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, sinopsis, cupos)
    VALUES (v_id_congreso, 'Sesión de Ponencias: Machine Learning', 'ponencia', v_id_tipo_ponencia, v_id_mesas_trabajo, v_f_inicio, v_f_final, 'Presentación de trabajos recientes en ML.', 50);

    -- 10. Personas y Roles
    -- Las contraseñas aquí son los hashes generados por Django para que funcionen con check_password()
    
    -- Admin
    INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
    VALUES ('Administrador', 'Sistema', 'admin@congreso.com', 'pbkdf2_sha256$1200000$zeTKPSA0TAyymKCpW7c50d$Ewxmr4iaAO2U/5nlrHFJ509a6coDskJYne3kqhKymgA=', 'ADMIN0000000000000', '2220000000', true, true, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        primer_apellido = EXCLUDED.primer_apellido,
        contrasena = EXCLUDED.contrasena,
        curp = EXCLUDED.curp,
        num_telefono = EXCLUDED.num_telefono,
        is_superuser = EXCLUDED.is_superuser,
        is_staff = EXCLUDED.is_staff,
        is_active = EXCLUDED.is_active
    RETURNING id_persona INTO v_id_persona;

    -- Evaluador
    INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
    VALUES ('Carlos', 'Evaluador', 'evaluador@congreso.com', 'pbkdf2_sha256$1200000$3gUODcjT4Jqh8i5Zctoqj1$UiRM2X/3TbzArwVJbGjW3eTXsQkB9juQzxak3zqAlsQ=', 'EVAL00000000000000', '2220000001', false, false, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        primer_apellido = EXCLUDED.primer_apellido,
        contrasena = EXCLUDED.contrasena,
        curp = EXCLUDED.curp,
        num_telefono = EXCLUDED.num_telefono,
        is_superuser = EXCLUDED.is_superuser,
        is_staff = EXCLUDED.is_staff,
        is_active = EXCLUDED.is_active
    RETURNING id_persona INTO v_id_persona;
    
    IF v_id_persona IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM evaluador WHERE id_persona = v_id_persona) THEN
            INSERT INTO evaluador (id_persona) VALUES (v_id_persona);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM evaluador_congreso WHERE id_persona = v_id_persona AND id_congreso = v_id_congreso) THEN
            INSERT INTO evaluador_congreso (id_persona, id_congreso) VALUES (v_id_persona, v_id_congreso);
        END IF;
    END IF;

    -- Dictaminador
    INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
    VALUES ('Laura', 'Dictaminadora', 'dictaminador@congreso.com', 'pbkdf2_sha256$1200000$XB3HCGOBph5Cs2NNpX8GhE$XdwIlti4t7B7HmlFO0fIrHXt7QDH4DrTctjDw1odPDo=', 'DICT00000000000000', '2220000002', false, false, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        primer_apellido = EXCLUDED.primer_apellido,
        contrasena = EXCLUDED.contrasena,
        curp = EXCLUDED.curp,
        num_telefono = EXCLUDED.num_telefono,
        is_superuser = EXCLUDED.is_superuser,
        is_staff = EXCLUDED.is_staff,
        is_active = EXCLUDED.is_active
    RETURNING id_persona INTO v_id_persona;

    IF v_id_persona IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM dictaminador WHERE id_persona = v_id_persona) THEN
            INSERT INTO dictaminador (id_persona) VALUES (v_id_persona);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM dictaminador_congreso WHERE id_persona = v_id_persona AND id_congreso = v_id_congreso) THEN
            INSERT INTO dictaminador_congreso (id_persona, id_congreso) VALUES (v_id_persona, v_id_congreso);
        END IF;
    END IF;

    -- Ponente
    INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
    VALUES ('Miguel', 'Ponente', 'ponente@congreso.com', 'pbkdf2_sha256$1200000$IsfjZjTB8e9d2CRP95ond0$6rBjfz2lsplx1IVbKXfnGZSp4tpGBfQI9ehVq1oJa9k=', 'PONE00000000000000', '2220000003', false, false, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        primer_apellido = EXCLUDED.primer_apellido,
        contrasena = EXCLUDED.contrasena,
        curp = EXCLUDED.curp,
        num_telefono = EXCLUDED.num_telefono,
        is_superuser = EXCLUDED.is_superuser,
        is_staff = EXCLUDED.is_staff,
        is_active = EXCLUDED.is_active
    RETURNING id_persona INTO v_id_persona;

    IF v_id_persona IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM ponente WHERE id_persona = v_id_persona) THEN
            INSERT INTO ponente (id_persona) VALUES (v_id_persona);
        END IF;
    END IF;

    -- Asistente
    INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, curp, num_telefono, is_superuser, is_staff, is_active)
    VALUES ('Ana', 'Asistente', 'asistente@congreso.com', 'pbkdf2_sha256$1200000$0bpyzsPAUENRgyyAF0L85d$zjpy9GsuE8C4o1wRx3pUo0FYU192UINr6reAE1sICQg=', 'ASIS00000000000000', '2220000004', false, false, true)
    ON CONFLICT (correo_electronico) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        primer_apellido = EXCLUDED.primer_apellido,
        contrasena = EXCLUDED.contrasena,
        curp = EXCLUDED.curp,
        num_telefono = EXCLUDED.num_telefono,
        is_superuser = EXCLUDED.is_superuser,
        is_staff = EXCLUDED.is_staff,
        is_active = EXCLUDED.is_active
    RETURNING id_persona INTO v_id_persona;

    IF v_id_persona IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM asistente WHERE id_persona = v_id_persona) THEN
            INSERT INTO asistente (id_persona, institucion_procedencia) VALUES (v_id_persona, 'UNAM');
        END IF;
    END IF;

    RAISE NOTICE '¡Base de datos poblada exitosamente!';
END $$;
