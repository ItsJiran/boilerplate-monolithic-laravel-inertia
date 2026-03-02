#!/bin/bash

# =========================================================
# DOCKER COMPOSE MANAGER (CHECKBOX STYLE)
# =========================================================

# --- Konfigurasi Warna ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- Script Directory & Root ---
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# --- Daftar Service Sesuai docker compose.yml ---
SERVICES=(
    "mariadb"
    "db-init"
    "phpmyadmin"
    "redis"
    "app"
    "app-worker"
    "app-socket"
    "app-cron"
    "client"
    "load_balancer"
    "minio"
    "createbuckets"
)

# Status awal checkbox (0 = unselected, 1 = selected)
SELECTED=()
for i in "${!SERVICES[@]}"; do SELECTED[$i]=0; done

# --- Fungsi Load Environment ---
load_envs() {
    echo -e "${BLUE}[INFO] Loading environment variables from root project...${NC}"
    set -a
    [ -f "$ROOT_DIR/.env" ] && source "$ROOT_DIR/.env"
    [ -f "$ROOT_DIR/.env.backend" ] && source "$ROOT_DIR/.env.backend"
    [ -f "$ROOT_DIR/.env.devops" ] && source "$ROOT_DIR/.env.devops"
    set +a
}

show_checkboxes() {
    local action_label="$1"
    clear
    echo -e "${YELLOW}=== PILIH SERVICE UNTUK: ${action_label^^} ===${NC}"
    echo "Ketik angka untuk (Un)Select, ketik 'a' untuk All, ketik 'r' untuk RUN."
    echo "------------------------------------------------"

    for i in "${!SERVICES[@]}"; do
        if [[ ${SELECTED[$i]} -eq 1 ]]; then
            echo -e "[$i] [${GREEN}x${NC}] ${SERVICES[$i]}"
        else
            echo -e "[$i] [ ] ${SERVICES[$i]}"
        fi
    done
    echo "------------------------------------------------"
}

# --- Logic Selector ---
service_selector() {
    local action_label="$1"
    local action_fn="$2"

    while true; do
        show_checkboxes "$action_label"
        read -p "Pilihan Anda (angka/a/r): " input

        [[ -z "$input" ]] && continue

        if [[ "$input" == "r" ]]; then
            break
        elif [[ "$input" == "a" ]]; then
            for i in "${!SERVICES[@]}"; do SELECTED[$i]=1; done
        elif [[ "$input" =~ ^[0-9]+$ ]] && [ "$input" -ge 0 ] && [ "$input" -lt "${#SERVICES[@]}" ]; then
            if [[ ${SELECTED[$input]} -eq 1 ]]; then
                SELECTED[$input]=0
            else
                SELECTED[$input]=1
            fi
        fi
    done

    CMD_SERVICES=""
    COUNT=0
    for i in "${!SERVICES[@]}"; do
        if [[ ${SELECTED[$i]} -eq 1 ]]; then
            CMD_SERVICES="$CMD_SERVICES ${SERVICES[$i]}"
            ((COUNT++))
        fi
    done

    if [[ $COUNT -eq 0 ]]; then
        echo -e "${RED}[ERROR] Tidak ada service yang dipilih!${NC}"
        # Jangan exit, return saja agar balik ke menu atau bisa coba lagi
        read -p "Tekan enter untuk kembali..."
        return 
    fi

    "$action_fn" "$CMD_SERVICES"
}

# --- Fungsi Eksekusi Docker ---

# 1. Standard Up
run_docker() {
    TARGETS=$1
    load_envs
    echo -e "${GREEN}[EXEC] Menjalankan: docker compose up -d $TARGETS${NC}"
    docker compose up -d $TARGETS
    echo -e "${YELLOW}------------------------------------------------${NC}"
    echo -e "${GREEN}✅ Selesai! Cek status dengan: docker compose ps${NC}"
}

# 2. Build & Force Recreate (NEW)
rebuild_docker() {
    TARGETS=$1
    load_envs
    echo -e "${GREEN}[EXEC] Rebuild & Recreate: docker compose up -d --build --force-recreate $TARGETS${NC}"
    docker compose up -d --build --force-recreate $TARGETS
    echo -e "${YELLOW}------------------------------------------------${NC}"
    echo -e "${GREEN}✅ Rebuild selesai! Cek status dengan: docker compose ps${NC}"
}

# 3. Restart
restart_docker() {
    TARGETS=$1
    load_envs
    echo -e "${GREEN}[EXEC] Menjalankan: docker compose restart $TARGETS${NC}"
    docker compose restart $TARGETS
    echo -e "${YELLOW}------------------------------------------------${NC}"
    echo -e "${GREEN}✅ Restart selesai! Cek status dengan: docker compose ps${NC}"
}

# --- Main Menu ---
while true; do
    clear
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   APP BOILERPLATE - DOCKER MANAGER   ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo "1. Jalankan SEMUA Service (Full Stack)"
    echo "2. Pilih Service Manual (Up -d Biasa)"
    echo -e "${YELLOW}3. Pilih Service Manual (Build & Force Recreate)${NC}" 
    echo "4. Pilih Service Manual (Restart)"
    echo "5. Restart SEMUA Service"
    echo "6. Matikan Semua (Down)"
    echo "7. Keluar"
    echo -e "----------------------------------------"
    read -p "Pilih menu [1-7]: " menu

    case $menu in
        1)
            run_docker ""
            read -p "Tekan enter..."
            ;;
        2)
            service_selector "Start (Up)" run_docker
            read -p "Tekan enter..."
            ;;
        3)
            # Ini fitur barunya
            service_selector "Build & Recreate" rebuild_docker
            read -p "Tekan enter..."
            ;;
        4)
            service_selector "Restart" restart_docker
            read -p "Tekan enter..."
            ;;
        5)
            restart_docker ""
            read -p "Tekan enter..."
            ;;
        6)
            echo -e "${RED}[STOP] Mematikan semua container...${NC}"
            docker compose down
            read -p "Tekan enter..."
            ;;
        7)
            echo "Bye!"
            exit 0
            ;;
        *)
            echo "Pilihan tidak valid."
            sleep 1
            ;;
    esac
done