#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_SCRIPT="$ROOT_DIR/scripts/setup/setup-nginx-host.sh"

if [ ! -f "$TARGET_SCRIPT" ]; then
    echo "Error: $TARGET_SCRIPT not found"
    exit 1
fi

if [ "$#" -gt 0 ]; then
    exec bash "$TARGET_SCRIPT" "$@"
fi

echo "========================================="
echo " NGINX Host Setup Menu"
echo "========================================="
echo "1) Single entry (append 1 host block)"
echo "2) Bulk mode (legacy full render)"
echo "3) Path only (custom output/copy helper)"
echo "0) Exit"
read -r -p "Choose [0-3]: " mode

ask_path_options() {
    local -n _args_ref=$1
    echo "Output target mode:"
    echo "1) Default path (/etc/nginx/sites-available/<default>)"
    echo "2) Custom output path (--output-host)"
    echo "3) Default path + copy to another path (--copy-to)"
    read -r -p "Choose [1-3]: " path_choice

    case "$path_choice" in
        1)
            ;;
        2)
            read -r -p "Custom output path: " custom_output
            [ -n "$custom_output" ] && _args_ref+=("--output-host=$custom_output")
            ;;
        3)
            read -r -p "Copy-to path: " copy_to
            [ -n "$copy_to" ] && _args_ref+=("--copy-to=$copy_to")
            ;;
        *)
            echo "Invalid output target choice"
            exit 1
            ;;
    esac
}

case "$mode" in
    1)
        read -r -p "Service [app|pma|s3|s3-console|grafana|reverb|hmr]: " service
        read -r -p "Domain (host only, ex: api.myapp.com): " domain
        read -r -p "Host filename [/etc/nginx/sites-available/<name>] (default: app domain): " host_file

        echo "SSL mode:"
        echo "1) letsencrypt (/etc/letsencrypt/live/<domain>/...)"
        echo "2) stepca (/etc/nginx/ssl/<domain>.pem/.key)"
        echo "3) custom manual path"
        read -r -p "Choose SSL mode [1-3]: " ssl_choice

        args=(--single --service="$service" --domain="$domain")
        [ -n "$host_file" ] && args+=(--host-file-name="$host_file")

        case "$ssl_choice" in
            1)
                args+=(--ssl-mode=letsencrypt)
                ;;
            2)
                args+=(--ssl-mode=stepca)
                ;;
            3)
                read -r -p "SSL cert path: " cert_path
                read -r -p "SSL key path: " key_path
                args+=(--ssl-cert="$cert_path" --ssl-key="$key_path")
                ;;
            *)
                echo "Invalid SSL choice"
                exit 1
                ;;
        esac

        ask_path_options args

        read -r -p "Dry-run? [y/N]: " dry
        [[ "$dry" =~ ^[Yy]$ ]] && args+=(--dry-run)

        exec bash "$TARGET_SCRIPT" "${args[@]}"
        ;;
    2)
        read -r -p "App domain: " app_domain
        read -r -p "Reverb domain (optional): " reverb_domain
        read -r -p "S3 domain (optional): " s3_domain
        read -r -p "S3 console domain (optional): " s3_console_domain
        read -r -p "PMA domain (optional): " pma_domain
        read -r -p "Grafana domain (optional): " grafana_domain
        read -r -p "HMR domain (optional): " hmr_domain

        args=(--app-domain="$app_domain")
        args+=(--reverb-domain="$reverb_domain")
        args+=(--s3-domain="$s3_domain")
        args+=(--s3-console-domain="$s3_console_domain")
        args+=(--pma-domain="$pma_domain")
        args+=(--grafana-domain="$grafana_domain")
        args+=(--hmr-domain="$hmr_domain")

        echo "SSL mode for bulk:"
        echo "1) letsencrypt auto-path"
        echo "2) stepca shared cert (manual path)"
        read -r -p "Choose [1-2]: " bulk_ssl
        if [ "$bulk_ssl" = "2" ]; then
            read -r -p "Shared SSL cert path: " cert_path
            read -r -p "Shared SSL key path: " key_path
            args+=(--ssl-cert="$cert_path" --ssl-key="$key_path")
        fi

        ask_path_options args

        read -r -p "Dry-run? [y/N]: " dry
        [[ "$dry" =~ ^[Yy]$ ]] && args+=(--dry-run)

        exec bash "$TARGET_SCRIPT" "${args[@]}"
        ;;
    3)
        args=()
        ask_path_options args
        read -r -p "Dry-run? [y/N]: " dry
        [[ "$dry" =~ ^[Yy]$ ]] && args+=(--dry-run)
        echo "Mode helper path akan menjalankan bulk minimal (host only)."
        exec bash "$TARGET_SCRIPT" --app-domain="${APP_DOMAIN:-}" "${args[@]}"
        ;;
    0)
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
