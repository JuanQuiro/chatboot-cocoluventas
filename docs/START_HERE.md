# 🚀 EMPIEZA AQUÍ

## ¡Bienvenido a tu Chatbot WhatsApp!

Este es tu punto de partida para poner en marcha el chatbot profesional de Cocolu Ventas.

---

## ⚡ Inicio Rápido (3 pasos)

### 1️⃣ Configurar Credenciales (5 min)

Edita el archivo `.env` con tus credenciales de WhatsApp Business:

```bash
# Abre el archivo
nano .env

# O con cualquier editor de texto
code .env
```

**Lo que DEBES configurar:**

```env
# 🔑 OBLIGATORIO - Obtén esto de Meta for Developers
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxx
META_PHONE_NUMBER_ID=123456789012345
WEBHOOK_VERIFY_TOKEN=tu_token_secreto_123

# 📝 RECOMENDADO - Tu información de negocio
BUSINESS_NAME=Tu Nombre de Empresa
BUSINESS_EMAIL=tu@email.com
BUSINESS_PHONE=+123456789
```

**¿Dónde obtengo las credenciales?**
👉 Ve a: https://developers.facebook.com/apps
👉 Crea/selecciona tu app → WhatsApp → Configuration

---

### 2️⃣ Instalar (si no lo hiciste)

```bash
npm install
```

**Tiempo estimado**: 1-2 minutos

---

### 3️⃣ Iniciar

```bash
npm run dev
```

**¡Listo!** El bot está corriendo en `http://localhost:3008`

---

## 🧪 Probar el Bot

### Opción A: Probar Localmente con Túnel

Usa ngrok o similar para exponer tu localhost:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto 3008
ngrok http 3008
```

Copia la URL HTTPS que te da ngrok (ej: `https://abc123.ngrok.io`)

### Opción B: Deploy Directo

Ve a la sección de **Deployment** más abajo.

---

## 🔧 Configurar Webhook en Meta

1. **Ve a Meta for Developers**
   - https://developers.facebook.com/apps
   - Tu App → WhatsApp → Configuration

2. **Configurar Webhook**
   - Click en "Configure" o "Edit"
   - **Callback URL**: `https://tu-url.com/webhook`
   - **Verify Token**: El que pusiste en `.env`
   - Click "Verify and Save"

3. **Suscribirse a Eventos**
   - En "Webhook fields" marca: `messages`
   - Click "Subscribe"

**¿Cómo sé si funciona?**
✅ Meta debe mostrar "Verified" con check verde

---

## 💬 Primeras Pruebas

Envía estos mensajes a tu número de WhatsApp:

```
1. "Hola"          → Debe responder con bienvenida
2. "MENU"          → Debe mostrar opciones
3. "1"             → Debe mostrar productos
4. "PEDIDO"        → Debe iniciar proceso de compra
5. "SOPORTE"       → Debe mostrar opciones de ayuda
```

---

## 🎨 Personalizar tu Bot

### Cambiar Productos

Edita: `src/services/products.service.js`

```javascript
const productsDatabase = [
    {
        id: 'PROD001',
        name: 'Tu Producto',      // ← Cambia esto
        price: 99.99,             // ← Y esto
        stock: 50,
        // ...
    }
];
```

### Cambiar Mensajes

Edita los archivos en: `src/flows/`

Por ejemplo, `welcome.flow.js`:

```javascript
.addAnswer('Tu mensaje personalizado aquí')
```

### Cambiar Horarios

En `.env`:

```env
BUSINESS_HOURS_START=09:00    # ← Hora de apertura
BUSINESS_HOURS_END=18:00      # ← Hora de cierre
BUSINESS_DAYS=1,2,3,4,5       # ← Días (1=Lun, 5=Vie)
```

---

## 🚀 Deployment (Producción)

### Opción 1: Railway (Más Fácil)

1. Ve a https://railway.app/
2. "New Project" → "Deploy from GitHub"
3. Conecta tu repo (o haz fork de este)
4. Agrega variables de entorno (.env)
5. ¡Deploy automático!

**Tiempo**: 5-10 minutos  
**Costo**: Gratis para empezar

### Opción 2: Heroku

