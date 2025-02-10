from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from api.models import FrequenciaAtualizacao, Host
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import json, re, time


import asyncio
from playwright.async_api import async_playwright

async def measure_load_time(url):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        start_time = asyncio.get_event_loop().time()
        await page.goto(url)
        end_time = asyncio.get_event_loop().time()
        
        load_time = end_time - start_time
        await browser.close()
        
        return f"{load_time:.2f}"



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
        Host.objects.create(
            nome=nome,
            host=host,
            frequencia_atualizacao=freq,
            usuario=retorno
        )
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
                'last_update': h.ultima_atualizacao.strftime('%d-%m-%Y %H:%M:%S') if h.ultima_atualizacao else None
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
    
    try:
        host = Host.objects.get(id=host_id, usuario=user)
        
        host.nome = nome
        host.host = host_r
        host.frequencia_atualizacao = FrequenciaAtualizacao.objects.get(tipo=freq_tipo)
        host.save()
        return JsonResponse({'success': 'Host atualizado com sucesso!'}, status=200)
    except Host.DoesNotExist:
        return JsonResponse({'error': 'Host não encontrado.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Ocorreu um erro ao editar o host: {str(e)}'}, status=500)
    
    
    
import json
import socket, ssl
from OpenSSL import crypto
from ping3 import ping
import requests

from django.core import serializers
from django.http import JsonResponse
from rest_framework.decorators import api_view
from api.models import Host  # ajuste conforme sua estrutura

def get_certificate_info(host, port=443):
    """
    Conecta via SSL e extrai datas de validade do certificado.
    Retorna um dicionário com as datas ou um erro.
    """
    try:
        context = ssl.create_default_context()
        conn = context.wrap_socket(socket.socket(socket.AF_INET), server_hostname=host)
        conn.settimeout(5)
        conn.connect((host, port))
        der_cert = conn.getpeercert(binary_form=True)
        conn.close()
        cert = crypto.load_certificate(crypto.FILETYPE_ASN1, der_cert)
        not_before = cert.get_notBefore().decode('utf-8')
        not_after = cert.get_notAfter().decode('utf-8')
        return {"not_before": not_before, "not_after": not_after}
    except Exception as e:
        return {"error": str(e)}

@api_view(['GET'])
def test(request):
    hosts = Host.objects.all()
    json_formatado = json.loads(serializers.serialize('json', hosts))
    
    for host_obj in json_formatado:
        fields = host_obj['fields']
        # Supondo que no seu modelo o campo seja "host" (endereço do host)
        host_address = fields.get('host')
        
        # Coleta do status HTTP
        try:
            url = f'https://{host_address}'
    
            resp = requests.get(url, timeout=5)
            status_http = resp.status_code
            
            # Cálculo do tempo de carregamento da página (em segundos)  
            load_time = asyncio.run(measure_load_time(url))
            
        except Exception as e:
            status_http = "Error"
        
        # Cálculo da latência média a partir de 5 pings (em ms)
        latencies = []
        for _ in range(5):
            r = ping(host_address, unit='ms')
            if r is not None:
                latencies.append(r)
        avg_latency = sum(latencies)/len(latencies) if latencies else None
        
        # Coleta de informações do certificado SSL
        cert_info = get_certificate_info(host_address)
        
        avg_latency = f'{avg_latency:.2f}' if isinstance(avg_latency, float) else avg_latency
        # Acrescenta os dados de métricas aos campos
        fields['status_http'] = status_http
        fields['avg_latency'] = avg_latency + 'ms'
        fields['load_time'] = load_time + 's'
        fields['cert_info'] = cert_info

    return JsonResponse(json_formatado, safe=False)




