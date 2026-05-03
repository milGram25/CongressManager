-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;

-- 1. TIPOS DE DATOS PERSONALIZADOS (ENUMS)
CREATE TYPE tipo_evento_enum AS ENUM ('ponencia','ponencia magistral', 'taller');
CREATE TYPE estatus_extenso_enum AS ENUM ('aceptado', 'aceptado con ligeras modificaciones', 'aceptado con modificaciones mayores', 'rechazado');
CREATE TYPE estatus_resumen_enum AS ENUM ('aceptado', 'rechazado');
CREATE TYPE tipo_participacion_enum AS ENUM ('presencial', 'virtual', 'hibrida');
CREATE TYPE rol_enum AS ENUM ('asistente', 'tallerista', 'ponente', 'evaluador', 'dictaminador', 'comite academico');
CREATE TYPE accion_enum AS ENUM (
    'crear taller', 'solicitar ponencia', 'revisar extenso', 'crear congreso', 
    'revisar resumen', 'iniciar sesion', 'cerrar sesion', 'realizar pago', 
    'crear area general', 'crear subarea especifica', 'borrar usuario', 'modificar fecha evento'
);

-- 2. TABLAS DE INFRAESTRUCTURA INDEPENDIENTES
CREATE TABLE institucion (
    id_institucion SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ubicacion VARCHAR(255),
    pais VARCHAR(100) DEFAULT 'México',
    ruta_imagen VARCHAR(255)
);

CREATE TABLE sede (
    id_sede SERIAL PRIMARY KEY,
    nombre_sede VARCHAR(255) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    calle VARCHAR(255) NOT NULL,
    num_exterior INTEGER NOT NULL,
    num_interior INTEGER,
    modulo_fisico VARCHAR(255)
);

