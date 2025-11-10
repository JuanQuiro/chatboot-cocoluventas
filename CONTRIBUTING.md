# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Chatbot de Cocolu Ventas! Este documento te guiará a través del proceso.

## 📋 Código de Conducta

### Nuestro compromiso

- Ser respetuoso con todos los contribuyentes
- Mantener un ambiente acogedor e inclusivo
- Aceptar críticas constructivas
- Enfocarse en lo mejor para la comunidad

## 🚀 Cómo contribuir

### Reportar Bugs

1. **Verifica** que el bug no haya sido reportado antes
2. **Abre un issue** con una descripción clara:
   - Título descriptivo
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si es posible
   - Versión de Node.js y sistema operativo

### Sugerir Mejoras

1. **Abre un issue** describiendo:
   - ¿Qué problema resuelve?
   - ¿Cómo lo implementarías?
   - ¿Por qué es importante?

### Pull Requests

#### Proceso

1. **Fork** el repositorio
2. **Crea** una rama desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
3. **Haz** tus cambios siguiendo las guías de estilo
4. **Prueba** tus cambios exhaustivamente
5. **Commit** con mensajes descriptivos:
   ```bash
   git commit -m "feat: agregar búsqueda avanzada de productos"
   ```
6. **Push** a tu fork:
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```
7. **Abre** un Pull Request

#### Checklist para PR

- [ ] El código sigue las guías de estilo
- [ ] Los comentarios están actualizados
- [ ] No rompe funcionalidad existente
- [ ] Se agregaron tests si es aplicable
- [ ] La documentación está actualizada
- [ ] El commit message sigue las convenciones

## 📝 Guías de Estilo

### JavaScript

```javascript
// ✅ Bueno
const getUserOrders = async (userId) => {
    try {
        const orders = await getOrdersByUser(userId);
        return orders.filter(order => order.status === 'active');
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        return [];
    }
};

// ❌ Malo
const getorders = (id) => {
    return orders.filter(o => o.status == 'active')
}
```

### Reglas

1. **Nombres descriptivos** en español para variables de negocio
2. **Funciones async/await** para operaciones asíncronas
3. **Try/catch** para manejo de errores
4. **Comentarios JSDoc** en funciones públicas
5. **ES Modules** (import/export)
6. **Indentación** de 4 espacios
7. **Punto y coma** al final de líneas

### Estructura de archivos

```
src/
├── flows/          # Flujos de conversación
│   └── *.flow.js
├── services/       # Lógica de negocio
│   └── *.service.js
└── utils/          # Utilidades
    └── *.js
```

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formateo
refactor: refactorización
test: tests
chore: mantenimiento
```

Ejemplos:
```bash
git commit -m "feat: agregar integración con Stripe"
git commit -m "fix: corregir validación de email"
git commit -m "docs: actualizar guía de instalación"
```

## 🧪 Testing

### Ejecutar tests
```bash
npm test
```

### Escribir tests

```javascript
// Ejemplo de test
describe('Products Service', () => {
    it('debe retornar lista de productos', async () => {
        const products = await getProducts();
        expect(products).toBeInstanceOf(Array);
        expect(products.length).toBeGreaterThan(0);
    });
});
```

## 📚 Documentación

### Comentarios JSDoc

```javascript
/**
 * Crea un nuevo pedido
 * @param {Object} orderData - Datos del pedido
 * @param {string} orderData.userId - ID del usuario
 * @param {string} orderData.products - Productos solicitados
 * @returns {Promise<Object>} Pedido creado
 * @throws {Error} Si falla la creación
 */
export const createOrder = async (orderData) => {
    // ...
};
```

### README

Al agregar funcionalidades, actualiza:
- README.md
- GUIA_RAPIDA.md
- CHANGELOG.md

## 🎯 Prioridades

### Alta prioridad
- Bugs críticos
- Problemas de seguridad
- Mejoras de rendimiento

### Media prioridad
- Nuevas funcionalidades
- Mejoras de UX
- Refactorización

### Baja prioridad
- Documentación
- Optimizaciones menores
- Limpieza de código

## 🏗️ Arquitectura

### Principios

1. **Modularidad**: Cada archivo tiene una responsabilidad
2. **Separación de concerns**: Flujos, servicios y utils separados
3. **DRY**: No repetir código
4. **KISS**: Mantener simple
5. **YAGNI**: No agregar lo que no se necesita

### Patrones

- **Service Layer**: Lógica de negocio en servicios
- **Flow Pattern**: BuilderBot flows para conversación
- **Factory Pattern**: Para crear instancias
- **Repository Pattern**: Para acceso a datos

## 🔍 Code Review

### Qué revisamos

- ✅ Funcionalidad correcta
- ✅ Código limpio y legible
- ✅ Buenas prácticas
- ✅ Performance
- ✅ Seguridad
- ✅ Documentación

### Proceso

1. El PR es asignado a un reviewer
2. Reviewer hace comentarios
3. Autor responde y actualiza
4. Se aprueba y merge

## 🐛 Debugging

### Logs útiles

```javascript
console.log('🔍 Debug:', variable);
console.error('❌ Error:', error);
console.warn('⚠️ Advertencia:', mensaje);
```

### Herramientas

- Node.js debugger
- Console logs
- Network inspector (para webhook)

## 📦 Releases

### Versionado

Seguimos [Semantic Versioning](https://semver.org/):
- **MAJOR**: Cambios incompatibles
- **MINOR**: Nueva funcionalidad compatible
- **PATCH**: Correcciones de bugs

### Proceso de release

1. Actualizar CHANGELOG.md
2. Actualizar version en package.json
3. Tag en git: `v1.2.3`
4. Push y crear release en GitHub

## 💬 Comunicación

### Canales

- **Issues**: Para bugs y features
- **Pull Requests**: Para código
- **Discussions**: Para preguntas generales
- **Discord**: Para chat en tiempo real

### Respuesta

Intentamos responder:
- Issues críticos: < 24 horas
- PRs: < 48 horas
- Issues normales: < 1 semana

## 🎓 Recursos

- [BuilderBot Docs](https://builderbot.app/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [JavaScript Guide](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🙏 Agradecimientos

Agradecemos a todos los contribuyentes que hacen posible este proyecto:

- Leifer Méndez por BuilderBot
- La comunidad de BuilderBot
- Todos los contribuyentes

## ❓ Preguntas

Si tienes preguntas:
1. Revisa la documentación
2. Busca en issues cerrados
3. Pregunta en Discussions
4. Contacta al equipo

---

¡Gracias por contribuir! 🚀
