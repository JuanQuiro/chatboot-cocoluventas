# 🔧 Configuración de Node.js con fnm

## 🎯 Objetivo

Instalar Node.js de forma **permanente, rápida y definitiva** usando **fnm** (Fast Node Manager).

---

## ⚡ ¿Por qué fnm?

| Característica | fnm | nvm | asdf |
|---|---|---|---|
| **Velocidad** | ⚡⚡⚡ Rápido (Rust) | ⚡ Lento (Bash) | ⚡⚡ Medio |
| **Instalación** | Única | Única | Única |
| **Cambio automático** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Específico Node** | ✅ Sí | ✅ Sí | ❌ Polivalente |
| **Tamaño** | 📦 Pequeño | 📦 Pequeño | 📦 Grande |

**fnm es la mejor opción para desarrollo Node.js puro.**

---

## 📋 Instalación (5 pasos)

### Paso 1: Instalar fnm

```bash
curl -fsSL https://fnm.io/install | bash
```

**Alternativa si curl no funciona:**
```bash
wget -qO- https://fnm.io/install | bash
```

### Paso 2: Configurar el shell

Abre tu archivo de configuración del shell:

**Para Bash:**
```bash
nano ~/.bashrc
```

**Para Zsh:**
```bash
nano ~/.zshrc
```

**Para Fish:**
```bash
nano ~/.config/fish/config.fish
```

### Paso 3: Agregar fnm al shell

Agrega esta línea al final del archivo:

```bash
eval "$(fnm env --use-on-cd)"
```

**Para Fish, usa esto:**
```fish
fnm env --use-on-cd | source
```

### Paso 4: Recargar el shell

```bash
source ~/.bashrc
# o
source ~/.zshrc
# o
source ~/.config/fish/config.fish
```

**O simplemente abre una nueva terminal.**

### Paso 5: Verificar instalación

```bash
fnm --version
```

Deberías ver algo como: `fnm 1.35.0`

---

## 📦 Instalar Node.js

### Opción A: Instalar LTS (Recomendado)

```bash
fnm install --lts
fnm use lts-latest
```

### Opción B: Instalar versión específica

```bash
fnm install 20.11.0
fnm use 20.11.0
```

### Opción C: Instalar latest

```bash
fnm install --latest
fnm use latest
```

---

## ✅ Verificar Instalación

```bash
node --version
# Debe mostrar: v20.11.0

npm --version
# Debe mostrar: 10.2.4 (o similar)

fnm current
# Debe mostrar: v20.11.0
```

---

## 🚀 Usar en el Proyecto

### Paso 1: Navega al proyecto

```bash
cd /home/guest/Documents/chatboot-cocoluventas
```

### Paso 2: fnm detecta automáticamente

fnm lee `.node-version` y cambia automáticamente a la versión correcta.

```bash
# fnm cambió a v20.11.0 automáticamente
node --version
# v20.11.0
```

### Paso 3: Instalar dependencias

```bash
npm install
```

### Paso 4: Iniciar el bot

```bash
npm start
```

---

## 🔄 Cambiar de Versión

### Listar versiones instaladas

```bash
fnm list
```

### Cambiar a otra versión

```bash
fnm use 18.0.0
```

### Instalar otra versión

```bash
fnm install 18.0.0
fnm use 18.0.0
```

---

## 🎯 Configuración Automática del Proyecto

El proyecto tiene 2 archivos de configuración:

### `.node-version` (fnm)
```
20.11.0
```

### `.nvmrc` (nvm)
```
20.11.0
```

Cuando entres al directorio:
- **Con fnm**: Cambia automáticamente a v20.11.0
- **Con nvm**: Cambia automáticamente a v20.11.0

---

## 🆘 Solución de Problemas

### Problema 1: "fnm: command not found"

**Causa**: fnm no está en el PATH

**Solución**:
```bash
# Verifica que fnm esté instalado
ls ~/.local/bin/fnm

# Si existe, agrega al PATH en ~/.bashrc
export PATH="$HOME/.local/bin:$PATH"

# Recarga
source ~/.bashrc
```

### Problema 2: "No version found"

**Causa**: La versión no está disponible

**Solución**:
```bash
# Listar versiones disponibles
fnm list-remote

# Instalar una disponible
fnm install 20.11.0
```

### Problema 3: "npm: command not found"

**Causa**: npm no se instaló con Node.js

**Solución**:
```bash
# Reinstala Node.js
fnm uninstall 20.11.0
fnm install 20.11.0
fnm use 20.11.0
```

---

## 📊 Verificación Final

Ejecuta esto para verificar que todo funciona:

```bash
# 1. Verificar fnm
fnm --version

# 2. Verificar Node.js
node --version

# 3. Verificar npm
npm --version

# 4. Navegar al proyecto
cd /home/guest/Documents/chatboot-cocoluventas

# 5. Verificar versión automática
node --version
# Debe ser v20.11.0

# 6. Instalar dependencias
npm install

# 7. Iniciar bot
npm start
```

---

## 🎯 Resumen

| Paso | Comando |
|------|---------|
| 1. Instalar fnm | `curl -fsSL https://fnm.io/install \| bash` |
| 2. Configurar shell | Editar `~/.bashrc` o `~/.zshrc` |
| 3. Agregar fnm | `eval "$(fnm env --use-on-cd)"` |
| 4. Recargar shell | `source ~/.bashrc` |
| 5. Instalar Node.js | `fnm install --lts` |
| 6. Usar Node.js | `fnm use lts-latest` |
| 7. Verificar | `node --version` |
| 8. Ir al proyecto | `cd chatboot-cocoluventas` |
| 9. Instalar deps | `npm install` |
| 10. Iniciar bot | `npm start` |

---

## ✅ Después de Instalar fnm

Una vez instalado fnm, **nunca más necesitarás instalar Node.js nuevamente**:

- ✅ fnm se encarga de todo
- ✅ Cambio automático de versiones
- ✅ Instalación única y definitiva
- ✅ Rápido y confiable

---

## 📚 Documentación Oficial

- **fnm**: https://fnm.io/
- **Node.js**: https://nodejs.org/
- **npm**: https://www.npmjs.com/

---

**Versión**: 5.1.0  
**Fecha**: 2025-11-14  
**Estado**: ✅ Listo para usar
