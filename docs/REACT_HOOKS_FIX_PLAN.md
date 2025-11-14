# 🔧 PLAN DE ARREGLO MASIVO - REACT HOOKS DEPENDENCIES

## 🚨 PROBLEMA IDENTIFICADO:

**Síntoma:** Componente se reinicia en loop infinito y redirige a login

**Causa Raíz:** Funciones usadas en `useEffect` no están wrapeadas con `useCallback` y no están en las dependencias

**Consecuencia:** React recrea la función en cada render → useEffect detecta cambio → ejecuta de nuevo → loop infinito

---

## 📊 ARCHIVOS AFECTADOS (23 componentes):

### **CRÍTICOS (Cargan datos con intervalos):**
1. ✅ `/pages/Bots.jsx` - **YA ARREGLADO**
2. ❌ `/pages/Dashboard.js` - **TIENE EL PROBLEMA**
3. ❌ `/pages/Analytics.js` - **TIENE EL PROBLEMA**
4. ❌ `/pages/Orders.js` - **TIENE EL PROBLEMA**
5. ❌ `/pages/Products.js` - **TIENE EL PROBLEMA**
6. ❌ `/pages/Sellers.js` - **TIENE EL PROBLEMA**
7. ❌ `/pages/Users.jsx` - **TIENE EL PROBLEMA**
8. ❌ `/pages/Roles.jsx` - **TIENE EL PROBLEMA**

### **Contextos:**
9. `/contexts/AuthContext.jsx` - Revisar
10. `/contexts/ThemeContext.jsx` - Revisar
11. `/contexts/TypographyContext.jsx` - Revisar
12. `/contexts/TenantContext.jsx` - Revisar

### **Componentes:**
13-23. Varios componentes UI - Revisar

---

## 🔧 PATRÓN DE ARREGLO:

### **ANTES (❌ MAL):**
```javascript
const MyComponent = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []); // ❌ fetchData no está en dependencias

    const fetchData = async () => {
        // Cargar datos...
    };
};
```

### **DESPUÉS (✅ BIEN):**
```javascript
import { useState, useEffect, useCallback } from 'react';

const MyComponent = () => {
    const [data, setData] = useState(null);

    const fetchData = useCallback(async () => {
        // Cargar datos...
    }, []); // ✅ Memoizada con useCallback

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]); // ✅ fetchData en dependencias
};
```

---

## 🎯 ACCIÓN INMEDIATA:

Arreglar TODOS los pages que cargan datos:
1. Dashboard.js
2. Analytics.js
3. Orders.js
4. Products.js
5. Sellers.js
6. Users.jsx
7. Roles.jsx

---

## ⚠️ REGLA UNIVERSAL:

**Si una función se usa en useEffect → DEBE estar con useCallback**

```javascript
// ✅ CORRECTO
const myFunction = useCallback(() => {
    // código
}, [dependencies]);

useEffect(() => {
    myFunction();
}, [myFunction]);

// ❌ INCORRECTO
const myFunction = () => {
    // código
};

useEffect(() => {
    myFunction();
}, []); // ← myFunction no está en dependencias!
```

---

*Plan de arreglo masivo para prevenir loops infinitos y reinicios*
