#!/usr/bin/env bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   The Daily Cairo — Setup Script           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# ─── Backend Setup ────────────────────────────────────────────────────────────
echo -e "${YELLOW}[1/4] Setting up Laravel backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  ✓ .env created from .env.example"
fi

echo "  → Installing Composer dependencies..."
composer install --no-interaction --prefer-dist

echo "  → Generating app key..."
php artisan key:generate --force

echo "  → Creating database..."
# Create the database if it doesn't exist
mysql -u "${DB_USERNAME:-root}" -p"${DB_PASSWORD:-}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_DATABASE:-daily_cairo}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || echo "  ! Please create database manually: CREATE DATABASE daily_cairo"

echo "  → Running migrations..."
php artisan migrate --force

echo "  → Seeding demo data..."
php artisan db:seed --force

echo "  → Creating storage link..."
php artisan storage:link 2>/dev/null || true

echo "  → Publishing vendor assets..."
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" --force 2>/dev/null || true
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --force 2>/dev/null || true

echo -e "${GREEN}  ✓ Backend ready!${NC}"
cd ..

# ─── Frontend Setup ───────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/4] Setting up React frontend...${NC}"
cd frontend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  ✓ .env created from .env.example"
fi

echo "  → Installing npm dependencies..."
npm install

echo -e "${GREEN}  ✓ Frontend ready!${NC}"
cd ..

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup complete! 🎉                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo "To start the project, open two terminals:"
echo ""
echo -e "  ${YELLOW}Terminal 1 (Backend):${NC}"
echo "    cd backend"
echo "    php artisan serve"
echo "    → http://localhost:8000"
echo ""
echo -e "  ${YELLOW}Terminal 2 (Frontend):${NC}"
echo "    cd frontend"
echo "    npm run dev"
echo "    → http://localhost:5173"
echo ""
echo -e "${YELLOW}Demo accounts:${NC}"
echo "  Admin:  admin@dailycairo.com  / admin123456"
echo "  Editor: editor@dailycairo.com / editor123456"
echo "  User:   user@dailycairo.com   / user123456"
echo ""
