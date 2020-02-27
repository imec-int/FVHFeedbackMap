# Generated by Django 3.0 on 2019-12-03 13:58

from django.db import migrations
from fvh_courier.rest.permissions import SENDER_GROUP


def forwards(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.get_or_create(name=SENDER_GROUP)


class Migration(migrations.Migration):

    dependencies = [
        ('fvh_courier', '0014_auto_20200220_1427'),
    ]

    operations = [
        migrations.RunPython(forwards)
    ]
