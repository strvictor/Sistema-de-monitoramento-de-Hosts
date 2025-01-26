from django.shortcuts import render
from django.http import JsonResponse

def create_account(request):
    ...


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
    
