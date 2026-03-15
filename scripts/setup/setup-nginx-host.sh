#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

LB_TEMPLATE="$ROOT_DIR/infra/nginx/default.conf.lb.template"
HOST_TEMPLATE="$ROOT_DIR/infra/nginx/default.host.vps.template"
LB_OUTPUT="$ROOT_DIR/infra/nginx/default.conf"

DRY_RUN=0
SKIP_RELOAD=0

usage() {
    cat <<USAGE
Usage: $0 [options]

Options:
  --app-domain=DOMAIN
  --pma-domain=DOMAIN
  --s3-domain=DOMAIN
  --s3-console-domain=DOMAIN
  --grafana-domain=DOMAIN
  --reverb-domain=DOMAIN
  --hmr-domain=DOMAIN
  --ssl-cert=PATH              Shared cert path for all domains (dev/Step CA)
  --ssl-key=PATH               Shared key path for all domains (dev/Step CA)
  --ssl-base-dir=PATH          Base dir for per-domain certs (default: /etc/letsencrypt/live)
                               Per-domain cert = <base-dir>/<domain>/fullchain.pem
  --load-balancer-port=PORT
  --grafana-port=PORT
  --output-host=PATH            Override output host vps config path
  --output-lb=PATH              Override output LB config path
  --dry-run                     Show generated file locations without reload
  --skip-reload                 Do not run nginx -t and reload
  --help

Notes:
  - Domain arguments are host-only (example: api.myapp.com)
  - Empty optional domain (example --hmr-domain=) will remove that block from templates
USAGE
}

extract_host() {
    local value="$1"
    local host="$value"
    host="${host#http://}"
    host="${host#https://}"
    host="${host%%/*}"
    host="${host%%:*}"
    echo "$host"
}

load_env() {
    local file="$1"
    if [ -f "$file" ]; then
        set -a
        source "$file"
        set +a
    fi
}

remove_section_between() {
    local file="$1"
    local start_marker="$2"
    local end_marker="$3"
    local tmp
    tmp="$(mktemp)"
    awk -v start="$start_marker" -v end="$end_marker" '
        $0 == start {skip=1; next}
        skip && $0 == end {skip=0}
        !skip {print}
    ' "$file" > "$tmp"
    mv "$tmp" "$file"
}

remove_section_to_eof() {
    local file="$1"
    local start_marker="$2"
    local tmp
    tmp="$(mktemp)"
    awk -v start="$start_marker" '
        $0 == start {skip=1}
        !skip {print}
    ' "$file" > "$tmp"
    mv "$tmp" "$file"
}

APP_DOMAIN_ARG=""
PMA_DOMAIN_ARG=""
S3_DOMAIN_ARG=""
S3_CONSOLE_DOMAIN_ARG=""
GRAFANA_DOMAIN_ARG=""
REVERB_DOMAIN_ARG=""
HMR_DOMAIN_ARG=""
SHARED_SSL_CERT=""
SHARED_SSL_KEY=""
SSL_BASE_DIR="/etc/letsencrypt/live"
LOAD_BALANCER_PORT_ARG=""
GRAFANA_PORT_ARG=""
OUTPUT_HOST_ARG=""
OUTPUT_LB_ARG=""

APP_DOMAIN_ARG_SET=0
PMA_DOMAIN_ARG_SET=0
S3_DOMAIN_ARG_SET=0
S3_CONSOLE_DOMAIN_ARG_SET=0
GRAFANA_DOMAIN_ARG_SET=0
REVERB_DOMAIN_ARG_SET=0
HMR_DOMAIN_ARG_SET=0

for arg in "$@"; do
    case "$arg" in
        --app-domain=*) APP_DOMAIN_ARG="${arg#*=}"; APP_DOMAIN_ARG_SET=1 ;;
        --pma-domain=*) PMA_DOMAIN_ARG="${arg#*=}"; PMA_DOMAIN_ARG_SET=1 ;;
        --s3-domain=*) S3_DOMAIN_ARG="${arg#*=}"; S3_DOMAIN_ARG_SET=1 ;;
        --s3-console-domain=*) S3_CONSOLE_DOMAIN_ARG="${arg#*=}"; S3_CONSOLE_DOMAIN_ARG_SET=1 ;;
        --grafana-domain=*) GRAFANA_DOMAIN_ARG="${arg#*=}"; GRAFANA_DOMAIN_ARG_SET=1 ;;
        --reverb-domain=*) REVERB_DOMAIN_ARG="${arg#*=}"; REVERB_DOMAIN_ARG_SET=1 ;;
        --hmr-domain=*) HMR_DOMAIN_ARG="${arg#*=}"; HMR_DOMAIN_ARG_SET=1 ;;
        --ssl-cert=*|--ssl-cert-path=*) SHARED_SSL_CERT="${arg#*=}" ;;
        --ssl-key=*|--ssl-key-path=*) SHARED_SSL_KEY="${arg#*=}" ;;
        --ssl-base-dir=*) SSL_BASE_DIR="${arg#*=}" ;;
        --load-balancer-port=*) LOAD_BALANCER_PORT_ARG="${arg#*=}" ;;
        --grafana-port=*) GRAFANA_PORT_ARG="${arg#*=}" ;;
        --output-host=*) OUTPUT_HOST_ARG="${arg#*=}" ;;
        --output-lb=*) OUTPUT_LB_ARG="${arg#*=}" ;;
        --dry-run) DRY_RUN=1 ;;
        --skip-reload) SKIP_RELOAD=1 ;;
        --help)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}[ERROR]${NC} Unknown argument: $arg"
            usage
            exit 1
            ;;
    esac
