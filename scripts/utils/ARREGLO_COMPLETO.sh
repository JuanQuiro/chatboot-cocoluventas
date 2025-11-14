#!/bin/bash

echo "🔧 ARREGLO COMPLETO DEL SISTEMA"
echo "================================"

# 1. Detener procesos
echo ""
echo "1️⃣ Deteniendo procesos..."
pkill -f "node app-integrated.js" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null
sleep 2

# 2. Limpiar caches
echo ""
echo "2️⃣ Limpiando caches..."
cd dashboard
rm -rf node_modules/.cache
rm -rf build
cd ..

# 3. Reinstalar dependencias del dashboard
echo ""
echo "3️⃣ Reinstalando dependencias del dashboard..."
cd dashboard
npm install --legacy-peer-deps
cd ..

# 4. Instalar dependencias faltantes en backend
echo ""
echo "4️⃣ Verificando dependencias del backend..."
npm install jsonwebtoken bcryptjs

# 5. Iniciar backend
echo ""
echo "5️⃣ Iniciando backend..."
node app-integrated.js &
BACKEND_PID=$!
sleep 5

# 6. Iniciar dashboard
echo ""
echo "6️⃣ Iniciando dashboard..."
cd dashboard
npm start &
DASHBOARD_PID=$!

echo ""
echo "✅ SISTEMA INICIADO"
echo "================================"
echo "Backend PID: $BACKEND_PID"
echo "Dashboard PID: $DASHBOARD_PID"
echo ""
echo "URLs:"
echo "  - Backend:  http://localhost:3009"
echo "  - Dashboard: http://localhost:3000"
echo ""
echo "Para detener:"
echo "  kill $BACKEND_PID $DASHBOARD_PID"
