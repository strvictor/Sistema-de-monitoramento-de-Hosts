from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from api.models import FrequenciaAtualizacao, Host
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import json, re
from django_celery_beat.models import PeriodicTask, IntervalSchedule
import json 
from api.tasks import atualiza_host  


def validate_token(request):
    auth = JWTAuthentication()
    header = request.headers.get('Authorization')

    if not header:
        return False, JsonResponse({'error': 'Token não fornecido'}, status=401)

    try:
        token = header.split(' ')[1]  # Remove "Bearer " do início
        validated_token = auth.get_validated_token(token)
        user = auth.get_user(validated_token) # Obtém o usuário do token
        if user is None:
            return False, JsonResponse({'error': 'Token inválido ou expirado'}, status=401)
    except Exception as e:
        return False, JsonResponse({'error': 'Token inválido ou expirado'}, status=401)
    
    return True, user


def create_or_update_task(freq_tipo, host_created):
    frequency_map = {
        "A cada 2 Minutos": (2, IntervalSchedule.MINUTES),
        "A cada 10 Minutos": (10, IntervalSchedule.MINUTES),
        "A cada 30 Minutos": (30, IntervalSchedule.MINUTES),
        "A cada Hora": (1, IntervalSchedule.HOURS),
        "Todos os dias": (1, IntervalSchedule.DAYS),
        "Semanalmente": (7, IntervalSchedule.DAYS),
        "Mensalmente": (30, IntervalSchedule.DAYS),
    }

    every, period = frequency_map.get(freq_tipo, (1, IntervalSchedule.HOURS))
    
    schedule, _ = IntervalSchedule.objects.get_or_create(
        every=every,
        period=period,
    )
    # Criar ou atualizar uma tarefa periódica
    task_name = f"{host_created.id} - {host_created.usuario}"
    
    periodic_task, created = PeriodicTask.objects.update_or_create(
        name=task_name,
        defaults={
            "interval": schedule,
            "task": "api.tasks.atualiza_host",
            "args": json.dumps([host_created.id]),
            "kwargs": json.dumps({}),
        }
    )
    return atualiza_host.delay(host_created.id)  


