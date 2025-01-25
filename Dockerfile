FROM python:3.12.7-alpine3.20

# Adiciona dependências do sistema para compilar pacotes Python
RUN apk add --no-cache gcc musl-dev postgresql-dev libffi-dev

WORKDIR /core

COPY requeriments.txt /core/

# Instala os pacotes do Python sem cache
RUN pip install --no-cache-dir -r requeriments.txt

COPY . /core/

# Porta padrão do Gunicorn
EXPOSE 8000

# Comando padrão: Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application", "--workers", "3", "--threads", "2"]
