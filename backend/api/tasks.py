from celery import shared_task

@shared_task
def atualiza_host(id):
    print(f'ATUALIZANDO HOST Y.... {id}')

