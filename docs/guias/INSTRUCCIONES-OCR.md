# 🚀 EXTRACCIÓN OCR OPTIMIZADA - INSTRUCCIONES

## ✅ MEJORAS IMPLEMENTADAS

### **1. OCR Dual (Doble Pasada)**
- **Método 1:** OCR sobre imagen original
- **Método 2:** OCR sobre imagen preprocesada (contraste, nitidez, brillo)
- Se usa el resultado con más texto detectado

### **2. Preprocesamiento de Imágenes**
```python
✅ Conversión a escala de grises
✅ Aumento de contraste (2.0x)
✅ Aumento de nitidez (SHARPEN filter)
✅ Aumento de brillo (1.2x)
```

### **3. Detección Inteligente de Precios**
Múltiples patrones:
- `$30`, `$100 USD`, `$ 50`
- `30 USD`, `50 dólares`
- `desde $30`, `a partir de $50`
- `precio: $30`, `costo: $50`

Validación: Solo precios entre $5-$500 USD

### **4. Sistema de Keywords Ampliado**
**50+ palabras clave organizadas en:**
- **Tipos:** anillo, dije, relicario, pulsera, collar, aretes, cadena, set
- **Materiales:** oro, plata, acero (con variantes: 18k, 14k, 925, quirúrgico)
- **Características:** graduación, grabado, personalizado, cristal, perla, diamante
- **Diseños:** corazón, cruz, estrella, luna, flor, infinito, mariposa

### **5. Generación Inteligente de Nombres**
Prioridad: **Tipo > Característica > Material**

Ejemplos:
- `anillo + graduacion + oro` → "Anillo de Graduación de Oro"
- `dije + corazon + plata` → "Dije Corazon de Plata"
- `pulsera + acero` → "Pulsera de Acero"

### **6. Detección de Material Específico**
- `oro_18k`, `oro_14k`, `oro_rosa`, `oro_blanco`
- `plata_925`
- `acero_quirurgico`

### **7. Extracción de Descripción**
Busca líneas descriptivas del texto OCR (10-100 caracteres)

### **8. Detección de "Consultar"**
Identifica productos sin precio que requieren consulta

---

## 🎯 CÓMO EJECUTAR

### **Opción 1: Extracción Completa (Recomendado)**
```bash
cd /home/alberto/Documentos/chatboot-cocoluventas
python3 extraer-catalogo.py
```
**Tiempo estimado:** 15-20 minutos para 136 páginas

### **Opción 2: Extracción en Background**
```bash
nohup python3 extraer-catalogo.py > extraccion.log 2>&1 &

# Ver progreso en tiempo real
tail -f extraccion.log

# Ver proceso
ps aux | grep extraer-catalogo
```

### **Opción 3: Prueba Rápida (5 páginas)**
```bash
python3 test-ocr-rapido.py
```
**Tiempo:** ~1 minuto

---

## 📊 QUÉ ESPERAR

### **Durante la Ejecución:**
```
🔍 EXTRACCIÓN INTELIGENTE DEL CATÁLOGO
==================================================

📄 Total de páginas: 136

[1/136] Analizando: 1.png
[2/136] Analizando: 2.png
   ✅ Nombre: Relicario | $45 USD | 3 keywords
[3/136] Analizando: 3.png
   ✅ Nombre: Anillo de Oro | 2 keywords
...
```

### **Resultados Esperados:**
- ✅ **70-80%** productos con keywords detectadas
- ✅ **40-60%** productos con precio extraído
- ✅ **30-40%** productos requieren "consultar"
- ✅ **100%** productos con texto OCR guardado

---

## 📁 ARCHIVOS GENERADOS

```
public/catalogo-data/
├── productos.json          ← Base de datos principal (JSON)
├── search_index.json       ← Índice de búsqueda rápida
├── catalogo-productos.js   ← Para importar en el bot
└── images/                 ← Imágenes optimizadas
    ├── page_001.png
    ├── page_002.png
    └── ...
```

---

## 🔍 VERIFICAR RESULTADOS

```bash
# Ver estadísticas
python3 -c "
import json
data = json.load(open('public/catalogo-data/productos.json'))
productos = data['products']

print(f'Total: {len(productos)}')
print(f'Con precio: {sum(1 for p in productos if \"price\" in p)}')
print(f'Con keywords: {sum(1 for p in productos if \"detected_keywords\" in p)}')
print(f'Con OCR: {sum(1 for p in productos if p.get(\"ocr_text\"))}')
"

# Ver productos con más información
python3 ver-productos-extraidos.py
```

---

## ⚡ CONFIGURACIÓN OCR (Ya Optimizada)

**Parámetros Tesseract:**
- `--psm 3`: Segmentación automática de página
- `--psm 6`: Bloque uniforme de texto
- `--oem 3`: Motor LSTM (más preciso)
- `-l spa+eng`: Español + Inglés

**Timeout:** 15 segundos por imagen (evita bloqueos)

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Si no extrae nada:**
```bash
# Probar OCR manual en una imagen
tesseract catalogo-noviembre/50.png stdout -l spa+eng

# Si funciona, el script debería funcionar
```

### **Si es muy lento:**
```bash
# Procesar menos páginas (editar extraer-catalogo.py línea 31)
# Cambiar: images[:20]  # Solo primeras 20
```

### **Si falla Pillow:**
```bash
pip install --upgrade Pillow
```

---

## 📈 CALIDAD ESPERADA

**Excelente (>80%):**
- ✅ Detección de tipos de producto
- ✅ Detección de materiales
- ✅ Extracción de texto general

**Buena (60-80%):**
- ✅ Extracción de precios
- ✅ Generación de nombres

**Variable (30-60%):**
- ⚠️ Descripciones detalladas
- ⚠️ Precios en formatos raros

---

## 🎉 LISTO PARA EJECUTAR

```bash
python3 extraer-catalogo.py
```

**¡El script está optimizado al máximo! 🚀**
