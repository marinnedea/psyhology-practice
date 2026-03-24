#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# MindBridge — Docker Install Script
#
# One-liner usage:
#   bash <(curl -fsSL https://raw.githubusercontent.com/marinnedea/psyhology-practice/main/scripts/docker-install.sh)
#
# Or after cloning:
#   bash scripts/docker-install.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

# ── Colours ───────────────────────────────────────────────────
RED='\\033[0;31m'; GREEN='\\033[0;32m'; YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'; BOLD='\\033[1m'; RESET='\\033[0m'

info()    { echo -e "${CYAN}▸ $*${RESET}"; }
success() { echo -e "${GREEN}✔  $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  $*${RESET}"; }
error()   { echo -e "${RED}✘  $*${RESET}" >&2; exit 1; }
header()  { echo -e "\n${BOLD}${CYAN}══ $* ══${RESET}\n"; }

# ── Banner ────────────────────────────────────────────────────
echo -e "${BOLD}"
echo "  __  __ _           _ ____       _     _            "
echo " |  \\/  (_)_ __   __| | __ )  ___(_) __| | __ _  ___ "
echo " | |\\/| | | '_ \\ / _\` |  _ \\ / __| |/ _\` |/ _\` |/ _ \\"
echo " | |  | | | | | | (_| | |_) | (__| | (_| | (_| |  __/"
echo " |_|  |_|_|_| |_|\\__,_|____/ \\___|_|\\__,_|\\__, |\\___| "
echo "                                           |___/      "
echo -e "${RESET}"
echo -e "${CYAN}  Psychology Practice Platform — Docker Installer${RESET}\n"

# ── 0. Check Docker ───────────────────────────────────────────
header "Checking Docker"

if ! command -v docker &>/dev/null; then
  error "Docker is not installed. Install it from https://docs.docker.com/get-docker/ and re-run."
fi
success "Docker found: $(docker --version)"

if ! docker compose version &>/dev/null; then
  error "Docker Compose plugin not found. Update Docker Desktop or install the plugin: https://docs.docker.com/compose/install/"
fi
success "Docker Compose found: $(docker compose version)"

# ── 1. Clone or detect repo ───────────────────────────────────
header "Repository"

REPO_URL="https://github.com/marinnedea/psyhology-practice.git"
APP_DIR="psyhology-practice"

if [ -f "docker-compose.yml" ] && [ -f "next.config.ts" ]; then
  # Already inside the project directory
  info "Running from inside project directory."
elif [ -d "$APP_DIR" ]; then
  info "Directory '$APP_DIR' already exists — skipping clone."
  cd "$APP_DIR"
else
  info "Cloning repository..."
  git clone "$REPO_URL"
  cd "$APP_DIR"
  success "Repository cloned."
fi

# ── 2. Environment setup ──────────────────────────────────────
header "Environment configuration"

if [ -f .env.local ]; then
  warn ".env.local already exists — skipping generation."
else
  if [ ! -f .env.example ]; then
    error ".env.example not found. Are you in the project directory?"
  fi
  cp .env.example .env.local
  success "Copied .env.example → .env.local"

  # Generate NEXTAUTH_SECRET
  NEXTAUTH_SECRET=$(openssl rand -base64 32)
  sed -i "s|CHANGE_ME_run_openssl_rand_-base64_32|${NEXTAUTH_SECRET}|g" .env.local
  success "Generated NEXTAUTH_SECRET."

  # DB password
  read -rp "  Choose a PostgreSQL password [auto-generate]: " DB_PASS
  if [ -z "$DB_PASS" ]; then
    DB_PASS=$(openssl rand -base64 16 | tr -dc 'A-Za-z0-9' | head -c 20)
    info "Generated DB password: ${DB_PASS}"
  fi
  sed -i "s|CHANGE_ME|${DB_PASS}|g" .env.local
  # Add DB_PASSWORD for docker-compose variable substitution
  echo "" >> .env.local
  echo "DB_PASSWORD=${DB_PASS}" >> .env.local
  success "Set database password."

  # Domain
  read -rp "  Enter your app URL (e.g. https://app.example.com) [http://localhost:3000]: " APP_URL
  APP_URL="${APP_URL:-http://localhost:3000}"
  sed -i "s|https://your-domain.com|${APP_URL}|g" .env.local
  success "Set NEXTAUTH_URL to ${APP_URL}."

  echo ""
  warn "Optional: add API keys to .env.local if you have them:"
  warn "  NEXT_PUBLIC_TINYMCE_API_KEY   — https://www.tiny.cloud"
  warn "  NEXT_PUBLIC_UNSPLASH_ACCESS_KEY — https://unsplash.com/developers"
fi

# Read DB_PASSWORD from .env.local for docker compose
export DB_PASSWORD
DB_PASSWORD=$(grep '^DB_PASSWORD=' .env.local | cut -d= -f2-)

if [ -z "$DB_PASSWORD" ]; then
  error "DB_PASSWORD not found in .env.local. Please add 'DB_PASSWORD=yourpassword' to .env.local and re-run."
fi

# ── 3. Build and start ────────────────────────────────────────
header "Building and starting services"

info "Running: docker compose up -d --build"
docker compose up -d --build
success "Services started."

# ── 4. Wait for app health ────────────────────────────────────
header "Waiting for application to be ready"

MAX_WAIT=120
ELAPSED=0
until curl -sf http://localhost:3000 >/dev/null 2>&1; do
  if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
    warn "App did not become reachable within ${MAX_WAIT}s. Check logs: docker compose logs app"
    break
  fi
  printf "."
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done
echo ""
success "Application is reachable."

# ── 5. Optional seed ──────────────────────────────────────────
header "Seed data (optional)"

read -rp "  Load demo data? Creates sample psychologists, clients, blog posts, etc. [y/N]: " SEED_ANSWER
if [[ "${SEED_ANSWER,,}" == "y" ]]; then
  info "Seeding database..."
  docker compose run --rm app npm run db:seed
  success "Database seeded."
  echo ""
  echo -e "  ${BOLD}Demo credentials:${RESET}"
  echo -e "  Admin:        admin@psychpractice.com  / Admin123#"
  echo -e "  Psychologist: dr.sofia.andreou@psychpractice.com / Psych123#"
  echo -e "  Client:       alice.johnson@example.com / Client123#"
else
  info "Skipping seed."
fi

# ── Done ──────────────────────────────────────────────────────
APP_URL_DISPLAY="${APP_URL:-http://localhost:3000}"

echo ""
echo -e "${GREEN}${BOLD}════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  ✔  MindBridge is running!                 ${RESET}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════${RESET}"
echo ""
echo -e "  App: ${BOLD}http://localhost:3000${RESET}"
echo ""
echo -e "${YELLOW}  Useful commands:${RESET}"
echo -e "  docker compose logs -f app    — follow app logs"
echo -e "  docker compose down           — stop all services"
echo -e "  docker compose pull && docker compose up -d --build  — update"
echo ""