```bash
heroku create mi-chatbot
heroku config:set META_ACCESS_TOKEN=xxx
heroku config:set META_PHONE_NUMBER_ID=xxx
heroku config:set WEBHOOK_VERIFY_TOKEN=xxx
git push heroku main
```

### Opción 3: VPS con PM2

```bash
# En tu servidor
git clone tu-repo
cd chatbot
npm install
pm2 start ecosystem.config.js
```

**Guía completa**: Ver `DEPLOYMENT.md`

---

## 📚 Documentación

| Lee esto | Si quieres | Tiempo |
|----------|------------|--------|
| **START_HERE.md** (este) | Empezar rápido | 5 min |
| **GUIA_RAPIDA.md** | Comandos y tips | 10 min |
| **README.md** | Documentación completa | 30 min |
| **DEPLOYMENT.md** | Deploy paso a paso | 20 min |
| **RESUMEN_PROYECTO.md** | Ver todo lo incluido | 10 min |

---

## ❓ FAQ Rápido

**P: ¿Necesito pagar por WhatsApp Business API?**  
R: Meta ofrece 1,000 conversaciones gratis/mes. Después tiene costo.

**P: ¿Funciona con WhatsApp normal?**  
R: No, necesitas WhatsApp Business API (diferente a WhatsApp Business app).

**P: ¿Puedo usar mi número personal?**  
R: No se recomienda. Usa un número dedicado para el negocio.

**P: ¿Cómo obtengo WhatsApp Business API?**  
R: A través de Meta for Developers o un BSP (Business Solution Provider).

**P: El bot no responde, ¿qué hago?**  
R: 
1. Verifica que el servidor esté corriendo
2. Revisa logs: `npm run dev` muestra errores
3. Verifica webhook en Meta
4. Confirma credenciales en `.env`

**P: ¿Cómo agrego más productos?**  
R: Edita `src/services/products.service.js`

**P: ¿Cómo cambio los mensajes?**  
R: Edita los archivos en `src/flows/`

---

## 🆘 Ayuda

**Problemas técnicos:**
1. Revisa los logs en la terminal
2. Consulta `README.md` → Troubleshooting
3. Ve `DEPLOYMENT.md` para deployment

**Aprende BuilderBot:**
- 📚 Docs: https://builderbot.app/
- 💬 Discord: https://link.codigoencasa.com/DISCORD
- 🎓 Curso: https://app.codigoencasa.com/courses/builderbot

**Comunidad:**
- GitHub Issues
- Discord de BuilderBot
- Twitter: @leifermendez

---

## ✅ Checklist de Verificación

Antes de considerar que todo funciona:

- [ ] Dependencias instaladas (`npm install`)
- [ ] `.env` configurado con credenciales reales
- [ ] Servidor corriendo sin errores (`npm run dev`)
- [ ] Webhook configurado en Meta
- [ ] Webhook verificado (check verde)
- [ ] Bot responde a "Hola"
- [ ] Menú funciona ("MENU")
- [ ] Productos se muestran ("1")

---

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. ✅ **Personaliza** productos y mensajes
2. ✅ **Prueba** todos los flujos
3. ✅ **Deploy** a producción
4. ✅ **Monitorea** logs y errores
5. ✅ **Itera** según feedback de usuarios

---

## 🎉 ¡Todo Listo!

Si llegaste hasta aquí y todo funciona:

**¡FELICITACIONES!** 🎊

Tienes un chatbot profesional funcionando 24/7.

### Ahora puedes:

✅ Atender clientes automáticamente  
✅ Procesar pedidos sin intervención  
✅ Responder preguntas frecuentes  
✅ Escalar tu negocio  
✅ Dormir tranquilo sabiendo que el bot trabaja por ti  

---

## 📞 Contacto

**¿Necesitas ayuda?**

- 📧 contacto@cocoluventas.com
- 💬 Discord de BuilderBot
- 🐛 GitHub Issues

---

## 🙏 Agradecimientos

Este chatbot está construido sobre:

- **BuilderBot** by Leifer Méndez
- **WhatsApp Business API** by Meta
- **Comunidad Open Source**

---

**¡Ahora sí, a vender!** 🚀💰

```bash
npm run dev
```

**¡Éxito!** ✨
