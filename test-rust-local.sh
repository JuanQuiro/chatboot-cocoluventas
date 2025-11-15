#!/bin/bash

# Script para probar el bot Rust localmente

echo "=========================================="
echo "🧪 PRUEBAS LOCALES - BOT RUST"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir títulos
print_test() {
    echo -e "${BLUE}✅ $1${NC}"
}

# Función para imprimir resultados
print_result() {
    echo -e "${GREEN}$1${NC}"
}

# TEST 1: Health Check
print_test "TEST 1: Health Check"
curl -s http://localhost:3009/health | jq .
echo ""

# TEST 2: Dashboard
print_test "TEST 2: Dashboard (primeras 5 líneas)"
curl -s http://localhost:3009 | head -5
echo ""

# TEST 3: Consumo de recursos
print_test "TEST 3: Consumo de Recursos"
ps aux | grep cocolu_rs_perf | grep -v grep | awk '{
    printf "  RAM (RSS):  %.1f MB\n", $6/1024
    printf "  RAM (VSZ):  %.1f MB\n", $5/1024
    printf "  CPU:        %.1f%%\n", $3
    printf "  PID:        %d\n", $2
}'
echo ""

# TEST 4: Uptime
print_test "TEST 4: Uptime"
UPTIME=$(curl -s http://localhost:3009/health | jq '.uptime_secs')
print_result "  Bot ha estado corriendo: $UPTIME segundos"
echo ""

# TEST 5: Latencia
print_test "TEST 5: Latencia de Respuesta"
echo "  Midiendo 5 requests..."
for i in {1..5}; do
    TIME=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:3009/health)
    echo "  Request $i: ${TIME}s"
done
echo ""

# TEST 6: Logs
print_test "TEST 6: Últimos logs del bot"
tail -3 /tmp/rust-bot-test.log
echo ""

# TEST 7: Conectividad
print_test "TEST 7: Conectividad"
if curl -s http://localhost:3009/health > /dev/null 2>&1; then
    print_result "  ✅ Bot respondiendo correctamente"
else
    echo "  ❌ Bot no responde"
fi
echo ""

echo "=========================================="
echo "🎉 Pruebas completadas"
echo "=========================================="
echo ""
echo "Comandos útiles:"
echo "  • Ver logs en tiempo real:"
echo "    tail -f /tmp/rust-bot-test.log"
echo ""
echo "  • Monitorear recursos:"
echo "    watch -n 1 'ps aux | grep cocolu_rs_perf | grep -v grep | awk \"{printf \\\"RAM: %.1f MB | CPU: %.1f%%\\n\\\", \\\$6/1024, \\\$3}\"'"
echo ""
echo "  • Detener bot:"
echo "    pkill -f cocolu_rs_perf"
echo ""
