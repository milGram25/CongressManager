-- Básicos, como instituciones, sedes, áreas generales, tipo de trabajo y personas
INSERT INTO institucion (nombre, ruta_imagen) VALUES 
('UNAM - Facultad de Ingeniería', '/assets/logos/unam.png'),
('IPN - ESCOM', '/assets/logos/ipn.png'),
('Tec de Monterrey', '/assets/logos/itesm.png');

INSERT INTO sede (nombre_sede, pais, estado, ciudad, calle, num_exterior, modulo_fisico) VALUES 
('Auditorio Principal', 'México', 'CDMX', 'Coyoacán', 'Circuito Exterior', 0, 'Planta Baja'),
('Sala de Juntas B', 'México', 'Nuevo León', 'Monterrey', 'Av. Eugenio Garza Sada', 2501, 'Piso 3'),
('Plataforma Virtual Zoom', 'Online', 'N/A', 'N/A', 'N/A', 0, 'Link en el evento');

INSERT INTO areas_generales (nombre) VALUES 
('Ciencias de la Computación'), ('Matemáticas Aplicadas'), ('Innovación Educativa');

INSERT INTO tipo_trabajo (tipo_trabajo) VALUES 
('Reflexiones o experiencias'), ('Avance de tesis'), ('Investigación en educación');

INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena, num_telefono, curp) VALUES 
('Alice', 'Smith', 'Jones', 'alice@email.com', 'hash_123', '5512345678', 'SMJA850101HDFRRN01'),
('Bob', 'Garcia', 'Ruiz', 'bob@email.com', 'bob_123', '5587654321', 'GARB900202HDFRRN02'),
('Charlie', 'Vazquez', NULL, 'charlie@email.com', 'hola.412', '5522334455', 'VAXC950303HDFRRN03'),
('Diana', 'Prince', 'Moon', 'diana@email.com', 'dino_21C', '5566778899', 'PRMD880404HDFRRN04'),
('Erik', 'Lensherr', NULL, 'erik@email.com', 'vacas14_', '5599887766', 'LEX820505HDFRRN05');

-- Subáreas y congreso
INSERT INTO subareas (nombre, id_area_general) VALUES 
('Inteligencia Artificial', 1), ('Ciberseguridad', 1),
('Estadística Descriptiva', 2), ('Modelación Matemática', 2);

INSERT INTO costos_congreso (cuenta_deposito, descuento_prepago, costo_congreso_asistente, costo_congreso_ponente) VALUES 
('0123456789 (BBVA)', 20.0, 800.0, 1200.0);

INSERT INTO fechas_congreso (
    fecha_inicio_evento, fecha_final_evento, fecha_inicio_pago_normal, fecha_fin_pago_normal,
    fecha_inicio_inscribir_dictaminador, fecha_fin_inscribir_dictaminador, fecha_inicio_inscribir_evaluador,
    fecha_fin_inscribir_evaluador, fecha_inicio_subida_ponencias, fecha_fin_subida_ponencias,
    fecha_inicio_evaluar_resumenes, fecha_final_evaluar_resumenes, fecha_inicio_evaluar_extensos,
    fecha_fin_evaluar_extensos, fecha_inicio_subir_multimedia, fecha_fin_subir_multimedia
) VALUES (
    '2026-11-10 09:00:00', '2026-11-15 18:00:00', '2026-08-01', '2026-10-30',
    '2026-01-01', '2026-02-01', '2026-01-01', '2026-02-01',
    '2026-03-01', '2026-05-30', '2026-06-01', '2026-07-01',
    '2026-07-15', '2026-09-01', '2026-09-02', '2026-10-15'
);

INSERT INTO congreso (nombre_congreso, id_sede, id_institucion, id_fechas_congreso, id_costos_congreso) VALUES 
('Congreso de Tecnología 2026', 1, 1, 1, 1);

-- Roles y logística de eventos
INSERT INTO ponente (id_persona, asistio) VALUES (1, true), (2, false);
INSERT INTO dictaminador (id_persona) VALUES (1), (3);
INSERT INTO evaluador (id_persona) VALUES (2), (4);
INSERT INTO tallerista (id_persona, nombre, asistio) VALUES (5, 'Erik Lensherr', true);

INSERT INTO mesas_trabajo (nombre, id_subarea, cupos_maximos, id_sede) VALUES 
('Mesa de IA Aplicada', 1, 20, 1),
('Mesa de Ciberseguridad 101', 2, 15, 2);

INSERT INTO evento (id_congreso, nombre_evento, tipo_evento, id_tipo_trabajo, id_mesas_trabajo, fecha_hora_inicio, fecha_hora_final, cupos, enlace) VALUES 
(1, 'Workshop: Python for Data Science', 'taller', 1, 1, '2026-11-11 10:00:00', '2026-11-11 14:00:00', 20, 'zoom.us/j/12345'),
(1, 'Conferencia: Futuro de la IA', 'ponencia', 2, 1, '2026-11-12 09:00:00', '2026-11-12 11:00:00', 50, NULL);

-- Evaluación de ponencias
INSERT INTO resumen (id_dictaminador, fecha_inicio, fecha_final, revisado, estatus, retroalimentacion) VALUES 
(1, '2026-06-01', '2026-06-15', true, 'aceptado', 'Tema muy innovador y bien estructurado.');

INSERT INTO extenso (id_evaluador1, id_evaluador2, fecha_inicio, fecha_final, revisado, estatus, retroalimentacion) VALUES 
(1, NULL, '2026-07-15', '2026-08-15', true, 'aceptado con ligeras modificaciones', 'Revisar la bibliografía.');

INSERT INTO taller (id_evento, tipo_participacion, id_tallerista, id_subarea) VALUES 
(1, 'virtual', 1, 1);

INSERT INTO ponencia (id_evento, tipo_participacion, id_subarea, id_resumen, id_extenso) VALUES 
(2, 'presencial', 1, 1, 1);

