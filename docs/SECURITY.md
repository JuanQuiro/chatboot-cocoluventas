# 🔒 Política de Seguridad

## Versiones Soportadas

Actualmente damos soporte de seguridad a las siguientes versiones:

| Versión | Soportada          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reportar una Vulnerabilidad

Si descubres una vulnerabilidad de seguridad, por favor **NO** la reportes públicamente en issues.

### Proceso de Reporte

1. **Email**: Envía un correo a `security@cocoluventas.com`
2. **Asunto**: "SECURITY: [Descripción breve]"
3. **Contenido**: Incluye:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de mitigación (si las tienes)

### Qué esperar

- **Respuesta inicial**: Dentro de 48 horas
- **Actualización de estado**: Cada 7 días
- **Resolución**: Según severidad
  - Crítica: 24-48 horas
  - Alta: 7 días
  - Media: 30 días
  - Baja: 90 días

### Recompensas

Aunque este es un proyecto pequeño, reconocemos públicamente a quienes reportan vulnerabilidades (si lo desean).

## Mejores Prácticas de Seguridad

### Para Usuarios

1. **Variables de Entorno**
   - ✅ NUNCA compartas tu archivo `.env`
   - ✅ Usa tokens seguros y únicos
   - ✅ Rota tokens periódicamente
   - ✅ No hardcodees credenciales

2. **Tokens de Acceso**
   - ✅ Usa tokens permanentes de Meta
   - ✅ Restringe permisos al mínimo necesario
   - ✅ Monitorea uso de tokens
   - ✅ Revoca tokens comprometidos inmediatamente

3. **Webhook**
   - ✅ Usa HTTPS en producción
   - ✅ Verifica verify_token
   - ✅ Implementa rate limiting
   - ✅ Valida todas las entradas

4. **Base de Datos**
   - ✅ No almacenes información sensible en JSON
   - ✅ Migra a DB segura en producción
   - ✅ Encripta datos sensibles
   - ✅ Realiza backups regulares

5. **Deployment**
   - ✅ Usa HTTPS/TLS
   - ✅ Mantén dependencias actualizadas
   - ✅ Usa firewall
   - ✅ Monitorea logs

### Para Desarrolladores

1. **Validación de Entrada**
   ```javascript
   // ✅ Bueno
   const sanitizedInput = sanitizeInput(userInput);
   
   // ❌ Malo
   const input = userInput;
   ```

2. **Manejo de Errores**
   ```javascript
   // ✅ Bueno
   try {
       // código
   } catch (error) {
       console.error('Error:', error.message); // No exponer stack
   }
   
   // ❌ Malo
   catch (error) {
       console.error(error); // Expone información sensible
   }
   ```

3. **Autenticación**
   - ✅ Verifica webhook signatures
   - ✅ Valida tokens en cada request
   - ✅ Implementa rate limiting
   - ✅ Usa timeouts apropiados

4. **Dependencias**
   ```bash
   # Auditar regularmente
   npm audit
   npm audit fix
   
   # Actualizar dependencias
   npm update
   ```

## Vulnerabilidades Conocidas

Actualmente no hay vulnerabilidades conocidas.

## Historial de Seguridad

### 2025-11-03 - v1.0.0
- ✅ Implementación inicial con mejores prácticas
- ✅ Validación de entrada
- ✅ Sanitización de datos
- ✅ Manejo seguro de tokens

## Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [WhatsApp Business API Security](https://developers.facebook.com/docs/whatsapp/security)

## Contacto

- Email: security@cocoluventas.com
- Para otros temas: contacto@cocoluventas.com

---

**Nota**: Esta política puede cambiar sin previo aviso. Última actualización: 2025-11-03
