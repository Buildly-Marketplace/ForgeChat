#!/bin/bash

# ForgeChat Docker Deployment Script
# Usage: ./deploy.sh [development|production]

set -e

ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Deploying ForgeChat in $ENVIRONMENT mode..."

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Use appropriate compose command
COMPOSE_CMD="docker-compose"
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
fi

cd "$PROJECT_DIR"

# Check for environment file
if [ ! -f "ops/.env" ]; then
    if [ -f "ops/.env.example" ]; then
        echo "📝 Creating .env file from example..."
        cp ops/.env.example ops/.env
        echo "⚠️  Please edit ops/.env with your BabbleBeaver credentials before continuing."
        echo "   Required variables: BABBLEBEAVER_ORG_UUID, BABBLEBEAVER_PRODUCT_UUID, BABBLEBEAVER_AUTH_TOKEN"
        exit 1
    else
        echo "❌ No environment file found. Please create ops/.env with your configuration."
        exit 1
    fi
fi

# Set environment-specific variables
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🔧 Setting up production environment..."
    export NODE_ENV=production
    export COMPOSE_FILE="ops/docker-compose.yml"
else
    echo "🔧 Setting up development environment..."
    export NODE_ENV=development
    export COMPOSE_FILE="ops/docker-compose.yml"
fi

# Pull latest images
echo "📦 Pulling latest images..."
$COMPOSE_CMD -f ops/docker-compose.yml --env-file ops/.env pull

# Build the application
echo "🔨 Building ForgeChat..."
$COMPOSE_CMD -f ops/docker-compose.yml --env-file ops/.env build

# Stop existing containers
echo "🛑 Stopping existing containers..."
$COMPOSE_CMD -f ops/docker-compose.yml --env-file ops/.env down

# Start the application
echo "▶️  Starting ForgeChat..."
$COMPOSE_CMD -f ops/docker-compose.yml --env-file ops/.env up -d

# Wait for health check
echo "🏥 Waiting for health check..."
sleep 10

# Check if the service is healthy
if curl -f http://localhost:${PORT:-3000}/health > /dev/null 2>&1; then
    echo "✅ ForgeChat is running successfully!"
    echo "🌐 Access your chat widget at: http://localhost:${PORT:-3000}"
    echo "📊 Health endpoint: http://localhost:${PORT:-3000}/health"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Visit the URL above to test your chat widget"
    echo "  2. Copy the embed code from the examples to use on your website" 
    echo "  3. Configure your BabbleBeaver settings in the admin panel"
    echo ""
    echo "🔍 View logs with: $COMPOSE_CMD -f ops/docker-compose.yml logs -f"
    echo "🛑 Stop with: $COMPOSE_CMD -f ops/docker-compose.yml down"
else
    echo "❌ Health check failed. Checking logs..."
    $COMPOSE_CMD -f ops/docker-compose.yml --env-file ops/.env logs forgechat
    exit 1
fi