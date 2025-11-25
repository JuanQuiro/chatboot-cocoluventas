# 🧪 Guía de Testing y Debugging - Meta WhatsApp Bot

## 🎯 Setup Mañana (Paso a Paso)

### 1. Configurar Tokens de Meta
```
1. Ve a: http://173.249.205.142:3008/meta-setup
2. Ingresa:
   - META_JWT_TOKEN: [tu token de Meta Business]
   - META_NUMBER_ID: [tu WhatsApp Business ID]
   - META_VERIFY_TOKEN: [token para webhook]
3. Click "Guardar"
```

### 2. Verificar Configuración
```bash
# Ver logs en tiempo real
ssh root@173.249.205.142
podman logs -f chatbot-cocolu

# Buscar confirmación de Meta configurado
podman logs chatbot-cocolu | grep -i "meta\|token\|configured"
```

---

## 🐛 Debugging en Tiempo Real

### Ver Logs del Bot
```bash
# Logs en vivo (tiempo real)
ssh root@173.249.205.142
podman logs -f chatbot-cocolu

# Últimas 100 líneas
podman logs chatbot-cocolu --tail 100

# Buscar errores
podman logs chatbot-cocolu | grep -i "error\|failed\|exception"

# Buscar mensajes recibidos
podman logs chatbot-cocolu | grep -i "mensaje\|message\|whatsapp"
```

### Ver Mensajes en Dashboard
```
1. Dashboard → Messages (real-time con SSE)
2. Se actualizan automáticamente cuando llegan mensajes
3. Verás: usuario, mensaje, vendedor asignado, estado
```

---

## 🧪 Testing del Flujo

### Enviar Mensaje de Prueba
```
1. Desde tu WhatsApp → Envía mensaje al número Business
2. Ver en Dashboard → Messages si llega
3. Ver logs: podman logs -f chatbot-cocolu
4. Verificar respuesta automática
```

### Comandos de Testing Incluidos
El bot tiene comandos para testing:
```
MODO TEST ACTIVAR    → Activa modo testing
DEBUG MODE ON        → Activa logs detallados
ESTADO BOT           → Ver estado del sistema
VER VENDEDORAS       → Ver asignaciones
TIMER 30SEG          → Timers rápidos para pruebas
```

---

## 🔍 Verificación de Funcionalidad

### 1. Webhook de Meta
```bash
# Verificar que Meta pueda alcanzar tu servidor
curl http://173.249.205.142:3008/api/webhook

# Debería devolver info del webhook
```

### 2. API de Sellers
```bash
# Crear vendedor de prueba
curl -X POST http://173.249.205.142:3008/api/sellers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Test",
    "whatsapp": "+52123456789",
    "email": "ana@test.com",
    "status": "available"
  }'

# Listar vendedores
curl http://173.249.205.142:3008/api/sellers

# Ver workload
curl http://173.249.205.142:3008/api/sellers/workload
```

### 3. Health Check
```bash
# Estado general del sistema
curl http://173.249.205.142:3008/api/health | jq '.'

# Ver provider activo
curl -s http://173.249.205.142:3008/api/health | jq '.bots'
```

---

## 📊 Monitoreo del Flujo

### Flujo Completo que Verás:
```
1. Usuario envía mensaje por WhatsApp
   ↓
2. Meta Webhook → Bot recibe (verás en logs)
   ↓
3. Bot asigna vendedor Round-Robin (verás en Dashboard)
   ↓
4. Bot ejecuta flujo de respuesta (verás en logs)
   ↓
5. Usuario recibe respuesta automática
   ↓
6. Todo guardado en SQLite (verás en Messages)
```

### Ver Todo en Tiempo Real:
```bash
# Terminal 1: Logs del bot
ssh root@173.249.205.142
podman logs -f chatbot-cocolu | grep -E "(mensaje|Message|Webhook|Vendedor|assigned)"

# Browser: Dashboard Messages
http://173.249.205.142:3008/messages
(Auto-refresh con SSE)
```

---

## ⚠️ Errores Comunes y Soluciones

### "Meta credentials missing"
```
Solución: Ir a Meta Setup y configurar tokens
```

### "Webhook verification failed"
```
Solución: Verificar que META_VERIFY_TOKEN coincida con Meta
```

### "No sellers available"
```
Solución: Agregar vendedores en Dashboard → Sellers
```

### "Message not received"
```
Debug:
1. podman logs chatbot-cocolu | grep -i webhook
2. Verificar que Meta tenga la URL correcta
3. Verificar firewall puerto 3008
```

---

## 🎯 Checklist Mañana

- [ ] Configurar tokens en Meta Setup
- [ ] Crear al menos 1 vendedor
- [ ] Enviar mensaje de prueba desde WhatsApp
- [ ] Verificar logs: `podman logs -f chatbot-cocolu`
- [ ] Ver mensaje en Dashboard → Messages
- [ ] Verificar respuesta automática
- [ ] Probar comandos de testing (ESTADO BOT)
- [ ] Revisar Analytics

---

## 🚀 Sistema Listo Para Testing

**El bot ya tiene:**
- ✅ Meta provider configurado
- ✅ Webhooks listos
- ✅ Flujos de conversación
- ✅ Asignación automática de vendedores
- ✅ Logs detallados
- ✅ Dashboard real-time
- ✅ Comandos de debugging
- ✅ Testing mode

**Solo falta:** Tus tokens de Meta.

**Mañana podrás probar todo el flujo end-to-end.** 🎉
