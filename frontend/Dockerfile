# Estágio de build
FROM node:18-alpine as build

WORKDIR /app

# Instalar dependências globais
RUN npm install -g typescript vite

# Copiar package.json e package-lock.json
COPY frontend/package.json frontend/package-lock.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código fonte
COPY frontend/ ./

# Executar vite diretamente sem o typescript
RUN npx vite build --config vite.config.ts

# Estágio de produção
FROM nginx:alpine

# Remover configuração padrão
RUN rm -rf /etc/nginx/conf.d/*

# Copiar arquivos de build para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Criar configuração simples do Nginx
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
