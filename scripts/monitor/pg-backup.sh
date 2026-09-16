#!/bin/bash
# Dumps the Medusa database, uploads it to Backblaze B2, prunes old copies and
# shouts in Telegram if any of that fails.
#
# Install on the server (every 6 hours) — see crontab.example in this directory.

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# pipefail matters here: without it the exit status of `pg_dump | gzip` is gzip's,
# so a failed dump would be happily compressed and reported as a success.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./notify.sh
. "$SCRIPT_DIR/notify.sh"

CONTAINER_NAME=garden-postgres
DB_USER=postgres
DB_NAME=medusa
BUCKET="b2:revus-garden-backups"
RETENTION_DAYS=14
LOG_FILE=/var/log/garden-pg-backup.log

# Never let two dumps run at once.
exec 9>/var/lock/garden-pg-backup.lock
if ! flock -n 9; then
    echo "$(date '+%F %T'): предыдущий бэкап ещё идёт, выхожу"
    exit 0
fi

TMP_FILE=$(mktemp "/tmp/${DB_NAME}-backup-XXXXXX.sql.gz")
trap 'rm -f "$TMP_FILE"' EXIT

FILENAME="${DB_NAME}_$(date +%Y-%m-%d_%H-%M).sql.gz"

log() { echo "$(date '+%F %T'): $1"; }

fail() {
    log "ОШИБКА: $1"
    report pg-backup fail "Бэкап базы не создан.

$1

Лог: $LOG_FILE"
    exit 1
}

log "начинаю бэкап $FILENAME"

# No -t: a TTY rewrites every LF in the dump as CRLF and silently corrupts it.
if ! docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$TMP_FILE"; then
    fail "pg_dump или gzip завершились с ошибкой (контейнер $CONTAINER_NAME)."
fi

if ! gzip -t "$TMP_FILE" 2>/dev/null; then
    fail "архив получился битый, gzip -t не прошёл."
fi

# pg_dump writes this as the very last line of a complete dump. Cheapest way to
# catch a dump that died halfway through and still looks like a valid archive.
if ! gunzip -c "$TMP_FILE" | tail -n 5 | grep -q "PostgreSQL database dump complete"; then
    fail "дамп оборван: нет финальной строки 'PostgreSQL database dump complete'."
fi

SIZE=$(du -h "$TMP_FILE" | cut -f1)

# copyto, not copy: the local file has a mktemp name and needs renaming on upload.
if ! rclone copyto "$TMP_FILE" "$BUCKET/$FILENAME" --quiet; then
    fail "не удалось загрузить бэкап в B2."
fi

log "загружено: $FILENAME ($SIZE)"

# Pruning only happens after a successful upload, so a long outage can never
# empty the bucket — no new backup, no delete.
if ! rclone delete "$BUCKET" --min-age "${RETENTION_DAYS}d" --rmdirs; then
    log "предупреждение: не удалось удалить бэкапы старше ${RETENTION_DAYS} дней"
fi

report pg-backup ok "бэкапы базы"
