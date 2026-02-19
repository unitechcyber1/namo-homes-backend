#!/bin/bash

# AWS EC2 Deployment Script for Namohomes Backend
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root${NC}"
   exit 1
fi

# Application directory
APP_DIR="/var/www/namohomes-backend"
cd $APP_DIR

echo -e "${GREEN}✓${NC} Changed to application directory"

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo -e "${YELLOW}→${NC} Pulling latest code..."
    git pull origin main || git pull origin master
    echo -e "${GREEN}✓${NC} Code updated"
else
    echo -e "${YELLOW}⚠${NC} Not a git repository, skipping pull"
fi

# Install/update dependencies
echo -e "${YELLOW}→${NC} Installing dependencies..."
npm install --production
echo -e "${GREEN}✓${NC} Dependencies installed"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}✗${NC} .env file not found!"
    echo -e "${YELLOW}Please create .env file with required variables${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Environment file found"

# Validate environment variables (basic check)
if ! grep -q "MONGO_URI" .env || ! grep -q "JWT_SECRET_ADMIN" .env; then
    echo -e "${RED}✗${NC} Required environment variables missing!"
    exit 1
fi
echo -e "${GREEN}✓${NC} Environment variables validated"

# Create logs directory if it doesn't exist
mkdir -p logs
echo -e "${GREEN}✓${NC} Logs directory ready"

# Restart application with PM2
echo -e "${YELLOW}→${NC} Restarting application..."
pm2 restart namohomes-backend || pm2 start ecosystem.config.js
echo -e "${GREEN}✓${NC} Application restarted"

# Save PM2 configuration
pm2 save
echo -e "${GREEN}✓${NC} PM2 configuration saved"

# Show status
echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
pm2 status
echo ""
echo -e "${GREEN}View logs with: pm2 logs namohomes-backend${NC}"

