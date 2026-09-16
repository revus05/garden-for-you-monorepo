#!/bin/bash
# Alerts to Telegram when the stack stops answering or the disk starts filling up.
#
# Install on the server (every 5 minutes):
#   */5 * * * * /opt/repositories/garden-for-you-monorepo/scripts/monitor/health-check.sh

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./notify.sh
. "$SCRIPT_DIR/notify.sh"

DISK_THRESHOLD=85
BACKEND_URL=http://127.0.0.1:9000/health
STOREFRONT_URL=http://127.0.0.1:3000/

# --- Disk ---
# This is what took the site down: a full disk stops Postgres from writing and
# the whole stack follows.
DISK_USED=$(df --output=pcent / | tail -n 1 | tr -dc '0-9')
if [ -n "$DISK_USED" ] && [ "$DISK_USED" -ge "$DISK_THRESHOLD" ]; then
    report disk fail "Диск заполнен на ${DISK_USED}%.

Почистить: docker image prune -af && docker builder prune -af"
else
    report disk ok "место на диске (сейчас ${DISK_USED}%)"
fi

# --- Postgres ---
if docker exec garden-postgres pg_isready -U postgres -d medusa -q 2>/dev/null; then
    report postgres ok "Postgres"
else
    report postgres fail "Postgres не отвечает на pg_isready.

Проверить: docker compose -f docker-compose.deploy.yml logs --tail=50 postgres"
fi

# --- Backend ---
if curl -fsS -m 10 -o /dev/null "$BACKEND_URL"; then
    report backend ok "backend (API и админка)"
else
    report backend fail "Backend не отвечает на $BACKEND_URL.

Админка и корзина не работают. Проверить: docker compose -f docker-compose.deploy.yml ps"
fi

# --- Storefront ---
if curl -fsS -m 15 -o /dev/null "$STOREFRONT_URL"; then
    report storefront ok "сайт"
else
    report storefront fail "Сайт не отвечает на $STOREFRONT_URL.

Проверить: docker compose -f docker-compose.deploy.yml logs --tail=50 storefront"
fi