CREATE TABLE areas_generales (
    id_areas_generales SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE tipo_trabajo (
    id_tipo_trabajo SERIAL PRIMARY KEY,
    id_congreso INTEGER,
    tipo_trabajo VARCHAR(255) NOT NULL
);

CREATE TABLE multimedia (
    id_material SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ruta_relativa VARCHAR(255) NOT NULL
);

CREATE TABLE persona (
    id_persona SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    primer_apellido VARCHAR(255) NOT NULL,
    segundo_apellido VARCHAR(255),
    correo_electronico VARCHAR(255) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    num_telefono VARCHAR(20) UNIQUE,
    curp CHAR(18) UNIQUE,
    genero VARCHAR(50),
    pais VARCHAR(100),
    discapacidad VARCHAR(255),
    last_login TIMESTAMP,
    is_superuser BOOLEAN DEFAULT FALSE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE costos_congreso (
    id_costos_congreso SERIAL PRIMARY KEY,
    cuenta_deposito VARCHAR(255) NOT NULL,
    descuento_prepago DOUBLE PRECISION DEFAULT 0,
    descuento_estudiante DOUBLE PRECISION DEFAULT 0,
    costo_congreso_asistente DOUBLE PRECISION NOT NULL,
    costo_congreso_ponente DOUBLE PRECISION NOT NULL,
    costo_congreso_comite DOUBLE PRECISION NOT NULL
);

CREATE TABLE fechas_congreso (
    id_fechas_congreso SERIAL PRIMARY KEY,
    fecha_inicio_evento TIMESTAMP NOT NULL,
    fecha_final_evento TIMESTAMP NOT NULL,
    fecha_inicio_prepago TIMESTAMP,
    fecha_fin_prepago TIMESTAMP,
    fecha_inicio_pago_normal TIMESTAMP NOT NULL,
    fecha_fin_pago_normal TIMESTAMP NOT NULL,
    fecha_inicio_inscribir_dictaminador TIMESTAMP NOT NULL,
    fecha_fin_inscribir_dictaminador TIMESTAMP NOT NULL,
    fecha_inicio_inscribir_evaluador TIMESTAMP NOT NULL,
    fecha_fin_inscribir_evaluador TIMESTAMP NOT NULL,
    fecha_inicio_subida_ponencias TIMESTAMP NOT NULL,
    fecha_fin_subida_ponencias TIMESTAMP NOT NULL,
    fecha_inicio_evaluar_resumenes TIMESTAMP NOT NULL,
    fecha_final_evaluar_resumenes TIMESTAMP NOT NULL,
    fecha_inicio_evaluar_extensos TIMESTAMP NOT NULL,
    fecha_fin_evaluar_extensos TIMESTAMP NOT NULL,
    fecha_inicio_subir_multimedia TIMESTAMP NOT NULL,
    fecha_fin_subir_multimedia TIMESTAMP NOT NULL,
    fecha_inicio_subir_extenso_final TIMESTAMP NOT NULL,
    fecha_fin_subir_extenso_final TIMESTAMP NOT NULL
);

-- 3. SISTEMA DE RÚBRICAS (Plantillas de evaluación)
CREATE TABLE rubrica (
    id_rubrica SERIAL PRIMARY KEY,
    id_congreso INTEGER,
    tipo_trabajo INTEGER REFERENCES tipo_trabajo(id_tipo_trabajo),
    nombre VARCHAR(255) NOT NULL,
    esta_activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rubrica_grupo (
    id_grupo SERIAL PRIMARY KEY,
    id_rubrica INTEGER NOT NULL REFERENCES rubrica(id_rubrica) ON DELETE CASCADE,
    nombre_grupo VARCHAR(255) NOT NULL
);

CREATE TABLE rubrica_criterio (
    id_criterio SERIAL PRIMARY KEY,
    id_grupo INTEGER NOT NULL REFERENCES rubrica_grupo(id_grupo) ON DELETE CASCADE,
    descripcion VARCHAR(255) NOT NULL,
    peso NUMERIC(3,2) DEFAULT 1.0 -- Peso relativo del criterio en la evaluación
);

CREATE TABLE dictamen (
    id_dictamen SERIAL PRIMARY KEY,
    tipo_trabajo INTEGER NOT NULL REFERENCES tipo_trabajo(id_tipo_trabajo),
    nombre VARCHAR(255) NOT NULL,
    esta_activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dictamen_pregunta (
    id_pregunta SERIAL PRIMARY KEY,
    id_dictamen INTEGER NOT NULL REFERENCES dictamen(id_dictamen) ON DELETE CASCADE,
    descripcion VARCHAR(255) NOT NULL
);

-- 4. ORGANIZACIÓN DEL CONGRESO
CREATE TABLE subareas (
    id_subareas SERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    id_area_general INTEGER NOT NULL REFERENCES areas_generales(id_areas_generales)
);

CREATE TABLE congreso (
    id_congreso SERIAL PRIMARY KEY,
    nombre_congreso VARCHAR(255) NOT NULL,
    id_sede INTEGER NOT NULL REFERENCES sede(id_sede),
    id_institucion INTEGER NOT NULL REFERENCES institucion(id_institucion),
    id_fechas_congreso INTEGER NOT NULL REFERENCES fechas_congreso(id_fechas_congreso),
    id_costos_congreso INTEGER NOT NULL REFERENCES costos_congreso(id_costos_congreso),
    id_rubrica_default INTEGER REFERENCES rubrica(id_rubrica), -- Rubrica global del congreso
    firma_organizador VARCHAR(255),
    firma_secretaria VARCHAR(255),
    firmas_bloqueadas BOOLEAN DEFAULT FALSE
);

ALTER TABLE tipo_trabajo ADD CONSTRAINT fk_tipo_trabajo_congreso FOREIGN KEY (id_congreso) REFERENCES congreso(id_congreso) ON DELETE CASCADE;
ALTER TABLE rubrica ADD CONSTRAINT fk_rubrica_congreso FOREIGN KEY (id_congreso) REFERENCES congreso(id_congreso) ON DELETE CASCADE;

-- 5. ROLES Y LOGÍSTICA
CREATE TABLE evaluador (
    id_evaluador SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona)
);

CREATE TABLE dictaminador (
    id_dictaminador SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona)
);

CREATE TABLE dictaminador_congreso (
    id_dictaminador_congreso SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona) ON DELETE CASCADE,
    id_congreso INTEGER NOT NULL REFERENCES congreso(id_congreso) ON DELETE CASCADE,
    UNIQUE(id_persona, id_congreso)
);

CREATE TABLE evaluador_congreso (
    id_evaluador_congreso SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona) ON DELETE CASCADE,
    id_congreso INTEGER NOT NULL REFERENCES congreso(id_congreso) ON DELETE CASCADE,
    UNIQUE(id_persona, id_congreso)
);

