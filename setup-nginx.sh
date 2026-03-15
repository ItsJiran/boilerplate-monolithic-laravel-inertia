#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_SCRIPT="$ROOT_DIR/scripts/setup/setup-nginx-template.sh"

if [ ! -f "$TARGET_SCRIPT" ]; then
  echo "Error: $TARGET_SCRIPT not found"
  exit 1
fi

if [ "$#" -gt 0 ]; then
  exec bash "$TARGET_SCRIPT" "$@"
fi

echo "========================================="
echo " NGINX LB Template Setup Menu"
echo "========================================="
read -r -p "Service [app|hmr|s3|s3-console|pma|reverb]: " service
read -r -p "Domain (host only, ex: api.myapp.com): " domain
read -r -p "Output file [infra/nginx/default.conf.lb.template]: " output
output="${output:-infra/nginx/default.conf.lb.template}"
read -r -p "Force append if same domain exists? [y/N]: " force

args=(--single --service="$service" --domain="$domain" --output="$output")
[[ "$force" =~ ^[Yy]$ ]] && args+=(--force-append)

exec bash "$TARGET_SCRIPT" "${args[@]}"
