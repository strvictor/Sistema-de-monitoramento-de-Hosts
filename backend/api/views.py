from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from api.models import FrequenciaAtualizacao, Host
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import json

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
    host = str(data.get('dominio', '')).strip()
    freq_tipo = data.get('frequencia', None)

    # Validação de campos obrigatórios
    if not nome or not host or not freq_tipo:
        return JsonResponse({'error': 'Todos os campos (nome, Dominio e frequência) são obrigatórios.'}, status=400)

    # Verificando se a frequência existe
    if not FrequenciaAtualizacao.objects.filter(tipo=freq_tipo).exists():
        return JsonResponse({'error': 'Frequência de atualização não encontrada.'}, status=404)

    # Criando o host
    try:
        freq = FrequenciaAtualizacao.objects.get(tipo=freq_tipo)
        Host.objects.create(nome=nome, host=host, frequencia_atualizacao=freq, usuario=retorno)
        return JsonResponse({'success': 'Host criado com sucesso!'}, status=201)
    except Exception as e:
        return JsonResponse({'error': f'Ocorreu um erro ao criar o host: {str(e)}'}, status=500)