CREATE TABLE ponente (
    id_ponente SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona)
);

CREATE TABLE asistente (
    id_asistente SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona) ON DELETE CASCADE,
    institucion_procedencia VARCHAR(255)
);

CREATE TABLE mesas_trabajo (
    id_mesas_trabajo SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    id_subarea INTEGER NOT NULL REFERENCES subareas(id_subareas),
    cupos_maximos INTEGER NOT NULL,
    id_sede INTEGER NOT NULL REFERENCES sede(id_sede)
);


CREATE TABLE evento (
    id_evento SERIAL PRIMARY KEY,
    id_congreso INTEGER NOT NULL REFERENCES congreso(id_congreso),
    nombre_evento VARCHAR(255) NOT NULL,
    tipo_evento tipo_evento_enum NOT NULL,
    id_tipo_trabajo INTEGER NOT NULL REFERENCES tipo_trabajo(id_tipo_trabajo),
    id_mesas_trabajo INTEGER REFERENCES mesas_trabajo(id_mesas_trabajo),
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_final TIMESTAMP NOT NULL,
    sinopsis TEXT,
    cupos SMALLINT DEFAULT 0,
    enlace VARCHAR(255)
);

CREATE TABLE asistente_evento (
    id_asistente_evento SERIAL PRIMARY KEY,
    id_asistente INTEGER NOT NULL REFERENCES asistente(id_asistente) ON DELETE CASCADE,
    id_evento INTEGER NOT NULL REFERENCES evento(id_evento) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_asistente, id_evento)
);

-- 6. GESTIÓN DE TRABAJOS (Resúmenes y Extensos)
CREATE TABLE resumen (
    id_resumen SERIAL PRIMARY KEY,
    id_dictaminador INTEGER REFERENCES dictaminador(id_dictaminador),
    fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revisado BOOLEAN DEFAULT FALSE,
    estatus estatus_resumen_enum,
    retroalimentacion TEXT
);

CREATE TABLE extenso (
    id_extenso SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revisado BOOLEAN DEFAULT FALSE,
    version_numero INTEGER DEFAULT 1,
    id_evaluador INTEGER REFERENCES evaluador(id_evaluador),
    id_evaluador_2 INTEGER REFERENCES evaluador(id_evaluador),
    id_evaluador_3 INTEGER REFERENCES evaluador(id_evaluador),
    ruta_relativa VARCHAR(500)
);

CREATE TABLE ponencia (
    id_ponencia SERIAL PRIMARY KEY,
    id_evento INTEGER REFERENCES evento(id_evento),
    tipo_participacion tipo_participacion_enum,
    id_subarea INTEGER NOT NULL REFERENCES subareas(id_subareas),
    id_resumen INTEGER REFERENCES resumen(id_resumen),
    id_extenso INTEGER REFERENCES extenso(id_extenso),
    id_multimedia INTEGER REFERENCES multimedia(id_material)
);

-- Te parece bien asi la tabla de taller?
-- no sé qué opines de poner el tipo de participación en el área de evento ok
CREATE TABLE taller (
    id_taller SERIAL PRIMARY KEY,
    tallerista VARCHAR(255) NOT NULL,
    id_evento INTEGER NOT NULL REFERENCES evento(id_evento),
    tipo_participacion tipo_participacion_enum,
    id_subarea INTEGER NOT NULL REFERENCES subareas(id_subareas),
    id_multimedia INTEGER REFERENCES multimedia(id_material)
);

