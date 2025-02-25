from django.contrib import admin
from api.models import *
# from django_celery_beat.models import PeriodicTask, IntervalSchedule

# admin.site.register(PeriodicTask)
# admin.site.register(IntervalSchedule)

admin.site.register(FrequenciaAtualizacao)
admin.site.register(Host)
admin.site.register(HostHistory)
