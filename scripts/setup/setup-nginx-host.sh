#!/bin/bash

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

LB_TEMPLATE="$ROOT_DIR/infra/nginx/default.conf.lb.template"
HOST_TEMPLATE="$ROOT_DIR/infra/nginx/default.conf.vps.template"
LB_OUTPUT="$ROOT_DIR/infra/nginx/default.conf"

DRY_RUN=0
SKIP_RELOAD=0

# Single mode
SINGLE_MODE=0
SERVICE=""
DOMAIN_ARG=""
HOST_FILE_NAME_ARG=""
SSL_MODE="letsencrypt"     # letsencrypt | stepca
STEPCA_SSL_DIR="/etc/nginx/ssl"
SSL_CERT_ARG=""
SSL_KEY_ARG=""
SCRIPT_ARGS=("$@")
COPY_TO_ARG=""

usage() {
    cat <<USAGE
Usage: $0 [options]

Single-entry mode (append 1 service block per execution):
  --single
  --service=NAME              app|pma|s3|s3-console|grafana|reverb|hmr
  --domain=DOMAIN             Domain for selected service
  --host-file-name=NAME       Host config filename (default: APP_DOMAIN)
  --ssl-mode=MODE             letsencrypt|stepca (default: letsencrypt)
  --ssl-cert=PATH             SSL cert path override (per-entry)
  --ssl-key=PATH              SSL key path override (per-entry)
  --ssl-base-dir=PATH         Base dir for letsencrypt certs (default: /etc/letsencrypt/live)
  --stepca-ssl-dir=PATH       Base dir for stepca certs (default: /etc/nginx/ssl)
  --output-host=PATH          Output host config path override
    --copy-to=PATH              Copy generated host config to extra path
  --dry-run

Bulk mode (legacy full render from templates):
  --app-domain=DOMAIN
  --pma-domain=DOMAIN
  --s3-domain=DOMAIN
  --s3-console-domain=DOMAIN
  --grafana-domain=DOMAIN
  --reverb-domain=DOMAIN
  --hmr-domain=DOMAIN
  --ssl-cert=PATH             Shared cert path for all domains (dev/Step CA)
  --ssl-key=PATH              Shared key path for all domains (dev/Step CA)
  --ssl-base-dir=PATH         LetsEncrypt base dir (default: /etc/letsencrypt/live)
  --load-balancer-port=PORT
  --grafana-port=PORT
  --output-host=PATH          Override output host vps config path
  --output-lb=PATH            Override output LB config path
    --copy-to=PATH              Copy generated host config to extra path
  --skip-reload               Do not run nginx -t and reload
  --dry-run

Common:
  --help
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

upsert_env_reference() {
    local file="$1"
    local key="$2"
    local value="$3"

    [ -f "$file" ] || return 0
    if grep -qE "^${key}=" "$file"; then
        sed -i "s|^${key}=.*|${key}=${value}|" "$file"
    else
        echo "${key}=${value}" >> "$file"
    fi
}

derive_single_cert_key() {
    local domain="$1"
    local cert=""
    local key=""

    if [ -n "$SSL_CERT_ARG" ] && [ -n "$SSL_KEY_ARG" ]; then
        cert="$SSL_CERT_ARG"
        key="$SSL_KEY_ARG"
    else
        case "$SSL_MODE" in
            letsencrypt)
                cert="${SSL_BASE_DIR}/${domain}/fullchain.pem"
                key="${SSL_BASE_DIR}/${domain}/privkey.pem"
                ;;
            stepca)
                cert="${STEPCA_SSL_DIR}/${domain}.pem"
                key="${STEPCA_SSL_DIR}/${domain}.key"
                ;;
            *)
                echo -e "${RED}[ERROR]${NC} Invalid --ssl-mode: $SSL_MODE (use letsencrypt|stepca)"
                exit 1
                ;;
        esac
    fi

    echo "$cert|$key"
}

single_service_block() {
    local service="$1"
    local domain="$2"
    local cert="$3"
    local key="$4"
    local lb_port="$5"
    local grafana_port="$6"

    cat <<EOF

# =========================================================
# GENERATED SINGLE ENTRY: ${service}:${domain}
# =========================================================
server {
    listen 443 ssl http2;
    server_name ${domain};

    ssl_certificate     ${cert};
    ssl_certificate_key ${key};

    access_log /var/log/nginx/app-boilerplate_${service}_access.log;
    error_log  /var/log/nginx/app-boilerplate_${service}_error.log warn;

    location / {
EOF

    case "$service" in
        grafana)
            cat <<EOF
        proxy_pass http://127.0.0.1:${grafana_port};
EOF
            ;;
        *)
            cat <<EOF
        proxy_pass http://127.0.0.1:${lb_port};
EOF
            ;;
    esac

    cat <<'EOF'

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
}

