# Sistema de Monitoramento de Hosts

Um sistema completo para monitoramento de disponibilidade, performance e segurança de servidores e aplicações web em tempo real.

## 📋 Sobre o Projeto

Este sistema permite monitorar o status de múltiplos hosts/servidores web, acompanhando:

- **Status de disponibilidade** (online/offline)
- **Tempo de resposta** e latência
- **Validade de certificados SSL**
- **Histórico de performance**
- **Alertas configuráveis** baseados em thresholds personalizados

A aplicação é construída com uma arquitetura moderna utilizando Django (backend) e React (frontend), permitindo monitoramentos agendados através do Celery e visualizações em tempo real dos dados coletados.

## 🛠️ Tecnologias Utilizadas

### Backend

- **Django**: Framework web Python
- **Django REST Framework**: API RESTful
- **Celery**: Processamento assíncrono e agendamento de tarefas
- **Redis**: Message broker para Celery
- **PostgreSQL**: Banco de dados relacional
- **JWT**: Autenticação via tokens

### Frontend

- **React**: Biblioteca JavaScript para interfaces
- **TypeScript**: Tipagem estática para JavaScript
- **TailwindCSS**: Framework CSS utilitário
- **Shadcn UI**: Componentes de UI reutilizáveis
- **Recharts**: Biblioteca de gráficos
- **React Router**: Navegação
- **Axios**: Cliente HTTP

### Infraestrutura

- **Docker/Docker Compose**: Conteinerização
- **Nginx**: Servidor web e proxy reverso

## 🚀 Instalação e Configuração

### Pré-requisitos

- Docker e Docker Compose
- Git

### Passos para Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/strvictor/sistema-de-monitoramento-de-hosts.git
   cd sistema-de-monitoramento-de-hosts
   ```

2. **Configure as variáveis de ambiente**

   ```bash
   cp .env-exemplo .env
   ```

   Edite o arquivo `.env` com suas configurações:

   ```
   POSTGRES_DB=nome_do_seu_bd
   POSTGRES_USER=usuario
   POSTGRES_PASSWORD=senha
   DB_HOST=db-postgres
   CELERY_BROKER_URL=redis://redis:6379/0
   ```

3. **Inicie os containers com Docker Compose**

   ```bash
   docker-compose up -d
   ```

4. **Acesse a aplicação**
   - Frontend: http://localhost:3000
   - API Backend: http://localhost:8000

## 💻 Uso da Aplicação

1. **Criar uma conta de usuário**

   - Acesse a página de registro para criar um novo usuário

2. **Adicionar hosts para monitoramento**

   - No dashboard, use o botão "Adicionar Host"
   - Informe nome, endereço (URL ou IP) e frequência de monitoramento

3. **Visualizar estatísticas**

   - No dashboard principal, acompanhe o status de todos os hosts
   - Clique em um host específico para visualizar detalhes e histórico

4. **Configurar alertas**
   - Acesse as configurações do usuário
   - Defina thresholds para tempo de resposta e downtime
   - Configure canais de notificação (quando disponíveis)

## 🌐 Deploy em Produção (VM)

### Requisitos da VM

- Sistema Operacional: Ubuntu 20.04 LTS ou superior
- RAM: 4GB+ (recomendado)
- vCPUs: 2+ (recomendado)
- Armazenamento: 20GB+ disponíveis
- Portas abertas: 80, 443 (HTTP/HTTPS), 22 (SSH)

### Preparação do Ambiente

1. **Instale as dependências necessárias**

   ```bash
   sudo apt update
   sudo apt upgrade -y
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common git
   ```

2. **Instale o Docker e Docker Compose**

   ```bash
   # Instalar Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER

   # Instalar Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

   Saia e entre novamente na sessão SSH para aplicar as alterações de grupo.

3. **Configure um domínio e DNS (opcional, mas recomendado)**

   Configure os registros DNS A/AAAA do seu domínio para apontar para o IP da sua VM.

### Deploy da Aplicação

1. **Clone o repositório na VM**

   ```bash
   git clone https://github.com/seu-usuario/sistema-de-monitoramento-de-hosts.git
   cd sistema-de-monitoramento-de-hosts
   ```

2. **Configure as variáveis de ambiente para produção**

   ```bash
   cp .env-exemplo .env
   ```

   Edite o arquivo `.env` com suas configurações de produção, incluindo:

   - Senhas fortes para o banco de dados
   - Configurações específicas para produção
   - URL do host de produção

3. **Configure o Nginx para produção**

   O arquivo `nginx_vps.conf` já está preparado para uso em produção. Ajuste o seguinte:

   ```bash
   # Abra o arquivo para edição
   nano nginx_vps.conf
   ```

   Altere as diretivas `server_name` para seu domínio e verifique os caminhos dos certificados SSL.

4. **Configure SSL com Certbot (recomendado)**

   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d seu-dominio.com
   ```

5. **Construa e inicie os containers em modo produção**

   ```bash
   docker-compose up -d
   ```

6. **Verifique os logs para garantir que tudo está funcionando**

   ```bash
   docker-compose logs -f
   ```

### Manutenção e Monitoramento

1. **Atualizações e Backup**

   Crie um script para backups regulares do banco de dados:

   ```bash
   mkdir -p /backups

   # Adicione ao crontab (crontab -e)
   # 0 2 * * * docker exec db-postgres pg_dump -U seu_usuario nome_bd > /backups/db_backup_$(date +\%Y\%m\%d).sql
   ```

   Para atualizar a aplicação:

   ```bash
   # Dentro do diretório do projeto
   git pull
   docker-compose down
   docker-compose up -d --build
   ```

2. **Monitoramento do Sistema**

   Considere instalar ferramentas como:

   - Netdata para monitoramento do servidor
   - Portainer para gerenciamento dos containers Docker

   ```bash
   # Instalar Portainer
   docker volume create portainer_data
   docker run -d -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce
   ```

### Resolução de Problemas

- **Problema com conexão à API**: Verifique as configurações CORS e o proxy Nginx
- **Problemas com certificados SSL**: Execute `certbot renew` para renovar certificados
- **Containers não iniciam**: Use `docker-compose logs nome_do_serviço` para investigar

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
.
├── backend/               # Aplicação Django
│   ├── api/               # API REST e modelos
│   ├── app/               # Configurações do projeto
│   └── Dockerfile         # Docker para o backend
├── frontend/              # Aplicação React
│   ├── src/               # Código fonte
│   │   ├── components/    # Componentes React
│   │   ├── app/           # Páginas da aplicação
│   │   └── services/      # Serviços e integrações
│   └── Dockerfile         # Docker para o frontend
├── docker-compose.yml     # Configuração dos serviços
└── .env                   # Variáveis de ambiente
```

## 📝 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.
