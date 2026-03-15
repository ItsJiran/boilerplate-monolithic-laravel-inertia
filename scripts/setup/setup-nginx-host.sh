#!/bin/bash

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

SOURCE_TEMPLATE="$ROOT_DIR/infra/nginx/default.conf.vps.template"
TARGET_DIR="/etc/nginx/sites-available"
SYMLINK_DIR="/etc/nginx/sites-enabled"
FILE_NAME=""
COPY_TO=""
DRY_RUN=0
SKIP_RELOAD=0

usage() {
  cat <<USAGE
Usage: $0 [options]

Deploy generated VPS nginx template into host nginx directory.

Options:
  --source=PATH        Source host template (default: infra/nginx/default.conf.vps.template)
  --file-name=NAME     Destination filename (without/with .conf)
  --target-dir=PATH    Destination directory (default: /etc/nginx/sites-available)
  --symlink-dir=PATH   Enabled sites dir (default: /etc/nginx/sites-enabled)
  --copy-to=PATH       Extra copy path (optional)
  --skip-symlink       Do not create symlink in sites-enabled
  --skip-reload        Do not run nginx -t and reload
  --dry-run            Print actions only
  --help
USAGE
}

SKIP_SYMLINK=0

ensure_conf_name() {
  local name="$1"
  if [[ "$name" == *.conf ]]; then
    echo "$name"
  else
    echo "${name}.conf"
  fi
}

load_env() {
  local f="$1"
  if [ -f "$f" ]; then
    set -a
    source "$f"
    set +a
  fi
}

for arg in "$@"; do
  case "$arg" in
    --source=*) SOURCE_TEMPLATE="${arg#*=}" ;;
    --file-name=*) FILE_NAME="${arg#*=}" ;;
    --target-dir=*) TARGET_DIR="${arg#*=}" ;;
    --symlink-dir=*) SYMLINK_DIR="${arg#*=}" ;;
    --copy-to=*) COPY_TO="${arg#*=}" ;;
    --skip-symlink) SKIP_SYMLINK=1 ;;
    --skip-reload) SKIP_RELOAD=1 ;;
    --dry-run) DRY_RUN=1 ;;
    --help) usage; exit 0 ;;
    *) echo -e "${RED}[ERROR]${NC} Unknown argument: $arg"; usage; exit 1 ;;
  esac
done

load_env "$ROOT_DIR/.env"
load_env "$ROOT_DIR/.env.backend"
load_env "$ROOT_DIR/.env.devops"

if [ -z "$FILE_NAME" ]; then
  default_name="${NGINX_HOST_FILE_NAME:-${APP_DOMAIN:-default}}"
  FILE_NAME="$default_name"
fi

FILE_NAME="$(ensure_conf_name "$FILE_NAME")"
TARGET_FILE="$TARGET_DIR/$FILE_NAME"
SYMLINK_FILE="$SYMLINK_DIR/$FILE_NAME"

if [ ! -f "$SOURCE_TEMPLATE" ]; then
  echo -e "${RED}[ERROR]${NC} Source template not found: $SOURCE_TEMPLATE"
  exit 1
fi

if [ "$DRY_RUN" -eq 1 ]; then
  echo -e "${YELLOW}[DRY-RUN]${NC} Source: $SOURCE_TEMPLATE"
  echo -e "${YELLOW}[DRY-RUN]${NC} Target: $TARGET_FILE"
  [ "$SKIP_SYMLINK" -eq 0 ] && echo -e "${YELLOW}[DRY-RUN]${NC} Symlink: $SYMLINK_FILE"
  [ -n "$COPY_TO" ] && echo -e "${YELLOW}[DRY-RUN]${NC} Extra copy: $COPY_TO"
  [ "$SKIP_RELOAD" -eq 0 ] && echo -e "${YELLOW}[DRY-RUN]${NC} Would run: nginx -t && systemctl reload nginx"
  exit 0
fi

if [ "$(id -u)" -ne 0 ]; then
  echo -e "${YELLOW}🔑 Membutuhkan hak akses Administrator. Masukkan password jika diminta:${NC}"
  exec sudo "$0" "$@"
fi

mkdir -p "$TARGET_DIR"
cp "$SOURCE_TEMPLATE" "$TARGET_FILE"
chmod 644 "$TARGET_FILE"

if [ "$SKIP_SYMLINK" -eq 0 ]; then
  mkdir -p "$SYMLINK_DIR"
  ln -sfn "$TARGET_FILE" "$SYMLINK_FILE"
fi

if [ -n "$COPY_TO" ]; then
  mkdir -p "$(dirname "$COPY_TO")"
  cp "$TARGET_FILE" "$COPY_TO"
fi

restorecon -Rv /etc/nginx/ 2>/dev/null || true

if [ "$SKIP_RELOAD" -eq 1 ]; then
  echo -e "${GREEN}[DONE]${NC} Host config deployed to $TARGET_FILE (reload skipped)."
  exit 0
fi

nginx -t
systemctl reload nginx
echo -e "${GREEN}[DONE]${NC} Host config deployed and nginx reloaded: $TARGET_FILE"
