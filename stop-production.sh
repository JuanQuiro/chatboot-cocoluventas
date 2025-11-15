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

echo "✅ Servicios detenidos"

