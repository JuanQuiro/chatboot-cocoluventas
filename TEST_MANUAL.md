# 🧪 SCRIPT DE TESTING MANUAL COMPLETO

## Pre-requisitos
- ✅ Backend corriendo: `start.bat` activo
- ✅ Frontend corriendo: `cd dashboard && npm start`
- ✅ DB local actualizada (apellidos migrados)

---

## TEST 1: CREAR CLIENTE CON APELLIDO ✅

**Objetivo:** Verificar que el formulario acepta apellido y usa endpoint correcto

**Pasos:**
1. Ir a Nueva Venta
2. Click "Nuevo cliente rápidamente"
3. Llenar:
   - Cédula: `30391154`
   - Nombre: `Juan`
   - Apellido: `Quiroz`
   - Teléfono: `04244545454`
   - Email: (opcional)

**Resultado esperado:**
- ✅ Cliente creado sin errores
- ✅ Toast de éxito muestra
- ✅ Cliente aparece en selector

**Resultado real:**
- [ ] Éxito / [ ] Fallo
- Error (si aplica): _______________

---

## TEST 2: BUSCAR CLIENTE POR APELLIDO ✅

**Objetivo:** Verificar búsqueda con nombre_completo

**Pasos:**
1. En buscador de clientes
2. Escribir: `Quiroz`
3. Debe aparecer "Juan Quiroz"

**Resultado esperado:**
- ✅ Búsqueda funciona
- ✅ Muestra nombre completo

**Resultado real:**
- [ ] Éxito / [ ] Fallo

---

## TEST 3: VALIDACIONES FUNCIONAN ✅

**Objetivo:** Verificar que no acepta data inválida

**Casos:**
1. Cliente sin nombre: Debe rechazar
2. Cliente sin apellido: Debe rechazar
3. Teléfono < 10 dígitos: Debe rechazar
4. Cédula duplicada: Debe avisar

**Resultado esperado:**
- ✅ Mensajes de error claros
- ✅ No guarda data inválida

**Resultado real:**
- [ ] Éxito / [ ] Fallo

---

## TEST 4: CREAR VENTA BÁSICA ✅

**Objetivo:** Verificar flujo completo de venta

**Pasos:**
1. Seleccionar cliente creado
2. Agregar productos al carrito
3. Configurar:
   - IVA: No
   - Descuento: 0%
   - Delivery: 0
4. Click "Crear Venta"

**Resultado esperado:**
- ✅ Venta creada
- ✅ Total calculado correctamente
- ✅ Redirige a lista de ventas

**Resultado real:**
- [ ] Éxito / [ ] Fallo

---

## TEST 5: PERFORMANCE ✅

**Objetivo:** Verificar que el sistema es rápido

**Métricas:**
- Búsqueda clientes: < 500ms
- Cargar productos: < 1s
- Crear venta: < 2s

**Resultado esperado:**
- ✅ Todo fluido, sin lags

**Resultado real:**
- [ ] Éxito / [ ] Fallo

---

## TEST 6: ERRORES SE MUESTRAN BIEN ✅

**Objetivo:** Verificar UX de errores

**Casos:**
1. Intentar crear venta sin cliente
2. Intentar crear cliente con cédula duplicada
3. Error de red (apagar backend)

**Resultado esperado:**
- ✅ Mensajes claros y específicos
- ✅ No crashea la app
- ✅ Usuario sabe qué hacer

**Resultado real:**
- [ ] Éxito / [ ] Fallo

---

## CHECKLIST FINAL

```markdown
- [ ] Todos los tests pasaron
- [ ] No hay errores en console
- [ ] Performance es buena
- [ ] UX es clara
- [ ] Listo para producción
```

---

## NOTAS
- Cualquier fallo anotar aquí: _______________
- Tiempo total de testing: _____ min
