from django.db import models
from django.contrib.auth.models import User

class FrequenciaAtualizacao(models.Model):
    TIPOS_FREQUENCIA = (
        ('A cada Hora', 'A cada Hora'),
        ('Todos os dias', 'Todos os dias'),
        ('Semanalmente', 'Semanalmente'),
        ('Mensalmente', 'Mensalmente'),
    )
    tipo = models.CharField(max_length=100, choices=TIPOS_FREQUENCIA, unique=True)

    def __str__(self):
        return self.tipo

class Host(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.BooleanField(default=True)
    nome = models.CharField(max_length=100)
    host = models.CharField(max_length=100)
    frequencia_atualizacao = models.ForeignKey(FrequenciaAtualizacao, on_delete=models.CASCADE)
    ultima_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Host {self.nome} | Usuario {self.usuario.first_name}"
