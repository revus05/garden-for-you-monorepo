#!/bin/bash
# Alerts to Telegram when the database backups go stale.
#
# Backups go to a Telegram chat now, and a bot cannot list files in a chat, so
# pg-backup.sh records the time of its last successful upload and this script
# checks that instead.
#
# Install on the server (hourly):
#   30 * * * * /opt/repositories/garden-for-you-monorepo/scripts/monitor/check-backups.sh

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./notify.sh
. "$SCRIPT_DIR/notify.sh"

LAST_OK_FILE=/var/lib/garden-monitor/last-backup-ok
MAX_AGE_HOURS=24

if [ ! -f "$LAST_OK_FILE" ]; then
    report backups fail "Ни одного успешного бэкапа ещё не было (нет $LAST_OK_FILE)."
    exit 1
fi

AGE_HOURS=$(( ( $(date +%s) - $(cat "$LAST_OK_FILE") ) / 3600 ))

if [ "$AGE_HOURS" -gt "$MAX_AGE_HOURS" ]; then
    report backups fail "Последний бэкап был $AGE_HOURS часов назад!

Лог: /var/log/garden-pg-backup.log"
else
    report backups ok "бэкапы (последний $AGE_HOURS ч назад)"
fi
