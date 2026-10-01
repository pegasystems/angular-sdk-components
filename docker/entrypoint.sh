#!/bin/sh
# Runs before nginx starts (nginx image executes /docker-entrypoint.d/*.sh): renders sdk-config.json from SDK_* variables.
set -eu

WEB_ROOT="${SDK_WEB_ROOT:-/usr/share/nginx/html}"
SCRIPT_DIR="${SDK_SCRIPT_DIR:-/opt/sdk/scripts}"

node "$SCRIPT_DIR/configure-sdk.js" --file "$WEB_ROOT/sdk-config.json" --out "$WEB_ROOT/sdk-config.json"
