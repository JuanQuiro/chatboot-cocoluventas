#\!/bin/bash

# Development Setup Script
# Prepara el entorno de desarrollo para DashOffice Rust

set -e

echo "🦀 DashOffice Rust - Development Setup"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Rust
echo -e "${YELLOW}[1/7] Checking Rust installation...${NC}"
if \! command -v cargo &> /dev/null; then
    echo -e "${RED}❌ Rust not installed${NC}"
    echo "Install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi
echo -e "${GREEN}✅ Rust installed: $(rustc --version)${NC}"

# 2. Check PostgreSQL
echo -e "${YELLOW}[2/7] Checking PostgreSQL...${NC}"
if \! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL client not found${NC}"
    echo "Install: sudo apt install postgresql-client"
else
    echo -e "${GREEN}✅ PostgreSQL client installed${NC}"
fi

# 3. Check Redis
echo -e "${YELLOW}[3/7] Checking Redis...${NC}"
if \! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis not installed${NC}"
    echo "Install: sudo apt install redis-server"
else
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis running${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis installed but not running${NC}"
        echo "Start: sudo systemctl start redis"
    fi
fi

# 4. Setup .env
echo -e "${YELLOW}[4/7] Setting up .env file...${NC}"
if [ \! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env from .env.example${NC}"
    echo -e "${YELLOW}⚠️  Edit .env with your configuration${NC}"
else
    echo -e "${GREEN}✅ .env already exists${NC}"
fi

# 5. Install sqlx-cli
echo -e "${YELLOW}[5/7] Checking sqlx-cli...${NC}"
if \! command -v sqlx &> /dev/null; then
    echo -e "${YELLOW}Installing sqlx-cli...${NC}"
    cargo install sqlx-cli --no-default-features --features postgres
    echo -e "${GREEN}✅ sqlx-cli installed${NC}"
else
    echo -e "${GREEN}✅ sqlx-cli already installed${NC}"
fi

# 6. Dependencies
echo -e "${YELLOW}[6/7] Installing Rust dependencies...${NC}"
cargo build
echo -e "${GREEN}✅ Dependencies installed${NC}"

# 7. Create directories
echo -e "${YELLOW}[7/7] Creating directories...${NC}"
mkdir -p logs
mkdir -p data
echo -e "${GREEN}✅ Directories created${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Development environment ready\!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env with your database credentials"
echo "2. Create database: sqlx database create"
echo "3. Run migrations: sqlx migrate run"
echo "4. Start development: cargo run --bin api-gateway"
echo ""
