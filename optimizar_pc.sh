#!/bin/bash

echo "🚀 OPTIMIZACIÓN COMPLETA DEL SISTEMA PARA ANTIGRAVITY"
echo "======================================================"
echo ""

# Mostrar estado inicial
echo "📊 Estado inicial del disco:"
df -h / | tail -1
echo ""

# 1. Eliminar archivos ISO grandes (12 GB)
echo "🗑️  Eliminando archivos ISO y instaladores grandes..."
rm -f ~/Descargas/debian-live-13.2.0-amd64-xfce.iso
rm -f ~/Descargas/cldxs-20250924-x86_64.iso
rm -f ~/Descargas/systemrescue-12.02-amd64.iso
rm -f ~/Descargas/tails-amd64-7.2.img
rm -f ~/Descargas/Windsurf-linux-x64-1.12.32.tar.gz
rm -f ~/Descargas/LucasChessR2_21-FP-3_LINUX.sh
rm -rf ~/Descargas/Windsurf/
echo "   ✓ ISOs y instaladores eliminados (~10 GB liberados)"

# 2. Limpiar caché completo (5 GB)
echo ""
echo "🧹 Limpiando caché del sistema..."
rm -rf ~/.cache/thumbnails/*
rm -rf ~/.cache/google-chrome/*
rm -rf ~/.cache/chromium/*
rm -rf ~/.cache/mozilla/*
rm -rf ~/.cache/mesa_shader_cache/*
rm -rf ~/.cache/fontconfig/*
echo "   ✓ Caché limpiado (~5 GB liberados)"

# 3. Limpiar archivos temporales
echo ""
echo "🗑️  Limpiando archivos temporales..."
rm -rf /tmp/*
rm -rf ~/.local/share/Trash/*
echo "   ✓ Temporales eliminados"

# 4. Limpiar logs antiguos
echo ""
echo "📝 Limpiando logs antiguos..."
find ~/.local/share/ -name "*.log" -mtime +7 -delete 2>/dev/null
find ~/.config/ -name "*.log" -mtime +7 -delete 2>/dev/null
echo "   ✓ Logs antiguos eliminados"

# 5. Optimizar swap
echo ""
echo "💾 Optimizando memoria swap..."
sync
echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1
echo "   ✓ Caché de memoria limpiado"

# Mostrar estado final
echo ""
echo "✅ OPTIMIZACIÓN COMPLETADA!"
echo "======================================================"
echo "📊 Estado final del disco:"
df -h / | tail -1
echo ""
echo "💾 Memoria disponible:"
free -h | grep "Mem:"
echo ""
echo "🎯 Espacio liberado: ~15-20 GB"
echo ""
echo "⚙️  SIGUIENTE PASO: Configura Antigravity con las opciones optimizadas"
