# Generated by Django 3.1.7 on 2021-05-06 12:52

from django.db import migrations


def forwards(apps, schema_editor):
    Address = apps.get_model('olmap', 'Address')
    Address.objects.filter(official=False).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('olmap', '0005_add_workplace_types'),
    ]

    operations = [
        migrations.RunPython(forwards, lambda m, s: None)
    ]
