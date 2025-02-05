from django.db import models

class FrequenciaAtualizacao(models.Model):
    TIPOS_FREQUENCIA = (
        ('hora', 'A cada Hora'),
        ('dia', 'Todos os dias'),
        ('semana', 'Semanalmente'),
    )
    tipo = models.CharField(max_length=100,choices=TIPOS_FREQUENCIA)

    def __str__(self):
        return self.tipo

class Host(models.Model):
    status = models.BooleanField(default=True)
    nome = models.CharField(max_length=100)
    host = models.CharField(max_length=100, unique=True)
    frequencia_atualizacao = models.OneToOneField(FrequenciaAtualizacao, on_delete=models.CASCADE)
    ultima_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome
