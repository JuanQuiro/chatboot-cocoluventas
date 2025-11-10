#\!/bin/bash

# Start all services in development mode

echo "🚀 Starting DashOffice Rust (Development)"
echo ""

# Start services in background
echo "Starting API Gateway..."
RUST_LOG=debug cargo run --bin api-gateway &
API_PID=$\!

echo "Starting WhatsApp Adapter..."
RUST_LOG=debug cargo run --bin whatsapp-adapter &
WA_PID=$\!

echo "Starting Bot Orchestrator..."
RUST_LOG=debug cargo run --bin bot-orchestrator &
BOT_PID=$\!

echo "Starting Analytics Engine..."
RUST_LOG=debug cargo run --bin analytics-engine &
ANA_PID=$\!

echo ""
echo "✅ All services started"
echo ""
echo "PIDs:"
echo "  API Gateway:      $API_PID"
echo "  WhatsApp Adapter: $WA_PID"
echo "  Bot Orchestrator: $BOT_PID"
echo "  Analytics Engine: $ANA_PID"
echo ""
echo "URLs:"
echo "  API:      http://localhost:3009/health"
echo "  WhatsApp: http://localhost:3010/health"
echo "  Bot:      http://localhost:3011/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "kill $API_PID $WA_PID $BOT_PID $ANA_PID 2>/dev/null" EXIT
wait
