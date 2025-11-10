# Dockerfile para Chatbot Cocolu Ventas
FROM node:18-alpine

# Información del maintainer
LABEL maintainer="contacto@cocoluventas.com"
LABEL description="Chatbot WhatsApp para Cocolu Ventas usando BuilderBot"

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorio de base de datos
RUN mkdir -p database

# Exponer puerto
EXPOSE 3008

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3008

# Comando para iniciar la aplicación
CMD ["node", "app.js"]
