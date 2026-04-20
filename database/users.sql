-- 1. Administrador (Superuser & Staff)
-- Correo: admin@udg.mx
-- Contraseña: admin123
INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, is_superuser, is_staff, is_active)
VALUES 
('Administrador', 'UDG', 'admin@udg.mx', 'pbkdf2_sha256$1200000$zeTKPSA0TAyymKCpW7c50d$Ewxmr4iaAO2U/5nlrHFJ509a6coDskJYne3kqhKymgA=', true, true, true);

-- 2. Asistente
-- Correo: asistente@udg.mx
-- Contraseña: asistente123
INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, is_active)
VALUES ('Asistente', 'UDG', 'asistente@udg.mx', 'pbkdf2_sha256$1200000$0bpyzsPAUENRgyyAF0L85d$zjpy9GsuE8C4o1wRx3pUo0FYU192UINr6reAE1sICQg=', true);

INSERT INTO asistente (id_persona, institucion_procedencia)
SELECT id_persona, 'Universidad de Guadalajara' FROM persona WHERE correo_electronico = 'asistente@udg.mx';


-- 3. Ponente
-- Correo: ponente@udg.mx
-- Contraseña: ponente123
INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, is_active)
VALUES ('Ponente', 'UDG', 'ponente@udg.mx', 'pbkdf2_sha256$1200000$IsfjZjTB8e9d2CRP95ond0$6rBjfz2lsplx1IVbKXfnGZSp4tpGBfQI9ehVq1oJa9k=', true);

INSERT INTO ponente (id_persona)
SELECT id_persona FROM persona WHERE correo_electronico = 'ponente@udg.mx';


-- 4. Dictaminador
-- Correo: dictaminador@udg.mx
-- Contraseña: dictaminador123
INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, is_active)
VALUES ('Dictaminador', 'UDG', 'dictaminador@udg.mx', 'pbkdf2_sha256$1200000$XB3HCGOBph5Cs2NNpX8GhE$XdwIlti4t7B7HmlFO0fIrHXt7QDH4DrTctjDw1odPDo=', true);

INSERT INTO dictaminador (id_persona)
SELECT id_persona FROM persona WHERE correo_electronico = 'dictaminador@udg.mx';


-- 5. Revisor (Nombrado "evaluador" en la Base de Datos)
-- Correo: revisor@udg.mx
-- Contraseña: revisor123
INSERT INTO persona (nombre, primer_apellido, correo_electronico, contrasena, is_active)
VALUES ('Revisor', 'UDG', 'revisor@udg.mx', 'pbkdf2_sha256$1200000$3gUODcjT4Jqh8i5Zctoqj1$UiRM2X/3TbzArwVJbGjW3eTXsQkB9juQzxak3zqAlsQ=', true);

INSERT INTO evaluador (id_persona)
SELECT id_persona FROM persona WHERE correo_electronico = 'revisor@udg.mx';
