# 🌐 Solución: Túnel para Webhook Meta

## ❌ Problema

ngrok está bloqueado desde tu IP. Necesitas una alternativa para exponer tu servidor local a internet.

## ✅ Soluciones disponibles

### Opción 1: Cloudflare Tunnel (RECOMENDADO) ⭐

Ya tienes `cloudflared` instalado. Es la mejor alternativa:

```bash
./setup-cloudflared.sh
```

O manualmente:
```bash
cloudflared tunnel --url http://localhost:3008
```

Te dará una URL como: `https://abc-123-def-456.trycloudflare.com`

**Ventajas:**
- ✅ Gratis
- ✅ No requiere cuenta
- ✅ Más rápido que ngrok
- ✅ Funciona desde cualquier IP

### Opción 2: Localtunnel

Alternativa ligera:

```bash
./setup-localtunnel.sh
```

O manualmente:
```bash
npm install -g localtunnel
lt --port 3008
```

Te dará una URL como: `https://abc-123.loca.lt`

**Ventajas:**
- ✅ Muy ligero
- ✅ No requiere cuenta
- ⚠️ Puede ser más lento

### Opción 3: Serveo (sin instalación)

```bash
ssh -R 80:localhost:3008 serveo.net
```

## 📋 Pasos para configurar

### 1. Iniciar el túnel

Elige una de las opciones anteriores. **Recomiendo Cloudflare Tunnel**:

```bash
./setup-cloudflared.sh
```

**IMPORTANTE:** Mantén esta terminal abierta. Si la cierras, el túnel se corta.

### 2. Copiar la URL pública

Cuando inicies el túnel, verás algo como:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://abc-123-def-456.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

Copia esa URL completa.

### 3. Configurar webhook en Meta

1. Ve a https://developers.facebook.com/
2. Selecciona tu app de WhatsApp
3. Ve a **WhatsApp > Configuration**
4. En la sección **Webhook**, haz clic en **Edit** o **Configure**
5. Configura:
   - **Callback URL**: `https://abc-123-def-456.trycloudflare.com/webhooks/whatsapp`
     (reemplaza con tu URL real)
   - **Verify Token**: El token que tienes en tu `.env` como `META_VERIFY_TOKEN`
6. Haz clic en **Verify and Save**
7. En **Webhook fields**, marca:
   - ✅ `messages`
   - ✅ `message_status`
8. Haz clic en **Save**

### 4. Verificar que funciona

1. **Mantén el túnel corriendo** (no cierres la terminal)
2. **Mantén el servidor corriendo** (`./start-production.sh`)
3. **Monitorea los logs**:
   ```bash
   ./monitor-webhooks.sh
   ```
4. **Envía un mensaje** al bot (+1 555 141-0797)
5. **Deberías ver** en los logs:
   ```
   🔔 Webhook recibido: ...
   📨 MENSAJE RECIBIDO DE META
   ```

## 🧪 Verificar que todo está listo

### 1. Servidor corriendo
```bash
curl http://localhost:3008/api/health
```

### 2. Webhook local funcionando
```bash
./test-webhook-local.sh
```

### 3. Ver mensajes registrados
```bash
curl -s http://localhost:3008/api/open/messages | jq '.data.received | length'
```

### 4. Dashboard
Abre: http://localhost:3009/

## ⚠️ Importante

1. **El túnel debe estar corriendo** mientras quieras recibir mensajes
2. **La URL cambia** cada vez que reinicias el túnel (a menos que uses cuenta de pago)
3. **Si reinicias el túnel**, debes actualizar la URL en Meta Developers

## 🔧 Si el túnel se cae

Si el túnel se desconecta:
1. Reinicia el túnel: `./setup-cloudflared.sh`
2. Copia la nueva URL
3. Actualiza la URL en Meta Developers

## 📊 Monitoreo

Para ver los logs en tiempo real:
```bash
./monitor-webhooks.sh
```

O manualmente:
```bash
tail -f logs/node-api.log | grep -E "Webhook|Mensaje|📨|🔔"
```

## 🐛 Troubleshooting

### No llegan mensajes

1. **Verifica que el túnel esté corriendo**: Debe mostrar una URL pública
2. **Verifica la URL en Meta**: Debe ser exactamente `https://[url]/webhooks/whatsapp`
3. **Verifica el Verify Token**: Debe coincidir exactamente con el de `.env`
4. **Revisa los logs**: `tail -f logs/node-api.log`
5. **Prueba el webhook localmente**: `./test-webhook-local.sh`

### El túnel se desconecta

- Cloudflare Tunnel es más estable que localtunnel
- Si se desconecta frecuentemente, considera usar un servidor con IP fija