-- 7. EVALUACIONES (Instancias de revisión)
CREATE TABLE evaluacion (
    id_evaluacion SERIAL PRIMARY KEY,
    id_extenso INTEGER NOT NULL REFERENCES extenso(id_extenso) ON DELETE CASCADE,
    id_evaluador INTEGER NOT NULL REFERENCES evaluador(id_evaluador),
    retroalimentacion_general TEXT,
    estatus estatus_extenso_enum NOT NULL,
    fecha_de_revision TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluacion_criterio (
    id_evaluacion_criterio SERIAL PRIMARY KEY,
    id_evaluacion INTEGER NOT NULL REFERENCES evaluacion(id_evaluacion) ON DELETE CASCADE,
    id_criterio INTEGER NOT NULL REFERENCES rubrica_criterio(id_criterio),
    puntaje INTEGER CHECK (puntaje BETWEEN 1 AND 5),
    comentario_especifico TEXT,
    UNIQUE(id_evaluacion, id_criterio)
);

CREATE TABLE dictamen_resumen (
    id_dictamen SERIAL PRIMARY KEY,
    id_resumen INTEGER NOT NULL REFERENCES resumen(id_resumen) ON DELETE CASCADE,
    id_dictaminador INTEGER NOT NULL REFERENCES dictaminador(id_dictaminador),
    retroalimentacion_general TEXT,
    estatus estatus_resumen_enum NOT NULL,
    fecha_de_revision TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluacion_pregunta (
    id_evaluacion_pregunta SERIAL PRIMARY KEY,
    id_dictamen INTEGER NOT NULL REFERENCES dictamen_resumen(id_dictamen) ON DELETE CASCADE,
    id_pregunta INTEGER NOT NULL REFERENCES dictamen_pregunta(id_pregunta), 
    cumplio BOOLEAN,
    comentario_especifico TEXT,
    UNIQUE(id_dictamen, id_pregunta)
);
-- 8. ADMINISTRACIÓN, PAGOS Y CONTROL
CREATE TABLE ponente_has_ponencia (
    id_ponente_has_ponencia SERIAL PRIMARY KEY,
    id_ponente INTEGER NOT NULL REFERENCES ponente(id_ponente),
    id_ponencia INTEGER NOT NULL REFERENCES ponencia(id_ponencia),
    asistio BOOLEAN DEFAULT FALSE,
    UNIQUE(id_ponente, id_ponencia)
);

CREATE TABLE factura (
    id_factura SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona),
    id_congreso INTEGER REFERENCES congreso(id_congreso),
    rfc VARCHAR(13),
    razon_social VARCHAR(255),
    codigo_postal VARCHAR(10),
    regimen_fiscal VARCHAR(255),
    ruta_pdf_xml VARCHAR(255),
    estatus VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'enviada'
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_envio TIMESTAMP
);

CREATE TABLE pagos (
    id_pagos SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona),
    monto DOUBLE PRECISION DEFAULT 0,
    concepto VARCHAR(255) NOT NULL,
    fecha_pago_realizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_costos INTEGER NOT NULL REFERENCES costos_congreso(id_costos_congreso),
    requiere_factura BOOLEAN DEFAULT FALSE,
    id_factura INTEGER REFERENCES factura(id_factura)
);

CREATE TABLE historial_acciones (
    id_historial_acciones SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona),
    rol rol_enum,
    fecha_accion TIMESTAMP NOT NULL,
    accion accion_enum
);

CREATE TABLE constancia (
    id_constancia SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona),
    id_congreso INTEGER REFERENCES congreso(id_congreso),
    ruta_constancia VARCHAR(255),
    tipo_constancia VARCHAR(50), -- 'Asistente', 'Ponente', etc.
    estatus VARCHAR(20) DEFAULT 'generada', -- 'generada', 'enviada'
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE libros(
    id_libro SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_publicacion DATE NOT NULL,
    id_congreso INTEGER NOT NULL REFERENCES congreso(id_congreso)
);

CREATE TABLE libro_has_ponencia(
    id_libro_has_ponencia SERIAL PRIMARY KEY,
    id_libro INTEGER NOT NULL REFERENCES libros(id_libro),
    id_ponencia INTEGER NOT NULL REFERENCES ponencia(id_ponencia),
    UNIQUE(id_libro, id_ponencia)
);

CREATE TABLE ponencia_magistral(
    id_ponencia_magistral SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tipo_participacion tipo_participacion_enum, 
    id_subarea INTEGER NOT NULL REFERENCES subareas(id_subareas),
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    id_congreso INTEGER REFERENCES congreso(id_congreso),
    id_multimedia INTEGER REFERENCES multimedia(id_material)
);

CREATE TABLE ponencia_magistral_has_ponente_magistral(
    id_ponencia_magistral_has_ponente_magistral SERIAL PRIMARY KEY,
    nombre_persona VARCHAR(100) NOT NULL,
    id_ponencia_magistral INTEGER NOT NULL REFERENCES ponencia_magistral(id_ponencia_magistral)
);

