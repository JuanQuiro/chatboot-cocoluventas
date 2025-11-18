# ✍️ SISTEMA DE TIPOGRAFÍA - DASHOFFICE

## ✅ Estado: 100% Implementado

El DashOffice ahora cuenta con un **sistema de tipografía profesional** de clase mundial con múltiples fuentes y escala ajustable.

---

## 📝 Fuentes Disponibles

| Fuente | Categoría | Descripción | Ideal Para |
|--------|-----------|-------------|------------|
| **Inter** | Sans-serif | Moderna y versátil | Interfaces, dashboards |
| **Poppins** | Sans-serif | Geométrica y amigable | UI moderno, friendly |
| **Montserrat** | Sans-serif | Elegante y profesional | Corporativo, formal |
| **Roboto** | Sans-serif | Clásica de Google | Neutral, legible |
| **Lato** | Sans-serif | Limpia y clara | Documentos, lectura |
| **Source Sans Pro** | Sans-serif | Adobe profesional | Editorial, contenido |
| **IBM Plex Sans** | Sans-serif | Corporativa IBM | Técnico, datos |
| **System UI** | System | Nativa del sistema | Máxima performance |

---

## 🎯 Características

### ✅ **Profesional**
- 8 fuentes de Google Fonts
- Escala tipográfica completa (h1-h6, body, small, tiny)
- 7 pesos de fuente (light a black)
- Line heights optimizados
- Letter spacing profesional

### ✅ **Escalable**
- Control de tamaño 75%-150%
- Ajuste en tiempo real
- Responsive automático (mobile)
- Persistencia en localStorage

### ✅ **Completo**
- CSS Variables para todo
- Clases utilitarias
- Soporte completo de weights
- Text utilities (truncate, line-clamp, etc.)
- Optimizado para performance

### ✅ **Accesible**
- WCAG AA compliance
- Font smoothing
- Optimized rendering
- Print styles incluidos

---

## 📐 Escala Tipográfica

```
H1: 2.5rem (40px)   - Line Height: 1.2  - Weight: Bold
H2: 2rem (32px)     - Line Height: 1.3  - Weight: Bold
H3: 1.75rem (28px)  - Line Height: 1.4  - Weight: Semibold
H4: 1.5rem (24px)   - Line Height: 1.4  - Weight: Semibold
H5: 1.25rem (20px)  - Line Height: 1.5  - Weight: Medium
H6: 1.125rem (18px) - Line Height: 1.5  - Weight: Medium

Body:    1rem (16px)     - Line Height: 1.6  - Weight: Regular
Small:   0.875rem (14px) - Line Height: 1.5  - Weight: Regular
Tiny:    0.75rem (12px)  - Line Height: 1.5  - Weight: Regular
Button:  1rem (16px)     - Line Height: 1.5  - Weight: Medium
Caption: 0.875rem (14px) - Line Height: 1.4  - Weight: Regular
```

### Responsive

**Tablet (< 768px):**
- H1: 2rem → 1.75rem
- H2: 1.75rem → 1.5rem
- H3: 1.5rem → 1.25rem

**Mobile (< 480px):**
- H1: 1.75rem
- H2: 1.5rem
- H3: 1.25rem

---

## 🚀 Cómo Usar

### Para Usuarios

1. **Abrir el selector de tipografía**
   - Buscar el botón "Aa" en el header
   - Click para abrir el panel

2. **Cambiar fuente**
   - Ver las 8 fuentes con preview
   - Click en la fuente deseada
   - Se aplica instantáneamente

3. **Ajustar tamaño**
   - Usar el slider (75% - 150%)
   - Ver cambios en tiempo real
   - Click "Reset" para volver a 100%

4. **Se guarda automáticamente**
   - Persiste entre sesiones
   - Se aplica en todas las páginas

---

## 💻 Para Desarrolladores

### Estructura de Archivos

```
dashboard/src/
├── contexts/
│   └── TypographyContext.jsx    # Context con fuentes y lógica
├── components/
│   └── FontSelector.jsx         # Selector visual
├── styles/
│   └── typography.css           # CSS Variables y estilos
└── App.js                       # Integración con TypographyProvider
```

### Usar el Typography Context

