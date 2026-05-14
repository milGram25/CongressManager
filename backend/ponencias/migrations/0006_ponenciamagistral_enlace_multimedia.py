from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ponencias', '0005_ponenciamagistral_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE ponencia_magistral ADD COLUMN IF NOT EXISTS enlace_multimedia VARCHAR(500) DEFAULT '';",
            reverse_sql="ALTER TABLE ponencia_magistral DROP COLUMN IF EXISTS enlace_multimedia;",
        ),
    ]
