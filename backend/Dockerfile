# Use uma imagem Python enxuta
FROM python:3.12-slim

# Variáveis de ambiente para não gerar arquivos .pyc e manter logs no stdout
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Copie o arquivo de requisitos e instale as dependências Python
COPY backend/requirements.txt .

RUN pip install --upgrade pip && pip install -r requirements.txt

# Copie o restante do código
COPY backend/ .

# Comando para iniciar o servidor (pode ser adaptado para usar Gunicorn, por exemplo)
CMD ["gunicorn", "app.wsgi:application", "--bind", "0.0.0.0:8000"]