```javascript
import { useTypography } from './contexts/TypographyContext';

function MyComponent() {
  const { 
    currentFont,     // 'inter', 'poppins', etc.
    font,            // Objeto de la fuente actual
    scale,           // 75-150
    changeFont,      // Cambiar fuente
    changeScale,     // Cambiar escala
  } = useTypography();

  return (
    <div>
      <p>Fuente: {currentFont}</p>
      <p>Escala: {scale}%</p>
    </div>
  );
}
```

### Usar CSS Variables

```css
/* En tus componentes */
.my-heading {
  font-size: var(--text-h1);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-h1);
}

.my-body {
  font-size: var(--text-body);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-body);
}
```

### Usar Clases Utilitarias

```jsx
<div>
  <h1 className="text-h1 font-bold">Título Principal</h1>
  <h2 className="text-h2 font-semibold">Subtítulo</h2>
  <p className="text-body font-regular">Párrafo normal</p>
  <small className="text-small font-light">Texto pequeño</small>
  
  {/* Font weights */}
  <p className="font-light">Light</p>
  <p className="font-medium">Medium</p>
  <p className="font-bold">Bold</p>
  <p className="font-black">Black</p>
  
  {/* Text utilities */}
  <p className="truncate">Texto que se corta...</p>
  <p className="line-clamp-2">Texto limitado a 2 líneas...</p>
  <p className="uppercase">Mayúsculas</p>
  <p className="italic">Cursiva</p>
</div>
```

---

## 🎨 Variables CSS Disponibles

### Font Family
```css
--font-family              /* Fuente actual */
```

### Font Weights
```css
--font-weight-light        /* 300 */
--font-weight-regular      /* 400 */
--font-weight-medium       /* 500 */
--font-weight-semibold     /* 600 */
--font-weight-bold         /* 700 */
--font-weight-extrabold    /* 800 */
--font-weight-black        /* 900 */
```

### Font Sizes (Escalables)
```css
--text-h1                  /* 2.5rem * scale */
--text-h2                  /* 2rem * scale */
--text-h3                  /* 1.75rem * scale */
--text-h4                  /* 1.5rem * scale */
--text-h5                  /* 1.25rem * scale */
--text-h6                  /* 1.125rem * scale */
--text-body                /* 1rem * scale */
--text-small               /* 0.875rem * scale */
--text-tiny                /* 0.75rem * scale */
--text-button              /* 1rem * scale */
--text-caption             /* 0.875rem * scale */
```

### Line Heights
```css
--line-height-h1           /* 1.2 */
--line-height-h2           /* 1.3 */
--line-height-h3           /* 1.4 */
--line-height-body         /* 1.6 */
/* ... etc */
```

---

## 🔧 Personalización

### Agregar una Nueva Fuente

Editar `TypographyContext.jsx`:

```javascript
export const FONT_FAMILIES = {
  // ... fuentes existentes
  
  myfont: {
    id: 'myfont',
    name: 'Mi Fuente',
    description: 'Descripción de mi fuente',
    category: 'Sans-serif',
    cssFamily: '"Mi Fuente", sans-serif',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Mi+Fuente:wght@300;400;700&display=swap',
    weights: {
      light: 300,
      regular: 400,
      bold: 700,
    },
  },
};
```

---

## 📊 Comparativa de Fuentes

| Fuente | Legibilidad | Modernidad | Formal | Casual | Performance |
|--------|-------------|------------|--------|--------|-------------|
| Inter | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Poppins | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Montserrat | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Roboto | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| System UI | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## ✨ Features Avanzadas

### Text Utilities

```jsx
{/* Truncate (una línea) */}
<p className="truncate">Este texto muy largo se cortará...</p>

{/* Line Clamp (múltiples líneas) */}
<p className="line-clamp-2">
  Este texto se limitará a 2 líneas máximo...
</p>

{/* Text Transform */}
<p className="uppercase">TODO EN MAYÚSCULAS</p>
<p className="lowercase">todo en minúsculas</p>
<p className="capitalize">Cada Palabra Capitalizada</p>

{/* Text Decoration */}
<p className="underline">Subrayado</p>
<p className="line-through">Tachado</p>

{/* Letter Spacing */}
<p className="tracking-tight">Espaciado apretado</p>
<p className="tracking-wide">Espaciado amplio</p>
<p className="tracking-wider">Espaciado más amplio</p>
```

---

