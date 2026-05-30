from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_add_video_url_to_lecon'),
    ]

    operations = [
        migrations.AddField(
            model_name='lecon',
            name='est_publie',
            field=models.BooleanField(default=False, help_text='La leçon est visible par les étudiants'),
        ),
    ]