done

load_env "$ROOT_DIR/.env"
load_env "$ROOT_DIR/.env.backend"
load_env "$ROOT_DIR/.env.devops"

if [ "$APP_DOMAIN_ARG_SET" -eq 1 ]; then
    APP_DOMAIN="$(extract_host "$APP_DOMAIN_ARG")"
else
    APP_DOMAIN="$(extract_host "${APP_DOMAIN}")"
fi

if [ "$PMA_DOMAIN_ARG_SET" -eq 1 ]; then
    PMA_DOMAIN="$(extract_host "$PMA_DOMAIN_ARG")"
else
    PMA_DOMAIN="$(extract_host "${PMA_DOMAIN:-${PMA_ABSOLUTE_URI:-${PHPMYADMIN_URL}}}")"
fi

if [ "$S3_DOMAIN_ARG_SET" -eq 1 ]; then
    S3_DOMAIN="$(extract_host "$S3_DOMAIN_ARG")"
else
    S3_DOMAIN="$(extract_host "${S3_DOMAIN:-${S3_URL}}")"
fi

if [ "$S3_CONSOLE_DOMAIN_ARG_SET" -eq 1 ]; then
    S3_CONSOLE_DOMAIN="$(extract_host "$S3_CONSOLE_DOMAIN_ARG")"
else
    S3_CONSOLE_DOMAIN="$(extract_host "${S3_CONSOLE_DOMAIN:-${S3_CONSOLE_URL}}")"
fi

if [ "$GRAFANA_DOMAIN_ARG_SET" -eq 1 ]; then
    GRAFANA_DOMAIN="$(extract_host "$GRAFANA_DOMAIN_ARG")"
else
    GRAFANA_DOMAIN="$(extract_host "${GRAFANA_URL}")"
fi

if [ "$REVERB_DOMAIN_ARG_SET" -eq 1 ]; then
    REVERB_DOMAIN="$(extract_host "$REVERB_DOMAIN_ARG")"
else
    REVERB_DOMAIN="$(extract_host "${REVERB_DOMAIN:-${REVERB_URL}}")"
fi

if [ "$HMR_DOMAIN_ARG_SET" -eq 1 ]; then
    HMR_DOMAIN="$(extract_host "$HMR_DOMAIN_ARG")"
else
    HMR_DOMAIN="$(extract_host "${HMR_URL}")"
fi

LOAD_BALANCER_PORT_VAL="${LOAD_BALANCER_PORT_ARG:-${LOAD_BALANCER_PORT}}"

# Derive per-domain SSL cert/key paths
# If --ssl-cert/--ssl-key provided: use shared cert for all domains (dev/Step CA)
# Otherwise: auto-derive from certbot standard path structure
derive_cert() {
    local domain="$1"
    [ -z "$domain" ] && return
    if [ -n "$SHARED_SSL_CERT" ]; then echo "$SHARED_SSL_CERT"; return; fi
    echo "${SSL_BASE_DIR}/${domain}/fullchain.pem"
}
derive_key() {
    local domain="$1"
    [ -z "$domain" ] && return
    if [ -n "$SHARED_SSL_KEY" ]; then echo "$SHARED_SSL_KEY"; return; fi
    echo "${SSL_BASE_DIR}/${domain}/privkey.pem"
}

APP_SSL_CERT="$(derive_cert "$APP_DOMAIN")"
APP_SSL_KEY="$(derive_key "$APP_DOMAIN")"
PMA_SSL_CERT="$(derive_cert "$PMA_DOMAIN")"
PMA_SSL_KEY="$(derive_key "$PMA_DOMAIN")"
S3_SSL_CERT="$(derive_cert "$S3_DOMAIN")"
S3_SSL_KEY="$(derive_key "$S3_DOMAIN")"
S3_CONSOLE_SSL_CERT="$(derive_cert "$S3_CONSOLE_DOMAIN")"
S3_CONSOLE_SSL_KEY="$(derive_key "$S3_CONSOLE_DOMAIN")"
GRAFANA_SSL_CERT="$(derive_cert "$GRAFANA_DOMAIN")"
GRAFANA_SSL_KEY="$(derive_key "$GRAFANA_DOMAIN")"
REVERB_SSL_CERT="$(derive_cert "$REVERB_DOMAIN")"
REVERB_SSL_KEY="$(derive_key "$REVERB_DOMAIN")"
HMR_SSL_CERT="$(derive_cert "$HMR_DOMAIN")"
HMR_SSL_KEY="$(derive_key "$HMR_DOMAIN")"
GRAFANA_PORT_VAL="${GRAFANA_PORT_ARG:-${GRAFANA_PORT}}"

