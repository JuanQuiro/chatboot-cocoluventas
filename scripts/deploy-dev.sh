#!/bin/bash

# Deploy to Development Environment

echo "🚀 Deploying to DEVELOPMENT..."

# Load environment
export NODE_ENV=development

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Build images
echo "🔨 Building images..."
docker-compose -f docker-compose.dev.yml build

# Start services
echo "▶️  Starting services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check health
echo "🏥 Checking health..."
docker-compose -f docker-compose.dev.yml ps

# Show logs
echo "📋 Showing logs (Ctrl+C to exit)..."
docker-compose -f docker-compose.dev.yml logs -f

echo "✅ Development environment is running!"
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 API: http://localhost:3001"
echo "🗄️  MongoDB: mongodb://localhost:27017"
