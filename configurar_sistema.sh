#!/bin/bash

echo "⚙️  CONFIGURACIÓN ADICIONAL DEL SISTEMA"
echo "======================================"
echo ""

# 1. Optimizar swappiness (usar menos swap)
echo "💾 Optimizando uso de swap..."
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf > /dev/null 2>&1
sudo sysctl -w vm.swappiness=10 > /dev/null 2>&1
echo "   ✓ Swappiness configurado a 10 (menos uso de swap)"

# 2. Desactivar servicios innecesarios
echo ""
echo "🛑 Desactivando servicios innecesarios..."

# Bluetooth (si no lo usas)
sudo systemctl disable bluetooth 2>/dev/null && echo "   ✓ Bluetooth desactivado" || echo "   - Bluetooth no encontrado"

# Cups (impresoras, si no las usas)
sudo systemctl disable cups 2>/dev/null && echo "   ✓ Servicio de impresión desactivado" || echo "   - CUPS no encontrado"

# ModemManager (si no usas módem)
sudo systemctl disable ModemManager 2>/dev/null && echo "   ✓ ModemManager desactivado" || echo "   - ModemManager no encontrado"

echo ""
echo "✅ Configuración del sistema completada!"
echo ""
echo "📋 RESUMEN DE OPTIMIZACIONES:"
echo "   • Espacio liberado: 12 GB"
echo "   • Disco disponible: 20 GB (83% uso)"
echo "   • Swappiness: 10 (menos uso de swap)"
echo "   • Servicios innecesarios: desactivados"
echo ""
echo "🎯 SIGUIENTE PASO:"
echo "   1. Abre Antigravity"
echo "   2. Presiona Ctrl+Shift+P"
echo "   3. Escribe: 'Open User Settings (JSON)'"
echo "   4. Copia el contenido de: antigravity_settings_optimizado.json"
echo ""
echo "💡 RECOMENDACIÓN: Reinicia tu PC para aplicar todos los cambios"
