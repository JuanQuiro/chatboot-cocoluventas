# 🚀 README PARA LA SIGUIENTE IA

## 🎯 Misión
Arreglar el modal de edición de vendedores para que guarde correctamente email, phone y otros datos.

## 🔐 Acceso VPS

```bash
# Conectarse al VPS
ssh root@173.249.205.142
# Contraseña: a9psHSvLyrKock45yE2F

# Ver logs en tiempo real
podman logs chatbot-cocolu -f

# Ver últimos 100 logs
podman logs chatbot-cocolu | tail -100
```

## 📍 Ubicaciones Importantes

```
Repositorio: /home/alberto/Documentos/chatboot-cocoluventas
VPS: /opt/cocolu-bot
Contenedor: chatbot-cocolu
```

## 🌐 URLs

- **Dashboard**: https://cocolu.emberdrago.com/dashboard
- **Vendedores**: https://cocolu.emberdrago.com/sellers
- **API Health**: https://cocolu.emberdrago.com/api/health

## 📁 Archivos Clave

1. **`production/src/api/sellers-management-routes.js`** ⭐ CRÍTICO
   - Contiene HTML/CSS/JavaScript del frontend
   - TODO está en una sola línea (muy difícil de editar)
   - Función `openEdit()` - Abre modal y carga datos
   - Función `saveSeller()` - Guarda cambios

2. **`production/src/api/routes.js`** ⭐ CRÍTICO
   - Endpoints API del backend
   - `POST /api/seller/:id/update` - Actualiza vendedor
   - `GET /api/sellers/:id` - Obtiene datos de vendedor
   - Tiene logging detallado para debugging

3. **`production/src/services/sellers.service.js`**
   - Servicio que maneja vendedores en memoria
   - `getStats()` - Retorna datos de vendedores

## 🔧 Problema Actual

**Estado**: Servidor respondiendo con 502 Bad Gateway

**Causa Probable**: Error de sintaxis en JavaScript (archivo muy largo)

**Solución**:
1. Ver logs: `ssh root@173.249.205.142 'podman logs chatbot-cocolu'`
2. Buscar errores de sintaxis
3. Si es necesario, refactorizar `sellers-management-routes.js`

## 🚀 Desplegar Cambios

```bash
# 1. Hacer cambios locales
# 2. Commit y push
git add -A
git commit -m "tu mensaje"
git push origin master

# 3. En el VPS (o via SSH)
ssh root@173.249.205.142 'cd /opt/cocolu-bot && git pull && podman-compose down && podman-compose build && podman-compose up -d && sleep 40 && echo LISTO'

# 4. Verificar que funciona
# Abre https://cocolu.emberdrago.com/sellers
```

## 🧪 Cómo Probar

1. Abre https://cocolu.emberdrago.com/sellers
2. Haz clic en "✏️ Editar" en un vendedor
3. Verifica que los campos se llenen con datos actuales
4. Cambia email y phone
5. Haz clic en "✅ Guardar Cambios"
6. Verifica en logs que se actualiza:
   ```bash
   ssh root@173.249.205.142 'podman logs chatbot-cocolu | grep -E "SELLER UPDATE|Email actualizado|Teléfono actualizado"'
   ```

## 📊 Logs Importantes

```bash
# Ver todos los logs
ssh root@173.249.205.142 'podman logs chatbot-cocolu'

# Ver logs de actualización de vendedor
ssh root@173.249.205.142 'podman logs chatbot-cocolu | grep "SELLER UPDATE"'

# Ver logs de email/phone
ssh root@173.249.205.142 'podman logs chatbot-cocolu | grep -E "Email|Teléfono"'

# Ver últimos 50 logs
ssh root@173.249.205.142 'podman logs chatbot-cocolu | tail -50'

# Buscar errores
ssh root@173.249.205.142 'podman logs chatbot-cocolu | grep -i error'
```

## 💾 Datos

**IMPORTANTE**: Los datos se guardan EN MEMORIA, no en base de datos.
- Se pierden cuando se reinicia el contenedor
- Para persistencia real, se necesita MongoDB o PostgreSQL

## ⚠️ Errores Comunes

| Error | Solución |
|-------|----------|
| 502 Bad Gateway | Ver logs, buscar errores de sintaxis |
| Espacio en disco lleno | `ssh root@173.249.205.142 'podman system prune -af'` |
| Cambios no se guardan | Verificar logs, revisar endpoint `/api/seller/:id/update` |
| Modal no carga datos | Revisar función `openEdit()` en `sellers-management-routes.js` |

## 📚 Documentación Completa

Lee estos archivos para más detalles:
- `DOCUMENTACION_VPS.md` - Guía completa del VPS
- `ESTADO_ACTUAL.md` - Estado actual del proyecto

## 🎯 Checklist Rápido

- [ ] ¿El servidor está corriendo? (sin 502 Bad Gateway)
- [ ] ¿El modal carga datos correctamente?
- [ ] ¿Se pueden editar email y phone?
- [ ] ¿Los cambios se guardan en memoria?
- [ ] ¿Los logs muestran la actualización?

## 🆘 Si Algo Falla

1. **Paso 1**: Ver logs
   ```bash
   ssh root@173.249.205.142 'podman logs chatbot-cocolu -f'
   ```

2. **Paso 2**: Buscar errores
   ```bash
   ssh root@173.249.205.142 'podman logs chatbot-cocolu | grep -i error'
   ```

3. **Paso 3**: Reiniciar contenedor
   ```bash
   ssh root@173.249.205.142 'cd /opt/cocolu-bot && podman-compose down && podman-compose up -d'
   ```

4. **Paso 4**: Si persiste, revisar código
   - Verificar sintaxis de JavaScript
   - Revisar endpoints API
   - Buscar typos en nombres de funciones

## 📞 Resumen

**Objetivo**: Modal de edición guarde email y phone correctamente
**Estado**: Código implementado, servidor con 502 Bad Gateway
**Próximo Paso**: Debuggear por qué el servidor está caído
**Contacto**: Ver `DOCUMENTACION_VPS.md` para más detalles

---

**Última actualización**: 2025-11-19
**Repositorio**: https://github.com/JuanQuiro/chatboot-cocoluventas
