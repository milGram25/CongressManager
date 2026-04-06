# Replicación del Entorno de Python

Replicar el entorno de Python.

## Crear el entorno virtual (Opcional pero recomendado):

```bash
cd backend
python -m venv venv
```

## Activar el entorno:

**En Windows:**
```bash
.\venv\Scripts\activate
```

**En Linux/Mac:**
```bash
source venv/bin/activate
```

## Instalar dependencias:

```bash
pip install -r requirements.txt
```

## Variables de Entorno (.env):

**IMPORTANTE:** Nunca suban sus contraseñas de base de datos al repo.

- DB_NAME  
- DB_USER  
- DB_PASSWORD  
- SECRET_KEY

Crear un archivo con .env y agregar las variables de entorno:

```bash
copy backend\.env.example backend\.env
```

## Migraciones y Servidor:

```bash
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



