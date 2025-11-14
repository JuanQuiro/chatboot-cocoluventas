# 🚀 Guía Rápida - Chatbot Cocolu Ventas

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar credenciales

Crea el archivo `.env` basado en `.env.example`:

```env
PORT=3008
WEBHOOK_VERIFY_TOKEN=mi_token_secreto_123
META_ACCESS_TOKEN=EAAxxxxxxxxxxxx
META_PHONE_NUMBER_ID=123456789
BUSINESS_NAME=Cocolu Ventas
```

### 3. Ejecutar
```bash
npm run dev
```

¡Listo! Tu bot está corriendo en `http://localhost:3008`

## 📱 Configurar WhatsApp

### Pasos esenciales:

1. **Meta for Developers**
   - Ir a https://developers.facebook.com/
   - Crear App → Tipo: Negocios
   - Agregar producto: WhatsApp

2. **Obtener credenciales**
   - Token de acceso (META_ACCESS_TOKEN)
   - ID del número de teléfono (META_PHONE_NUMBER_ID)

3. **Configurar Webhook**
   - URL: `https://tu-dominio.com/webhook`
   - Verify Token: El de tu `.env`
   - Suscribirse a: `messages`

## 🎯 Comandos del Bot

### Comandos principales que el usuario puede usar:

| Comando | Descripción |
|---------|-------------|
| `MENU` | Mostrar menú principal |
| `1` o `PRODUCTOS` | Ver catálogo |
| `2` o `PEDIDO` | Hacer pedido |
| `3` o `SEGUIMIENTO` | Rastrear pedido |
| `4` o `HORARIOS` | Ver horarios |
| `5` o `SOPORTE` | Ayuda y contacto |
| `6` o `ENVIOS` | Info de envíos |
| `7` o `PAGO` | Métodos de pago |
| `8` o `FAQ` | Preguntas frecuentes |

### Comandos de búsqueda:

- `BUSCAR nombre_producto` - Buscar producto
- `CATEGORIAS` - Ver categorías
- `TODOS` - Ver todos los productos
- `WEB` - Enlace al sitio web

### Comandos de soporte:

- `ASESOR` - Hablar con humano
- `PROBLEMA` - Reportar problema
- `CONTACTO` - Ver datos de contacto

## 🛠️ Personalización Rápida

### Cambiar productos

Edita `src/services/products.service.js`:

```javascript
const productsDatabase = [
    {
        id: 'PROD001',
        name: 'Tu Producto',
        description: 'Descripción aquí',
        price: 99.99,
        category: 'categoria',
        stock: 100,
        icon: '📦'
    }
];
```

### Cambiar mensajes

Edita los archivos en `src/flows/`:

```javascript
.addAnswer('Tu mensaje personalizado aquí')
```

### Cambiar horarios

En `.env`:

```env
BUSINESS_HOURS_START=09:00
BUSINESS_HOURS_END=18:00
BUSINESS_DAYS=1,2,3,4,5  # Lun-Vie
```

## 🐛 Solución de Problemas

### El bot no responde
- ✅ Verifica que el servidor esté corriendo
- ✅ Revisa las credenciales en `.env`
- ✅ Verifica el webhook en Meta

### Error de conexión
- ✅ Verifica tu META_ACCESS_TOKEN
- ✅ Asegúrate de usar un token permanente

### Error en base de datos
- ✅ Crea la carpeta `database/` manualmente
- ✅ Da permisos de escritura

## 📊 Scripts NPM

```bash
npm start     # Producción
npm run dev   # Desarrollo con hot-reload
```

## 🌐 Deployment Rápido

### Railway (Recomendado)
1. Conectar GitHub
2. Agregar variables de entorno
3. Deploy automático

### Heroku
```bash
heroku create mi-chatbot
heroku config:set META_ACCESS_TOKEN=xxx
git push heroku main
```

## 💡 Tips

- 🔒 **Nunca** compartas tu `.env`
- 📝 Personaliza los mensajes para tu marca
- 🧪 Prueba el bot antes de lanzar
- 📊 Monitorea los logs regularmente
- 🔄 Actualiza BuilderBot periódicamente

## 🆘 Ayuda

- 📖 README completo: `README.md`
- 🌐 Documentación: https://builderbot.app/
- 💬 Comunidad: Discord de BuilderBot
- 🐛 Issues: GitHub del proyecto

---

¿Todo listo? ¡Empieza a vender con tu chatbot! 🚀
