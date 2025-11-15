#!/bin/bash

# 🛑 Script para detener el sistema de producción

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PID_DIR="./.pids"

echo "🛑 Deteniendo servicios..."

# Detener Rust API
if [ -f "$PID_DIR/rust-api.pid" ]; then
    RUST_PID=$(cat "$PID_DIR/rust-api.pid")
    if kill -0 "$RUST_PID" 2>/dev/null; then
        echo "  Deteniendo Rust API (PID: $RUST_PID)..."
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
        echo "  Deteniendo Node.js API (PID: $NODE_PID)..."
        kill "$NODE_PID" 2>/dev/null || true
        sleep 1
        kill -9 "$NODE_PID" 2>/dev/null || true
    fi
    rm -f "$PID_DIR/node-api.pid"
fi

# Detener procesos por nombre también
pkill -f "cocolu_rs_perf" 2>/dev/null || true
pkill -f "app-integrated.js" 2>/dev/null || true

# Detener cloudflared si está corriendo
if pgrep -f "cloudflared" > /dev/null; then
    echo "  Deteniendo cloudflared..."
    pkill -f "cloudflared" 2>/dev/null || true
    sleep 1
    pkill -9 -f "cloudflared" 2>/dev/null || true
fi

# Detener ngrok si está corriendo
if pgrep -f "ngrok" > /dev/null; then
    echo "  Deteniendo ngrok..."
    pkill -f "ngrok" 2>/dev/null || true
    sleep 1
    pkill -9 -f "ngrok" 2>/dev/null || true
fi

# Detener localtunnel si está corriendo
if pgrep -f "localtunnel" > /dev/null; then
    echo "  Deteniendo localtunnel..."
    pkill -f "localtunnel" 2>/dev/null || true
    sleep 1
    pkill -9 -f "localtunnel" 2>/dev/null || true
fi

# Liberar puertos
echo "  Liberando puertos..."
lsof -ti:3008 | xargs kill -9 2>/dev/null || true
lsof -ti:3009 | xargs kill -9 2>/dev/null || true

echo "✅ Servicios detenidos"