@csrf_exempt
def create_account(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Dados inválidos, não foi possível processar o JSON.'}, status=400)

        # Extraindo e normalizando os dados
        nome = str(data.get('name', '')).strip().title()
        email = str(data.get('email', '')).strip().lower()
        username = email.split('@')[0]
        password = data.get('password', '').strip()

        # Validação de campos obrigatórios
        if not nome or not email or not password:
            return JsonResponse({'error': 'Todos os campos (nome, email e senha) são obrigatórios.'}, status=400)

        # Verificando se o e-mail já está cadastrado
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Já existe outro usuário com esse e-mail cadastrado.'}, status=400)

        # Criando o usuário
        try:
            User.objects.create_user(username=username, email=email, password=password, first_name=nome)
            return JsonResponse({'success': 'Usuário criado com sucesso!'}, status=201)
        except Exception as e:
            return JsonResponse({'error': f'Ocorreu um erro ao criar o usuário: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Método não permitido. Use POST.'}, status=405)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  
def get_user_data(request):
    valid, user = validate_token(request)
    if not valid:
        return user
    data = {
        'id': user.id,
        'name': user.get_full_name(),
        'email': user.email,
    }

    return JsonResponse(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def frequency_data(request):
    valid, user = validate_token(request)
    if not valid:
        return user
    data = {
        'frequencies': [
            {
                'id': f.id,
                'type': f.tipo,
            } for f in FrequenciaAtualizacao.objects.all()
        ]
    }
    return JsonResponse(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_host(request):
    valid, retorno = validate_token(request)
    if not valid:
        return retorno

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Dados inválidos, não foi possível processar o JSON.'}, status=400)

    # Extraindo e normalizando os dados
    nome = str(data.get('nome', '')).strip().title()
    raw_host = str(data.get('dominio', '')).strip()
    freq_tipo = data.get('frequencia', None)

    # Validação de campos obrigatórios
    if not nome or not raw_host or not freq_tipo:
        return JsonResponse({'error': 'Todos os campos (nome, Dominio e frequência) são obrigatórios.'}, status=400)

    # Limpeza do host
    host = raw_host.lower()
    if host.startswith(('http://', 'https://')):
        host = host.split('://')[1]
    if host.startswith('www.'):
        host = host[4:]
    host = host.rstrip('/').split('/')[0]

    # Expressões regulares para validação
    domain_regex = r'^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'
    ipv4_regex = r'^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'

    # Validação do host
    is_valid_domain = re.fullmatch(domain_regex, host) is not None
    is_valid_ip = re.fullmatch(ipv4_regex, host) is not None

    if not (is_valid_domain or is_valid_ip):
        return JsonResponse({'error': 'Host inválido. Deve ser um domínio válido ou IPv4.'}, status=400)

    # Verificação da frequência
    if not FrequenciaAtualizacao.objects.filter(tipo=freq_tipo).exists():
        return JsonResponse({'error': 'Frequência de atualização não encontrada.'}, status=404)

    # Criação do host
    try:
        freq = FrequenciaAtualizacao.objects.get(tipo=freq_tipo)
        host_created = Host.objects.create(
            nome=nome,
            host=host,
            frequencia_atualizacao=freq,
            usuario=retorno
        )
        task_create = create_or_update_task(freq_tipo, host_created)
        print(task_create)
        
        return JsonResponse({'success': 'Host criado com sucesso!'}, status=201)
    except Exception as e:
        return JsonResponse({'error': f'Ocorreu um erro ao criar o host: {str(e)}'}, status=500)
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_hosts(request):
    valid, user = validate_token(request)
    if not valid:
        return user
    data = {
        'hosts': [
            {
                'id': h.id,
                'name': h.nome,
                'host': h.host,
                'frequency': h.frequencia_atualizacao.tipo,
                'status': h.status,
                'last_update': 'em desenvolvimento'
            } for h in Host.objects.filter(usuario=user)
        ]
    }

    return JsonResponse(data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_host(request, host_id):
    valid, user = validate_token(request)
    if not valid:
        return user
    
    try:
        host = Host.objects.get(id=host_id, usuario=user)
        host.delete()
        task_name = f'{host_id} - {user.username}'
        task = PeriodicTask.objects.get(name=task_name)
        task.enabled = False
        task.save()
        
        return JsonResponse({'success': 'Host excluído com sucesso!'}, status=200)
    except Host.DoesNotExist:
        return JsonResponse({'error': 'Host não encontrado.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Ocorreu um erro ao excluir o host: {str(e)}'}, status=500)
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_host(request, host_id):
    valid, user = validate_token(request)
    if not valid:
        return user

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Dados inválidos, não foi possível processar o JSON.'}, status=400)

    # Extraindo e normalizando os dados
    nome = str(data.get('nome', '')).strip().title()
    host_r = str(data.get('dominio', '')).strip()
    freq_tipo = data.get('frequencia', None)

    # Validação de campos obrigatórios
    if not nome or not host_r or not freq_tipo:
        return JsonResponse({'error': 'Todos os campos (nome, dominio, host e frequencia) são obrigatórios.'}, status=400)
    
    
    # Limpeza do host
    host = host_r.lower()
    if host.startswith(('http://', 'https://')):
        host = host.split('://')[1]
    if host.startswith('www.'):
        host = host[4:]
    host = host.rstrip('/').split('/')[0]

    # Expressões regulares para validação
    domain_regex = r'^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'
    ipv4_regex = r'^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'

    # Validação do host
    is_valid_domain = re.fullmatch(domain_regex, host) is not None
    is_valid_ip = re.fullmatch(ipv4_regex, host) is not None

    if not (is_valid_domain or is_valid_ip):
        return JsonResponse({'error': 'Host inválido. Deve ser um domínio válido ou IPv4.'}, status=400)

    # Verificação da frequência
    if not FrequenciaAtualizacao.objects.filter(tipo=freq_tipo).exists():
        return JsonResponse({'error': 'Frequência de atualização não encontrada.'}, status=404)
    
    
    try:
        host = Host.objects.get(id=host_id, usuario=user)
        
        host.nome = nome
        host.host = host_r
        host.frequencia_atualizacao = FrequenciaAtualizacao.objects.get(tipo=freq_tipo)
        host.save()
        
        task_create = create_or_update_task(freq_tipo, host)
        print(task_create)
        
        return JsonResponse({'success': 'Host atualizado com sucesso!'}, status=200)
    except Host.DoesNotExist:
        return JsonResponse({'error': 'Host não encontrado.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Ocorreu um erro ao editar o host: {str(e)}'}, status=500)




import asyncio
import json
import socket
import ssl
from datetime import datetime
from functools import lru_cache

from OpenSSL import crypto
from ping3 import ping
import requests
from django.core import serializers
from django.http import JsonResponse
from rest_framework.decorators import api_view
from api.models import Host
from playwright.async_api import async_playwright


async def measure_load_time(url):
    """
    Mede o tempo de carregamento da página usando Playwright.
    """
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            start_time = asyncio.get_event_loop().time()
            await page.goto(url)  # Timeout de 10s
            end_time = asyncio.get_event_loop().time()

            await browser.close()
            return f"{(end_time - start_time):.3f}s"
    except Exception as e:
        return f"N/A: {str(e)}"


@lru_cache(maxsize=100)  # Cache para evitar múltiplas consultas ao mesmo host
def get_certificate_info(host, port=443):
    """
    Obtém as datas de validade do certificado SSL do host.
    Retorna um dicionário com:
    - Data de início (`not_before`)
    - Data de expiração (`not_after`)
    - Status do certificado (`valid` ou `expired`)
    """
    try:
        context = ssl.create_default_context()
        with context.wrap_socket(socket.socket(socket.AF_INET), server_hostname=host) as conn:
            conn.settimeout(5)
            conn.connect((host, port))
            cert = crypto.load_certificate(crypto.FILETYPE_ASN1, conn.getpeercert(binary_form=True))

        not_before = datetime.strptime(cert.get_notBefore().decode("utf-8"), "%Y%m%d%H%M%SZ")
        not_after = datetime.strptime(cert.get_notAfter().decode("utf-8"), "%Y%m%d%H%M%SZ")

        status = "valid" if datetime.utcnow() < not_after else "expired"

        return {
            "not_before": not_before.strftime("%Y-%m-%d %H:%M:%S"),
            "not_after": not_after.strftime("%Y-%m-%d %H:%M:%S"),
            "status": status,
        }
    except Exception as e:
        return {"error": str(e).split(']')[0].replace('[', '').split(':')[1].strip()}


def get_http_status_and_latency(host):
    """
    Obtém o status HTTP e a latência média (ping) de um host.
    Retorna um dicionário com os dados coletados.
    """
    result = {"status_http": "Error", "avg_latency": "N/A"}

    try:
        url = f"https://{host}"
        resp = requests.get(url, timeout=5)
        result["status_http"] = resp.status_code
    except requests.RequestException:
        pass  # Mantém "Error" no status HTTP

    # Mede latência média com 5 pings
    latencies = [ping(host, unit="ms") for _ in range(5)]
    latencies = [lat for lat in latencies if lat is not None]  # Remove None

    if latencies:
        result["avg_latency"] = f"{(sum(latencies) / len(latencies)):.2f}ms"

    return result


@api_view(["GET"])
def test(request):
    """
    Retorna informações sobre os hosts cadastrados, incluindo:
    - Status HTTP
    - Latência média (ping)
    - Tempo de carregamento da página
    - Informações do certificado SSL
    """
    hosts = Host.objects.all()
    json_hosts = json.loads(serializers.serialize("json", hosts))

    for host_obj in json_hosts:
        fields = host_obj["fields"]
        host_address = fields.get("host")

        if not host_address:
            continue  # Pula hosts sem endereço

        # Coleta de dados
        http_and_latency = get_http_status_and_latency(host_address)
        cert_info = get_certificate_info(host_address)
        load_time = asyncio.run(measure_load_time(f"https://{host_address}"))

        # Atualiza os campos
        fields.update(http_and_latency)
        fields["load_time"] = load_time
        fields["cert_info"] = cert_info

    return JsonResponse(json_hosts, safe=False)

