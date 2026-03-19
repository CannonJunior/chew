#!/bin/bash

# Chew - Startup Script
# This script ensures port 3000 is available, runs DB migrations, and starts the application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Application port
PORT=3000

echo -e "${BLUE}🍽️  Chew - Food Intelligence Platform${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Check if port is in use
echo -e "${YELLOW}🔍 Checking if port ${PORT} is in use...${NC}"

PID=$(lsof -ti TCP:${PORT} -s TCP:LISTEN 2>/dev/null || true)

if [ -n "$PID" ]; then
    echo -e "${YELLOW}⚠️  Found process running on port ${PORT} (PID: ${PID})${NC}"
    echo -e "${YELLOW}🔪 Killing process ${PID}...${NC}"

    kill $PID 2>/dev/null || true
    sleep 2

    if lsof -ti TCP:${PORT} -s TCP:LISTEN >/dev/null 2>&1; then
        echo -e "${RED}⚠️  Process didn't stop gracefully, forcing...${NC}"
        kill -9 $PID 2>/dev/null || true
        sleep 1
    fi

    if lsof -ti TCP:${PORT} -s TCP:LISTEN >/dev/null 2>&1; then
        echo -e "${RED}❌ Failed to free port ${PORT}${NC}"
        echo -e "${RED}   Please manually kill the process and try again${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Port ${PORT} is now free${NC}\n"
    fi
else
    echo -e "${GREEN}✅ Port ${PORT} is available${NC}\n"
fi

# Run database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npm run db:migrate
echo -e "${GREEN}✅ Database ready${NC}\n"

# Seed Food Wiki from USDA FoodData Central (runs until complete)
WIKI_COUNT=$(node -e "
const DB = require('better-sqlite3');
try { const db = new DB('chew.db'); console.log(db.prepare('SELECT COUNT(*) as n FROM wiki_ingredients').get().n); db.close(); }
catch { console.log(0); }
" 2>/dev/null || echo "0")

# Target: Foundation Foods (~365) + SR Legacy essentials (~7000+)
# Re-seed if under 1000 — allows resuming after a rate-limit interruption
if [ "$WIKI_COUNT" -lt 1000 ]; then
    echo -e "${YELLOW}🌾 Seeding Food Wiki from USDA FoodData Central (${WIKI_COUNT} so far)...${NC}"
    if [ -z "$USDA_API_KEY" ]; then
        echo -e "${YELLOW}   Tip: Set USDA_API_KEY for unlimited requests → https://fdc.nal.usda.gov/api-key-signup${NC}"
        echo -e "${YELLOW}   Using DEMO_KEY (30 req/hour — may need multiple restarts to complete)${NC}"
    fi
    npm run seed:wiki || true  # Don't fail startup if rate-limited
    echo -e "${GREEN}✅ Food Wiki seeding done${NC}\n"
else
    echo -e "${GREEN}✅ Food Wiki ready (${WIKI_COUNT} ingredients)${NC}\n"
fi

# Remove stale Next.js dev lock (left behind when process is killed)
rm -f .next/dev/lock

# Start the application
echo -e "${GREEN}🚀 Starting Chew...${NC}"
echo -e "${BLUE}======================================${NC}\n"

npm run dev
