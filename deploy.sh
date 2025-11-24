#!/bin/bash
# Deploy Script - Cocolu ChatBot
# Usage: ./deploy.sh [server_password]

set -e  # Exit on error

SERVER="root@173.249.205.142"
PASSWORD="${1:-a9psHSvLyrKock45yE2F}"
APP_DIR="/root/apps/chatboot-cocoluventas"

echo "🚀 ===== COCOLU CHATBOT DEPLOY ===== 🚀"
echo ""

# Function to run command on server
run_on_server() {
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"
}

echo "📥 Step 1/7: Git pull latest code..."
run_on_server "cd $APP_DIR && git pull origin master"

echo ""
echo "🧹 Step 2/7: Cleaning old dependencies..."
run_on_server "cd $APP_DIR/production && rm -rf node_modules"

echo ""
echo "📦 Step 3/7: Installing optimized dependencies (no Baileys)..."
run_on_server "cd $APP_DIR/production && npm install --omit=dev --no-optional --legacy-peer-deps --loglevel=error"

echo ""
echo "🐳 Step 4/7: Building Docker image..."
run_on_server "cd $APP_DIR && podman build -q -t chatboot-cocoluventas_chatbot ."

echo ""
echo "🛑 Step 5/7: Stopping old container..."
run_on_server "podman stop chatbot-cocolu 2>/dev/null || true"
run_on_server "podman rm chatbot-cocolu 2>/dev/null || true"

echo ""
echo "🚀 Step 6/7: Starting new container..."
run_on_server "podman run -d --name chatbot-cocolu -p 3008:3008 \
  -v $APP_DIR/database:/app/database:Z \
  -v $APP_DIR/credentials/.env.production:/app/production/.env:Z \
  localhost/chatboot-cocoluventas_chatbot:latest"

echo ""
echo "⏳ Waiting for container startup..."
sleep 5

echo ""
echo "✅ Step 7/7: Verification..."
run_on_server "podman ps | grep chatbot"
echo ""
run_on_server "podman logs chatbot-cocolu 2>&1 | grep -E '(Listening|BOT_ADAPTER|Provider)' | tail -5"

echo ""
echo "✅✅✅ DEPLOY COMPLETE ✅✅✅"
echo ""
echo "Dashboard: http://173.249.205.142:3008"
echo ""
