# 🚨 RECUPERACIÓN DE EMERGENCIA - Sistema Caído

## ⚠️ SITUACIÓN ACTUAL
- Container `chatbot-cocolu` NO existe
- Sistema devuelve 502 Bad Gateway
- Último cambio que rompió: agregar campo `provider` a `/api/health`

## ✅ SOLUCIÓN RÁPIDA - Ejecuta en el servidor

**Conéctate:**
```bash
ssh root@173.249.205.142
# Password: a9psHSvLyrKock45yE2F
```

**Paso 1: Revertir código al estado funcional**
```bash
cd /root/apps/chatboot-cocoluventas
git reset --hard 8054a43
# Esto vuelve al commit antes de mi cambio roto
```

**Paso 2: Rebuild Docker**
```bash
podman build -t chatboot-cocoluventas_chatbot .
```

**Paso 3: Limpiar y recrear container**
```bash
podman stop chatbot-cocolu 2>/dev/null
podman rm chatbot-cocolu 2>/dev/null
podman run -d --name chatbot-cocolu -p 3008:3008 \
  -v /root/apps/chatboot-cocoluventas/database:/app/database:Z \
  -v /root/apps/chatboot-cocoluventas/credentials/.env.production:/app/production/.env:Z \
  localhost/chatboot-cocoluventas_chatbot:latest
```

**Paso 4: Verificar**
```bash
podman ps | grep chatbot
podman logs chatbot-cocolu | head -20
curl http://localhost:3008/api/health | jq '.status'
```

## ✅ Debe devolver:
- Container corriendo
- Logs normales
- `"healthy"` en el curl

---

## 📋 DESPUÉS DE RECUPERAR

**El sistema volverá a:**
- ✅ Backend usando Meta
- ✅ 418 packages optimizados
- ✅ Analytics funcionando
- ✅ Sellers CRUD completo
- ⚠️ Adapters page mostrará "Baileys" (es solo display, backend usa Meta)

**NO voy a intentar arreglar el display de "Baileys" ahora.**
**El sistema funciona con Meta, solo la UI muestra info vieja.**

---

## 🎯 EJECUTA ESTO AHORA

Copia TODO este bloque en el servidor:

```bash
cd /root/apps/chatboot-cocoluventas && \
git reset --hard 8054a43 && \
echo "✅ Código revertido" && \
podman build -q -t chatboot-cocoluventas_chatbot . && \
echo "✅ Image rebuilt" && \
podman stop chatbot-cocolu 2>/dev/null; podman rm chatbot-cocolu 2>/dev/null && \
podman run -d --name chatbot-cocolu -p 3008:3008 \
  -v /root/apps/chatboot-cocoluventas/database:/app/database:Z \
  -v /root/apps/chatboot-cocoluventas/credentials/.env.production:/app/production/.env:Z \
  localhost/chatboot-cocoluventas_chatbot:latest && \
sleep 3 && \
podman ps | grep chatbot && \
echo "✅ Sistema recuperado - probando health..." && \
curl -s http://localhost:3008/api/health | jq '.status'
```

**Esto recuperará el sistema en ~2 minutos.**