-- =============================================================================
-- DATOS DE PRUEBA — PARTICIPANTES DEL MÓDULO DE CONSTANCIAS
-- =============================================================================
-- Generados con: python manage.py seed_participants
-- Contraseña de todos los usuarios de prueba: Test1234!
--
-- ROLES:
--   Asistentes  → inscritos al congreso vía asistente_evento
--   Dictaminadores / Evaluadores → comité (se incluyen en todos los congresos)
--   Ponentes    → vinculados a ponencias vía ponente_has_ponencia
--
-- REQUISITOS:
--   • Debe existir el congreso con id_congreso = 8  (Encuentro con dios)
--   • Debe existir el evento      con id_evento    = 16 (Diego – ponencia)
--   • Debe existir la ponencia    con id_ponencia  = 6
--   Los registros anteriores son parte del script del backend de congresos.
-- =============================================================================

-- ── Personas de prueba ────────────────────────────────────────────────────────
INSERT INTO persona (id_persona, nombre, primer_apellido, correo_electronico, contrasena, num_telefono, is_active, is_staff, is_superuser)
VALUES
  (16, 'Laura',     'Hernández', 'laura.hernandez@udg.mx',     'pbkdf2_sha256$1200000$3clD78SJJ3vX5H5aqGfJZh$2iRMQIkDJ2p6DiHKqd6pSuy9OqSKJ4qKKT1RYBERE74=', '3311100001', TRUE, FALSE, FALSE),
  (17, 'Carlos',    'Mendoza',   'carlos.mendoza@unam.mx',     'pbkdf2_sha256$1200000$5PJZUt6S8aj7Sb9B7OAw8X$GIWwJgrcoWjasrdjsaHJl4u8Sfd9aCHnfifsh+5HdEM=', '5511100001', TRUE, FALSE, FALSE),
  (18, 'Sofía',     'Ramírez',   'sofia.ramirez@tec.mx',       'pbkdf2_sha256$1200000$6ZDoRi5L1VLkD8EKKrAGPP$xklNSk2AxxXLURUpSAwavcOHMy9ejq10LStqSVzJeJc=', '8111100001', TRUE, FALSE, FALSE),
  (19, 'Miguel',    'Torres',    'miguel.torres@udg.mx',       'pbkdf2_sha256$1200000$DlwCRI8VNyLzlTBDbrM4T1$nbMmgVL6Z1hBchl57QqsSc+vhP9DIYxkFbHT659rO04=', '3311100002', TRUE, FALSE, FALSE),
  (20, 'Valentina', 'Cruz',      'valentina.cruz@uam.mx',      'pbkdf2_sha256$1200000$gk6UHaqPM6wleSPhxGUFo4$+7i/ua7BTnS2uS4frIMPPqKTqCXeU1Qt2NHdCeUyICk=', '5511100002', TRUE, FALSE, FALSE),
  (21, 'Jorge',     'Fuentes',   'jorge.fuentes@udg.mx',       'pbkdf2_sha256$1200000$cF5LkXLIPYtQX16oAjcMxW$mc1JRmkfhVncqveSc9x2VwwfnnnMoVCczfwrmfP0w1E=', '3311100003', TRUE, FALSE, FALSE),
  (22, 'Gabriela',  'Sánchez',   'gabriela.sanchez@unam.mx',   'pbkdf2_sha256$1200000$l92xOBY2vdeUoPbKyBS2vO$A5M/MrLV5JouSU2rX5E9TdxDC7KOVrvvjJazrghgbrU=', '5511100003', TRUE, FALSE, FALSE),
  (23, 'Roberto',   'Pérez',     'roberto.perez@tec.mx',       'pbkdf2_sha256$1200000$8ZE4yZgWLWHWeE1yPvegSe$TdXLi9zv0Cnug0GGGjhGeuyjC4jDA1N5IuoDaTx9mDI=', '8111100002', TRUE, FALSE, FALSE),
  (24, 'Elena',     'Vázquez',   'elena.vazquez@unam.mx',      'pbkdf2_sha256$1200000$tDYSx1BTO1LEKRhcmDi5hW$aksjCcUTzpN5G/4scnpnXJqRdl00XMpTbcI7mt7tq5A=', '5511100004', TRUE, FALSE, FALSE),
  (25, 'Fernando',  'López',     'fernando.lopez@udg.mx',      'pbkdf2_sha256$1200000$icTGpAVAKrbZzUn4yMeq9d$/BtRdLWmENWFGw96XuVFqdRfx4YM/8e2kuMHwddyTdw=', '3311100004', TRUE, FALSE, FALSE),
  (26, 'Patricia',  'Morales',   'patricia.morales@uam.mx',    'pbkdf2_sha256$1200000$BXMRWHAGiU6gM6zt0B1TL7$eXN662Pig3f0Q6/DihDz3p7F7inU4MxY/sONBEuif9Q=', '5511100005', TRUE, FALSE, FALSE),
  (27, 'Alejandro', 'Jiménez',   'alejandro.jimenez@udg.mx',   'pbkdf2_sha256$1200000$s1zQUl64anpZ9gjzYF2NCu$xvxxvfMjCPN/aeXGYpz6LruFmtCE6OGVVVwwbPw1Lj8=', '3311100005', TRUE, FALSE, FALSE),
  (28, 'Claudia',   'García',    'claudia.garcia@tec.mx',      'pbkdf2_sha256$1200000$JTfP2p7FsHCAclT43qfva1$bTNd0gMEqp7g6ze2EBQlHCi42aNyVdReSaNdW4B/klA=', '8111100003', TRUE, FALSE, FALSE),
  (29, 'Ricardo',   'Ortega',    'ricardo.ortega@unam.mx',     'pbkdf2_sha256$1200000$5Ss6JZ2pXoagzFRRKMJHxg$vsnqNri9upKJjSqCmNP3rYNd6qewU9uVazQ8Cd2XCYs=', '5511100006', TRUE, FALSE, FALSE)
