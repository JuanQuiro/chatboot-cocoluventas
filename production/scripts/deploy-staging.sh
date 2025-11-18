#!/bin/bash

# Deploy to Staging Environment

echo "🚀 Deploying to STAGING..."

# Load environment
export NODE_ENV=staging

# Check if .env.staging exists
if [ ! -f .env.staging ]; then
    echo "❌ Error: .env.staging not found"
    exit 1
fi

# Load staging secrets
source .env.staging

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin staging

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.staging.yml down

# Build images
echo "🔨 Building images..."
docker-compose -f docker-compose.staging.yml build --no-cache

# Start services
echo "▶️  Starting services..."
docker-compose -f docker-compose.staging.yml up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 15

# Run migrations if needed
echo "🔄 Running migrations..."
docker-compose -f docker-compose.staging.yml exec api-staging npm run migrate

# Check health
echo "🏥 Checking health..."
curl -f http://localhost:3001/health || echo "⚠️  API health check failed"

# Show status
docker-compose -f docker-compose.staging.yml ps

echo "✅ Staging environment is running!"
echo "📊 Dashboard: https://staging.cocolu-ventas.com"
echo "🔌 API: https://api-staging.cocolu-ventas.com"
