# 🖥️ CLI Inteligente - Guía Completa

## 📋 Índice

1. [Introducción](#introducción)
2. [Instalación](#instalación)
3. [Uso](#uso)
4. [Flujo Paso a Paso](#flujo-paso-a-paso)
5. [Opciones](#opciones)
6. [Ejemplos](#ejemplos)

---

## 🎯 Introducción

El CLI inteligente es una herramienta interactiva que guía el startup del bot paso a paso:

- ✅ Selecciona adaptador WhatsApp
- ✅ Elige método de vinculación (QR o Pairing Code)
- ✅ Configura número telefónico
- ✅ Compila y ejecuta automáticamente
- ✅ Muestra guía de inicio
- ✅ Monitorea en tiempo real

---

## 📦 Instalación

### Instalar dependencias del CLI

```bash
npm install chalk ora
```

O instalar todas las dependencias:

```bash
npm install
```

---

## 🚀 Uso

### Iniciar con CLI

```bash
npm run rs:cli
```

### Flujo Interactivo

```
1. Selecciona Adaptador
   ├─ Baileys (Recomendado)
   ├─ Venom (Alternativa)
   └─ WPPConnect (Alternativa)

2. Selecciona Método de Vinculación
   ├─ Código de Vinculación (6 dígitos)
   └─ Código QR

3. Ingresa Número Telefónico
   └─ Formato: +584244370180

4. Confirma Configuración
   └─ Resumen de opciones

5. Compila y Ejecuta
   ├─ Compila Rust (release)
   └─ Inicia bot con configuración
```

---

## 📝 Flujo Paso a Paso

### Paso 1: Seleccionar Adaptador

```
📱 Selecciona Adaptador WhatsApp:

  1. 🏆 Baileys
     Recomendado - Más compatible

  2. ⚠️  Venom
     Alternativa - Fallback 1

  3. ⚠️  WPPConnect
     Alternativa - Fallback 2

Opción (1-3): 1
```

**Explicación:**
- **Baileys**: Más compatible, mejor mantenimiento, recomendado
- **Venom**: Alternativa si Baileys falla
- **WPPConnect**: Alternativa si Venom falla

### Paso 2: Seleccionar Método de Vinculación

```
🔐 Método de Vinculación:

  1. 📱 Código de Vinculación (Recomendado)
     - Más seguro
     - Ingresa 6 dígitos en WhatsApp

  2. 🔲 Código QR
     - Escanea con WhatsApp

Opción (1-2): 1
```

**Explicación:**
- **Pairing Code**: Más seguro, ingresa 6 dígitos
- **QR**: Escanea con WhatsApp

### Paso 3: Número Telefónico

```
📞 Número Telefónico:

Formato: +584244370180 (con +)

Número: +584244370180
```

**Formato requerido:**
- Debe empezar con `+`
- Código de país (58 para Venezuela)
- 10-15 dígitos totales

### Paso 4: Confirmar Configuración

```
✅ Configuración Resumen:

  Adaptador:    Baileys
  Vinculación:  Código (6 dígitos)
  Número:       +584244370180

¿Continuar? (s/n): s
```

### Paso 5: Compilar y Ejecutar

```
🚀 Iniciando bot...

✅ Compilación completada
🔗 Conectando a WhatsApp...

📋 Guía de Inicio:

1️⃣  El bot generará un código de 6 dígitos
   Ejemplo: 123-456

2️⃣  Abre WhatsApp en tu teléfono
   Configuración → Dispositivos vinculados → Vincular dispositivo

3️⃣  Ingresa el código
   El bot se conectará automáticamente

✨ Una vez conectado:

  - API disponible en http://localhost:3009
  - Health check: curl http://localhost:3009/health
  - Enviar mensaje: curl -X POST http://localhost:3009/send
  - Ver QR/Pairing: curl http://localhost:3009/qr
```

---

## 🎛️ Opciones

### Adaptadores

| Opción | Nombre | Descripción |
|--------|--------|-------------|
| 1 | Baileys | Recomendado, más compatible |
| 2 | Venom | Alternativa, fallback 1 |
| 3 | WPPConnect | Alternativa, fallback 2 |

### Métodos de Vinculación

| Opción | Método | Descripción |
|--------|--------|-------------|
| 1 | Pairing Code | 6 dígitos, más seguro |
| 2 | QR | Escanear con WhatsApp |

### Número Telefónico

- Formato: `+[código país][número]`
- Ejemplo: `+584244370180`
- Validación: 10-15 dígitos

---

## 💡 Ejemplos

### Ejemplo 1: Configuración Recomendada

```bash
$ npm run rs:cli

# Seleccionar:
# 1. Baileys
# 2. Pairing Code
# +584244370180
# s (confirmar)

# Resultado: Bot conectado con Baileys + Pairing Code
```

### Ejemplo 2: Usar Venom

```bash
$ npm run rs:cli

# Seleccionar:
# 2. Venom
# 1. Pairing Code
# +584244370180
# s (confirmar)

# Resultado: Bot conectado con Venom + Pairing Code
```

### Ejemplo 3: Usar QR

```bash
$ npm run rs:cli

# Seleccionar:
# 1. Baileys
# 2. QR
# +584244370180
# s (confirmar)

# Resultado: Bot genera QR para escanear
```

---

## 🔍 Características del CLI

✅ **Interfaz Colorida**
- Colores para mejor legibilidad
- Iconos descriptivos
- Formato ordenado

✅ **Validación**
- Verifica opciones válidas
- Valida formato de número
- Reintentos si hay error

✅ **Guía Integrada**
- Explicaciones en cada paso
- Instrucciones claras
- Ejemplos de uso

✅ **Compilación Automática**
- Compila Rust en release
- Muestra progreso
- Maneja errores

✅ **Ejecución Automática**
- Inicia bot con configuración
- Muestra logs en tiempo real
- Mantiene proceso activo

---

## 🐛 Troubleshooting

### "Opción inválida"

```bash
# Ingresa un número entre 1-3 (o 1-2 según el paso)
Opción (1-3): 1  # ✅ Correcto
Opción (1-3): 4  # ❌ Inválido
```

### "Formato inválido"

```bash
# Usa formato con +
Número: +584244370180  # ✅ Correcto
Número: 584244370180   # ❌ Falta +
Número: +58 4244370180 # ❌ No espacios
```

### "Error de compilación"

```bash
# Verifica que Rust esté instalado
rustc --version
cargo --version

# Si no está instalado:
bash instalar-rust-gentoo.sh
```

### "Cancelado"

```bash
# Si cancelas en la confirmación, reinicia:
npm run rs:cli
```

---

## 📊 Flujo Completo

```
┌─────────────────────────────────────────┐
│  npm run rs:cli                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Banner + Bienvenida                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Seleccionar Adaptador                  │
│  (Baileys / Venom / WPPConnect)         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Seleccionar Método                     │
│  (Pairing Code / QR)                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Ingresar Número Telefónico             │
│  (+584244370180)                        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Confirmar Configuración                │
│  (Resumen)                              │
└──────────────┬──────────────────────────┘
               │
         ┌─────┴─────┐
         │           │
         ▼           ▼
        NO           SÍ
        │            │
        │            ▼
        │    ┌──────────────────┐
        │    │ Compilar Rust    │
        │    │ (release)        │
        │    └────────┬─────────┘
        │             │
        │             ▼
        │    ┌──────────────────┐
        │    │ Ejecutar Bot     │
        │    │ (con config)     │
        │    └────────┬─────────┘
        │             │
        │             ▼
        │    ┌──────────────────┐
        │    │ Mostrar Guía     │
        │    │ (paso a paso)    │
        │    └────────┬─────────┘
        │             │
        │             ▼
        │    ┌──────────────────┐
        │    │ Bot Conectado    │
        │    │ (listo para usar)│
        │    └──────────────────┘
        │
        └──→ Reiniciar CLI
```

---

## 🎓 Próximos Pasos

Una vez que el bot está conectado:

1. **Verificar conexión**
   ```bash
   curl http://localhost:3009/health | jq
   ```

2. **Ver QR/Pairing Code**
   ```bash
   curl http://localhost:3009/qr | jq
   curl http://localhost:3009/pairing | jq
   ```

3. **Enviar mensaje**
   ```bash
   curl -X POST http://localhost:3009/send \
     -H "Content-Type: application/json" \
     -d '{"to": "+584244370180", "text": "Hola"}'
   ```

4. **Ver métricas**
   ```bash
   curl http://localhost:3009/metrics | jq
   ```

---

**Versión:** 5.2.0  
**Última actualización:** 2025-11-14
