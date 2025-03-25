#!/bin/bash

# Script para build e deploy simplificado do frontend
set -e

echo "🚀 Iniciando build e deploy do frontend para o Sistema de Monitoramento de Hosts..."

# Diretório temporário para o build
BUILD_DIR="/tmp/frontend_build"
mkdir -p $BUILD_DIR

# Copiar os arquivos do frontend para o diretório temporário
echo "📋 Copiando arquivos do frontend..."
cp -r frontend/* $BUILD_DIR/

# Entrar no diretório de build
cd $BUILD_DIR

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Executar o build
echo "🔨 Executando build do frontend..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
  echo "❌ Falha ao gerar o build do frontend!"
  exit 1
fi

# Criar diretório para o frontend na VM
echo "📁 Criando diretório para o frontend..."
sudo mkdir -p /var/www/mnt-hosts

# Copiar os arquivos de build para o diretório do Nginx
echo "📋 Copiando arquivos de build para o diretório do Nginx..."
sudo cp -r dist/* /var/www/mnt-hosts/

# Configurar o Nginx
echo "🔧 Configurando o Nginx..."
cat << EOF > /tmp/mnt-hosts.conf
server {
    listen 80;
    server_name mnt-hosts.dev-strvictor.online;
    
    # Redirecionar HTTP para HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name mnt-hosts.dev-strvictor.online;

    # Configuração SSL gerenciada pelo Certbot
    ssl_certificate /etc/letsencrypt/live/mnt-hosts.dev-strvictor.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mnt-hosts.dev-strvictor.online/privkey.pem;
    
    # Otimizações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Headers de segurança
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
    
    # Raiz dos arquivos estáticos
    root /var/www/mnt-hosts;
    index index.html;
    
    # Configuração para servir arquivos estáticos do React
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Configuração do proxy reverso para a API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Servir arquivos estáticos diretamente
    location /static/ {
        proxy_pass http://localhost:8000/static/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # Configuração para arquivos grandes
    client_max_body_size 10M;
    
    # Logs específicos para o site
    access_log /var/log/nginx/mnt-hosts_access.log;
    error_log /var/log/nginx/mnt-hosts_error.log;
}
EOF

# Instalar configuração do Nginx
sudo cp /tmp/mnt-hosts.conf /etc/nginx/sites-available/mnt-hosts.conf

# Criar link simbólico se não existir
if [ ! -f /etc/nginx/sites-enabled/mnt-hosts.conf ]; then
  sudo ln -s /etc/nginx/sites-available/mnt-hosts.conf /etc/nginx/sites-enabled/
fi

# Testar e reiniciar o Nginx
echo "🔍 Testando configuração do Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
  echo "🔄 Reiniciando o Nginx..."
  sudo systemctl restart nginx
  echo "✅ Deploy do frontend concluído com sucesso!"
  echo "🌍 Acesse https://mnt-hosts.dev-strvictor.online para ver a aplicação"
else
  echo "❌ Configuração do Nginx inválida!"
  exit 1
fi

# Limpar arquivos temporários
echo "🧹 Limpando arquivos temporários..."
rm -rf $BUILD_DIR

echo "✨ Concluído!" 