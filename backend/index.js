const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Prueba de conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos PostgreSQL');
  }
});

// Ruta de Registro
app.post('/api/register', async (req, res) => {
  const { nombre, primer_apellido, segundo_apellido, email, password } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar si el correo ya existe
    const checkUser = await client.query('SELECT 1 FROM persona WHERE correo_electronico = $1', [email]);
    if (checkUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar en la tabla 'persona'
    const personaRes = await client.query(
      'INSERT INTO persona (nombre, primer_apellido, segundo_apellido, correo_electronico, contrasena) VALUES ($1, $2, $3, $4, $5) RETURNING id_persona',
      [nombre, primer_apellido, segundo_apellido, email, hashedPassword]
    );

    const idPersona = personaRes.rows[0].id_persona;

    // Insertar en la tabla 'asistente' por defecto
    await client.query('INSERT INTO asistente (id_persona) VALUES ($1)', [idPersona]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: { id: idPersona, nombre, email }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en registro:', err);
    res.status(500).json({ success: false, message: 'Error al registrar el usuario' });
  } finally {
    client.release();
  }
});

// Ruta de Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario en la tabla 'persona'
    const result = await pool.query(
      'SELECT id_persona, nombre, contrasena FROM persona WHERE correo_electronico = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // Comparar la contraseña
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.contrasena);
    } catch (error) {
      // Si falla bcrypt (ej. no es un hash), comparamos directamente
      isMatch = password === user.contrasena;
    }

    // Fallback manual si isMatch es falso pero las contraseñas son idénticas en texto plano
    if (!isMatch && password === user.contrasena) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    // Buscar el rol del usuario (esto puede variar dependiendo de en qué tabla de rol esté)
    // Buscamos en las tablas de roles para ver cuál tiene su id_persona
    const roles = ['administrador', 'asistente', 'ponente', 'evaluador', 'dictaminador'];
    let userRol = 'asistente'; // Rol por defecto

    // Lógica simplificada: en una base de datos real, podrías tener una tabla de roles vinculada
    // Por ahora, buscaremos si el id_persona existe en la tabla asistente, ponente, etc.
    
    const [asistenteRes, ponenteRes, dictaminadorRes, evaluadorRes] = await Promise.all([
      pool.query('SELECT 1 FROM asistente WHERE id_persona = $1', [user.id_persona]),
      pool.query('SELECT 1 FROM ponente WHERE id_persona = $1', [user.id_persona]),
      pool.query('SELECT 1 FROM dictaminador WHERE id_persona = $1', [user.id_persona]),
      pool.query('SELECT 1 FROM evaluador WHERE id_persona = $1', [user.id_persona]),
    ]);

    if (email === 'admin@udg.mx') {
      userRol = 'administrador';
    } else if (dictaminadorRes.rows.length > 0) {
      userRol = 'dictaminador';
    } else if (evaluadorRes.rows.length > 0) {
      userRol = 'revisor';
    } else if (ponenteRes.rows.length > 0) {
      userRol = 'ponente';
    } else if (asistenteRes.rows.length > 0) {
      userRol = 'asistente';
    }

    // Crear un token JWT
    const token = jwt.sign(
      { id: user.id_persona, email, rol: userRol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id_persona,
        nombre: user.nombre,
        email,
        rol: userRol
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
