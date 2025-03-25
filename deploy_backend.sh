#!/bin/bash

# Script para deploy simplificado do backend
set -e

echo "🚀 Iniciando deploy do backend para o Sistema de Monitoramento de Hosts..."

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
  echo "❌ Docker não está instalado! Instalando..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  echo "⚠️ Por favor, saia e entre novamente na sessão SSH para aplicar as alterações de grupo."
  exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose não está instalado! Instalando..."
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
  echo "❌ Arquivo .env não encontrado! Criando a partir do exemplo..."
  cp .env-exemplo .env
  echo "⚠️ Por favor, edite o arquivo .env com suas configurações antes de continuar."
  exit 1
fi

# Criar docker-compose simplificado apenas para o backend
echo "📝 Criando configuração do docker-compose para o backend..."
cat << EOF > docker-compose.backend.yml
version: '3.8'

services:
  db-postgres:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: \${POSTGRES_DB}
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    restart: always
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: django_backend
    volumes:
      - ./backend:/app
      - static_volume:/app/staticfiles
    ports:
      - "8000:8000"
    depends_on:
      - db-postgres
    environment:
      POSTGRES_DB: \${POSTGRES_DB}
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_HOST: db-postgres
      POSTGRES_PORT: 5432
      CELERY_BROKER_URL: \${CELERY_BROKER_URL}
      DEBUG: 'False'
      ALLOWED_HOSTS: \${ALLOWED_HOSTS:-*}
    command: >
      sh -c "python manage.py migrate && 
             python manage.py collectstatic --noinput && 
             gunicorn app.wsgi:application --bind 0.0.0.0:8000"

  redis:
    restart: always
    image: redis:latest
    ports:
      - "6379:6379"

  celery-worker:
    restart: always
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: celery_worker
    depends_on:
      - redis
      - db-postgres
    environment:
      POSTGRES_DB: \${POSTGRES_DB}
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_HOST: db-postgres
      POSTGRES_PORT: 5432
      CELERY_BROKER_URL: \${CELERY_BROKER_URL}
      DEBUG: 'False'
    command: >
      sh -c "celery -A app worker --loglevel=info"

  celery-beat:
    restart: always
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: celery_beat
    command: celery -A app beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler
    depends_on:
      - db-postgres
      - backend
      - redis
      - celery-worker
    environment:
      POSTGRES_DB: \${POSTGRES_DB}
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_HOST: db-postgres
      POSTGRES_PORT: 5432
      CELERY_BROKER_URL: \${CELERY_BROKER_URL}
      DEBUG: 'False'

volumes:
  postgres_data:
  static_volume:
EOF

# Iniciar os serviços
echo "🏗️ Iniciando os serviços do backend..."
docker-compose -f docker-compose.backend.yml down
docker-compose -f docker-compose.backend.yml up -d --build

# Verificar se os serviços estão rodando
echo "🔍 Verificando status dos serviços..."
docker-compose -f docker-compose.backend.yml ps

# Verificar os logs do backend
echo "📋 Verificando logs do backend..."
docker-compose -f docker-compose.backend.yml logs -f backend

echo "✅ Deploy do backend concluído com sucesso!" 