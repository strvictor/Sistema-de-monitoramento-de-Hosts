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
from .task_manager import save_historys
from django.db import transaction


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
            "task": "api.task_manager.save_historys",
            "args": json.dumps([host_created.id]),
            "kwargs": json.dumps({}),
        }
    )
    if not host_created.status:
        periodic_task.enabled = False
        periodic_task.save()
        
    _ = save_historys.delay(host_created.id) 
    return _


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
    status = data.get('status', True)

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

    if isinstance(status, str):
        status = status.lower() == 'true'
        
    if not status:
        status = False
    else:
        status = True
        
    # Criação do host
    try:
        freq = FrequenciaAtualizacao.objects.get(tipo=freq_tipo)
        host_created = Host.objects.create(
            nome=nome,
            host=host,
            frequencia_atualizacao=freq,
            usuario=retorno,
            status=status
        )
        host_created.save()
        task_create = create_or_update_task(freq_tipo, host_created)
        
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
    status = data.get('status', True)

    # Validação de campos obrigatórios
    if not nome or not host_r or not freq_tipo:
        return JsonResponse({'error': 'Todos os campos (nome, dominio e frequencia) são obrigatórios.'}, status=400)
    
    
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
    
    if isinstance(status, str):
        status = status.lower() == 'true'
        
    task_name = f'{host_id} - {user.username}'
    task = PeriodicTask.objects.get(name=task_name)
    
    if not status:
        task.enabled = False
    else:
        task.enabled = True
    task.save()
        
    try:
        host_bd = Host.objects.get(id=host_id, usuario=user)
        
        host_bd.nome = nome
        host_bd.host = host
        host_bd.status = status
        host_bd.frequencia_atualizacao = FrequenciaAtualizacao.objects.get(tipo=freq_tipo)
        host_bd.save()
        
        task_create = create_or_update_task(freq_tipo, host_bd)
        
        return JsonResponse({'success': 'Host atualizado com sucesso!'}, status=200)
    except Host.DoesNotExist:
        return JsonResponse({'error': 'Host não encontrado.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Ocorreu um erro ao editar o host: {str(e)}'}, status=500)
