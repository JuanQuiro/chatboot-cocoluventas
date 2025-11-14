# 📊 GUÍA DE ANÁLISIS DEL BOT COCOLU

## ✅ ESTADO ACTUAL DEL SISTEMA

### Proceso
- **PID**: 9270
- **Estado**: ✅ En ejecución
- **Uptime**: 27.78 segundos
- **Memoria**: ~125 MB

### Puertos
- **3008**: Bot HTTP Server (WhatsApp)
- **3009**: API REST + Dashboard

### Endpoints Verificados
- ✅ `/api/health` - Respondiendo correctamente
- ✅ `/api/open/messages` - Respondiendo correctamente
- ✅ `/` - Dashboard principal
- ✅ `/analytics` - Panel de análisis

---

## 📱 CÓMO PROBAR EL BOT

### Paso 1: Acceder al Dashboard de Análisis
```
http://localhost:3009/analytics
```

### Paso 2: Escanear QR
```
http://localhost:3009/qr
```
- Abre esta URL en el navegador
- Escanea el código QR con WhatsApp
- El bot se conectará

### Paso 3: Enviar Mensajes
- Abre WhatsApp en tu teléfono
- Busca el número del bot
- Envía un mensaje (ej: "Hola")
- **Verás el mensaje aparecer en tiempo real** en `/analytics`

---

## 📊 DASHBOARD DE ANÁLISIS

**URL**: `http://localhost:3009/analytics`

### Qué Verás:

#### 1. **Estadísticas en Tiempo Real**
```
📥 Mensajes Recibidos: 0
📤 Mensajes Enviados: 0
⚠️ Errores: 0
⏱️ Uptime: 27s
```

#### 2. **Logs de Mensajes Recibidos**
```
[HH:MM:SS] [RECIBIDO] De: +58XXXXXXXXX
📝 Hola
```

#### 3. **Logs de Mensajes Enviados**
```
[HH:MM:SS] [ENVIADO] Para: +58XXXXXXXXX
📝 ¡Hola! Bienvenido a Cocolu Ventas
```

#### 4. **Errores Recientes**
```
[HH:MM:SS] ❌ Error: [descripción del error]
```

#### 5. **Estado del Sistema**
```
| Métrica | Valor |
|---------|-------|
| Estado | ✅ En línea |
| Uptime | 27s |
| Mensajes Recibidos | 0 |
| Mensajes Enviados | 0 |
| Errores | 0 |
| Última Actualización | HH:MM:SS |
```

---

## 🔄 AUTO-REFRESH

- **Actualización automática**: Cada 2 segundos
- **Botón de actualización manual**: "🔄 Actualizar Ahora"
- **Toggle de auto-refresh**: "⏸️ Auto-refresh: ON/OFF"

---

## 🔗 TODOS LOS ENDPOINTS

| URL | Descripción |
|-----|-------------|
| `http://localhost:3009` | Dashboard principal |
| `http://localhost:3009/analytics` | **Panel de análisis (RECOMENDADO)** |
| `http://localhost:3009/messages` | Vista simplificada de mensajes |
| `http://localhost:3009/qr` | Código QR para conectar |
| `http://localhost:3009/api/health` | Estado del sistema (JSON) |
| `http://localhost:3009/api/open/messages` | API de mensajes (JSON) |
| `http://localhost:3009/api/open/debug-snapshot` | Información técnica (JSON) |
| `http://localhost:3009/metrics` | Métricas Prometheus |

---

## 🧪 PRUEBAS RECOMENDADAS

### Test 1: Verificar Conexión
1. Abre `http://localhost:3009/qr`
2. Escanea el QR
3. Espera a que diga "✅ BOT CONECTADO Y LISTO"

### Test 2: Recibir Mensajes
1. Abre `http://localhost:3009/analytics`
2. Envía un mensaje en WhatsApp
3. Verifica que aparezca en "Últimos Mensajes Recibidos"

### Test 3: Enviar Mensajes
1. El bot debería responder automáticamente
2. Verifica que aparezca en "Últimos Mensajes Enviados"

### Test 4: Errores
1. Si hay errores, aparecerán en "Errores Recientes"
2. Analiza qué está causando el error

---

## 🐛 DEBUGGING

### Si no ves mensajes:

1. **Verifica que el bot esté conectado**
   ```
   http://localhost:3009/qr
   ```
   Debe decir "✅ BOT CONECTADO Y LISTO"

2. **Verifica los logs del servidor**
   ```bash
   tail -100 /tmp/bot.log
   ```

3. **Verifica que el mensaje sea válido**
   - El mensaje debe contener palabras clave
   - Ej: "hola", "1", "asesor", "catálogo", etc.

4. **Verifica el endpoint de mensajes**
   ```
   http://localhost:3009/api/open/messages
   ```
   Debe retornar JSON con arrays vacíos o con mensajes

---

## 📈 MÉTRICAS IMPORTANTES

### Mensajes Recibidos
- Contador de todos los mensajes que llegan
- Se actualiza en tiempo real
- Se almacenan los últimos 100

### Mensajes Enviados
- Contador de respuestas del bot
- Se actualiza cuando el bot responde
- Se almacenan los últimos 100

### Errores
- Contador de errores del sistema
- Se almacenan los últimos 50
- Incluye timestamp y descripción

### Uptime
- Tiempo que lleva el bot en línea
- Se reinicia cada vez que arrancas el bot
- Útil para detectar caídas

---

## 🔄 CICLO DE VIDA DE UN MENSAJE

```
1. Usuario envía mensaje en WhatsApp
   ↓
2. Bot recibe el mensaje
   ↓
3. Se almacena en messageLog.received
   ↓
4. Se procesa en los flujos
   ↓
5. Bot genera respuesta
   ↓
6. Se almacena en messageLog.sent
   ↓
7. Se envía al usuario
   ↓
8. Aparece en /analytics en tiempo real
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Bot corriendo (proceso Node activo)
- [ ] Puertos 3008 y 3009 abiertos
- [ ] Dashboard principal accesible (`http://localhost:3009`)
- [ ] Panel de análisis accesible (`http://localhost:3009/analytics`)
- [ ] QR visible (`http://localhost:3009/qr`)
- [ ] API de salud respondiendo (`http://localhost:3009/api/health`)
- [ ] API de mensajes respondiendo (`http://localhost:3009/api/open/messages`)
- [ ] Auto-refresh funcionando (actualiza cada 2 segundos)
- [ ] Puedes escanear el QR
- [ ] Puedes enviar mensajes en WhatsApp
- [ ] Los mensajes aparecen en `/analytics`

---

## 🚀 PRÓXIMOS PASOS

1. **Abre el panel de análisis**: `http://localhost:3009/analytics`
2. **Escanea el QR**: `http://localhost:3009/qr`
3. **Envía un mensaje** en WhatsApp
4. **Analiza los logs** en tiempo real
5. **Identifica problemas** si los hay

---

## 📞 SOPORTE

Si algo no funciona:

1. Verifica que el bot esté corriendo: `ps aux | grep node`
2. Verifica los logs: `tail -100 /tmp/bot.log`
3. Reinicia el bot: `pkill -9 node && cd /home/alberto/Documentos/chatboot-cocoluventas && node app-integrated.js &`
4. Accede al panel de análisis: `http://localhost:3009/analytics`

---

**¡Todo está listo para que analices el bot!**
