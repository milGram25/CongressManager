-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;
-- Para recargar la base de datos, ejecutar el comando anterior para eliminar todas las tablas y luego ejecutar este script nuevamente.

-- Tipos de datos personalizados
CREATE TYPE tipo_evento_enum AS ENUM ('ponencia', 'taller');
CREATE TYPE estatus_extenso_enum AS ENUM ('aceptado', 'aceptado con ligeras modificaciones', 'aceptado con modificaciones mayores', 'rechazado');
CREATE TYPE estatus_resumen_enum AS ENUM ('aceptado', 'rechazado');
CREATE TYPE tipo_participacion_enum AS ENUM ('presencial', 'virtual', 'hibrida');
CREATE TYPE rol_enum AS ENUM ('asistente', 'tallerista', 'ponente', 'evaluador', 'dictaminador', 'comite academico');
CREATE TYPE accion_enum AS ENUM (
    'crear taller', 'solicitar ponencia', 'revisar extenso', 'crear congreso', 
    'revisar resumen', 'iniciar sesion', 'cerrar sesion', 'realizar pago', 
    'crear area general', 'crear subarea especifica', 'borrar usuario', 'modificar fecha evento'
);

-- Tablas principales
CREATE TABLE institucion (
    id_institucion SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ruta_imagen VARCHAR(255) NOT NULL
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
    correo_electronico VARCHAR(255) UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    num_telefono VARCHAR(20) UNIQUE,
    primer_apellido VARCHAR(255) NOT NULL,
    segundo_apellido VARCHAR(255),
    curp CHAR(18) UNIQUE
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
    fecha_fin_subir_multimedia TIMESTAMP NOT NULL
);

-- Organización del congreso
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
    id_rubrica INTEGER NOT NULL REFERENCES rubricas(id_rubrica)
);

-- Roles específicos
CREATE TABLE tallerista (
    id_tallerista SERIAL PRIMARY KEY,
    id_persona INTEGER REFERENCES persona(id_persona),
    nombre VARCHAR(255), 
    asistio BOOLEAN DEFAULT FALSE
);

CREATE TABLE evaluador (
    id_evaluador SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona)
);

CREATE TABLE dictaminador (
    id_dictaminador SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona)
);

CREATE TABLE ponente (
    id_ponente SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona),
    asistio BOOLEAN DEFAULT FALSE
);

-- Logística del congreso
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
    cupos SMALLINT DEFAULT 0,
    enlace VARCHAR(255)
);

CREATE TABLE asistente (
    id_asistente SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona),
    asistio BOOLEAN DEFAULT FALSE
);

CREATE TABLE asistente_evento (
    id_asistente_evento SERIAL PRIMARY KEY,
    id_asistente INTEGER NOT NULL REFERENCES asistente(id_asistente),
    id_evento INTEGER NOT NULL REFERENCES evento(id_evento)
);

-- Evaluación de ponencias
CREATE TABLE resumen (
    id_resumen SERIAL PRIMARY KEY,
    id_dictaminador INTEGER REFERENCES dictaminador(id_dictaminador),
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_final TIMESTAMP NOT NULL,
    revisado BOOLEAN DEFAULT FALSE,
    estatus estatus_resumen_enum,
    retroalimentacion TEXT
);

CREATE TABLE extenso (
    id_extenso SERIAL PRIMARY KEY,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_final TIMESTAMP NOT NULL,
    revisado BOOLEAN DEFAULT FALSE
);

CREATE TABLE taller (
    id_taller SERIAL PRIMARY KEY,
    id_evento INTEGER REFERENCES evento(id_evento),
    tipo_participacion tipo_participacion_enum,
    id_tallerista INTEGER NOT NULL REFERENCES tallerista(id_tallerista),
    id_subarea INTEGER NOT NULL REFERENCES subareas(id_subareas)
);

CREATE TABLE ponencia (
    id_ponencia SERIAL PRIMARY KEY,
    id_evento INTEGER NOT NULL REFERENCES evento(id_evento),
    tipo_participacion tipo_participacion_enum,
    id_subarea INTEGER NOT NULL REFERENCES subareas(id_subareas),
    id_resumen INTEGER NOT NULL REFERENCES resumen(id_resumen),
    id_extenso INTEGER REFERENCES extenso(id_extenso),
    id_multimedia INTEGER REFERENCES multimedia(id_material)
);

-- Adminsitración de acciones y pagos
CREATE TABLE ponente_has_ponencia (
    id_ponente_has_ponencia SERIAL PRIMARY KEY,
    id_ponente INTEGER NOT NULL REFERENCES ponente(id_ponente),
    id_ponencia INTEGER NOT NULL REFERENCES ponencia(id_ponencia)
);

CREATE TABLE pagos (
    id_pagos SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona),
    monto DOUBLE PRECISION DEFAULT 0,
    descuento DOUBLE PRECISION DEFAULT 0,
    pagado BOOLEAN DEFAULT FALSE,
    fecha_pago_realizado TIMESTAMP,
    limite_fecha_pago TIMESTAMP NOT NULL,
    id_destinatario INTEGER NOT NULL REFERENCES costos_congreso(id_constos_congreso)
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
    ruta_constancia VARCHAR(255) NOT NULL
);

CREATE TABLE factura (
    id_factura SERIAL PRIMARY KEY,
    id_persona INTEGER NOT NULL REFERENCES persona(id_persona),
    ruta_factura VARCHAR(255) NOT NULL
);

-- Rubricas para evaluación de extensos
CREATE TABLE rubrica (
    id_rubrica SERIAL PRIMARY KEY,
    tipo_evento tipo_evento_enum NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    esta_activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rubrica_grupo (
    id_grupo SERIAL PRIMARY KEY,
    id_rubrica INTEGER REFERENCES rubricas(id_rubrica) ON DELETE CASCADE,
    nombre_grupo VARCHAR(255) NOT NULL
);

CREATE TABLE rubrica_criterio (
    id_criterio SERIAL PRIMARY KEY,
    id_grupo INTEGER REFERENCES rubrica_grupos(id_grupo) ON DELETE CASCADE,
    descripcion VARCHAR(255) NOT NULL,
    calificacion NUMERIC(3,2) DEFAULT 1.0
);

CREATE TABLE evaluacion (
    id_evaluacion SERIAL PRIMARY KEY,
    id_extenso INTEGER NOT NULL REFERENCES extenso(id_extenso) ON DELETE CASCADE,
    id_evaluador INTEGER NOT NULL REFERENCES evaluador(id_evaluador),
    retroalimentacion TEXT,
    estatus estatus_extenso_enum NOT NULL,
    fecha_de_revision TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluacion_criterio (
    id_evaluacion_criterio SERIAL PRIMARY KEY,
    id_evaluacion INTEGER REFERENCES evaluaciones(id_evaluacion) ON DELETE CASCADE,
    id_criterio INTEGER REFERENCES rubrica_criterio(id_criterio),
    puntaje INTEGER CHECK (puntaje BETWEEN 1 AND 5),
    comentario TEXT,
    UNIQUE(id_evaluacion, id_criterio)
);