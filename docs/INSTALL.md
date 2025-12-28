# 🚀 Guía de Instalación Rápida - Ember Drago Edition

## Pasos de Instalación

### 1. Instalar Dependencias del Backend
```bash
npm install
```

### 2. Instalar Dependencias del Dashboard
```bash
cd dashboard
npm install
cd ..
```

O usar el script:
```bash
npm run dashboard:install
```

### 3. Iniciar el Sistema

#### Opción A: Solo Chatbot
```bash
npm run dev
```

Esto inicia:
- 🤖 Chatbot en puerto 3008
- 🌐 API REST en puerto 3009

#### Opción B: Chatbot + Dashboard (Recomendado)

**Terminal 1** (Backend):
```bash
npm run dev
```

**Terminal 2** (Frontend):
```bash
npm run dashboard
```

### 4. Acceder al Sistema

- 📱 **Chatbot**: Escanea el QR con WhatsApp
- 🌐 **Dashboard**: http://localhost:3000
- 🚀 **API**: http://localhost:3009/api/health

## ✅ Verificación

El sistema está funcionando correctamente si ves:

```
🤖 =======================================
🤖   CHATBOT COCOLU VENTAS - EMBER DRAGO
🤖 =======================================
🤖 Puerto Bot: 3008
🌐 Puerto API: 3009
🤖 Proveedor: Baileys (WhatsApp Web)
🤖 =======================================
📱 Escanea el código QR con WhatsApp
🌐 Dashboard: http://localhost:3009/dashboard
📊 API Docs: http://localhost:3009/api/health
🤖 =======================================
```

## 🎯 Primer Uso

1. **Escanear QR** con WhatsApp
2. **Enviar "Hola"** desde cualquier número
3. **Ver Dashboard** en http://localhost:3000
4. **Observar** cómo se asigna vendedor automáticamente

## 🐛 Troubleshooting

**Error: Cannot find module**
```bash
npm install
cd dashboard && npm install
```

**Dashboard no inicia**
```bash
cd dashboard
npm install react-scripts
npm start
```

**Puerto en uso**
```bash
# Cambiar puerto en .env
PORT=3010
API_PORT=3011
```

## 📞 Soporte

Desarrollado por **Ember Drago**
