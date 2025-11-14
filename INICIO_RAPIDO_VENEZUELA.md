# 🇻🇪 Inicio Rápido - Venezuela

## 📱 Guía para Conectar tu Bot con Número Venezolano

Esta guía está optimizada para números venezolanos y te ayudará a conectar tu bot de WhatsApp en minutos.

---

## ⚡ Inicio Rápido (3 pasos)

### 1. Instalar Dependencias

```bash
cd /home/guest/Documents/chatboot-cocoluventas
npm install
```

### 2. Configurar tu Número

El número **+58 424 437 0180** ya está configurado por defecto.

Si quieres cambiarlo, edita `.env`:

```bash
cp .env.example .env
nano .env
```

Busca y modifica:
```env
PHONE_NUMBER=+584244370180
```

### 3. Iniciar el Bot

```bash
npm start
```

¡Eso es todo! El CLI interactivo te guiará.

---

## 🎯 Método Recomendado: Número Telefónico

### ¿Por qué usar número en lugar de QR?

✅ **Más rápido** - Solo 8 dígitos, sin cámara  
✅ **Más seguro** - No necesitas mostrar QR en pantalla  
✅ **Más fácil** - Copias y pegas el código  
✅ **Funciona mejor** - Menos problemas de conexión  

### Formato de Números Venezolanos

| Formato Original | Formato Correcto |
|-----------------|------------------|
| `04244370180` | `+584244370180` |
| `0424-437-0180` | `+584244370180` |
| `424 437 0180` | `+584244370180` |
| `58 424 437 0180` | `+584244370180` |

**Regla**: Siempre usa `+58` seguido de 10 dígitos (sin el 0 inicial).

---

## 📋 Flujo Completo Paso a Paso

### Paso 1: Ejecutar el CLI

```bash
npm start
```

Verás:

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║        🤖 COCOLU VENTAS - BOT DE WHATSAPP             ║
║              Ember Drago - Venezuela                   ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

📱 Número configurado: +58 424 437 0180

? ¿Cómo deseas conectar el bot?
  ❯ 🔢 Número telefónico (Recomendado)
    📷 QR Code
```

### Paso 2: Elegir "Número telefónico"

Presiona **Enter** (ya está seleccionado por defecto).

### Paso 3: Confirmar tu Número

```
? ¿Usar el número +584244370180? (Y/n)
```

Presiona **Enter** para confirmar.

### Paso 4: Guardar Preferencia

```
? ¿Guardar esta preferencia para próximos inicios? (Y/n)
```

Presiona **Enter** para guardar.

### Paso 5: Esperar el Código

Verás algo como:

```
🔥 =======================================
🔢 CÓDIGO DE VINCULACIÓN GENERADO
🔥 =======================================

📱 Tu código de vinculación es:

     ╔═══════════════╗
     ║  1234-5678  ║
     ╚═══════════════╝

📝 INSTRUCCIONES:

1️⃣  Abre WhatsApp en tu teléfono
2️⃣  Ve a: Ajustes → Dispositivos vinculados
3️⃣  Toca: "Vincular un dispositivo"
4️⃣  Selecciona: "Vincular con número de teléfono"
5️⃣  Ingresa el código: 1234-5678

⏰ El código expira en 60 segundos
```

### Paso 6: En tu Teléfono

1. **Abre WhatsApp**
2. Ve a **Ajustes** (⚙️ arriba a la derecha)
3. Toca **"Dispositivos vinculados"**
4. Toca **"Vincular un dispositivo"**
5. Selecciona **"Vincular con número de teléfono"**
6. Ingresa el código: `1234-5678`

### Paso 7: ¡Listo!

Verás:

```
✅ ¡BOT CONECTADO Y LISTO!

🤖 =======================================
🤖   SISTEMA COMPLETAMENTE INICIALIZADO
🤖 =======================================
```

---

## 🎮 Comandos Disponibles

```bash
# Inicio interactivo (CLI)
npm start

# Inicio directo con número
npm run start:phone

# Inicio directo con QR
npm run start:qr

# Desarrollo con reinicio automático
npm run dev

