# Generated by Django 4.2.21 on 2025-05-24 06:02

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('TexiApp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='mode',
            field=models.CharField(choices=[('driver', 'Driver'), ('passenger', 'Passenger')], default='passenger', max_length=10),
        ),
        migrations.CreateModel(
            name='Ride',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ride_type', models.CharField(choices=[('request', 'Ride Request'), ('offer', 'Ride Offer')], max_length=7)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('pickup_name', models.CharField(max_length=255)),
                ('pickup_lat', models.DecimalField(decimal_places=6, max_digits=9)),
                ('pickup_lng', models.DecimalField(decimal_places=6, max_digits=9)),
                ('dropoff_name', models.CharField(max_length=255)),
                ('dropoff_lat', models.DecimalField(decimal_places=6, max_digits=9)),
                ('dropoff_lng', models.DecimalField(decimal_places=6, max_digits=9)),
                ('is_active', models.BooleanField(default=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