append_single_mode() {
    local domain="$1"
    local service="$2"
    local host_file_name="$3"
    local target_file="$4"

    local cert_and_key
    cert_and_key="$(derive_single_cert_key "$domain")"
    local cert_path="${cert_and_key%%|*}"
    local key_path="${cert_and_key#*|}"

    local lb_port="${LOAD_BALANCER_PORT_ARG:-${LOAD_BALANCER_PORT:-80}}"
    local grafana_port="${GRAFANA_PORT_ARG:-${GRAFANA_PORT:-3000}}"

    if [ "$DRY_RUN" -eq 1 ]; then
        echo -e "${YELLOW}[DRY-RUN]${NC} Service=$service Domain=$domain"
        echo -e "${YELLOW}[DRY-RUN]${NC} SSL Cert=$cert_path"
        echo -e "${YELLOW}[DRY-RUN]${NC} SSL Key=$key_path"
        echo -e "${YELLOW}[DRY-RUN]${NC} Target file: $target_file"
        if [ -n "$COPY_TO_ARG" ]; then
            echo -e "${YELLOW}[DRY-RUN]${NC} Extra copy target: $COPY_TO_ARG"
        fi
        single_service_block "$service" "$domain" "$cert_path" "$key_path" "$lb_port" "$grafana_port"
        return 0
    fi

    if [ "$(id -u)" -ne 0 ]; then
        echo -e "${YELLOW}🔑 Membutuhkan hak akses Administrator. Masukkan password jika diminta:${NC}"
        exec sudo "$0" "${SCRIPT_ARGS[@]}"
    fi

    mkdir -p "$(dirname "$target_file")"
    touch "$target_file"

    # Prevent accidental duplicate same service+domain unless requested by user manually
    if grep -q "GENERATED SINGLE ENTRY: ${service}:${domain}" "$target_file"; then
        echo -e "${YELLOW}[SKIP]${NC} Entry ${service}:${domain} already exists in $target_file"
    else
        single_service_block "$service" "$domain" "$cert_path" "$key_path" "$lb_port" "$grafana_port" >> "$target_file"
        echo -e "${GREEN}[OK]${NC} Appended ${service}:${domain} into $target_file"
    fi

    # Save reference in env for operational visibility
    upsert_env_reference "$ROOT_DIR/.env.devops" "NGINX_HOST_FILE_NAME" "$host_file_name"
    upsert_env_reference "$ROOT_DIR/.env.devops" "NGINX_SSL_MODE" "$SSL_MODE"
    if [ -n "$COPY_TO_ARG" ]; then
        mkdir -p "$(dirname "$COPY_TO_ARG")"
        cp "$target_file" "$COPY_TO_ARG"
        echo -e "${GREEN}[OK]${NC} Copied host config to: $COPY_TO_ARG"
    fi

    local symlink_file=""
    if [ -z "$OUTPUT_HOST_ARG" ]; then
        symlink_file="/etc/nginx/sites-enabled/$host_file_name"
        if [ ! -f "$symlink_file" ]; then
            ln -s "$target_file" "$symlink_file"
        fi
    fi

    restorecon -Rv /etc/nginx/ 2>/dev/null || true

    if [ "$SKIP_RELOAD" -eq 1 ]; then
        echo -e "${GREEN}[DONE]${NC} Single entry generated. Reload skipped (--skip-reload)."
        return 0
    fi

    nginx -t
    systemctl reload nginx
    echo -e "${GREEN}[DONE]${NC} Nginx reloaded. Active file: $target_file"
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

# Bulk mode args
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
        --single) SINGLE_MODE=1 ;;
        --service=*) SERVICE="${arg#*=}" ;;
        --domain=*) DOMAIN_ARG="${arg#*=}" ;;
        --host-file-name=*) HOST_FILE_NAME_ARG="${arg#*=}" ;;
        --ssl-mode=*) SSL_MODE="${arg#*=}" ;;
        --stepca-ssl-dir=*) STEPCA_SSL_DIR="${arg#*=}" ;;

        --app-domain=*) APP_DOMAIN_ARG="${arg#*=}"; APP_DOMAIN_ARG_SET=1 ;;
        --pma-domain=*) PMA_DOMAIN_ARG="${arg#*=}"; PMA_DOMAIN_ARG_SET=1 ;;
        --s3-domain=*) S3_DOMAIN_ARG="${arg#*=}"; S3_DOMAIN_ARG_SET=1 ;;
        --s3-console-domain=*) S3_CONSOLE_DOMAIN_ARG="${arg#*=}"; S3_CONSOLE_DOMAIN_ARG_SET=1 ;;
        --grafana-domain=*) GRAFANA_DOMAIN_ARG="${arg#*=}"; GRAFANA_DOMAIN_ARG_SET=1 ;;
        --reverb-domain=*) REVERB_DOMAIN_ARG="${arg#*=}"; REVERB_DOMAIN_ARG_SET=1 ;;
        --hmr-domain=*) HMR_DOMAIN_ARG="${arg#*=}"; HMR_DOMAIN_ARG_SET=1 ;;

        --ssl-cert=*|--ssl-cert-path=*) SHARED_SSL_CERT="${arg#*=}"; SSL_CERT_ARG="${arg#*=}" ;;
        --ssl-key=*|--ssl-key-path=*) SHARED_SSL_KEY="${arg#*=}"; SSL_KEY_ARG="${arg#*=}" ;;
        --ssl-base-dir=*) SSL_BASE_DIR="${arg#*=}" ;;
        --load-balancer-port=*) LOAD_BALANCER_PORT_ARG="${arg#*=}" ;;
        --grafana-port=*) GRAFANA_PORT_ARG="${arg#*=}" ;;
        --output-host=*) OUTPUT_HOST_ARG="${arg#*=}" ;;
        --output-lb=*) OUTPUT_LB_ARG="${arg#*=}" ;;
        --copy-to=*) COPY_TO_ARG="${arg#*=}" ;;
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

