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
import requests

response = requests.get("https://ipinfo.io/json").json()

ip = response.get("ip")
cidade = response.get("city")
regiao = response.get("region")
pais = response.get("country")
localizacao = response.get("loc")  # Latitude e Longitude

print(f"IP: {ip}")
print(f"Localização: {cidade}, {regiao}, {pais}")
print(f"Coordenadas: {localizacao}")
