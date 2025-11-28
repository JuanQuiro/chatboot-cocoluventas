#!/bin/bash

echo "🧹 Limpiando sistema para optimizar Antigravity..."

# Limpiar caché de navegadores
echo "Limpiando caché de navegadores..."
rm -rf ~/.cache/google-chrome/ 2>/dev/null
rm -rf ~/.cache/chromium/ 2>/dev/null
rm -rf ~/.cache/mozilla/ 2>/dev/null

# Limpiar caché temporal
echo "Limpiando archivos temporales..."
rm -rf ~/.cache/thumbnails/* 2>/dev/null
rm -rf /tmp/* 2>/dev/null

# Limpiar logs antiguos
echo "Limpiando logs..."
find ~/.local/share/ -name "*.log" -mtime +7 -delete 2>/dev/null

# Limpiar paquetes apt (requiere sudo)
echo "Limpiando paquetes apt (requiere contraseña)..."
sudo apt-get clean
sudo apt-get autoclean
sudo apt-get autoremove --purge -y

# Mostrar espacio liberado
echo ""
echo "✅ Limpieza completada!"
df -h / | tail -1