# Producción con PM2
npm run prod:pm2
```

---

## 🔧 Solución de Problemas

### Problema 1: "Número inválido"

**Causa**: Formato incorrecto del número

**Solución**:
```bash
# Editar .env
nano .env

# Usar formato correcto
PHONE_NUMBER=+584244370180
# NO uses: 04244370180
# NO uses: 0424-437-0180
```

### Problema 2: "Código expirado"

**Causa**: Tardaste más de 60 segundos

**Solución**:
- El bot generará un nuevo código automáticamente
- Espera 5 segundos
- Verás un nuevo código
- Ingrésalo rápido (tienes 60 segundos)

### Problema 3: "Error de conexión"

**Causa**: Problemas de internet

**Solución**:
1. **Usa datos móviles** en tu teléfono (no WiFi)
2. **Desactiva VPN** si tienes
3. **Verifica tu internet** en la computadora
4. Reinicia el bot: `Ctrl+C` y luego `npm start`

### Problema 4: "AUTH FAILURE"

**Causa**: Sesión anterior corrupta

**Solución**:
```bash
# Limpiar sesiones
rm -rf bot_principal_sessions/
rm -rf auth/
rm -rf tokens/

# Reiniciar bot
npm start
```

### Problema 5: "inquirer not found"

**Causa**: Dependencias no instaladas

**Solución**:
```bash
npm install
npm start
```

---

## 💡 Consejos para Venezuela

### 🌐 Internet

- **Usa datos móviles** para vincular (más estable que WiFi)
- **Evita VPN** durante la vinculación
- **Verifica tu conexión** antes de iniciar

### 📱 WhatsApp

- **Cierra WhatsApp Web** en navegadores
- **Actualiza WhatsApp** a la última versión
- **Libera espacio** en tu teléfono (al menos 100MB)

### ⚡ Velocidad

- **Copia el código** antes de ir al teléfono
- **Ten WhatsApp abierto** antes de iniciar el bot
- **Ingresa el código rápido** (60 segundos)

---

## 📊 Operadores Venezolanos Compatibles

✅ **Movistar** - Totalmente compatible  
✅ **Digitel** - Totalmente compatible  
✅ **Movilnet** - Totalmente compatible  

Todos los operadores venezolanos funcionan correctamente.

---

## 🎯 Formatos de Número por Operador

### Movistar (0414, 0424)
```
Original: 0424 437 0180
Correcto: +584244370180
```

### Digitel (0412)
```
Original: 0412 123 4567
Correcto: +584121234567
```

### Movilnet (0416, 0426)
```
Original: 0416 987 6543
Correcto: +584169876543
```

**Regla general**: `+58` + (número sin el 0 inicial)

---

## 🚀 Próximos Pasos

Una vez conectado:

1. **Probar el bot**
   - Envíate un mensaje: `hola`
   - Deberías recibir el menú principal

2. **Personalizar**
   - Edita flujos en `src/flows/`
   - Configura tu negocio en `.env`

3. **Producción**
   - Usa PM2: `npm run prod:pm2`
   - Configura inicio automático

---

## 📚 Documentación Adicional

- `README.md` - Documentación completa
- `GUIA_CONEXION_TELEFONO.md` - Guía detallada
- `docs/guias/` - Más guías
- `ANALISIS_SRC_VS_SRC-TS.md` - Análisis técnico

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa esta guía
2. Ejecuta: `bash scripts/utils/verificar-actualizacion.sh`
3. Revisa logs: `npm run dev`
4. Consulta: `docs/`

---

## ✅ Checklist de Verificación

Antes de considerar que funciona:

- [ ] `npm install` ejecutado sin errores
- [ ] `.env` configurado con tu número
- [ ] `npm start` ejecutado
- [ ] Código de 8 dígitos recibido
- [ ] Código ingresado en WhatsApp
- [ ] Mensaje "BOT CONECTADO" visible
- [ ] Bot responde a "hola"
- [ ] Dashboard accesible (http://localhost:3009)

---

**¡Tu bot está listo para Venezuela! 🇻🇪**

Siguiente paso: Personaliza los mensajes y flujos según tu negocio.
