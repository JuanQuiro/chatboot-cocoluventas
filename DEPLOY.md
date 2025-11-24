# 🚀 Deploy Manual - Cocolu ChatBot

## Pasos para Deploy Completo

Ejecuta estos comandos **UNO POR UNO** en tu terminal local:

### 1. Conectar al servidor
```bash
ssh root@173.249.205.142
# Password: a9psHSvLyrKock45yE2F
```

### 2. Pull latest code
```bash
cd /root/apps/chatboot-cocoluventas
git pull origin master
```

### 3. Clean install (sin Baileys)
```bash
cd production
rm -rf node_modules
npm install --omit=dev --no-optional --legacy-peer-deps
```

### 4. Rebuild Docker image
```bash
cd /root/apps/chatboot-cocoluventas
podman build -t chatboot-cocoluventas_chatbot .
```

### 5. Stop old container
```bash
podman stop chatbot-cocolu
podman rm chatbot-cocolu
```

### 6. Start new container
```bash
podman run -d --name chatbot-cocolu -p 3008:3008 \
  -v /root/apps/chatboot-cocoluventas/database:/app/database:Z \
  -v /root/apps/chatboot-cocoluventas/credentials/.env.production:/app/production/.env:Z \
  localhost/chatboot-cocoluventas_chatbot:latest
```

### 7. Verify
```bash
podman ps | grep chatbot
podman logs chatbot-cocolu | grep -E "(Listening|BOT_ADAPTER|Provider)" | tail -10
```

### 8. Check provider
```bash
podman logs chatbot-cocolu 2>&1 | grep -i "adapter\|provider" | head -20
```

---

## ✅ Qué esperar ver:

**En los logs debe aparecer:**
- `BOT_ADAPTER: meta` o similar
- `Provider: MetaProvider` o `meta`
- **NO debe decir** `baileys` o `BaileysProvider`

**En http://173.249.205.142:3008/adapters:**
- Debe mostrar "meta" como provider activo

---

## 🔧 Para futuros deploys:

**Ejecuta estos 3 comandos en tu PC local:**

```bash
# 1. Commit tus cambios
cd /home/alberto/Documentos/chatboot-cocoluventas
git add -A
git commit -m "tu mensaje"
git push origin master

# 2. Deploy al servidor (copia TODO el bloque)
ssh root@173.249.205.142 << 'DEPLOY'
cd /root/apps/chatboot-cocoluventas
git pull origin master
cd production && rm -rf node_modules
npm install --omit=dev --no-optional --legacy-peer-deps
cd /root/apps/chatboot-cocoluventas
podman build -t chatboot-cocoluventas_chatbot .
podman stop chatbot-cocolu && podman rm chatbot-cocolu
podman run -d --name chatbot-cocolu -p 3008:3008 \
  -v /root/apps/chatboot-cocoluventas/database:/app/database:Z \
  -v /root/apps/chatboot-cocoluventas/credentials/.env.production:/app/production/.env:Z \
  localhost/chatboot-cocoluventas_chatbot:latest
podman ps | grep chatbot
DEPLOY

# 3. Verificar deployment
ssh root@173.249.205.142 "podman logs chatbot-cocolu 2>&1 | grep -iE '(listening|bot_adapter|provider)' | tail -10"
```

---

## ⚠️ Si algo falla:

**Ver logs completos:**
```bash
ssh root@173.249.205.142 "podman logs chatbot-cocolu"
```

**Restart container:**
```bash
ssh root@173.249.205.142 "podman restart chatbot-cocolu"
```

**Ver qué está corriendo:**
```bash
ssh root@173.249.205.142 "podman ps -a"
```
