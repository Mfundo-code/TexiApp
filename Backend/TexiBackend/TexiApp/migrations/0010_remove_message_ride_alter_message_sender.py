# Generated by Django 4.2.21 on 2025-05-29 04:07

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('TexiApp', '0009_alter_message_ride'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='message',
            name='ride',
        ),
        migrations.AlterField(
            model_name='message',
            name='sender',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_messages', to=settings.AUTH_USER_MODEL),
        ),
    ]
