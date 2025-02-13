# import json
# import socket, ssl
# from OpenSSL import crypto
# from ping3 import ping
# import requests, time

# from django.core import serializers
# from api.models import Host  # ajuste conforme sua estrutura



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



# def get_certificate_info(host, port=443):
#     """
#     Conecta via SSL e extrai datas de validade do certificado.
#     Retorna um dicionário com as datas ou um erro.
#     """
#     try:
#         context = ssl.create_default_context()
#         conn = context.wrap_socket(socket.socket(socket.AF_INET), server_hostname=host)
#         conn.settimeout(5)
#         conn.connect((host, port))
#         der_cert = conn.getpeercert(binary_form=True)
#         conn.close()
#         cert = crypto.load_certificate(crypto.FILETYPE_ASN1, der_cert)
#         not_before = cert.get_notBefore().decode('utf-8')
#         not_after = cert.get_notAfter().decode('utf-8')
#         return {"not_before": not_before, "not_after": not_after}
#     except Exception as e:
#         return {"error": str(e)}


  
def GenerateDataHosts():
    print('oi')
    # return json.loads(serializers.serialize('json', hosts))
    
    # for host_obj in json_formatado:
    #     fields = host_obj['fields']
    #     # Supondo que no seu modelo o campo seja "host" (endereço do host)
    #     host_address = fields.get('host')
        
    #     # Coleta do status HTTP
    #     try:
    #         url = f'https://{host_address}'
    
    #         resp = requests.get(url, timeout=5)
    #         status_http = resp.status_code
            
    #         # Cálculo do tempo de carregamento da página (em segundos)  
    #         load_time = asyncio.run(measure_load_time(url))
            
    #     except Exception as e:
    #         status_http = "Error"
        
    #     # Cálculo da latência média a partir de 5 pings (em ms)
    #     latencies = []
    #     for _ in range(5):
    #         r = ping(host_address, unit='ms')
    #         if r is not None:
    #             latencies.append(r)
    #     avg_latency = sum(latencies)/len(latencies) if latencies else None
        
    #     # Coleta de informações do certificado SSL
    #     cert_info = get_certificate_info(host_address)
        
    #     avg_latency = f'{avg_latency:.2f}' if isinstance(avg_latency, float) else avg_latency
    #     # Acrescenta os dados de métricas aos campos
    #     fields['status_http'] = status_http
    #     fields['avg_latency'] = avg_latency + 'ms'
    #     fields['load_time'] = load_time + 's'
    #     fields['cert_info'] = cert_info

    #     return json_formatado
    
    
GenerateDataHosts()
