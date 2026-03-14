#!/bin/bash

# ===========================================
# DataGN Setup Script
# Run this script after cloning the repository
# ===========================================

set -e

echo "🚀 Setting up DataGN..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js 20+ is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found, creating from .env.example${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Please edit .env.local with your configuration${NC}"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Check if Docker is available for local development
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker is available${NC}"

    read -p "Do you want to start Docker services (PostgreSQL, Redis, MinIO)? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🐳 Starting Docker services..."
        docker-compose up -d

        echo "⏳ Waiting for services to be ready..."
        sleep 5

        # Run migrations
        echo "📊 Running database migrations..."
        npx prisma migrate dev

        # Seed database
        echo "🌱 Seeding database..."
        npx prisma db seed
    fi
else
    echo -e "${YELLOW}⚠️  Docker not found. Make sure PostgreSQL, Redis, and MinIO are running.${NC}"
fi

# Run tests
echo "🧪 Running tests..."
npm run test

# Build the project
echo "🏗️  Building the project..."
npm run build

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local with your configuration"
echo "  2. Run 'npm run dev' to start development server"
echo "  3. Open http://localhost:3000"
echo ""
