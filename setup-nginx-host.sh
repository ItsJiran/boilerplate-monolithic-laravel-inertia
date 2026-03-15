#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_SCRIPT="$ROOT_DIR/scripts/setup/setup-nginx-host-template.sh"
DEPLOY_SCRIPT="$ROOT_DIR/scripts/setup/setup-nginx-host.sh"

if [ ! -f "$TEMPLATE_SCRIPT" ] || [ ! -f "$DEPLOY_SCRIPT" ]; then
  echo "Error: required scripts not found"
  exit 1
fi

if [ "$#" -gt 0 ]; then
  # Direct mode defaults to deploy script to keep backward behavior.
  exec bash "$DEPLOY_SCRIPT" "$@"
fi

echo "========================================="
echo " NGINX Host Setup Menu"
echo "========================================="
echo "1) Generate host template entry (1-1 append)"
echo "2) Deploy template to /etc/nginx/sites-available/*.conf"
echo "3) Generate + Deploy (combined)"
echo "0) Exit"
read -r -p "Choose [0-3]: " mode

case "$mode" in
  1)
    read -r -p "Service [app|pma|s3|s3-console|grafana|reverb|hmr]: " service
    read -r -p "Domain (host only): " domain
    read -r -p "SSL mode [letsencrypt|stepca|manual]: " ssl_mode

    args=(--single --service="$service" --domain="$domain" "--ssl-mode=${ssl_mode:-letsencrypt}")
    if [ "$ssl_mode" = "manual" ]; then
      read -r -p "SSL cert path: " cert
      read -r -p "SSL key path: " key
      args+=(--ssl-cert="$cert" --ssl-key="$key")
    fi

    exec bash "$TEMPLATE_SCRIPT" "${args[@]}"
    ;;
  2)
    read -r -p "File name (default from env APP_DOMAIN/NGINX_HOST_FILE_NAME): " file_name
    read -r -p "Source template [infra/nginx/default.conf.vps.template]: " source
    source="${source:-infra/nginx/default.conf.vps.template}"

    args=(--source="$source")
    [ -n "$file_name" ] && args+=(--file-name="$file_name")

    exec bash "$DEPLOY_SCRIPT" "${args[@]}"
    ;;
  3)
    read -r -p "Service [app|pma|s3|s3-console|grafana|reverb|hmr]: " service
    read -r -p "Domain (host only): " domain
    read -r -p "SSL mode [letsencrypt|stepca|manual]: " ssl_mode
    read -r -p "Deploy file name (.conf) [auto]: " file_name

    gen_args=(--single --service="$service" --domain="$domain" "--ssl-mode=${ssl_mode:-letsencrypt}")
    if [ "$ssl_mode" = "manual" ]; then
      read -r -p "SSL cert path: " cert
      read -r -p "SSL key path: " key
      gen_args+=(--ssl-cert="$cert" --ssl-key="$key")
    fi

    bash "$TEMPLATE_SCRIPT" "${gen_args[@]}"

    dep_args=()
    [ -n "$file_name" ] && dep_args+=(--file-name="$file_name")
    exec bash "$DEPLOY_SCRIPT" "${dep_args[@]}"
    ;;
  0)
    exit 0
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac
