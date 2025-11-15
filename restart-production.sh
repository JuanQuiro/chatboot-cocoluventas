#!/bin/bash

# 🔄 Script para reiniciar todo el sistema limpiamente
# Detiene todo, mata procesos colgados, y levanta todo de nuevo

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔄 REINICIANDO SISTEMA COMPLETO                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# 1. DETENER TODO
# ============================================
echo -e "${YELLOW}🛑 Paso 1: Deteniendo todos los servicios...${NC}"
./stop-production.sh

# Esperar un poco para que los procesos terminen
sleep 2

# ============================================
# 2. MATAR PROCESOS COLGADOS
# ============================================
echo ""
echo -e "${YELLOW}🧹 Paso 2: Limpiando procesos colgados...${NC}"

# Matar procesos por nombre
pkill -9 -f "cocolu_rs_perf" 2>/dev/null || true
pkill -9 -f "app-integrated.js" 2>/dev/null || true
pkill -9 -f "cloudflared" 2>/dev/null || true
pkill -9 -f "ngrok" 2>/dev/null || true
pkill -9 -f "localtunnel" 2>/dev/null || true

# Liberar puertos - intentar múltiples veces
echo "  Liberando puertos 3008 y 3009..."
for i in {1..3}; do
    lsof -ti:3008 | xargs kill -9 2>/dev/null || true
    lsof -ti:3009 | xargs kill -9 2>/dev/null || true
    sleep 0.5
done

# Limpiar archivos PID
rm -f .pids/*.pid 2>/dev/null || true

echo -e "${GREEN}  ✅ Limpieza completada${NC}"

# Esperar un poco más
sleep 1

# ============================================
# 3. VERIFICAR QUE LOS PUERTOS ESTÁN LIBRES
# ============================================
echo ""
echo -e "${YELLOW}🔍 Paso 3: Verificando puertos...${NC}"

# Verificar y forzar liberación de puertos
for port in 3008 3009; do
    if lsof -ti:$port > /dev/null 2>&1; then
        echo -e "${RED}  ⚠️  Puerto $port aún en uso, forzando liberación...${NC}"
        for i in {1..5}; do
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 0.3
            if ! lsof -ti:$port > /dev/null 2>&1; then
                break
            fi
        done
        # Verificar una última vez
        if lsof -ti:$port > /dev/null 2>&1; then
            echo -e "${YELLOW}  ⚠️  Puerto $port aún ocupado, pero continuando...${NC}"
        fi
    fi
done

echo -e "${GREEN}  ✅ Puertos libres${NC}"

# ============================================
# 4. LEVANTAR TODO
# ============================================
echo ""
echo -e "${GREEN}🚀 Paso 4: Iniciando sistema...${NC}"
echo ""

# Ejecutar start-production.sh
exec ./start-production.sh

