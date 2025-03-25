#!/bin/bash

# Script de deploy para o Sistema de Monitoramento de Hosts
# Uso: ./deploy.sh [--with-ssl]

set -e

echo "🚀 Iniciando deploy do Sistema de Monitoramento de Hosts..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "🔧 Docker não encontrado, instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "⚠️ Por favor, saia e entre novamente na sessão SSH para aplicar as alterações de grupo."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "🔧 Docker Compose não encontrado, instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "📝 Arquivo .env não encontrado, criando a partir do exemplo..."
    cp .env-exemplo .env
    echo "⚠️ Por favor, edite o arquivo .env com suas configurações antes de continuar."
    exit 1
fi

# Perguntar pelo domínio
read -p "🌐 Digite o domínio para o sistema (ex: monitor.seudominio.com): " DOMAIN

# Atualizar o nginx_vps.conf com o domínio
echo "📝 Atualizando configuração do Nginx..."
sed -i "s/server_name mnt-hosts.dev-strvictor.online;/server_name $DOMAIN;/g" nginx_vps.conf
sed -i "s/\/etc\/letsencrypt\/live\/mnt-hosts.dev-strvictor.online\//\/etc\/letsencrypt\/live\/$DOMAIN\//g" nginx_vps.conf

# Verificar se a flag --with-ssl foi passada
if [[ "$1" == "--with-ssl" ]]; then
    echo "🔒 Configurando SSL com Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d $DOMAIN
fi

# Construir e iniciar os containers
echo "🏗️ Construindo e iniciando containers..."
docker-compose down
docker-compose up -d --build

# Criar diretório para backups
echo "💾 Configurando diretório de backups..."
mkdir -p /backups

# Criar script de backup
cat > backup_db.sh << EOF
#!/bin/bash
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
docker exec db-postgres pg_dump -U \${POSTGRES_USER} \${POSTGRES_DB} > /backups/db_backup_\${TIMESTAMP}.sql
find /backups -name "db_backup_*.sql" -type f -mtime +7 -delete
EOF

chmod +x backup_db.sh

# Adicionar ao crontab
echo "⏱️ Configurando backup automático diário..."
(crontab -l 2>/dev/null || echo "") | grep -v "backup_db.sh" | { cat; echo "0 2 * * * $(pwd)/backup_db.sh"; } | crontab -

echo "✅ Deploy concluído com sucesso!"
echo "🌍 Sua aplicação está disponível em: https://$DOMAIN"
echo ""
echo "ℹ️ Para verificar os logs, execute: docker-compose logs -f"
echo "ℹ️ Para atualizar a aplicação no futuro, execute: ./deploy.sh" 