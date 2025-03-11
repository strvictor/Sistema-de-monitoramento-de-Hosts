from django.db.models import Avg
from django.db.models.functions import Cast, TruncHour
from django.db.models import FloatField
from .models import *  # ajuste conforme seu app/modelo

# Agrupa os registros por hora da última atualização e calcula a média dos campos
dados = (
    HostHistory.objects
    .annotate(hour=TruncHour('ultima_atualizacao'))
    .values('hour')
    .annotate(
         avg_latency_avg=Avg(Cast('avg_latency', FloatField())),
         load_time_avg=Avg(Cast('load_time', FloatField()))
    )
    .order_by('hour')
)

chartData = []
for d in dados:
    chartData.append({
         'hour': d['hour'].strftime('%H:%M'),  # formato ex: "14:00"
         'avg_latency': d['avg_latency_avg'],
         'load_time': d['load_time_avg'],
    })

# chartData está pronto para ser enviado ao front-end.
print(chartData)