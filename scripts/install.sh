#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# MindBridge — Bare-metal Ubuntu Install Script
#
# Tested on Ubuntu 24.x / 25.x.
# Run from the project root directory:
#   bash scripts/install.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

# ── Colours ───────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}▸ $*${RESET}"; }
success() { echo -e "${GREEN}✔  $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  $*${RESET}"; }
error()   { echo -e "${RED}✘  $*${RESET}" >&2; exit 1; }
header()  { echo -e "\n${BOLD}${CYAN}══ $* ══${RESET}\n"; }

# ── Banner ────────────────────────────────────────────────────
echo -e "${BOLD}"
echo "  __  __ _           _ ____       _     _            "
echo " |  \/  (_)_ __   __| | __ )  ___(_) __| | __ _  ___ "
echo " | |\/| | | '_ \ / _\` |  _ \ / __| |/ _\` |/ _\` |/ _ \\"
echo " | |  | | | | | | (_| | |_) | (__| | (_| | (_| |  __/"
echo " |_|  |_|_|_| |_|\__,_|____/ \___|_|\__,_|\__, |\___|"
echo "                                           |___/      "
echo -e "${RESET}"
echo -e "${CYAN}  Psychology Practice Platform — Bare-metal Installer${RESET}\n"

# ── 0. Prerequisite checks ────────────────────────────────────
header "Checking prerequisites"

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    error "$1 is not installed. Please install it and re-run."
  fi
  success "$1 found: $(command -v "$1")"
}

check_cmd node
NODE_VER=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 20 ]; then
  error "Node.js ≥ 20 required. Found: $(node --version)"
fi
success "Node.js version: $(node --version)"

check_cmd npm
check_cmd psql

# ── 1. Database setup ─────────────────────────────────────────
header "Database setup"

read -rp "  Enter a password for the 'psychology_app' DB user: " DB_PASS
if [ -z "$DB_PASS" ]; then
  error "DB password cannot be empty."
fi

info "Creating PostgreSQL user and database (requires sudo access)..."
sudo -u postgres psql <<SQL || warn "DB/user may already exist — skipping creation."
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'psychology_app') THEN
    CREATE USER psychology_app WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE psychology_practice_next OWNER psychology_app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'psychology_practice_next') \gexec

GRANT ALL PRIVILEGES ON DATABASE psychology_practice_next TO psychology_app;
SQL

success "Database ready."

# ── 2. Environment setup ──────────────────────────────────────
header "Environment configuration"

if [ ! -f .env.example ]; then
  error ".env.example not found. Are you running from the project root?"
fi

if [ -f .env.local ]; then
  warn ".env.local already exists — skipping copy."
else
  cp .env.example .env.local
  success "Copied .env.example → .env.local"
fi

# Generate NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)
sed -i "s|CHANGE_ME_run_openssl_rand_-base64_32|${NEXTAUTH_SECRET}|g" .env.local
success "Generated NEXTAUTH_SECRET."

# Set DB password in DATABASE_URL
sed -i "s|CHANGE_ME|${DB_PASS}|g" .env.local
success "Updated DATABASE_URL with DB password."

# Set domain
read -rp "  Enter your domain (e.g. https://app.example.com) [http://localhost:3000]: " APP_URL
APP_URL="${APP_URL:-http://localhost:3000}"
sed -i "s|https://your-domain.com|${APP_URL}|g" .env.local
success "Set NEXTAUTH_URL to ${APP_URL}."

echo ""
warn "Optional API keys — you can add these to .env.local later:"
warn "  NEXT_PUBLIC_TINYMCE_API_KEY   — https://www.tiny.cloud"
warn "  NEXT_PUBLIC_UNSPLASH_ACCESS_KEY — https://unsplash.com/developers"

# ── 3. Install dependencies ───────────────────────────────────
header "Installing dependencies"
npm ci
success "npm ci complete."

# ── 4. Prisma migrate ─────────────────────────────────────────
header "Running database migrations"
npx prisma migrate deploy
success "Migrations applied."

# ── 5. Optional seed ──────────────────────────────────────────
header "Seed data (optional)"
read -rp "  Load demo data? Creates sample psychologists, clients, blog posts, etc. [y/N]: " SEED_ANSWER
if [[ "${SEED_ANSWER,,}" == "y" ]]; then
  info "Seeding database..."
  npm run db:seed
  success "Database seeded."
  echo ""
  echo -e "  ${BOLD}Demo credentials:${RESET}"
  echo -e "  Admin:       admin@psychpractice.com  / Admin123#"
  echo -e "  Psychologist: dr.sofia.andreou@psychpractice.com / Psych123#"
  echo -e "  Client:      alice.johnson@example.com / Client123#"
else
  info "Skipping seed."
fi

# ── 6. Build ──────────────────────────────────────────────────
header "Building application"
npm run build
success "Build complete."

# ── 7. PM2 setup ──────────────────────────────────────────────
header "PM2 process manager"

if ! command -v pm2 &>/dev/null; then
  warn "PM2 not found. Installing globally..."
  npm install -g pm2
  success "PM2 installed."
fi

pm2 start npm --name psych-app -- start
pm2 save
success "Application started with PM2 (name: psych-app)."

# ── Done ──────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  ✔  MindBridge installed successfully!     ${RESET}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════${RESET}"
echo ""
echo -e "  App running on port ${BOLD}3000${RESET}."
echo -e "  URL: ${BOLD}${APP_URL}${RESET}"
echo ""
echo -e "${YELLOW}  Next steps:${RESET}"
echo -e "  1. Configure Nginx to proxy ${APP_URL} → localhost:3000"
echo -e "     (see README.md for an example Nginx config)"
echo -e "  2. Set up SSL with Let's Encrypt (certbot)"
echo -e "  3. Add TinyMCE and Unsplash keys to .env.local, then:"
echo -e "     npm run build && pm2 restart psych-app"
echo ""
