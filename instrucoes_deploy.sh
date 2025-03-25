#!/bin/bash
# Este script contém os comandos para deploy do Sistema de Monitoramento de Hosts em uma VM Ubuntu
# Execute cada comando ou bloco separadamente para controlar melhor o processo

# 1. Instalando Docker (caso não esteja instalado)
apt update && apt upgrade -y
apt install -y apt-transport-https ca-certificates curl software-properties-common git
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER

# 2. Instalando Docker Compose (caso não esteja instalado)
curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 3. Criando diretório para o projeto
mkdir -p /var/www/monitor
cd /var/www/monitor

# 4. Clonando o repositório
git clone https://github.com/seu-usuario/sistema-de-monitoramento-de-hosts.git .
# OU
# Copie os arquivos via SFTP/SCP para o diretório

# 5. Configurando o arquivo .env
cp .env-exemplo .env
# Edite o arquivo .env com suas configurações:
# nano .env

# 6. Configurando o SSL com Certbot para seu subdomínio
apt install -y certbot python3-certbot-nginx
# Substitua 'seu-subdominio.dominio.com' pelo seu subdomínio real
certbot --nginx -d seu-subdominio.dominio.com

# 7. Atualizando a configuração do Nginx para o projeto
# Substitua 'seu-subdominio.dominio.com' pelo seu subdomínio real no arquivo nginx_vps.conf
# nano nginx_vps.conf

# 8. Instalando a configuração do Nginx
cp nginx_vps.conf /etc/nginx/sites-available/monitor.conf
ln -s /etc/nginx/sites-available/monitor.conf /etc/nginx/sites-enabled/
# Remova a configuração default se necessário
# rm /etc/nginx/sites-enabled/default

# 9. Testando e reiniciando o Nginx
nginx -t
systemctl restart nginx

# 10. Construindo e iniciando os containers
docker-compose up -d --build

# 11. Configurando backup automático do banco de dados
mkdir -p /backups
# Criar script de backup
cat > /var/www/monitor/backup_db.sh << EOF
#!/bin/bash
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
source /var/www/monitor/.env
docker exec db-postgres pg_dump -U \${POSTGRES_USER} \${POSTGRES_DB} > /backups/db_backup_\${TIMESTAMP}.sql
find /backups -name "db_backup_*.sql" -type f -mtime +7 -delete
EOF

chmod +x /var/www/monitor/backup_db.sh

# Adicionar ao crontab para execução diária às 2 da manhã
(crontab -l 2>/dev/null || echo "") | { cat; echo "0 2 * * * /var/www/monitor/backup_db.sh"; } | crontab - 