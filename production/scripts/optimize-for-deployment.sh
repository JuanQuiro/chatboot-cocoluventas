#!/bin/bash
# 🧹 Script de Optimización para Deployment Híbrido Rust + Node
# Objetivo: Reducir proyecto de 1.8GB a ≤700MB

set -e

echo "🚀 Iniciando optimización para deployment híbrido..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar tamaño
show_size() {
    local path=$1
    if [ -d "$path" ] || [ -f "$path" ]; then
        du -sh "$path" 2>/dev/null | awk '{print $1}'
    else
        echo "0"
    fi
}

# Tamaño inicial
echo "📊 Tamaño inicial del proyecto:"
INITIAL_SIZE=$(du -sh . 2>/dev/null | awk '{print $1}')
echo "   $INITIAL_SIZE"
echo ""

# 1. Eliminar compilaciones Rust
echo "📦 [1/8] Eliminando compilaciones Rust..."
RUST_TARGET_SIZE=$(show_size "src-rs-performance/target")
if [ -d "src-rs-performance/target" ]; then
    rm -rf src-rs-performance/target/
    echo "   ✅ Eliminado: $RUST_TARGET_SIZE"
else
    echo "   ⏭️  Ya eliminado"
fi

if [ -d "dashoffice-rust" ]; then
    find dashoffice-rust -name "target" -type d -exec rm -rf {} + 2>/dev/null || true
    echo "   ✅ Eliminados targets de dashoffice-rust"
fi
echo ""

# 2. Eliminar catálogo de imágenes (opcional - comentar si necesitas)
echo "🖼️  [2/8] Eliminando catálogo de imágenes..."
CATALOG_SIZE=$(show_size "catalogo-noviembre")
if [ -d "catalogo-noviembre" ]; then
    read -p "   ¿Eliminar catálogo-noviembre ($CATALOG_SIZE)? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf catalogo-noviembre/
        echo "   ✅ Eliminado: $CATALOG_SIZE"
    else
        echo "   ⏭️  Conservado (puedes moverlo a CDN después)"
    fi
else
    echo "   ⏭️  Ya eliminado"
fi
echo ""

# 3. Eliminar carpetas innecesarias
echo "🗑️  [3/8] Eliminando carpetas de prueba y desarrollo..."
for dir in "primera-prueba-flujo-chatboot" "segunda-prueba-flujo" "presupuiestos" "bot_principal_sessions" "tokens"; do
    if [ -d "$dir" ]; then
        SIZE=$(show_size "$dir")
        rm -rf "$dir"
        echo "   ✅ Eliminado $dir: $SIZE"
    fi
done
echo ""

# 4. Limpiar logs y temporales
echo "📝 [4/8] Limpiando logs y archivos temporales..."
LOG_COUNT=$(find . -name "*.log" -type f 2>/dev/null | wc -l)
if [ "$LOG_COUNT" -gt 0 ]; then
    find . -name "*.log" -type f -delete 2>/dev/null || true
    echo "   ✅ Eliminados $LOG_COUNT archivos .log"
fi

if [ -d "logs" ]; then
    LOGS_SIZE=$(show_size "logs")
    rm -rf logs/
    echo "   ✅ Eliminado directorio logs: $LOGS_SIZE"
fi

find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name "*.backup" -type f -delete 2>/dev/null || true
echo ""

# 5. Optimizar node_modules (solo producción)
echo "📦 [5/8] Optimizando node_modules (solo producción)..."
if [ -d "node_modules" ]; then
    NODE_SIZE=$(show_size "node_modules")
    echo "   📊 Tamaño actual: $NODE_SIZE"
    echo "   🗑️  Eliminando node_modules..."
    rm -rf node_modules/
    echo "   📥 Instalando solo dependencias de producción..."
    npm ci --omit=dev
    NEW_NODE_SIZE=$(show_size "node_modules")
    echo "   ✅ Nuevo tamaño: $NEW_NODE_SIZE"
else
    echo "   📥 Instalando dependencias de producción..."
    npm ci --omit=dev
fi
echo ""

# 6. Optimizar dashboard
echo "🎨 [6/8] Compilando dashboard..."
if [ -d "dashboard" ]; then
    cd dashboard
    
    # Eliminar node_modules de desarrollo
    if [ -d "node_modules" ]; then
        DASH_NODE_SIZE=$(show_size "node_modules")
        echo "   🗑️  Eliminando node_modules del dashboard: $DASH_NODE_SIZE"
        rm -rf node_modules/
    fi
    
    # Instalar solo producción
    echo "   📥 Instalando dependencias de producción..."
    npm ci --omit=dev
    
    # Compilar
    echo "   🔨 Compilando dashboard..."
    npm run build
    
    # Eliminar node_modules después de compilar
    echo "   🗑️  Eliminando node_modules después de compilar..."
    rm -rf node_modules/
    
    cd ..
    echo "   ✅ Dashboard compilado"
else
    echo "   ⚠️  Dashboard no encontrado"
fi
echo ""

# 7. Limpiar archivos de desarrollo
echo "🧹 [7/8] Limpiando archivos de desarrollo..."
# Eliminar archivos de prueba
find . -name "*.test.js" -type f -delete 2>/dev/null || true
find . -name "*.spec.js" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
echo "   ✅ Archivos de desarrollo eliminados"
echo ""

# 8. Verificar tamaño final
echo "📊 [8/8] Verificando tamaño final..."
FINAL_SIZE=$(du -sh . 2>/dev/null | awk '{print $1}')
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN DE OPTIMIZACIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Tamaño inicial:  $INITIAL_SIZE"
echo "   Tamaño final:    $FINAL_SIZE"
echo ""

# Verificar si cumple objetivo
FINAL_SIZE_MB=$(du -sm . 2>/dev/null | awk '{print $1}')
if [ "$FINAL_SIZE_MB" -le 700 ]; then
    echo -e "   ${GREEN}✅ OBJETIVO CUMPLIDO: ≤700 MB${NC}"
    echo "   Tamaño actual: ${FINAL_SIZE_MB} MB"
else
    echo -e "   ${YELLOW}⚠️  Aún por encima de 700 MB${NC}"
    echo "   Tamaño actual: ${FINAL_SIZE_MB} MB"
    echo "   Considera:"
    echo "   - Mover catálogo a CDN"
    echo "   - Eliminar más archivos de desarrollo"
    echo "   - Comprimir imágenes restantes"
fi
echo ""

# Mostrar estructura final
echo "📁 Estructura final optimizada:"
echo ""
du -sh */ 2>/dev/null | sort -h | tail -10
echo ""

echo "✅ Optimización completada!"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Verificar que todo funciona: npm start"
echo "   2. Compilar Rust: cd src-rs-performance && cargo build --release"
echo "   3. Probar dashboard: cd dashboard && npm run build"
echo ""