# Backward compatibility for old template name.
if [ ! -f "$HOST_TEMPLATE" ] && [ -f "$ROOT_DIR/infra/nginx/default.host.vps.template" ]; then
    HOST_TEMPLATE="$ROOT_DIR/infra/nginx/default.host.vps.template"
fi

if [ "$SINGLE_MODE" -eq 1 ]; then
    if [ -z "$SERVICE" ]; then
        echo -e "${RED}[ERROR]${NC} --service wajib diisi untuk --single"
        exit 1
    fi

    domain="$(extract_host "${DOMAIN_ARG}")"
    if [ -z "$domain" ]; then
        case "$SERVICE" in
            app) domain="$(extract_host "${APP_DOMAIN_ARG:-${APP_DOMAIN:-}}")" ;;
            pma) domain="$(extract_host "${PMA_DOMAIN:-${PMA_ABSOLUTE_URI:-${PHPMYADMIN_URL:-}}}")" ;;
            s3) domain="$(extract_host "${S3_DOMAIN:-${S3_URL:-}}")" ;;
            s3-console) domain="$(extract_host "${S3_CONSOLE_DOMAIN:-${S3_CONSOLE_URL:-}}")" ;;
            grafana) domain="$(extract_host "${GRAFANA_URL:-}")" ;;
            reverb) domain="$(extract_host "${REVERB_DOMAIN:-${REVERB_URL:-}}")" ;;
            hmr) domain="$(extract_host "${HMR_URL:-}")" ;;
        esac
    fi

    if [ -z "$domain" ]; then
        echo -e "${RED}[ERROR]${NC} Domain kosong. Isi --domain=... atau pastikan env variabel tersedia."
        exit 1
    fi

    case "$SERVICE" in
        app|pma|s3|s3-console|grafana|reverb|hmr) ;;
        *)
            echo -e "${RED}[ERROR]${NC} Service tidak valid: $SERVICE"
            exit 1
            ;;
    esac

    app_domain_ref="$(extract_host "${APP_DOMAIN_ARG:-${APP_DOMAIN:-$domain}}")"
    host_file_name="${HOST_FILE_NAME_ARG:-$app_domain_ref}"
    target_file="${OUTPUT_HOST_ARG:-/etc/nginx/sites-available/$host_file_name}"

    append_single_mode "$domain" "$SERVICE" "$host_file_name" "$target_file"
    exit 0
fi

# ------------------------------
# Legacy bulk mode (full render)
# ------------------------------
if [ "$APP_DOMAIN_ARG_SET" -eq 1 ]; then
    APP_DOMAIN="$(extract_host "$APP_DOMAIN_ARG")"
else
    APP_DOMAIN="$(extract_host "${APP_DOMAIN:-}")"
fi

if [ "$PMA_DOMAIN_ARG_SET" -eq 1 ]; then
    PMA_DOMAIN="$(extract_host "$PMA_DOMAIN_ARG")"
