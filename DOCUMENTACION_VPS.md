# 📋 DOCUMENTACIÓN VPS - Chatbot Cocoluventas

## 🔐 Credenciales VPS

```
Host: 173.249.205.142
Usuario: root
Contraseña: a9psHSvLyrKock45yE2F
Puerto SSH: 22
```

## 📍 Rutas en VPS

```
Directorio principal: /opt/cocolu-bot
Archivo principal: /opt/cocolu-bot/production/app-integrated.js
Contenedor Docker: chatbot-cocolu
```

## 🐳 Comandos Docker/Podman Útiles

### Ver estado del contenedor
```bash
ssh root@173.249.205.142 'podman ps'
```

### Ver logs del contenedor
```bash
ssh root@173.249.205.142 'podman logs chatbot-cocolu -f'
```

### Ver últimas líneas de logs
```bash
ssh root@173.249.205.142 'podman logs chatbot-cocolu | tail -100'
```

### Buscar logs específicos (ej: errores de actualización)
```bash
ssh root@173.249.205.142 'podman logs chatbot-cocolu | grep -A 50 "SELLER UPDATE REQUEST"'
```

### Reiniciar contenedor
```bash
ssh root@173.249.205.142 'podman-compose -f /opt/cocolu-bot/docker-compose.yml down && podman-compose -f /opt/cocolu-bot/docker-compose.yml up -d'
```

## 🚀 Desplegar Cambios

### Proceso completo de deploy:
```bash
cd /home/alberto/Documentos/chatboot-cocoluventas

# 1. Hacer commit y push
git add -A
git commit -m "tu mensaje"
git push origin master

# 2. En el VPS, actualizar y reconstruir
ssh root@173.249.205.142 'cd /opt/cocolu-bot && git pull && podman-compose down && podman-compose build && podman-compose up -d && sleep 40 && echo LISTO'
```

### Si hay problemas de espacio en disco:
```bash
ssh root@173.249.205.142 'podman system prune -af'
```

## 🌐 URLs de Acceso

```
Dashboard: https://cocolu.emberdrago.com/dashboard
Vendedores: https://cocolu.emberdrago.com/sellers
Disponibilidad: https://cocolu.emberdrago.com/seller-availability
API Health: https://cocolu.emberdrago.com/api/health
```

## 📁 Estructura de Archivos Importante

```
production/
├── app-integrated.js          # Archivo principal del servidor
├── src/
│   ├── api/
│   │   ├── routes.js          # Rutas API principales (CRÍTICO)
│   │   ├── sellers.routes.js  # Rutas de vendedores (Mongoose)
│   │   └── sellers-management-routes.js  # Frontend HTML/JS (CRÍTICO)
│   └── services/
│       ├── sellers.service.js # Servicio de vendedores en memoria
│       └── analytics.service.js
└── package.json
```

## 🔧 Problema Actual: Modal de Edición de Vendedores

### Estado del Problema:
- El modal de edición de vendedores NO estaba cargando los datos actuales
- Esto causaba que siempre enviara "N/A" para email y phone
- El backend recibía "N/A" y no actualizaba esos campos

### Solución Implementada:
Se modificó la función `openEdit()` en `sellers-management-routes.js` para:
1. Hacer un fetch a `/api/sellers/:id` cuando se abre el modal
2. Cargar los datos actuales del vendedor desde el backend
3. Llenar todos los campos del formulario con los valores existentes
4. Ahora cuando se guarda, envía los datos reales en lugar de "N/A"

### Archivo Crítico:
`production/src/api/sellers-management-routes.js` - Línea donde está la función `openEdit()`

