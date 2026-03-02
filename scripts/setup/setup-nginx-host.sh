#!/bin/bash

# --- 1. Load Variable dari .env ---
# Script akan mencari .env di folder yang sama dengan script ini dijalankan
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ Error: File .env tidak ditemukan! Pastikan Anda menjalankan script di folder yg ada .env nya."
    exit 1
fi

dump_env_var() {
    local key="$1"
    local entry
    entry="$(grep -nE "^${key}=" .env | head -n1)"

    if [ -n "$entry" ]; then
        echo "  ${entry}"
    else
        echo "  ${key} not defined in .env"
    fi
}

if [ -f .env.backend ]; then
    export $(grep -v '^#' .env.backend | xargs)
else
    echo "❌ Error: File .env.backend tidak ditemukan! Pastikan Anda menjalankan script di folder yg ada .env.backend nya."
    exit 1
fi


if [ -f .env.devops ]; then
    export $(grep -v '^#' .env.devops | xargs)
else
    echo "❌ Error: File .env.devops tidak ditemukan! Pastikan Anda menjalankan script di folder yg ada .env.devops nya."
    exit 1
fi

# Cek apakah variable penting ada
if [ -z "$APP_URL" ]; then
    echo "❌ Error: Variable DOMAIN_NAME atau APP_PORT belum diisi di .env"
    exit 1
fi

echo "ℹ️  Values loaded from .env:"
dump_env_var "SSL_CERT_PATH"
dump_env_var "SSL_KEY_PATH"

# --- 2. Konfigurasi Path ---
TEMPLATE_FILE="./default.host.conf.template"
TARGET_FILE="/etc/nginx/sites-available/$APP_URL"
SYMLINK_FILE="/etc/nginx/sites-enabled/$APP_URL"

echo "⚙️  Sedang men-generate config Nginx untuk: $APP_URL..."

# --- 3. Generate Config (Magic Happens Here) ---
# Kita gunakan 'sed' untuk mengganti placeholder dengan value dari .env
# Outputnya langsung ditulis ke /etc/nginx/...
sudo cp "$TEMPLATE_FILE" temp_nginx.conf

escape_replacement() {
    printf '%s\n' "$1" | sed -e 's/[&/|]/\\&/g'
}

apply_replace() {
    local placeholder="$1"
    local value
    value="$(escape_replacement "$2")"
    sudo sed -i "s|{{${placeholder}}}|$value|g" temp_nginx.conf
}

apply_replace "APP_URL" "$APP_URL"
apply_replace "API_URL" "$API_URL"
apply_replace "S3_URL" "$S3_URL"
apply_replace "S3_CONSOLE_URL" "$S3_CONSOLE_URL"
apply_replace "PHPMYADMIN_URL" "$PHPMYADMIN_URL"
apply_replace "GRAFANA_URL" "$GRAFANA_URL"
apply_replace "GRAFANA_PORT" "$GRAFANA_PORT"
apply_replace "LOAD_BALANCER_PORT" "$LOAD_BALANCER_PORT"
apply_replace "SSL_CERT_PATH" "$SSL_CERT_PATH"
apply_replace "SSL_KEY_PATH" "$SSL_KEY_PATH"

# Pindahkan file yang sudah jadi ke target
sudo mv temp_nginx.conf "$TARGET_FILE"

# Permissions
sudo chmod 755 "$TARGET_FILE"
sudo chown ${USER}:${USER} "$TARGET_FILE"

echo "📋 Config berhasil dibuat di: $TARGET_FILE"

# --- 4. Symlink & Restart ---
if [ ! -f "$SYMLINK_FILE" ]; then
    echo "🔗 Membuat Symlink..."
    sudo ln -s "$TARGET_FILE" "$SYMLINK_FILE"
    sudo chmod 755 $TARGET_FILE
    sudo chown ${USER}:${USER} "$TARGET_FILE"
fi

# Ensure 
sudo restorecon -Rv /etc/nginx/

echo "tesss config..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Config Valid! Reloading Nginx..."
    sudo systemctl reload nginx
    echo "🎉 Selesai! Website http://$APP_URL siap diakses."
    echo "👉 Langkah selanjutnya: Jalankan 'sudo certbot --nginx -d $APP_URL' untuk HTTPS."
else
    echo "❌ Config Nginx Error. Cek file config manual."
fi
