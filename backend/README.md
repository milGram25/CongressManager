# Guía de Setup del Backend

## Requisitos previos

- Python 3.11+
- PostgreSQL 14+ instalado y corriendo

---

## Paso 1 — Crear la base de datos y el usuario en PostgreSQL

Abre la terminal de PostgreSQL (`psql`) y ejecuta:

```sql
CREATE USER congress_admin WITH PASSWORD '1234';
CREATE DATABASE congress_manager OWNER congress_admin;
GRANT ALL PRIVILEGES ON DATABASE congress_manager TO congress_admin;
\q
```

> Puedes usar otro usuario/contraseña/nombre de BD, pero debes reflejarlo en el `.env` del siguiente paso.

---

## Paso 2 — Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus credenciales:

**En Windows:**
```bash
copy backend\.env.example backend\.env
```

**En Linux/Mac:**
```bash
cp backend/.env.example backend/.env
```

Abre `backend/.env` y llena los valores:

```
SECRET_KEY=cualquier-clave-larga-y-aleatoria
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_ENGINE=django.db.backends.postgresql
DB_NAME=congress_manager
DB_USER=congress_admin
DB_PASSWORD=1234
DB_HOST=localhost
DB_PORT=5432
```

**IMPORTANTE:** Nunca subas tu `.env` al repo. El `.gitignore` ya lo excluye.

---

## Paso 3 — Crear y activar el entorno virtual

```bash
cd backend
python -m venv venv
```

**En Windows:**
```bash
.\venv\Scripts\activate
```

**En Linux/Mac:**
```bash
source venv/bin/activate
```

---

## Paso 4 — Instalar dependencias

```bash
pip install -r requirements.txt
```

---

## Paso 5 — Crear el esquema de la base de datos

Ejecuta el script SQL desde la raíz del proyecto. Este script crea todas las tablas necesarias y es seguro correrlo más de una vez (`IF NOT EXISTS`):

**En Windows (psql):**
```bash
psql -U congress_admin -d congress_manager -f database\congress.sql
```

**En Linux/Mac:**
```bash
psql -U congress_admin -d congress_manager -f database/congress.sql
```

> Si te pide contraseña, escribe `1234` (o la que usaste en el Paso 1).

---

## Paso 6 — Aplicar migraciones de Django

Las migraciones crean las tablas internas de Django y las tablas `dictaminador_congreso` y `evaluador_congreso`:

```bash
python manage.py migrate
```

---

## Paso 7 — Correr el servidor

```bash
python manage.py runserver
```

El servidor corre en `http://localhost:8000`.

---

## Resumen rápido (para quien ya lo hizo antes)

```bash
source venv/bin/activate          # o .\venv\Scripts\activate en Windows
python manage.py migrate
python manage.py runserver
```

# 📂 Guía del Directorio Backend

## 1. 📁 core/ (El Cerebro)

Es el núcleo del proyecto. Aquí no se programa lógica de negocio, solo configuración.

- **settings.py:** Donde vive la configuración de la base de datos, las API Keys, y donde registramos nuestras apps.
- **urls.py:** El "enrutador maestro". Aquí se definen los prefijos globales (ej: /api/users/, /api/congresos/).

---

## 2. 📁 users/ (Gestión de Accesos)

Se encarga de quién puede entrar y qué puede hacer.

- **models.py:** Define los roles (Admin, Revisor, Asistente, Dictaminador).
- **views.py:** Contiene la lógica de Login, Register y validación de tokens JWT.

**Conexión Frontend:** Alimenta a AuthContext.jsx y Login.jsx.

---

## 3. 📁 congresos/ (Lógica del Evento)

Maneja toda la información administrativa del congreso.

- **models.py:** Tablas para Sedes, Fechas, Áreas e Instituciones.
- **views.py:** Endpoints que llenan tablas como CongresosView.jsx o AgendaView.jsx.
- **admin.py:** Configuración para que tú, como superusuario, puedas editar congresos desde el panel visual de Django (/admin).

---

## 4. 📁 ponencias/ (Flujo de Trabajo)

Es la parte más compleja, donde se gestionan los archivos y las revisiones.

- **models.py:** Define qué es una ponencia, quién es el autor y su estatus (pendiente, aceptado, rechazado).
- **views.py:** Lógica para subir archivos, asignar revisores y guardar dictámenes.

**Conexión Frontend:** Conecta con EnviarPonenciaView.jsx, RevisionesView.jsx y DictamenesView.jsx.

---

## 🐍 Archivos Clave en cada App

Todos los folders de apps (users, congresos, ponencias) tienen estos archivos:

| Archivo        | Función |
|---------------|--------|
| models.py     | Base de Datos: Aquí defines las tablas en código Python (el ORM lo traduce a SQL). |
| views.py      | Lógica: Recibe la petición de React, procesa datos y devuelve la respuesta. |
| urls.py       | Rutas: Define el camino final del endpoint (ej: .../lista/, .../crear/). |
| admin.py      | Panel de Control: Registra los modelos para verlos en la interfaz gráfica de Django. |
| migrations/   | Historial: Guarda los cambios realizados en la estructura de la base de datos. |

---

## 🔄 Flujo de una Petición

1. React hace un fetch a http://localhost:8000/api/congresos/lista/.
2. core/urls.py ve que empieza con api/congresos/ y se lo pasa a la app congresos.
3. congresos/urls.py ve que termina en lista/ y llama a una función en views.py.
4. La View le pide al Model los datos de PostgreSQL.
5. La View convierte los datos a JSON y los manda de regreso a React.

---

## 💡 Tip

Si crean una tabla nueva en models.py, siempre deben ejecutar:

```bash
python manage.py makemigrations
python manage.py migrate
```

Esto actualiza la base de datos de todos para que esté sincronizada con el código.



