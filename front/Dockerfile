# Etapa 1: Construcción (Build)
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Compilamos React/Vite para producción
RUN npm run build 

# Etapa 2: Servidor Web Ligero (Nginx)
FROM nginx:alpine
# Copiamos la carpeta /dist generada en la etapa anterior a Nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]