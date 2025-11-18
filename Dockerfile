# Dockerfile para Chatbot Cocolu Ventas
FROM node:20-alpine

# Información del maintainer
LABEL maintainer="contacto@cocoluventas.com"
LABEL description="Chatbot WhatsApp para Cocolu Ventas usando BuilderBot"

# Crear directorio de trabajo
WORKDIR /app

# Instalar git (necesario para algunas dependencias)
RUN apk add --no-cache git

# Copiar archivos de dependencias del proyecto raíz
COPY package*.json ./

# Copiar package.json de la app integrada en production (para type: "module")
COPY production/package*.json ./production/

# Instalar dependencias de producción
RUN npm install --omit=dev --legacy-peer-deps

# Copiar código fuente completo (incluye carpeta production)
COPY . .

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
