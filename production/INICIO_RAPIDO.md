# 🚀 Inicio Rápido - Cocolu Ventas

## 📋 Resumen

Tu proyecto está **completamente organizado y listo para producción**.

- ✅ **Desplegado en:** https://cocolu.emberdrago.com
- ✅ **Contenedor:** Podman en VPS
- ✅ **Estado:** Activo
- ⚠️ **Pendiente:** Actualizar credenciales Meta

## 🎯 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `app-integrated.js` | Aplicación principal |
| `package.json` | Dependencias |
| `.env` | Configuración (SECRETO) |
| `Dockerfile` | Imagen del contenedor |
| `docker-compose.yml` | Configuración Podman |
| `src/` | Código fuente |
| `dashboard/` | Frontend React |

## 🚀 Comandos Útiles

### En VPS (Producción)

```bash
# Iniciar el bot
cd /opt/cocolu-bot
podman-compose up -d

# Ver logs
podman logs cocolu-bot -f

# Reiniciar
podman-compose restart

# Detener
podman-compose down
```

### Localmente (Desarrollo)

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm start

# Compilar dashboard
cd dashboard && npm run build
```

## ⚠️ Problema: Error 401 de Meta

Si ves este error en los logs:
```
Error: Request failed with status code 401
```

**Solución:**
1. Abre `.env`
2. Actualiza estas variables:
   - `META_JWT_TOKEN`
   - `META_NUMBER_ID`
   - `META_VERIFY_TOKEN`
3. Reinicia el contenedor:
   ```bash
   podman-compose restart
   ```

## 📊 Estructura

```
chatboot-cocoluventas/
├── app-integrated.js      ← Aplicación principal
├── src/                   ← Código fuente
├── dashboard/             ← Frontend React
├── docker-compose.yml     ← Configuración Podman
├── Dockerfile             ← Imagen del contenedor
├── .env                   ← Variables de entorno
└── legacy/                ← Archivos antiguos (no tocar)
```

## 🔗 URLs

- **Dashboard:** https://cocolu.emberdrago.com
- **Webhook:** https://cocolu.emberdrago.com/webhook
- **API:** https://cocolu.emberdrago.com/api/

## 📚 Documentación

- `DEPLOYMENT.md` - Guía de despliegue
- `ESTRUCTURA.txt` - Estructura del proyecto
- `legacy/` - Documentación antigua

## ✅ Checklist

- [ ] Actualizar credenciales Meta en `.env`
- [ ] Reiniciar el contenedor
- [ ] Verificar logs
- [ ] Probar webhook desde Meta
- [ ] Enviar mensaje de prueba

---

**¿Necesitas ayuda?** Revisa `DEPLOYMENT.md` o la carpeta `legacy/` para documentación adicional.
