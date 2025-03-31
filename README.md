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

## 💻 Uso da Aplicação

1. **Criar uma conta de usuário**

   - Acesse a página de registro para criar um novo usuário

2. **Adicionar hosts para monitoramento**

   - No Cadastrar Host, use o botão "Adicionar novo Host"
   - Informe nome, endereço (URL ou IP) e frequência de monitoramento...

3. **Visualizar estatísticas**

   - No dashboard principal, acompanhe o status de todos os hosts
   - Clique em um host específico para visualizar detalhes e histórico

4. **Configurar alertas**
   - Acesse as configurações do usuário
   - Defina thresholds para tempo de resposta e downtime
   - Configure canais de notificação (quando disponíveis)

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