else
    PMA_DOMAIN="$(extract_host "${PMA_DOMAIN:-${PMA_ABSOLUTE_URI:-${PHPMYADMIN_URL:-}}}")"
fi

if [ "$S3_DOMAIN_ARG_SET" -eq 1 ]; then
    S3_DOMAIN="$(extract_host "$S3_DOMAIN_ARG")"
else
    S3_DOMAIN="$(extract_host "${S3_DOMAIN:-${S3_URL:-}}")"
fi

if [ "$S3_CONSOLE_DOMAIN_ARG_SET" -eq 1 ]; then
    S3_CONSOLE_DOMAIN="$(extract_host "$S3_CONSOLE_DOMAIN_ARG")"
else
    S3_CONSOLE_DOMAIN="$(extract_host "${S3_CONSOLE_DOMAIN:-${S3_CONSOLE_URL:-}}")"
fi

if [ "$GRAFANA_DOMAIN_ARG_SET" -eq 1 ]; then
    GRAFANA_DOMAIN="$(extract_host "$GRAFANA_DOMAIN_ARG")"
else
    GRAFANA_DOMAIN="$(extract_host "${GRAFANA_URL:-}")"
fi

if [ "$REVERB_DOMAIN_ARG_SET" -eq 1 ]; then
    REVERB_DOMAIN="$(extract_host "$REVERB_DOMAIN_ARG")"
else
    REVERB_DOMAIN="$(extract_host "${REVERB_DOMAIN:-${REVERB_URL:-}}")"
fi

if [ "$HMR_DOMAIN_ARG_SET" -eq 1 ]; then
    HMR_DOMAIN="$(extract_host "$HMR_DOMAIN_ARG")"
else
    HMR_DOMAIN="$(extract_host "${HMR_URL:-}")"
fi

LOAD_BALANCER_PORT_VAL="${LOAD_BALANCER_PORT_ARG:-${LOAD_BALANCER_PORT:-80}}"
GRAFANA_PORT_VAL="${GRAFANA_PORT_ARG:-${GRAFANA_PORT:-3000}}"

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

APP_SERVICE="${APP_SERVICE:-app}"
APP_PORT="${APP_PORT:-8000}"
MINIO_SERVICE="${MINIO_SERVICE:-minio}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_CONSOLE_PORT="${MINIO_CONSOLE_PORT:-9001}"
REVERB_SERVER_PORT="${REVERB_SERVER_PORT:-18080}"

S3_URL="$S3_DOMAIN"
S3_CONSOLE_URL="$S3_CONSOLE_DOMAIN"
PHPMYADMIN_URL="$PMA_DOMAIN"
REVERB_URL="$REVERB_DOMAIN"
HMR_URL="$HMR_DOMAIN"

mkdir -p "$(dirname "$LB_OUTPUT")"

VARS='$APP_DOMAIN $APP_SERVICE $APP_PORT $HMR_URL $S3_URL $S3_CONSOLE_URL $MINIO_SERVICE $MINIO_PORT $MINIO_CONSOLE_PORT $PHPMYADMIN_URL $REVERB_URL $REVERB_SERVER_PORT'
envsubst "$VARS" < "$LB_TEMPLATE" > "$LB_OUTPUT"

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
    if [ -n "$COPY_TO_ARG" ]; then
        if [ -n "$OUTPUT_HOST_ARG" ]; then
            cp "$OUTPUT_HOST_ARG" "$COPY_TO_ARG"
        else
            cp "$TMP_HOST" "$COPY_TO_ARG"
        fi
        echo -e "${YELLOW}[DRY-RUN]${NC} Host VPS config copied to: $COPY_TO_ARG"
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

if [ -n "$COPY_TO_ARG" ]; then
    mkdir -p "$(dirname "$COPY_TO_ARG")"
    cp "$TARGET_FILE" "$COPY_TO_ARG"
    echo -e "${GREEN}[OK]${NC} Copied host config to: $COPY_TO_ARG"
fi

if [ -n "$SYMLINK_FILE" ] && [ ! -f "$SYMLINK_FILE" ]; then
    ln -s "$TARGET_FILE" "$SYMLINK_FILE"
fi

restorecon -Rv /etc/nginx/ 2>/dev/null || true

if [ "$SKIP_RELOAD" -eq 1 ]; then
    echo -e "${GREEN}[DONE]${NC} Config generated. Reload skipped (--skip-reload)."
    exit 0
fi

nginx -t
systemctl reload nginx
echo -e "${GREEN}[DONE]${NC} Nginx config valid and reloaded for $APP_DOMAIN"