if [ -z "$APP_DOMAIN" ]; then
    echo -e "${RED}[ERROR]${NC} APP domain wajib diisi (--app-domain atau APP_DOMAIN di .env)."
    exit 1
fi

TARGET_FILE="${OUTPUT_HOST_ARG:-/etc/nginx/sites-available/$APP_DOMAIN}"
SYMLINK_FILE="/etc/nginx/sites-enabled/$APP_DOMAIN"
if [ -n "$OUTPUT_HOST_ARG" ]; then
    SYMLINK_FILE=""
fi

if [ -n "$OUTPUT_LB_ARG" ]; then
    LB_OUTPUT="$OUTPUT_LB_ARG"
fi

if [ ! -f "$LB_TEMPLATE" ] || [ ! -f "$HOST_TEMPLATE" ]; then
    echo -e "${RED}[ERROR]${NC} Template nginx tidak ditemukan."
    exit 1
fi

# Prepare variables for LB template substitution
APP_SERVICE="${APP_SERVICE:-app}"
APP_PORT="${APP_PORT:-8000}"
MINIO_SERVICE="${MINIO_SERVICE:-minio}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_CONSOLE_PORT="${MINIO_CONSOLE_PORT:-9001}"
REVERB_SERVER_PORT="${REVERB_SERVER_PORT:-18080}"

# Keep legacy variable names expected by templates
S3_URL="$S3_DOMAIN"
S3_CONSOLE_URL="$S3_CONSOLE_DOMAIN"
PHPMYADMIN_URL="$PMA_DOMAIN"
REVERB_URL="$REVERB_DOMAIN"
HMR_URL="$HMR_DOMAIN"

mkdir -p "$(dirname "$LB_OUTPUT")"

# --- Generate LB config from LB template (ditiban dari argument/env) ---
VARS='$APP_DOMAIN $APP_SERVICE $APP_PORT $HMR_URL $S3_URL $S3_CONSOLE_URL $MINIO_SERVICE $MINIO_PORT $MINIO_CONSOLE_PORT $PHPMYADMIN_URL $REVERB_URL $REVERB_SERVER_PORT'
envsubst "$VARS" < "$LB_TEMPLATE" > "$LB_OUTPUT"

# Remove optional LB sections based on empty domains
if [ -z "$HMR_DOMAIN" ]; then
    remove_section_between "$LB_OUTPUT" '# --- App Service (HMR) ---' '# --- MINIO S3 Storage ---'
fi
if [ -z "$S3_DOMAIN" ]; then
    remove_section_between "$LB_OUTPUT" '# --- MINIO S3 Storage ---' '# --- MINIO Console ---'
fi
if [ -z "$S3_CONSOLE_DOMAIN" ]; then
    remove_section_between "$LB_OUTPUT" '# --- MINIO Console ---' '# --- PHPMYADMIN ---'
fi
if [ -z "$PMA_DOMAIN" ]; then
    remove_section_between "$LB_OUTPUT" '# --- PHPMYADMIN ---' '# --- REVERB ---'
fi
if [ -z "$REVERB_DOMAIN" ]; then
    remove_section_to_eof "$LB_OUTPUT" '# --- REVERB ---'
fi

# --- Generate Host VPS config ---
TMP_HOST="$(mktemp)"
cp "$HOST_TEMPLATE" "$TMP_HOST"

escape_replacement() {
    printf '%s\n' "$1" | sed -e 's/[&/|]/\\&/g'
}

apply_replace() {
    local placeholder="$1"
    local value
    value="$(escape_replacement "$2")"
    sed -i "s|{{${placeholder}}}|$value|g" "$TMP_HOST"
}