### Cambio Realizado:
```javascript
// ANTES (incorrecto):
function openEdit(id,name,status){
    currentSeller=id;
    currentStatus=status==='available'?'active':'inactive';
    document.getElementById('sellerName').value=name;
    document.getElementById('sellerEmail').value='';  // ❌ Vacío
    document.getElementById('sellerPhone').value='';  // ❌ Vacío
    // ... más campos vacíos
}

// DESPUÉS (correcto):
function openEdit(id,name,status){
    currentSeller=id;
    currentStatus=status==='available'?'active':'inactive';
    fetch(`/api/sellers/${id}`).then(r=>r.json()).then(d=>{
        const seller=d.data;
        document.getElementById('sellerName').value=seller.name||name;
        document.getElementById('sellerEmail').value=seller.email||'';  // ✅ Cargado
        document.getElementById('sellerPhone').value=seller.phone||'';  // ✅ Cargado
        // ... más campos cargados correctamente
    })
}
```

## 🐛 Debugging - Logs Importantes

### Para verificar que se actualiza correctamente:
```bash
ssh root@173.249.205.142 'podman logs chatbot-cocolu | grep -E "SELLER UPDATE|Email actualizado|Teléfono actualizado|VERIFICACIÓN DE PERSISTENCIA"'
```

### Logs que deberías ver después de guardar:
```
📝 SELLER UPDATE REQUEST RECIBIDO
Datos Recibidos: { name: "...", email: "test@test.com", phone: "0424242", ... }
✏️ Email actualizado a: test@test.com
✏️ Teléfono actualizado a: 0424242
✅ Vendedor actualizado exitosamente
🔍 VERIFICACIÓN DE PERSISTENCIA:
✅ Vendedor verificado en memoria: { ... email: "test@test.com", phone: "0424242", ... }
```

## 🔍 Endpoints API Principales

### GET /api/health
Retorna estado general del sistema y datos de vendedores

### GET /api/sellers
Retorna lista de todos los vendedores

### GET /api/sellers/:id
Retorna datos de un vendedor específico

### POST /api/seller/:id/update
Actualiza datos de un vendedor
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "specialty": "string",
  "maxClients": "number",
  "avgResponse": "number",
  "notes": "string",
  "workStart": "HH:MM",
  "workEnd": "HH:MM",
  "notificationInterval": "number",
  "daysOff": ["Lunes", "Martes", ...],
  "status": "active|inactive"
}
```

### POST /api/seller/:id/status
Cambia estado activo/inactivo de un vendedor

## 💾 Almacenamiento de Datos

**IMPORTANTE**: Los datos se guardan EN MEMORIA en `sellersManager`, NO en base de datos.
- Cuando se reinicia el contenedor, se pierden todos los cambios
- Los datos iniciales se cargan desde un archivo o se crean por defecto
- Para persistencia real, se necesitaría integrar MongoDB o PostgreSQL

## ⚠️ Problemas Conocidos

1. **502 Bad Gateway**: El servidor Node.js está caído
   - Solución: Revisar logs con `podman logs chatbot-cocolu`
   - Buscar errores de sintaxis o crashes

2. **Datos no persisten después de reiniciar**: Es normal, están en memoria
   - Solución: Implementar base de datos real

3. **Espacio en disco lleno**: Podman acumula imágenes viejas
   - Solución: `podman system prune -af`

## 📝 Próximos Pasos Sugeridos

1. ✅ Verificar que el modal carga datos correctamente
2. ✅ Probar actualizar email y phone de un vendedor
3. ✅ Verificar en logs que se actualiza correctamente
4. ⏳ (Opcional) Implementar persistencia en base de datos
5. ⏳ (Opcional) Agregar validaciones más robustas

## 🎯 Cómo Probar la Solución

1. Abre https://cocolu.emberdrago.com/sellers
2. Haz clic en "✏️ Editar" en cualquier vendedor
3. Verifica que los campos se llenen con los datos actuales
4. Cambia email a `test@test.com` y teléfono a `0424242`
5. Haz clic en "✅ Guardar Cambios"
6. Verifica en los logs que se actualiza correctamente
7. Recarga la página y verifica que los cambios persisten

## 📞 Contacto/Notas

- Repositorio: https://github.com/JuanQuiro/chatboot-cocoluventas
- Rama principal: master
- Última actualización: 2025-11-19
