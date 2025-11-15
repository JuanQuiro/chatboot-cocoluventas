#!/bin/bash

# 🚀 Script de Orquestación - Sistema Híbrido Rust + Node.js
# Levanta todo el sistema para producción

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Configuración
NODE_PORT=${NODE_PORT:-3008}
RUST_PORT=${RUST_PORT:-3009}
LOG_DIR="./logs"
PID_DIR="./.pids"

# Crear directorios necesarios
mkdir -p "$LOG_DIR"
mkdir -p "$PID_DIR"
mkdir -p database

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 COCOLU BOT - Sistema Híbrido Rust + Node.js      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}⚠️  Deteniendo servicios...${NC}"
    
    # Detener Rust API
    if [ -f "$PID_DIR/rust-api.pid" ]; then
        RUST_PID=$(cat "$PID_DIR/rust-api.pid")
        if kill -0 "$RUST_PID" 2>/dev/null; then
            echo -e "${YELLOW}  Deteniendo Rust API (PID: $RUST_PID)...${NC}"
            kill "$RUST_PID" 2>/dev/null || true
            sleep 1
            kill -9 "$RUST_PID" 2>/dev/null || true
        fi
        rm -f "$PID_DIR/rust-api.pid"
    fi
    
    # Detener Node.js
    if [ -f "$PID_DIR/node-api.pid" ]; then
        NODE_PID=$(cat "$PID_DIR/node-api.pid")
        if kill -0 "$NODE_PID" 2>/dev/null; then
            echo -e "${YELLOW}  Deteniendo Node.js API (PID: $NODE_PID)...${NC}"
            kill "$NODE_PID" 2>/dev/null || true
            sleep 1
            kill -9 "$NODE_PID" 2>/dev/null || true
        fi
        rm -f "$PID_DIR/node-api.pid"
    fi
    
    echo -e "${GREEN}✅ Servicios detenidos${NC}"
    exit 0
}

# Capturar señales de terminación
trap cleanup SIGINT SIGTERM

# Verificar que Rust está compilado
if [ ! -f "src-rs-performance/target/release/cocolu_rs_perf" ]; then
    echo -e "${YELLOW}⚠️  Rust API no compilada. Compilando...${NC}"
    cd src-rs-performance
    cargo build --release
    cd ..
    echo -e "${GREEN}✅ Rust API compilada${NC}"
fi

# Verificar que Node.js tiene dependencias
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencias Node.js no instaladas. Instalando...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
fi

echo -e "${BLUE}📋 Configuración:${NC}"
echo -e "  Adaptador:    ${BOT_ADAPTER:-meta} (WhatsApp Business API)"
echo -e "  Node.js API:  http://127.0.0.1:$NODE_PORT"
echo -e "  Rust API:       http://127.0.0.1:$RUST_PORT"
echo -e "  Logs:         $LOG_DIR"
echo ""

# ============================================
# 1. INICIAR NODE.JS API
# ============================================
echo -e "${GREEN}🚀 Iniciando Node.js API...${NC}"

# Configurar variables de entorno para Node.js
export PORT=$NODE_PORT
export API_PORT=$NODE_PORT
export NODE_ENV=production
export BOT_ADAPTER=${BOT_ADAPTER:-meta}
export LOG_LEVEL=${LOG_LEVEL:-info}

# Verificar variables de Meta si el adaptador es meta
if [ "$BOT_ADAPTER" = "meta" ]; then
    if [ -z "$META_JWT_TOKEN" ] || [ -z "$META_NUMBER_ID" ] || [ -z "$META_VERIFY_TOKEN" ]; then
        echo -e "${YELLOW}⚠️  ADVERTENCIA: Variables de Meta no configuradas${NC}"
        echo -e "${YELLOW}   Necesitas configurar en .env:${NC}"
        echo -e "${YELLOW}   - META_JWT_TOKEN${NC}"
        echo -e "${YELLOW}   - META_NUMBER_ID${NC}"
        echo -e "${YELLOW}   - META_VERIFY_TOKEN${NC}"
        echo -e "${YELLOW}   El sistema iniciará pero el bot no funcionará sin estas credenciales.${NC}"
        echo ""
    else
        echo -e "${GREEN}✅ Credenciales Meta configuradas${NC}"
    fi
fi

# Iniciar Node.js en background con logging
node app-integrated.js > "$LOG_DIR/node-api.log" 2>&1 &
NODE_PID=$!
echo $NODE_PID > "$PID_DIR/node-api.pid"

echo -e "${GREEN}  ✅ Node.js iniciado (PID: $NODE_PID)${NC}"
echo -e "${BLUE}  📝 Logs: $LOG_DIR/node-api.log${NC}"

# Esperar a que Node.js esté listo
echo -e "${YELLOW}  ⏳ Esperando que Node.js esté listo...${NC}"
for i in {1..30}; do
    if curl -s "http://127.0.0.1:$NODE_PORT/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✅ Node.js API lista${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}  ❌ Node.js no respondió después de 30 segundos${NC}"
        echo -e "${YELLOW}  📝 Revisa los logs: tail -f $LOG_DIR/node-api.log${NC}"
    fi
    sleep 1
done

# ============================================
# 2. INICIAR RUST API
# ============================================
echo ""
echo -e "${GREEN}🚀 Iniciando Rust API...${NC}"

# Configurar variables de entorno para Rust
export API_PORT=$RUST_PORT
export NODE_PORT=$NODE_PORT
export AUTH_TOKEN=${AUTH_TOKEN:-cocolu_secret_token_2025}
export RUST_LOG=info

# Iniciar Rust en background con logging
cd src-rs-performance
./target/release/cocolu_rs_perf > "../$LOG_DIR/rust-api.log" 2>&1 &
RUST_PID=$!
cd ..
echo $RUST_PID > "$PID_DIR/rust-api.pid"

echo -e "${GREEN}  ✅ Rust API iniciada (PID: $RUST_PID)${NC}"
echo -e "${BLUE}  📝 Logs: $LOG_DIR/rust-api.log${NC}"

# Esperar a que Rust esté listo
echo -e "${YELLOW}  ⏳ Esperando que Rust API esté lista...${NC}"
for i in {1..15}; do
    if curl -s "http://127.0.0.1:$RUST_PORT/health" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✅ Rust API lista${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}  ❌ Rust API no respondió después de 15 segundos${NC}"
        echo -e "${YELLOW}  📝 Revisa los logs: tail -f $LOG_DIR/rust-api.log${NC}"
    fi
    sleep 1
done

# ============================================
# 3. VERIFICAR ESTADO
# ============================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✅ SISTEMA INICIADO CORRECTAMENTE                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📊 Endpoints disponibles:${NC}"
echo -e "  🌐 Dashboard Leptos:  http://localhost:$RUST_PORT/"
echo -e "  🦀 Rust API Health:   http://localhost:$RUST_PORT/health"
echo -e "  📦 Node.js API:       http://localhost:$NODE_PORT/api/health"
echo -e "  🔗 Métricas:          http://localhost:$RUST_PORT/api/health/combined"
echo ""
echo -e "${GREEN}📝 Logs:${NC}"
echo -e "  Node.js:  tail -f $LOG_DIR/node-api.log"
echo -e "  Rust:     tail -f $LOG_DIR/rust-api.log"
echo ""
echo -e "${YELLOW}💡 Para detener: Presiona Ctrl+C${NC}"
echo ""

# Mantener el script corriendo y mostrar logs
tail -f "$LOG_DIR/node-api.log" "$LOG_DIR/rust-api.log" 2>/dev/null &
TAIL_PID=$!

# Esperar hasta que se reciba señal de terminación
wait

