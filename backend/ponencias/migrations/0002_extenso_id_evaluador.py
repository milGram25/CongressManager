from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ponencias', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE extenso ADD COLUMN IF NOT EXISTS id_evaluador INTEGER REFERENCES evaluador(id_evaluador) ON DELETE SET NULL;",
            reverse_sql="ALTER TABLE extenso DROP COLUMN IF EXISTS id_evaluador;",
        ),
    ]
