#!/bin/bash
# Dumps the Medusa database, encrypts it with age and sends it to a Telegram
# chat; shouts in Telegram if any of that fails.
#
# Backblaze B2 was dropped: the hosting provider resets every connection to
# api.backblazeb2.com, while Telegram stays reachable.
#
# Extra keys in /etc/garden-monitor.env (see notify.sh):
#   AGE_RECIPIENT=age1...       public key; the private one never touches the server
#   BACKUP_CHAT_ID=-100...      optional, defaults to CHAT_ID
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
BACKUP_CHAT_ID="${BACKUP_CHAT_ID:-$CHAT_ID}"
# Telegram's sendDocument limit for bots.
MAX_SIZE_BYTES=$(( 50 * 1024 * 1024 ))
# check-backups.sh reads this to tell how old the newest backup is.
LAST_OK_FILE=/var/lib/garden-monitor/last-backup-ok
LOG_FILE=/var/log/garden-pg-backup.log

# Never let two dumps run at once.
exec 9>/var/lock/garden-pg-backup.lock
if ! flock -n 9; then
    echo "$(date '+%F %T'): предыдущий бэкап ещё идёт, выхожу"
    exit 0
fi

TMP_FILE=$(mktemp "/tmp/${DB_NAME}-backup-XXXXXX.sql.gz")
ENC_FILE="$TMP_FILE.age"
ERR_FILE=$(mktemp)
trap 'rm -f "$TMP_FILE" "$ENC_FILE" "$ERR_FILE"' EXIT

FILENAME="${DB_NAME}_$(date +%Y-%m-%d_%H-%M).sql.gz.age"

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

# The dump holds customer names, addresses and password hashes, and bot chats
# are not end-to-end encrypted, so nothing leaves the server in plain form.
if [ -z "${AGE_RECIPIENT:-}" ]; then
    fail "AGE_RECIPIENT не задан в $CONFIG_FILE, без шифрования бэкап не отправляю."
fi

if ! age -r "$AGE_RECIPIENT" -o "$ENC_FILE" "$TMP_FILE" 2>"$ERR_FILE"; then
    fail "не удалось зашифровать дамп (age).

$(tail -n 3 "$ERR_FILE")"
fi

SIZE_BYTES=$(stat -c %s "$ENC_FILE")
SIZE=$(du -h "$ENC_FILE" | cut -f1)

if [ "$SIZE_BYTES" -gt "$MAX_SIZE_BYTES" ]; then
    fail "бэкап $SIZE больше лимита Telegram в 50 МБ, нужно другое хранилище."
fi

# Telegram answers HTTP 200 with {"ok":false,...} on some errors, so the body is
# checked as well as curl's exit code.
RESPONSE=$(curl -sS -m 120 \
    -F chat_id="$BACKUP_CHAT_ID" \
    -F document=@"$ENC_FILE;filename=$FILENAME" \
    -F caption="🗄 Бэкап базы $DB_NAME, $SIZE" \
    "https://api.telegram.org/bot${BOT_TOKEN}/sendDocument" 2>"$ERR_FILE")
CURL_RC=$?

if [ "$CURL_RC" -ne 0 ] || ! echo "$RESPONSE" | grep -q '"ok":true'; then
    fail "не удалось отправить бэкап в Telegram (curl, код $CURL_RC).

$(tail -n 3 "$ERR_FILE")
$(echo "$RESPONSE" | head -c 300)"
fi

date +%s > "$LAST_OK_FILE"
log "отправлено: $FILENAME ($SIZE)"

report pg-backup ok "бэкапы базы"
