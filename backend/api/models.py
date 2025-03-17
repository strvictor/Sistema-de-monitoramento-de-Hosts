from django.db import models
from django.contrib.auth.models import User

class FrequenciaAtualizacao(models.Model):
    TIPOS_FREQUENCIA = (
        ('A cada 2 Minutos', 'A cada 2 Minutos'),
        ('A cada 10 Minutos', 'A cada 10 Minutos'),
        ('A cada 30 Minutos', 'A cada 30 Minutos'),
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
    avg_latency = models.CharField(max_length=10, default=0)  # Média do ping (ms)
    load_time = models.CharField(max_length=20, default=0)  # Tempo de carregamento (s)
    
    cert_not_before = models.CharField(max_length=20, null=True, blank=True)  # Data de início SSL
    cert_not_after = models.CharField(max_length=20, null=True, blank=True)  # Data de expiração SSL
    cert_error = models.TextField(null=True, blank=True, default='-')  # Armazena erro caso o SSL falhe
    
    ultima_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Host: {self.host.nome} | Status: {self.status_code} | Latência: {self.avg_latency}ms | Ultima Att: {self.ultima_atualizacao}"

class UserSettings(models.Model):
    active = models.BooleanField(default=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    down_time_threshold = models.IntegerField(default=5)  # em minutos
    response_time_threshold = models.IntegerField(default=2000)  # em milissegundos
    notify_on_status = models.JSONField(default=list)  # lista de códigos de status

    def __str__(self):
        return f'Configurações de {self.user.username}'
