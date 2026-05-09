from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('congresos', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql=(
                "ALTER TABLE congreso "
                "ADD COLUMN IF NOT EXISTS firma_organizador varchar(255) NULL, "
                "ADD COLUMN IF NOT EXISTS firma_secretaria varchar(255) NULL, "
                "ADD COLUMN IF NOT EXISTS firmas_bloqueadas boolean NOT NULL DEFAULT false;"
            ),
            reverse_sql=(
                "ALTER TABLE congreso "
                "DROP COLUMN IF EXISTS firma_organizador, "
                "DROP COLUMN IF EXISTS firma_secretaria, "
                "DROP COLUMN IF EXISTS firmas_bloqueadas;"
            ),
        ),
    ]