apply_replace "APP_DOMAIN" "$APP_DOMAIN"
apply_replace "S3_URL" "$S3_DOMAIN"
apply_replace "S3_CONSOLE_URL" "$S3_CONSOLE_DOMAIN"
apply_replace "PHPMYADMIN_URL" "$PMA_DOMAIN"
apply_replace "GRAFANA_URL" "$GRAFANA_DOMAIN"
apply_replace "GRAFANA_PORT" "$GRAFANA_PORT_VAL"
apply_replace "LOAD_BALANCER_PORT" "$LOAD_BALANCER_PORT_VAL"
apply_replace "LOAD_BALANCER_HMR_PORT" "${LOAD_BALANCER_HMR_PORT:-5353}"
apply_replace "APP_SSL_CERT" "$APP_SSL_CERT"
apply_replace "APP_SSL_KEY" "$APP_SSL_KEY"
apply_replace "PMA_SSL_CERT" "$PMA_SSL_CERT"
apply_replace "PMA_SSL_KEY" "$PMA_SSL_KEY"
apply_replace "S3_SSL_CERT" "$S3_SSL_CERT"
apply_replace "S3_SSL_KEY" "$S3_SSL_KEY"
apply_replace "S3_CONSOLE_SSL_CERT" "$S3_CONSOLE_SSL_CERT"
apply_replace "S3_CONSOLE_SSL_KEY" "$S3_CONSOLE_SSL_KEY"
apply_replace "GRAFANA_SSL_CERT" "$GRAFANA_SSL_CERT"
apply_replace "GRAFANA_SSL_KEY" "$GRAFANA_SSL_KEY"
apply_replace "REVERB_SSL_CERT" "$REVERB_SSL_CERT"
apply_replace "REVERB_SSL_KEY" "$REVERB_SSL_KEY"
apply_replace "HMR_SSL_CERT" "$HMR_SSL_CERT"
apply_replace "HMR_SSL_KEY" "$HMR_SSL_KEY"
apply_replace "REVERB_URL" "$REVERB_DOMAIN"
apply_replace "HMR_URL" "$HMR_DOMAIN"

# Remove optional host sections based on empty domains
if [ -z "$PMA_DOMAIN" ]; then
    remove_section_between "$TMP_HOST" '# 3. PHPMYADMIN SERVER - HTTPS' '# 4. MINIO SERVER (S3) - HTTPS'
fi
if [ -z "$S3_DOMAIN" ]; then
    remove_section_between "$TMP_HOST" '# 4. MINIO SERVER (S3) - HTTPS' '# 5. MINIO SERVER (S3 CONSOLE) - HTTPS'
fi
if [ -z "$S3_CONSOLE_DOMAIN" ]; then
    remove_section_between "$TMP_HOST" '# 5. MINIO SERVER (S3 CONSOLE) - HTTPS' '# 6. GRAFANA SERVER - HTTPS'
fi
if [ -z "$GRAFANA_DOMAIN" ]; then
    remove_section_between "$TMP_HOST" '# 6. GRAFANA SERVER - HTTPS' '# 7. REVERB SERVER - HTTPS'
fi
if [ -z "$REVERB_DOMAIN" ]; then
    remove_section_between "$TMP_HOST" '# 7. REVERB SERVER - HTTPS' '# 8. HMR SERVER - HTTPS'
fi
if [ -z "$HMR_DOMAIN" ]; then
    remove_section_to_eof "$TMP_HOST" '# 8. HMR SERVER - HTTPS'
fi

if [ "$DRY_RUN" -eq 1 ]; then
    echo -e "${YELLOW}[DRY-RUN]${NC} LB config generated at: $LB_OUTPUT"
    if [ -n "$OUTPUT_HOST_ARG" ]; then
        cp "$TMP_HOST" "$OUTPUT_HOST_ARG"
        echo -e "${YELLOW}[DRY-RUN]${NC} Host VPS config written at: $OUTPUT_HOST_ARG"
    else
        echo -e "${YELLOW}[DRY-RUN]${NC} Host VPS config preview at: $TMP_HOST"
    fi
    echo -e "${GREEN}[DONE]${NC} No nginx reload executed."
    exit 0
fi

if [ "$(id -u)" -ne 0 ]; then
    echo -e "${YELLOW}🔑 Membutuhkan hak akses Administrator. Masukkan password jika diminta:${NC}"
    exec sudo "$0" "$@"
fi

mv "$TMP_HOST" "$TARGET_FILE"
chmod 755 "$TARGET_FILE"
chown ${SUDO_USER:-$USER}:${SUDO_USER:-$USER} "$TARGET_FILE"

if [ -n "$SYMLINK_FILE" ] && [ ! -f "$SYMLINK_FILE" ]; then
    ln -s "$TARGET_FILE" "$SYMLINK_FILE"
fi

restorecon -Rv /etc/nginx/ 2>/dev/null || true

if [ "$SKIP_RELOAD" -eq 1 ]; then
    echo -e "${GREEN}[DONE]${NC} Config generated. Reload skipped (--skip-reload)."
    exit 0
fi

nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo -e "${GREEN}[DONE]${NC} Nginx config valid and reloaded for $APP_DOMAIN"
else
    echo -e "${RED}[ERROR]${NC} Nginx config test failed."
    exit 1
fi
