# 🚀 Cocolu Ventas - Despliegue en Producción

## 📋 Estado Actual

**Bot desplegado en:** https://cocolu.emberdrago.com  
**Servidor:** VPS con Podman/Docker  
**Puerto API:** 3010  
**Puerto Bot:** 3008  

## ✅ Componentes Desplegados

- ✅ **Bot Node.js** - BuilderBot con adaptador Meta
- ✅ **Dashboard React** - Panel administrativo compilado
- ✅ **API REST** - Express.js en puerto 3010
- ✅ **Nginx** - Proxy inverso con SSL
- ✅ **10 Flujos** - Activos y funcionando
- ✅ **SSL/HTTPS** - Let's Encrypt válido

## 🔧 Estructura del Proyecto

```
chatboot-cocoluventas/
├── app-integrated.js      # Aplicación principal
├── src/                   # Código fuente
│   ├── api/              # Rutas REST
│   ├── flows/            # Flujos de conversación
│   ├── services/         # Servicios
│   └── ...
├── dashboard/            # React compilado
├── docker-compose.yml    # Configuración Podman
├── Dockerfile            # Imagen del contenedor
├── package.json          # Dependencias
├── .env                  # Variables de entorno
└── legacy/               # Archivos antiguos y documentación
```

## 🚀 Iniciar el Bot

### En VPS (Producción)

```bash
cd /opt/cocolu-bot
podman-compose up -d
```

### Localmente (Desarrollo)

```bash
npm install
npm start
```

## 📝 Configuración Necesaria (.env)

```env
# Meta WhatsApp
META_JWT_TOKEN=tu_token_aqui
META_NUMBER_ID=tu_numero_id
META_VERIFY_TOKEN=tu_verify_token
META_API_VERSION=v22.0

# Bot
BOT_ADAPTER=meta
BOT_NAME=Bot Principal Cocolu
PORT=3008
API_PORT=3010

# Dominio
DOMAIN=cocolu.emberdrago.com
WEBHOOK_URL=https://cocolu.emberdrago.com/webhook
```

## ⚠️ Problemas Conocidos

### Error 401 de Meta
Si ves error 401, significa que las credenciales de Meta son inválidas.  
**Solución:** Actualiza `META_JWT_TOKEN`, `META_NUMBER_ID` y `META_VERIFY_TOKEN` en `.env`

## 📊 Monitoreo

```bash
# Ver logs del contenedor
podman logs cocolu-bot -f

# Ver estado del contenedor
podman ps | grep cocolu

# Reiniciar el contenedor
podman-compose restart
```

## 🔗 URLs Importantes

- **Dashboard:** https://cocolu.emberdrago.com
- **Webhook:** https://cocolu.emberdrago.com/webhook
- **API Health:** https://cocolu.emberdrago.com/api/health
- **Bots API:** https://cocolu.emberdrago.com/api/bots

## 📚 Documentación Adicional

Toda la documentación antigua y archivos de desarrollo están en la carpeta `legacy/`.

## 🎯 Próximos Pasos

1. Actualizar credenciales Meta en `.env`
2. Reiniciar el contenedor
3. Verificar logs para confirmar conexión
4. Probar webhook desde Meta
5. Enviar mensajes de prueba

---

**Última actualización:** Nov 17, 2025  
**Versión:** 5.0.0 (Producción)
