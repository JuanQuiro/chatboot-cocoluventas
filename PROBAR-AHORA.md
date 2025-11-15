# 🧪 PROBAR FLUJO RÁPIDO - Guía Inmediata

## ⚡ Inicio Rápido

### **Opción 1: Script Automático (Recomendado)**

```bash
./test-flujo-rapido.sh
```

Este script:
- ✅ Inicia todo el sistema
- ✅ Verifica que esté funcionando
- ✅ Muestra cómo probar
- ✅ Muestra logs en tiempo real

### **Opción 2: Manual**

```bash
# 1. Iniciar sistema
./start-production.sh

# 2. En otra terminal, enviar mensaje de prueba
./test-mensaje-rapido.sh

# 3. Ver logs
tail -f logs/node-api.log
```

---

## 🧪 Probar el Flujo

### **Método 1: Simular Mensaje (Más Rápido)**

```bash
./test-mensaje-rapido.sh
```

Esto envía un mensaje "hola" al bot y deberías ver:
- ✅ El bot recibe el mensaje
- ✅ Procesa el flujo welcome
- ✅ Responde con el menú

### **Método 2: Desde WhatsApp Real**

1. Asegúrate de que el webhook esté configurado en Meta Developers
2. Envía un mensaje desde WhatsApp al número: **+1 555 141 0797**
3. Escribe: **hola**
4. El bot debería responder

---

## 📊 Verificar que Funciona

### **1. Verificar que los servicios están corriendo:**

```bash
# Ver procesos
ps aux | grep -E "cocolu_rs_perf|app-integrated"

# Verificar puertos
curl http://localhost:3008/api/health
curl http://localhost:3009/health
```

### **2. Ver logs en tiempo real:**

```bash
# Logs de Node.js (donde verás los mensajes)
tail -f logs/node-api.log

# Logs de Rust (métricas)
tail -f logs/rust-api.log

# Ambos
tail -f logs/*.log
```

### **3. Ver dashboard:**

Abre en el navegador: http://localhost:3009/

---

## 🎯 Flujos Disponibles para Probar

Una vez que el bot responda a "hola", puedes probar:

1. **Menú principal** - Responde "hola" o "menu"
2. **Opción 1** - "asesor" o "1" - Hablar con asesor
3. **Opción 2** - "catalogo" o "2" - Ver catálogo
4. **Opción 3** - "pedido" o "3" - Info de pedido
5. **Opción 4** - "horarios" o "4" - Horarios
6. **Opción 5** - "problema" o "5" - Reportar problema

---

## 🐛 Si algo no funciona

### **El bot no responde:**

1. Verifica que el sistema esté corriendo:
   ```bash
   curl http://localhost:3008/api/health
   ```

2. Revisa los logs:
   ```bash
   tail -f logs/node-api.log | grep -i error
   ```

3. Verifica credenciales Meta:
   ```bash
   grep META .env
   ```

### **Error de webhook:**

- Si usas Meta real, asegúrate de configurar el webhook en Meta Developers
- Para pruebas locales, usa ngrok:
  ```bash
  ngrok http 3008
  ```

---

## 🛑 Detener el Sistema

```bash
./stop-production.sh
```

O presiona `Ctrl+C` en la terminal donde está corriendo.

---

**¡Listo para probar! 🚀**
