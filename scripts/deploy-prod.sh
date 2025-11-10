#!/bin/bash

# Deploy to Production Environment

echo "🚀 Deploying to PRODUCTION..."

# Confirmation
read -p "⚠️  Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Load environment
export NODE_ENV=production

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production not found"
    exit 1
fi

# Load production secrets
source .env.production

# Backup database
echo "💾 Creating database backup..."
./scripts/backup-db.sh

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Run tests
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Aborting deployment"
    exit 1
fi

# Build images
echo "🔨 Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Rolling update (zero-downtime)
echo "🔄 Performing rolling update..."
docker-compose -f docker-compose.prod.yml up -d --scale api-prod=3 --no-recreate

# Wait for new containers
echo "⏳ Waiting for services..."
sleep 30

# Health check
echo "🏥 Checking health..."
for i in {1..5}; do
    if curl -f https://api.cocolu-ventas.com/health; then
        echo "✅ Health check passed"
        break
    fi
    echo "⏳ Waiting for health check... ($i/5)"
    sleep 10
done

# Remove old containers
echo "🧹 Cleaning up old containers..."
docker system prune -f

# Show status
docker-compose -f docker-compose.prod.yml ps

echo "✅ Production deployment complete!"
echo "📊 Dashboard: https://cocolu-ventas.com"
echo "🔌 API: https://api.cocolu-ventas.com"
echo "📈 Monitoring: https://grafana.cocolu-ventas.com"

# Send notification
echo "📧 Sending deployment notification..."
# Add your notification logic here (Slack, email, etc.)
