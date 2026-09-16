#!/bin/bash
# Alerts to Telegram when the database backups in Backblaze go stale.
#
# Install on the server (hourly):
#   30 * * * * /opt/repositories/garden-for-you-monorepo/scripts/monitor/check-backups.sh

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./notify.sh
. "$SCRIPT_DIR/notify.sh"

BUCKET="b2:revus-garden-backups"
MAX_AGE_HOURS=24

LATEST=$(rclone lsl "$BUCKET" 2>/dev/null | sort -k2,3 | tail -n 1)

if [ -z "$LATEST" ]; then
    report backups fail "В бакете revus-garden-backups вообще нет бэкапов!"
    exit 1
fi

FILE_DATE=$(echo "$LATEST" | awk '{print $2, $3}')
FILE_TIMESTAMP=$(date -d "$FILE_DATE" +%s 2>/dev/null)

if [ -z "$FILE_TIMESTAMP" ]; then
    report backups fail "Не удалось определить дату последнего бэкапа."
    exit 1
fi

AGE_HOURS=$(( ( $(date +%s) - FILE_TIMESTAMP ) / 3600 ))

if [ "$AGE_HOURS" -gt "$MAX_AGE_HOURS" ]; then
    report backups fail "Последний бэкап был $AGE_HOURS часов назад!

Пора проверить, почему бэкапы не создаются."
else
    report backups ok "бэкапы (последний $AGE_HOURS ч назад)"
fi
