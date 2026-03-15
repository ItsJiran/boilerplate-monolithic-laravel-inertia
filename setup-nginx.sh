#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_SCRIPT="$ROOT_DIR/scripts/setup/setup-nginx.sh"

if [ ! -f "$TARGET_SCRIPT" ]; then
    echo "Error: $TARGET_SCRIPT not found"
    exit 1
fi

if [ "$#" -gt 0 ]; then
    exec bash "$TARGET_SCRIPT" "$@"
fi

echo "========================================="
echo " NGINX LB Setup Menu"
echo "========================================="
echo "1) Single entry (append 1 service-domain)"
echo "2) Bulk mode (legacy template render)"
echo "0) Exit"
read -r -p "Choose [0-2]: " choice

case "$choice" in
    1)
        read -r -p "Service [app|hmr|s3|s3-console|pma|reverb]: " service
        read -r -p "Domain (host only, ex: api.myapp.com): " domain
        read -r -p "Output file [infra/nginx/default.conf.lb.template]: " output
        output="${output:-infra/nginx/default.conf.lb.template}"

        exec bash "$TARGET_SCRIPT" \
            --single \
            --service="$service" \
            --domain="$domain" \
            --output="$output"
        ;;
    2)
        echo "Enable modules? (y/n)"
        read -r -p "MinIO: " minio
        read -r -p "PhpMyAdmin: " pma
        read -r -p "Reverb: " reverb
        read -r -p "HMR: " hmr

        args=()
        [[ "$minio" =~ ^[Yy]$ ]] && args+=("--enable-minio")
        [[ "$pma" =~ ^[Yy]$ ]] && args+=("--enable-pma")
        [[ "$reverb" =~ ^[Yy]$ ]] && args+=("--enable-reverb")
        [[ "$hmr" =~ ^[Yy]$ ]] && args+=("--enable-hmr") || args+=("--disable-hmr")

        exec bash "$TARGET_SCRIPT" "${args[@]}"
        ;;
    0)
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
