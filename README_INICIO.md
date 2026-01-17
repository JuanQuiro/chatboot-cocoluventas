# 🚀 Guía de Inicio Rápido - Cocolu Ventas

## Inicio Automático (Recomendado)

### Windows
Simplemente haz **doble clic** en:
```
start.bat
```

Esto iniciará automáticamente:
1. ✅ Backend en http://localhost:3008
2. ✅ Frontend en http://localhost:3000
3. ✅ Abrirá el navegador automáticamente

---

## Inicio Manual

### 1. Iniciar Backend
```bash
npm run dev
```
El backend se iniciará en http://localhost:3008

### 2. Iniciar Frontend (en otra terminal)
```bash
cd dashboard
npm start
```
El frontend se iniciará en http://localhost:3000

---

## Verificación

Una vez iniciado, verifica que todo funcione:

- ✅ Backend: http://localhost:3008/api/health
- ✅ Frontend: http://localhost:3000
- ✅ Dashboard: http://localhost:3000/dashboard

---

## Detener el Sistema

### Si usaste start.bat:
Cierra las 2 ventanas de comandos que se abrieron

### Si iniciaste manualmente:
Presiona `Ctrl+C` en cada terminal

---

## Solución de Problemas

### Error: "Puerto ya en uso"
```bash
# Detener procesos en puerto 3000 y 3008
taskkill /F /IM node.exe
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
npm install
cd dashboard && npm install
```

### El navegador no abre automáticamente
Abre manualmente: http://localhost:3000

---

## Configuración

### Variables de Entorno

**Backend** (`.env` en raíz):
- Puerto: 3008
- Base de datos: SQLite local

**Frontend** (`dashboard/.env`):
```
REACT_APP_API_URL=http://localhost:3008/api
```

---

## Características Implementadas

✅ Sistema de ventas completo
✅ Gestión de inventario
✅ Gestión de clientes
✅ Cuentas por cobrar
✅ Reportes y dashboard
✅ Diseño moderno con animaciones
✅ Validación de datos
✅ Manejo de errores

---

## Soporte

Para más información, consulta la documentación en `/docs`