ON CONFLICT (id_persona) DO NOTHING;

-- Ajustar secuencia de persona para que no colisione con los registros insertados
SELECT setval('persona_id_persona_seq', (SELECT MAX(id_persona) FROM persona));

-- ── Asistentes ────────────────────────────────────────────────────────────────
INSERT INTO asistente (id_asistente, id_persona, institucion_procedencia)
VALUES
  (3,  16, 'Universidad de Guadalajara'),
  (4,  17, 'UNAM'),
  (5,  18, 'Tec de Monterrey'),
  (6,  19, 'Universidad de Guadalajara'),
  (7,  20, 'UAM Iztapalapa'),
  -- Dictaminadores también son asistentes (institución de procedencia)
  (8,  21, 'Universidad de Guadalajara'),
  (9,  22, 'UNAM'),
  (10, 23, 'Tec de Monterrey'),
  -- Evaluadores también son asistentes
  (11, 24, 'UNAM'),
  (12, 25, 'Universidad de Guadalajara'),
  (13, 26, 'UAM Iztapalapa'),
  -- Ponentes también son asistentes
  (14, 27, 'Universidad de Guadalajara'),
  (15, 28, 'Tec de Monterrey'),
  (16, 29, 'UNAM')
ON CONFLICT (id_asistente) DO NOTHING;

SELECT setval('asistente_id_asistente_seq', (SELECT MAX(id_asistente) FROM asistente));

-- ── Dictaminadores ────────────────────────────────────────────────────────────
INSERT INTO dictaminador (id_dictaminador, id_persona)
VALUES
  (5, 21),  -- Jorge Fuentes
  (6, 22),  -- Gabriela Sánchez
  (7, 23)   -- Roberto Pérez
ON CONFLICT (id_dictaminador) DO NOTHING;

SELECT setval('dictaminador_id_dictaminador_seq', (SELECT MAX(id_dictaminador) FROM dictaminador));

-- ── Evaluadores / Revisores ───────────────────────────────────────────────────
INSERT INTO evaluador (id_evaluador, id_persona)
VALUES
  (5, 24),  -- Elena Vázquez
  (6, 25),  -- Fernando López
  (7, 26)   -- Patricia Morales
ON CONFLICT (id_evaluador) DO NOTHING;

SELECT setval('evaluador_id_evaluador_seq', (SELECT MAX(id_evaluador) FROM evaluador));

-- ── Ponentes ──────────────────────────────────────────────────────────────────
INSERT INTO ponente (id_ponente, id_persona)
VALUES
  (3, 27),  -- Alejandro Jiménez
  (4, 28),  -- Claudia García
  (5, 29)   -- Ricardo Ortega
ON CONFLICT (id_ponente) DO NOTHING;

SELECT setval('ponente_id_ponente_seq', (SELECT MAX(id_ponente) FROM ponente));

