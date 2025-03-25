# Guia de Deploy em Produção - Sistema de Monitoramento de Hosts

Este guia detalha o processo para implantar o Sistema de Monitoramento de Hosts em uma VM Ubuntu com Nginx já instalado e configurar um certificado SSL para seu subdomínio.

## Pré-requisitos

- VM Ubuntu (recomendado 20.04 LTS ou superior)
- Acesso SSH à VM com privilégios de sudo
- Um subdomínio configurado para apontar para o IP da VM
- Nginx já instalado na VM

## 1. Preparação do Ambiente

### 1.1. Conecte-se à VM via SSH

```bash
ssh usuario@ip_da_sua_vm
```

### 1.2. Instale o Docker e Docker Compose

```bash
# Atualize os pacotes
sudo apt update && sudo apt upgrade -y

# Instale dependências necessárias
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common git

# Instale o Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instale o Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Aplique as alterações de grupo (necessário fazer logout e login novamente)
exit
```

Reconecte-se à VM para aplicar as alterações de grupo:

```bash
ssh usuario@ip_da_sua_vm
```

## 2. Configuração do Projeto

### 2.1. Crie o diretório para o projeto

```bash
sudo mkdir -p /var/www/monitor
sudo chown -R $USER:$USER /var/www/monitor
cd /var/www/monitor
```

### 2.2. Transfira os arquivos do projeto

Opção 1: Clone o repositório (se disponível no GitHub/GitLab):

```bash
git clone https://github.com/seu-usuario/sistema-de-monitoramento-de-hosts.git .
```

Opção 2: Copie os arquivos do seu computador para a VM (execute no seu computador local):

```bash
# No seu computador local (não na VM)
scp -r /caminho/local/sistema-de-monitoramento-de-hosts/* usuario@ip_da_sua_vm:/var/www/monitor/
```

### 2.3. Configure o arquivo .env

```bash
cp .env-exemplo .env
nano .env
```

Edite o arquivo com as configurações apropriadas:

```
POSTGRES_DB=nome_do_seu_bd
POSTGRES_USER=usuario_bd
POSTGRES_PASSWORD=senha_segura_bd
DB_HOST=db-postgres
CELERY_BROKER_URL=redis://redis:6379/0
ALLOWED_HOSTS=seu-subdominio.seu-dominio.com
```

## 3. Configuração do SSL e Nginx

### 3.1. Instale o Certbot para SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 3.2. Configure o arquivo Nginx para seu subdomínio

```bash
cp nginx_subdominio.conf /var/www/monitor/nginx.conf
nano /var/www/monitor/nginx.conf
```

Substitua todas as ocorrências de `SEU_SUBDOMINIO.SEU_DOMINIO.com` pelo seu subdomínio real.

### 3.3. Crie o link para a configuração do Nginx

```bash
sudo cp /var/www/monitor/nginx.conf /etc/nginx/sites-available/monitor.conf
sudo ln -s /etc/nginx/sites-available/monitor.conf /etc/nginx/sites-enabled/
```

### 3.4. Obtenha o certificado SSL com Certbot

```bash
sudo certbot --nginx -d seu-subdominio.seu-dominio.com
```

Siga as instruções na tela para configurar o certificado SSL.

### 3.5. Verifique e reinicie o Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 4. Deploy da Aplicação

### 4.1. Crie o arquivo docker-compose.prod.yml

Certifique-se de que o arquivo `docker-compose.prod.yml` está no diretório do projeto.

### 4.2. Inicie os containers

```bash
cd /var/www/monitor
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4.3. Verifique o status dos containers

```bash
docker-compose -f docker-compose.prod.yml ps
```

### 4.4. Verifique os logs para identificar problemas

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## 5. Configuração de Backups

### 5.1. Crie um diretório para backups

```bash
sudo mkdir -p /backups
sudo chown -R $USER:$USER /backups
```

### 5.2. Crie um script de backup

```bash
nano /var/www/monitor/backup_db.sh
```

Adicione o seguinte conteúdo:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
source /var/www/monitor/.env
docker exec db-postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > /backups/db_backup_${TIMESTAMP}.sql
find /backups -name "db_backup_*.sql" -type f -mtime +7 -delete
```

### 5.3. Torne o script executável

```bash
chmod +x /var/www/monitor/backup_db.sh
```

### 5.4. Configure o backup automático

```bash
(crontab -l 2>/dev/null || echo "") | { cat; echo "0 2 * * * /var/www/monitor/backup_db.sh"; } | crontab -
```

## 6. Verificação Final

### 6.1. Teste a aplicação

Acesse seu subdomínio pelo navegador: `https://seu-subdominio.seu-dominio.com`

### 6.2. Comandos úteis para manutenção

```bash
# Reiniciar containers
docker-compose -f docker-compose.prod.yml restart

# Parar todos os containers
docker-compose -f docker-compose.prod.yml down

# Visualizar logs de um serviço específico
docker-compose -f docker-compose.prod.yml logs -f backend

# Fazer backup manual do banco de dados
/var/www/monitor/backup_db.sh

# Renovar certificado SSL (geralmente é automático)
sudo certbot renew

# Verificar status do Nginx
sudo systemctl status nginx
```

## 7. Resolução de Problemas

### 7.1. Erro de conexão com o banco de dados

- Verifique as variáveis de ambiente no arquivo `.env`
- Verifique se o container do banco de dados está rodando: `docker ps | grep db-postgres`

### 7.2. Problemas com certificado SSL

- Execute `sudo certbot certificates` para verificar o status
- Tente renovar: `sudo certbot renew --dry-run`

### 7.3. 502 Bad Gateway no Nginx

- Verifique se os containers estão rodando: `docker ps`
- Verifique logs do Nginx: `sudo tail -f /var/log/nginx/error.log`
- Verifique logs dos containers: `docker-compose -f docker-compose.prod.yml logs -f`

### 7.4. Erros de permissão

- Ajuste as permissões do diretório: `sudo chown -R $USER:$USER /var/www/monitor`
- Verifique as permissões do script de backup: `ls -la /var/www/monitor/backup_db.sh`
