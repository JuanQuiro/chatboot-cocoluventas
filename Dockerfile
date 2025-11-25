# Dockerfile para Chatbot Cocolu Ventas
FROM node:20-alpine

# Información del maintainer
LABEL maintainer="contacto@cocoluventas.com"
LABEL description="Chatbot WhatsApp para Cocolu Ventas usando BuilderBot"

# Crear directorio de trabajo
WORKDIR /app

# Instalar git y build tools necesarios para better-sqlite3
RUN apk add --no-cache git python3 make g++

# Copiar package.json de la app integrada en production (donde están TODAS las dependencias)
COPY production/package*.json ./production/

# Instalar dependencias de producción DESDE /app/production
WORKDIR /app/production
RUN npm install --omit=dev --legacy-peer-deps

# Volver al directorio principal y copiar TODO EL CÓDIGO FUENTE
WORKDIR /app
COPY . .

# Build React dashboard (ahora que tenemos el código completo)
WORKDIR /app/production/dashboard
RUN npm install --legacy-peer-deps && npm run build && npm prune --production

# Back to app root
WORKDIR /app

# Crear directorio de base de datos
RUN mkdir -p database

# Exponer puertos
EXPOSE 3008 3010

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3008
ENV API_PORT=3010

# Comando para iniciar la aplicación integrada en carpeta production
CMD ["node", "production/app-integrated.js"]
