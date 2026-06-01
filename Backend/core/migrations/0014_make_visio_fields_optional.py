from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0013_merge_20260601_0615'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sessionvisio',
            name='lecon',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.CASCADE, related_name='sessions_visio', to='core.lecon'),
        ),
        migrations.AlterField(
            model_name='sessionvisio',
            name='url_visio',
            field=models.URLField(blank=True, default=''),
        ),
    ]
