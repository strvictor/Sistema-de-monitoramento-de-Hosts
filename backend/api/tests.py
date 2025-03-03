# import asyncio
# from playwright.async_api import async_playwright

# async def measure_load_time(url):
#     async with async_playwright() as p:
#         browser = await p.chromium.launch(headless=True)
#         page = await browser.new_page()
        
#         start_time = asyncio.get_event_loop().time()
#         await page.goto(url)
#         end_time = asyncio.get_event_loop().time()
        
#         load_time = end_time - start_time
#         await browser.close()
        
#         print(f"Tempo de carregamento: {load_time:.3f} segundos")

# # Teste com uma URL
# asyncio.run(measure_load_time("https://mercadolivre.com.br"))
# import requests

# response = requests.get("https://ipinfo.io/json").json()

# ip = response.get("ip")
# cidade = response.get("city")
# regiao = response.get("region")
# pais = response.get("country")
# localizacao = response.get("loc")  # Latitude e Longitude

# print(f"IP: {ip}")
# print(f"Localização: {cidade}, {regiao}, {pais}")
# print(f"Coordenadas: {localizacao}")

# import itertools
# [i for i in filter(lambda x: x % 5,
#     itertools.islice(itertools.count(5), 10))]

# [6, 7, 8, 9, 11, 12, 13, 14]

# import time
# from playwright.sync_api import sync_playwright

# def measure_load_time(url):
#     """
#     Mede o tempo de carregamento da página usando Playwright (versão síncrona).
#     """
#     try:
#         with sync_playwright() as p:
#             browser = p.chromium.launch(headless=False)
#             page = browser.new_page()

#             start_time = time.perf_counter()  # Captura o tempo inicial
#             page.goto(url, timeout=10000)  # Timeout de 10s
#             end_time = time.perf_counter()  # Captura o tempo final

#             browser.close()
#             return f"{(end_time - start_time):.3f}s"
#     except Exception as e:
#         return f"N/A: {str(e)}"

# # Exemplo de uso
# url = "https://chatgpt.com/c/67c5a201-4070-8003-98a4-07b06130b859"
# print(measure_load_time(url))

# import requests
# result = {'status_http': 'error'}
# try:
#     url = f"https://23.227.38.65"
#     resp = requests.get(url, timeout=10, verify=False)
#     result["status_http"] = resp.status_code
# except requests.RequestException:
#     pass  

# print(result)
