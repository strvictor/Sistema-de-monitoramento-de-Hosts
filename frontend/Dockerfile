# Etapa de build com Node
FROM node:18-alpine as build

WORKDIR /app

# Copie os arquivos de dependências e instale-os
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
# Instala o TypeScript e Vite globalmente
RUN npm install -g typescript vite

# Copie o restante do código e construa o projeto
COPY frontend/ .
RUN npm run build

# Etapa final: use o Nginx para servir os arquivos estáticos
FROM nginx:alpine

# Copie a configuração do Nginx personalizada (para suportar React Router)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copie os arquivos buildados para a pasta padrão do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponha a porta 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
