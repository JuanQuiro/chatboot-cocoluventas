#\!/bin/bash
# Deploy a Producción - DashOffice Rust

set -e

echo "🚀 DashOffice - Deployment a Producción"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables
SERVER="${1:-production}"
COMPOSE_FILE="docker-compose.production.yml"

# Verificar que estemos en main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" \!= "main" ]; then
    echo -e "${RED}❌ ERROR: Debes estar en la rama 'main' para deploy${NC}"
    echo "Rama actual: $CURRENT_BRANCH"
    exit 1
fi

# Verificar que no haya cambios sin commit
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}❌ ERROR: Hay cambios sin commit${NC}"
    git status -s
    exit 1
fi

# Pull latest
echo -e "${YELLOW}[1/7] Pulling latest changes...${NC}"
git pull origin main

# Build release
echo -e "${YELLOW}[2/7] Building release...${NC}"
cargo build --release --all

# Run tests
echo -e "${YELLOW}[3/7] Running tests...${NC}"
cargo test --all

# Build Docker images
echo -e "${YELLOW}[4/7] Building Docker images...${NC}"
docker-compose -f $COMPOSE_FILE build

# Tag images
VERSION=$(git describe --tags --always)
echo -e "${YELLOW}[5/7] Tagging images with version: $VERSION${NC}"
docker tag dashoffice-api:latest dashoffice-api:$VERSION
docker tag dashoffice-whatsapp:latest dashoffice-whatsapp:$VERSION
docker tag dashoffice-orchestrator:latest dashoffice-orchestrator:$VERSION

# Push to registry (optional)
echo -e "${YELLOW}[6/7] Pushing images to registry...${NC}"
# docker push dashoffice-api:$VERSION
# docker push dashoffice-whatsapp:$VERSION
# docker push dashoffice-orchestrator:$VERSION

# Deploy
echo -e "${YELLOW}[7/7] Deploying to $SERVER...${NC}"
docker-compose -f $COMPOSE_FILE up -d

# Wait for services
echo ""
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 10

# Health checks
echo ""
echo -e "${GREEN}Health Checks:${NC}"
curl -s http://localhost:3009/health && echo "  ✅ API Gateway OK" || echo "  ❌ API Gateway FAIL"
curl -s http://localhost:3010/health && echo "  ✅ WhatsApp Adapter OK" || echo "  ❌ WhatsApp Adapter FAIL"
curl -s http://localhost:3011/health && echo "  ✅ Bot Orchestrator OK" || echo "  ❌ Bot Orchestrator FAIL"

# Show containers
echo ""
echo -e "${GREEN}Running Containers:${NC}"
docker-compose -f $COMPOSE_FILE ps

# Show memory usage
echo ""
echo -e "${GREEN}Memory Usage:${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}"

echo ""
echo -e "${GREEN}✅ Deployment completed successfully\!${NC}"
echo ""
echo "URLs:"
echo "  Dashboard: http://localhost"
echo "  API:       http://localhost/api/health"
echo "  Metrics:   http://localhost/metrics"
echo ""
echo "Next steps:"
echo "  - Monitor logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "  - Check metrics: make monitor"
echo "  - Rollback: docker-compose -f $COMPOSE_FILE down && git checkout <previous-version>"
echo ""
