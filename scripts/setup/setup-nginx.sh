#!/bin/bash

# --- Definisi Warna ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🛠️  Generating Nginx Configuration..."

# --- 1. Load Environment Variables ---
# Function to safely load env files
load_env() {
    if [ -f "$1" ]; then
        set -a
        source "$1"
        set +a
    fi
}

if [ -f .env ]; then
    load_env .env
    load_env .env.backend
    load_env .env.devops
else
    echo -e "${RED}[ERROR]${NC} .env file not found! Run setup-env.sh first."
    exit 1
fi

# --- 2. Check Arguments ---
ENABLE_MINIO=0
ENABLE_PMA=0
ENABLE_REVERB=0
ENABLE_HMR=-1

for arg in "$@"; do
    case $arg in
        --enable-minio) ENABLE_MINIO=1 ;;
        --enable-pma)   ENABLE_PMA=1 ;;
        --enable-reverb) ENABLE_REVERB=1 ;;
        --enable-hmr) ENABLE_HMR=1 ;;
        --disable-hmr) ENABLE_HMR=0 ;;
        --all) 
            ENABLE_MINIO=1
            ENABLE_PMA=1
            ENABLE_REVERB=1
            ENABLE_HMR=1
            ;;
    esac
done

if [ "$ENABLE_HMR" -eq -1 ]; then
    if [ -n "${HMR_URL:-}" ]; then
        ENABLE_HMR=1
    else
        ENABLE_HMR=0
    fi
fi

# --- 3. Concatenate Templates ---
TEMPLATE_DIR="infra/nginx/templates"
TEMP_FILE="infra/nginx/temp_combined.conf"
OUTPUT_FILE="infra/nginx/default.conf"

# Start with base
cat "$TEMPLATE_DIR/base.conf" > "$TEMP_FILE"

if [ "$ENABLE_MINIO" -eq 1 ]; then
    echo -e "\n# --- Module: MinIO ---" >> "$TEMP_FILE"
    cat "$TEMPLATE_DIR/minio.conf" >> "$TEMP_FILE"
    echo -e "${GREEN}[INFO]${NC} Included MinIO Service"
fi

if [ "$ENABLE_PMA" -eq 1 ]; then
    echo -e "\n# --- Module: PhpMyAdmin ---" >> "$TEMP_FILE"
    cat "$TEMPLATE_DIR/pma.conf" >> "$TEMP_FILE"
    echo -e "${GREEN}[INFO]${NC} Included PhpMyAdmin Service"
fi

if [ "$ENABLE_REVERB" -eq 1 ]; then
    echo -e "\n# --- Module: Reverb ---" >> "$TEMP_FILE"
    cat "$TEMPLATE_DIR/reverb.conf" >> "$TEMP_FILE"
    echo -e "${GREEN}[INFO]${NC} Included Reverb Service"
fi

if [ "$ENABLE_HMR" -eq 1 ] && [ -n "${HMR_URL:-}" ]; then
    echo -e "\n# --- Module: HMR ---" >> "$TEMP_FILE"
    cat "$TEMPLATE_DIR/hmr.conf" >> "$TEMP_FILE"
    echo -e "${GREEN}[INFO]${NC} Included HMR Service"
else
    echo -e "${YELLOW}[SKIP]${NC} HMR Service not included (HMR_URL empty or disabled)."
fi

# --- 4. Substitute Variables ---
# Valid variables allowed to be replaced (Prevent Nginx variables from being replaced)
# Using single quotes for the variable list to avoid expansion by shell
VARS='$APP_DOMAIN $APP_SERVICE $APP_PORT $HMR_URL $S3_DOMAIN $S3_CONSOLE_DOMAIN $MINIO_SERVICE $MINIO_PORT $MINIO_CONSOLE_PORT $PMA_DOMAIN $REVERB_DOMAIN $REVERB_SERVER_PORT'

envsubst "$VARS" < "$TEMP_FILE" > "$OUTPUT_FILE"

# Cleanup
rm "$TEMP_FILE"

echo -e "${GREEN}[OK]${NC} Generated Nginx config at $OUTPUT_FILE"