-- ── Inscripciones al congreso 8 (asistentes → evento 16) ─────────────────────
-- Asistentes inscritos al evento "Diego" (id_evento=16) del congreso "Encuentro con dios" (id=8)
INSERT INTO asistente_evento (id_asistente, id_evento, fecha_inscripcion)
VALUES
  (3, 16, NOW()),  -- Laura Hernández
  (4, 16, NOW()),  -- Carlos Mendoza
  (5, 16, NOW()),  -- Sofía Ramírez
  (6, 16, NOW()),  -- Miguel Torres
  (7, 16, NOW())   -- Valentina Cruz
ON CONFLICT DO NOTHING;

-- ── Ponentes vinculados a la ponencia 6 (congreso 8, evento 16) ───────────────
INSERT INTO ponente_has_ponencia (id_ponente, id_ponencia, asistio)
VALUES
  (3, 6, FALSE),  -- Alejandro Jiménez
  (4, 6, FALSE),  -- Claudia García
  (5, 6, FALSE)   -- Ricardo Ortega
ON CONFLICT DO NOTHING;

-- ── Facturas pendientes de prueba (congreso 8) ───────────────────────────────
-- 6 facturas con datos fiscales para probar la vista /admin/usuarios/facturas.
-- Equivalente a correr: python manage.py seed_facturas
INSERT INTO factura (id_persona, id_congreso, rfc, razon_social, codigo_postal, regimen_fiscal, estatus)
SELECT p.id_persona, 8, v.rfc, v.razon, v.cp, v.regimen, 'pendiente'
FROM (VALUES
  ('laura.hernandez@udg.mx',   'HERL900101AAA', 'Universidad de Guadalajara', '44100', '601 - General Personas Morales'),
  ('carlos.mendoza@unam.mx',   'MECA850615BBB', 'UNAM',                       '04510', '601 - General Personas Morales'),
  ('sofia.ramirez@tec.mx',     'RASF920320CCC', 'Tec de Monterrey',           '64849', '601 - General Personas Morales'),
  ('jorge.fuentes@udg.mx',     'FUJG780910DDD', 'Universidad de Guadalajara', '44100', '612 - Personas Físicas con Actividades Empresariales'),
  ('alejandro.jimenez@udg.mx', 'JIEA880225EEE', 'Universidad de Guadalajara', '44100', '612 - Personas Físicas con Actividades Empresariales'),
  ('elena.vazquez@unam.mx',    'VAEE910714FFF', 'UNAM',                       '04510', '601 - General Personas Morales')
) AS v(email, rfc, razon, cp, regimen)
JOIN persona p ON p.correo_electronico = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM factura f WHERE f.id_persona = p.id_persona AND f.id_congreso = 8
);

-- =============================================================================
-- INSTRUCCIONES PARA NUEVOS DESARROLLADORES
-- =============================================================================
-- 1. Aplicar este script completo en una BD PostgreSQL vacía:
--       psql -U <usuario> -d <base_de_datos> -f database/congress.sql
--
-- 2. Configurar el .env del backend (backend/.env) con las credenciales de BD.
--
-- 3. Instalar dependencias del backend:
--       cd backend && python -m venv venv && source venv/bin/activate
--       pip install -r requirements.txt
--
-- 4. Correr el servidor Django:
--       python manage.py runserver
--
-- 5. Instalar dependencias del frontend:
--       cd frontend && npm install
--
-- 6. Correr el frontend:
--       npm run dev
--
-- Usuarios de prueba disponibles (contraseña: Test1234!):
--   laura.hernandez@udg.mx   → Asistente    (UDG)  – tiene factura pendiente
--   carlos.mendoza@unam.mx   → Asistente    (UNAM) – tiene factura pendiente
--   sofia.ramirez@tec.mx     → Asistente    (Tec)  – tiene factura pendiente
--   jorge.fuentes@udg.mx     → Dictaminador (UDG)  – tiene factura pendiente
--   gabriela.sanchez@unam.mx → Dictaminador (UNAM)
--   elena.vazquez@unam.mx    → Evaluador    (UNAM) – tiene factura pendiente
--   alejandro.jimenez@udg.mx → Ponente      (UDG)  – tiene factura pendiente
--
-- Comandos de seed disponibles:
--   python manage.py seed_participants  → Crea personas con roles de prueba
--   python manage.py seed_facturas      → Crea facturas pendientes (requiere seed_participants)
-- =============================================================================
