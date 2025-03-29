# Estágio de build
FROM node:18-alpine as build

WORKDIR /app

# Instalar dependências globais necessárias
RUN npm install -g typescript vite

# Copiar package.json e package-lock.json
COPY frontend/package.json frontend/package-lock.json ./

# Limpar cache e instalar dependências com base no package-lock.json
RUN npm cache clean --force && npm ci

# Instalar explicitamente os plugins do Vite para React
RUN npm install --save-dev @vitejs/plugin-react @vitejs/plugin-react-swc

# Copiar todo o código fonte
COPY frontend/ ./

# Verificar se os módulos estão instalados corretamente
RUN ls -la node_modules/@vitejs || echo "Diretório @vitejs não encontrado"

# Executar o build com o Vite
RUN npx vite build

# Estágio de produção
FROM nginx:alpine

# Remover configuração padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copiar arquivos de build para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Criar diretório conf.d se não existir
RUN mkdir -p /etc/nginx/conf.d

# Copiar nossa configuração personalizada
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
