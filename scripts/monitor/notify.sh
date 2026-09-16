#!/bin/bash
# Shared Telegram notifier for the monitoring scripts in this directory.
#
# The bot token lives outside the repo so it is never committed. Create
# /etc/garden-monitor.env on the server with:
#
#   BOT_TOKEN=123456:AA...
#   CHAT_ID=805218286
#
# then: chmod 600 /etc/garden-monitor.env

CONFIG_FILE="${GARDEN_MONITOR_CONFIG:-/etc/garden-monitor.env}"

if [ ! -r "$CONFIG_FILE" ]; then
    echo "monitor: config $CONFIG_FILE is missing or unreadable" >&2
    exit 1
fi

# shellcheck disable=SC1090
. "$CONFIG_FILE"

if [ -z "${BOT_TOKEN:-}" ] || [ -z "${CHAT_ID:-}" ]; then
    echo "monitor: BOT_TOKEN or CHAT_ID is not set in $CONFIG_FILE" >&2
    exit 1
fi

notify() {
    curl -sS -m 15 -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
        -d chat_id="${CHAT_ID}" \
        -d text="$1" \
        -o /dev/null
}
