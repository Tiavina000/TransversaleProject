# Generated manually - add createur field to Chapitre

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_add_enseignant_niveau'),
    ]

    operations = [
        migrations.AddField(
            model_name='chapitre',
            name='createur',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='chapitres_crees', to='core.enseignant'),
        ),
    ]
