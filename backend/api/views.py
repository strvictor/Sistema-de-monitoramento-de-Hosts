from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth.models import User


from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

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


def login_account(request):
    if request.method == "POST":
        # email = request.POST.get('email')
        # senha = request.POST.get('senha')
        # print(request.POST)
        print(request.data)
        return JsonResponse({'retorno': 'teste123'}, status=200)
        # # Autenticar usando o email
        # usuario = authenticate(request, username=email, password=senha)
        
        # if usuario is not None:
        #     login(request, usuario)
        #     return redirect('home')
    else:
        # Autenticação falhou
        return JsonResponse({'message': 'Autenticação falhou'}, status=401)
    
