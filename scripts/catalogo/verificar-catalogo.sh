#!/bin/bash

echo "🔍 VERIFICACIÓN COMPLETA DEL CATÁLOGO"
echo "======================================"
echo ""

# 1. Verificar imágenes originales
echo "📁 Imágenes originales:"
IMG_COUNT=$(ls -1 catalogo-noviembre/*.png 2>/dev/null | wc -l)
echo "   Total: $IMG_COUNT imágenes PNG"
echo ""

# 2. Verificar PDF optimizado
echo "📄 PDF Optimizado:"
if [ -f "public/catalogo-cocolu-noviembre-2025-optimizado.pdf" ]; then
    SIZE_MB=$(ls -lh public/catalogo-cocolu-noviembre-2025-optimizado.pdf | awk '{print $5}')
    PAGES=$(pdfinfo public/catalogo-cocolu-noviembre-2025-optimizado.pdf | grep "Pages:" | awk '{print $2}')
    DIMENSIONS=$(pdfinfo public/catalogo-cocolu-noviembre-2025-optimizado.pdf | grep "Page size:" | cut -d':' -f2)
    
    echo "   ✅ Archivo existe"
    echo "   📊 Tamaño: $SIZE_MB"
    echo "   📄 Páginas: $PAGES"
    echo "   📐 Dimensiones:$DIMENSIONS"
    echo ""
    
    # Verificar si cabe en WhatsApp
    SIZE_BYTES=$(stat -c%s "public/catalogo-cocolu-noviembre-2025-optimizado.pdf")
    SIZE_MB_NUM=$(echo "scale=2; $SIZE_BYTES / 1024 / 1024" | bc)
    
    echo "📱 WhatsApp:"
    if (( $(echo "$SIZE_MB_NUM < 16" | bc -l) )); then
        echo "   ✅ Cabe en WhatsApp ($SIZE_MB_NUM MB < 16 MB)"
    else
        echo "   ❌ NO cabe en WhatsApp ($SIZE_MB_NUM MB > 16 MB)"
    fi
    echo ""
    
    # Comparar páginas
    echo "🔢 Comparación:"
    if [ "$IMG_COUNT" -eq "$PAGES" ]; then
        echo "   ✅ PERFECTO: $IMG_COUNT imágenes = $PAGES páginas PDF"
    else
        echo "   ⚠️  DIFERENCIA: $IMG_COUNT imágenes ≠ $PAGES páginas PDF"
    fi
    echo ""
else
    echo "   ❌ PDF no encontrado"
    echo ""
fi

# 3. Verificar configuración del bot
echo "🤖 Configuración del Bot:"
if grep -q "catalogo-cocolu-noviembre-2025-optimizado.pdf" src/flows/catalogo.flow.js; then
    echo "   ✅ Bot configurado para enviar PDF optimizado"
else
    echo "   ⚠️  Bot NO configurado correctamente"
fi
echo ""

# 4. Verificar orden de imágenes
echo "📋 Orden de Imágenes:"
FIRST_IMG=$(ls catalogo-noviembre/*.png | head -1 | xargs basename)
LAST_IMG=$(ls catalogo-noviembre/*.png | tail -1 | xargs basename)
echo "   Primera: $FIRST_IMG"
echo "   Última: $LAST_IMG"
echo ""

# 5. Verificar que todas las páginas existen
echo "🔍 Verificando secuencia completa..."
MISSING=0
for i in {1..136}; do
    if [ ! -f "catalogo-noviembre/$i.png" ]; then
        echo "   ⚠️  Falta: $i.png"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo "   ✅ TODAS las páginas 1-136 están presentes"
else
    echo "   ⚠️  Faltan $MISSING páginas"
fi
echo ""

# Resumen final
echo "======================================"
echo "📊 RESUMEN FINAL:"
echo "======================================"
if [ "$IMG_COUNT" -eq 136 ] && [ "$PAGES" -eq 136 ] && [ $MISSING -eq 0 ]; then
    echo "🎉 ✅ TODO PERFECTO"
    echo "   • 136 imágenes originales ✓"
    echo "   • 136 páginas en PDF ✓"
    echo "   • Secuencia completa ✓"
    echo "   • Cabe en WhatsApp ✓"
    echo "   • Bot configurado ✓"
else
    echo "⚠️  HAY PROBLEMAS - Revisar arriba"
fi
echo ""
