from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ponencias', '0002_extenso_id_evaluador'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE extenso
                  ADD COLUMN IF NOT EXISTS id_evaluador_2 INTEGER REFERENCES evaluador(id_evaluador) ON DELETE SET NULL,
                  ADD COLUMN IF NOT EXISTS id_evaluador_3 INTEGER REFERENCES evaluador(id_evaluador) ON DELETE SET NULL;
            """,
            reverse_sql="""
                ALTER TABLE extenso
                  DROP COLUMN IF EXISTS id_evaluador_2,
                  DROP COLUMN IF EXISTS id_evaluador_3;
            """,
        ),
    ]
