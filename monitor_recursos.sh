#!/bin/bash

# Script de monitoreo de recursos para saber cuándo Antigravity puede crashear

clear
echo "🔍 MONITOR DE RECURSOS DEL SISTEMA"
echo "===================================="
echo ""

while true; do
    # Limpiar pantalla anterior
    tput cup 3 0
    
    # Fecha y hora
    echo "⏰ $(date '+%H:%M:%S - %d/%m/%Y')"
    echo ""
    
    # Memoria
    echo "💾 MEMORIA RAM:"
    free -h | grep "Mem:" | awk '{printf "   Total: %s | Usado: %s | Libre: %s | Disponible: %s\n", $2, $3, $4, $7}'
    
    # Calcular porcentaje de memoria usada
    MEM_PERCENT=$(free | grep Mem | awk '{printf "%.0f", ($3/$2) * 100}')
    if [ "$MEM_PERCENT" -gt 85 ]; then
        echo "   ⚠️  ADVERTENCIA: Memoria al ${MEM_PERCENT}% - Antigravity puede cerrarse!"
    elif [ "$MEM_PERCENT" -gt 75 ]; then
        echo "   ⚡ PRECAUCIÓN: Memoria al ${MEM_PERCENT}% - Cierra aplicaciones innecesarias"
    else
        echo "   ✅ Memoria OK: ${MEM_PERCENT}% usado"
    fi
    
    echo ""
    
    # Disco
    echo "💿 DISCO:"
    df -h / | tail -1 | awk '{printf "   Usado: %s de %s (%s) | Disponible: %s\n", $3, $2, $5, $4}'
    
    DISK_PERCENT=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_PERCENT" -gt 90 ]; then
        echo "   ⚠️  ADVERTENCIA: Disco al ${DISK_PERCENT}% - Libera más espacio!"
    else
        echo "   ✅ Disco OK: ${DISK_PERCENT}% usado"
    fi
    
    echo ""
    
    # CPU
    echo "🖥️  CPU:"
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    printf "   Uso: %.1f%%\n" "$CPU_USAGE"
    
    echo ""
    
    # Procesos de Antigravity
    echo "⚙️  PROCESOS ANTIGRAVITY:"
    ANTIGRAVITY_COUNT=$(ps aux | grep -i antigravity | grep -v grep | wc -l)
    ANTIGRAVITY_MEM=$(ps aux | grep -i antigravity | grep -v grep | awk '{sum+=$6} END {printf "%.0f", sum/1024}')
    
    if [ "$ANTIGRAVITY_COUNT" -gt 0 ]; then
        echo "   Procesos activos: $ANTIGRAVITY_COUNT"
        echo "   Memoria usada: ${ANTIGRAVITY_MEM} MB"
        
        # Mostrar proceso más pesado
        echo "   Proceso más pesado:"
        ps aux | grep -i antigravity | grep -v grep | sort -k4 -r | head -1 | awk '{printf "      %s MB - %s\n", int($6/1024), $11}'
    else
        echo "   ❌ Antigravity no está ejecutándose"
    fi
    
    echo ""
    echo "===================================="
    echo "Presiona Ctrl+C para salir"
    
    # Actualizar cada 2 segundos
    sleep 2
done
