import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def migrate_db():
    with connection.cursor() as cursor:
        # Check existing columns
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'institucion'")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Columnas actuales en 'institucion': {columns}")

        if 'ubicacion' not in columns:
            print("Añadiendo columna 'ubicacion'...")
            cursor.execute("ALTER TABLE institucion ADD COLUMN ubicacion VARCHAR(255)")
        
        if 'pais' not in columns:
            print("Añadiendo columna 'pais'...")
            cursor.execute("ALTER TABLE institucion ADD COLUMN pais VARCHAR(100) DEFAULT 'México'")
            
        if 'ruta_imagen' not in columns:
            print("Añadiendo columna 'ruta_imagen'...")
            cursor.execute("ALTER TABLE institucion ADD COLUMN ruta_imagen VARCHAR(255)")
        
        print("Migración manual completada con éxito.")

if __name__ == "__main__":
    try:
        migrate_db()
    except Exception as e:
        print(f"Error durante la migración: {e}")
