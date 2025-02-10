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

    def __str__(self):
        return f"Host {self.nome} | Usuario {self.usuario.first_name}"


class HostHistory(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    host = models.ForeignKey(Host, on_delete=models.CASCADE, related_name="historico")
    
    status = models.BooleanField(default=True)  # True = Online, False = Offline
    status_code = models.CharField(max_length=10, null=True, blank=True)  # Pode ser "Error"
    avg_latency = models.FloatField(default=0.0)  # Média do ping (ms)
    load_time = models.FloatField(default=0.0)  # Tempo de carregamento (s)
    
    cert_not_before = models.CharField(max_length=20, null=True, blank=True)  # Data de início SSL
    cert_not_after = models.CharField(max_length=20, null=True, blank=True)  # Data de expiração SSL
    cert_error = models.TextField(null=True, blank=True)  # Armazena erro caso o SSL falhe
    
    ultima_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Host: {self.host.nome} | Status: {self.status_code} | Latência: {self.avg_latency}ms"