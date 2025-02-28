
import asyncio
import socket
import ssl
from datetime import datetime
from functools import lru_cache
from OpenSSL import crypto
from ping3 import ping
import requests
from api.models import Host, HostHistory
from playwright.async_api import async_playwright
from celery import shared_task



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


@shared_task(bind=True, max_retries=3, autoretry_for=(Exception,))
def save_historys(self, id):
    """
    Retorna informações sobre os hosts cadastrados, incluindo:
    - Status HTTP
    - Latência média (ping)
    - Tempo de carregamento da página
    - Informações do certificado SSL
    """
    try:
        host = Host.objects.get(id=id)
        user = host.usuario
        status = host.status
        host_address = host.host

        if not status:
            return

        # Coleta de dados
        http_and_latency = get_http_status_and_latency(host_address)
        
        cert_info = get_certificate_info(host_address)
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        load_time = loop.run_until_complete(measure_load_time(f"https://{host_address}"))
        loop.close()

        # Cria o histórico
        host_history = HostHistory.objects.create(
            host=host,
            usuario=user,
            status=status,
            status_code=http_and_latency['status_http'],
            avg_latency=http_and_latency['avg_latency'],
            load_time=load_time,
            cert_not_before=cert_info['not_before'],
            cert_not_after=cert_info['not_after']
        )
        
        host_history.save()
        print(HostHistory.objects.all())

        return f"Histórico do host {host_address} salvo com sucesso!"
    except Exception as e:
        print(f"Erro ao salvar histórico: {e}")
        self.retry(exc=e, countdown=30)  # Repete após 30s em caso de falha