## 🎯 Mejores Prácticas

### ✅ **DO:**
- Usa clases de tipografía consistentes
- Usa var(--text-h1) en lugar de tamaños fijos
- Mantén la jerarquía visual (h1 > h2 > h3)
- Usa line-height apropiados para lectura
- Considera la accesibilidad

### ❌ **DON'T:**
- No mezcles demasiadas fuentes
- No uses tamaños de fuente arbitrarios
- No ignores el line-height
- No uses letter-spacing excesivo
- No comprometas la legibilidad

---

## 📱 Responsive

El sistema incluye **breakpoints automáticos**:

```css
/* Desktop: tamaños completos */
H1: 2.5rem

/* Tablet (< 768px): reducción proporcional */
H1: 2rem

/* Mobile (< 480px): optimizado para móvil */
H1: 1.75rem
```

Además, el **scale se aplica en todos los breakpoints**, permitiendo ajuste global.

---

## ⚡ Performance

### Google Fonts Optimization
- **display=swap**: previene FOIT (Flash of Invisible Text)
- **Selective weights**: solo los pesos necesarios
- **Async loading**: no bloquea el render

### System Font
- **Opción System UI** para máxima performance
- Sin descarga externa
- Render instantáneo

---

## 🔍 Debugging

### Ver fuente actual:
```javascript
console.log('Fuente:', localStorage.getItem('typography-font'));
console.log('Escala:', localStorage.getItem('typography-scale'));
```

### Forzar una fuente:
```javascript
localStorage.setItem('typography-font', 'poppins');
window.location.reload();
```

### Resetear:
```javascript
localStorage.removeItem('typography-font');
localStorage.removeItem('typography-scale');
window.location.reload();
```

---

## 📚 Ejemplos de Uso

### Ejemplo 1: Card con Jerarquía

```jsx
<div className="card">
  <h2 className="text-h2 font-bold mb-2">Título de Card</h2>
  <p className="text-small font-medium text-muted mb-4">
    Subtítulo o fecha
  </p>
  <p className="text-body font-regular leading-relaxed">
    Contenido principal del card con buen line-height para lectura.
  </p>
</div>
```

### Ejemplo 2: Estadística Destacada

```jsx
<div className="stat">
  <div className="text-tiny font-semibold uppercase tracking-wider text-muted">
    Total Ventas
  </div>
  <div className="text-h1 font-black">
    $124,500
  </div>
  <div className="text-small font-medium text-success">
    +12.5% vs mes anterior
  </div>
</div>
```

### Ejemplo 3: Lista de Items

```jsx
<ul>
  <li className="text-body font-regular leading-relaxed">
    Item con buen espaciado para fácil lectura
  </li>
  <li className="text-body font-medium">
    Item destacado con medium weight
  </li>
</ul>
```

---

## ✅ Checklist de Implementación

- [x] TypographyContext con 8 fuentes
- [x] FontSelector component visual
- [x] Escala tipográfica profesional (11 tamaños)
- [x] 7 pesos de fuente
- [x] CSS Variables completas
- [x] Clases utilitarias
- [x] Control de escala 75%-150%
- [x] Persistencia en localStorage
- [x] Carga asíncrona de Google Fonts
- [x] Responsive breakpoints
- [x] Text utilities (truncate, line-clamp, etc.)
- [x] Font smoothing optimizado
- [x] Print styles
- [x] Accesibilidad (::selection, :focus-visible)
- [x] Integración en App.js
- [x] Documentación completa

---

## 🎯 Resumen

**El DashOffice ahora tiene:**

✅ **8 fuentes profesionales** (Google Fonts + System)
✅ **Escala completa** (h1-h6, body, small, tiny, etc.)
✅ **Control de tamaño** (75%-150%)
✅ **7 pesos de fuente** (light a black)
✅ **CSS Variables** para todo
✅ **Text utilities** completas
✅ **100% responsive** con breakpoints
✅ **Performance optimizada** (display=swap)
✅ **Selector visual** fácil de usar
✅ **Accesibilidad** WCAG AA

**Cada usuario puede personalizar la tipografía a su gusto para máxima comodidad de lectura** ✍️

---

*Sistema de Tipografía implementado: ${new Date().toLocaleDateString()}*
*DashOffice v3.0.0 con Sistema Tipográfico Profesional*
