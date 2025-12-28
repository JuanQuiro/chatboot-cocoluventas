# 🧹 INSTRUCCIONES PARA LIMPIAR LOGS

## En el navegador, abre la consola (F12) y ejecuta:

```javascript
// Limpiar TODOS los logs viejos
localStorage.removeItem('dashoffice_errors');
localStorage.removeItem('dashoffice_warnings');
localStorage.removeItem('dashoffice_logs');
localStorage.removeItem('dashoffice_backend_queue');

// Recargar página
location.reload();
```

## O simplemente:

1. Abre DevTools (F12)
2. Application → Storage → Local Storage → http://localhost:3000
3. Click derecho → Clear
4. Refresca (Ctrl + Shift + R)
