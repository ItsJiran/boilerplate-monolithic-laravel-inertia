# App Boilerplate — Monolith Full-Stack Architecture

> Laravel 12 + React (Inertia.js) + Docker — production-grade boilerplate dengan monitoring, SSL, real-time, dan object storage siap pakai.
>
> Developed by **Akterma Technology [AT]** — ItsJiran | `2026`

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 12, PHP 8.2+, FrankenPHP, Laravel Octane |
| Frontend | React (JSX), Inertia.js, Vite, Tailwind CSS |
| Real-time | Laravel Reverb (WebSocket) |
| Auth | Laravel Sanctum + Breeze |
| Database | MariaDB |
| Cache / Queue | Redis |
| Object Storage | MinIO (S3-compatible) |
| Monitoring | Grafana + Prometheus + Loki + Promtail |
| Load Balancer | Nginx |
| Container Mgmt | Portainer |
| SSL Dev | Step CA (self-signed) |
| SSL Production | Let's Encrypt |

---

## Struktur Direktori

```
.
├── app/                         # Aplikasi Laravel
│   ├── app/
│   │   ├── Http/Controllers/    # Controller (thin layer)
│   │   ├── Services/            # Business logic per domain
│   │   │   ├── AccessControl/
│   │   │   ├── Admin/
│   │   │   ├── Dashboard/
│   │   │   ├── Notification/
│   │   │   ├── Profile/
│   │   │   └── Shared/
│   │   ├── DTO/                 # Data Transfer Objects
│   │   ├── Models/              # Eloquent Models
│   │   ├── Events/ + Listeners/ # Event-driven
│   │   ├── Jobs/                # Async queue jobs
│   │   └── Rules/               # Custom validation rules
│   └── resources/js/
│       ├── Pages/               # Inertia page components
│       ├── Components/ui/       # Atomic Design (atoms/molecules/organisms)
│       ├── Hooks/               # Custom React hooks
│       ├── Stores/              # Zustand state stores
│       └── Lib/                 # utils, enums, authRoles, routes
├── infra/                       # Infrastruktur Docker
│   ├── docker-compose.devops.yml
│   ├── docker-compose.devops.exporter.yml
│   ├── docker-compose.portainer.yml
│   └── docker-compose.step-ca.yml
├── scripts/
│   ├── setup/                   # One-time setup scripts
│   └── run/                     # Operational run scripts
├── docker-compose.yml           # Main app stack
├── setup.sh                     # Entry point: menu setup scripts
└── run.sh                       # Entry point: menu run scripts
```

---

## Environment Files

Project menggunakan 3 env file terpisah, semua di root project:

| File | Isi |
|---|---|
| `.env` | Config utama: APP_URL, ports, APP_SLUG, SSL, network |
| `.env.backend` | Config Laravel: DB, Redis, Mail, S3, Sanctum, Reverb |
| `.env.devops` | Config monitoring: Grafana, Prometheus, Loki, resource limits |

Copy dari contoh:
```bash
cp .env.example .env
cp .env.example.backend .env.backend
cp .env.example.devops .env.devops
```
Atau jalankan `./setup.sh` → pilih `setup-env.sh`.

> Lihat `infra/ENV-FILE-CONFIG.md` untuk penjelasan lengkap tiap variabel.

---

## Docker Stack

### Main App (`docker-compose.yml`)

| Service | Fungsi |
|---|---|
| `mariadb` | Database utama |
| `db-init` | One-shot: buat database & user saat pertama kali |
| `redis` | Cache + Queue broker |
| `server` | Laravel app (FrankenPHP/Octane) |
| `server-worker` | `php artisan queue:work` — async job processor |
| `server-socket` | `php artisan reverb:start` — WebSocket server |
| `server-cron` | `php artisan schedule:work` — cron scheduler |
| `load_balancer` | Nginx, expose port ke host |
| `minio` | Object storage S3-compatible |
| `createbuckets` | One-shot: auto-create bucket MinIO |
| `phpmyadmin` | UI manajemen database |

### Monitoring (`infra/docker-compose.devops.yml`)

| Service | Fungsi |
|---|---|
| `grafana` | Dashboard visualisasi |
| `prometheus` | Metrics collector |
| `loki` | Log aggregator |

### Exporters (`infra/docker-compose.devops.exporter.yml`)

| Service | Fungsi |
|---|---|
| `node_exporter` | Metrics CPU/RAM/disk host |
| `redis-exporter` | Metrics Redis |
| `mariadb-exporter` | Metrics MariaDB |
| `nginx-exporter` | Metrics Nginx |
| `cadvisor` | Metrics per container Docker |
| `promtail` | Log shipper → Loki |

### Tools

| Compose File | Service | Fungsi |
|---|---|---|
| `docker-compose.portainer.yml` | `portainer` | UI manajemen container |
| `docker-compose.step-ca.yml` | `step-ca` | CA server untuk SSL development |

---

## Workflow: Setup Pertama Kali

Jalankan semua langkah berikut secara berurutan.

### 1. Setup Environment

```bash
./setup.sh
# Pilih: setup-env.sh
# Atau pilih A untuk run semua setup scripts sekaligus
```

Akan meng-copy `.env.example` → `.env`, `.env.backend`, `.env.devops`.
Edit ketiga file tersebut sesuai kebutuhan (minimal: `APP_URL`, `DB_PASSWORD`, `APP_SLUG`).

### 2. Setup Local Hosts

```bash
sudo ./setup.sh
# Pilih: setup-hosts.sh
```

Menambahkan semua domain dari `.env` (`APP_URL`, `API_URL`, `S3_URL`, `S3_CONSOLE_URL`, `GRAFANA_URL`, `PHPMYADMIN_URL`) ke `/etc/hosts` → `127.0.0.1`.

### 3. Setup Nginx Virtual Host di Host Machine

```bash
sudo ./setup.sh
# Pilih: setup-nginx-host.sh
```

Membuat konfigurasi Nginx di `/etc/nginx/sites-available/` dan symlink ke `sites-enabled/` agar domain lokal diroute ke port load balancer.

### 4. Setup SSL Development

```bash
# 4a. Jalankan Step CA server
./run.sh
# Pilih: run.step-ca.sh

# 4b. Generate SSL certificate untuk domain
./run.sh
# Pilih: run.dev.ssl.sh

# 4c. Install Root CA ke system dan browser
./run.sh
# Pilih: run.dev.ssl.ca.sh
# → Install ke: system trust store (apt/rpm/arch), Chrome/Chromium (NSS DB), semua Firefox profile

# 4d. Verifikasi SSL
./run.sh
# Pilih: run.dev.ssl.verify.sh
```

> **Production**: Gunakan Let's Encrypt. Lihat `infra/LETSENCRYPT.md`.

### 5. Setup Monitoring Config

```bash
./setup.sh
# Pilih: setup-monitoring-config.sh
```

Generate `prometheus.yml` dan `promtail.config.yml` dari variabel `.env.devops`.
Gunakan `infra/monitoring/prometheus.example.yml` sebagai referensi endpoint exporter.

---

## Workflow: Menjalankan Aplikasi

### Jalankan Main App

```bash
./run.sh
# Pilih: run.app.sh
```

Script interaktif dengan **checkbox selector** — pilih service yang ingin dioperasikan. Operasi yang tersedia:

| Operasi | Keterangan |
|---|---|
| `up` | Jalankan service |
| `restart` | Restart service |
| `rebuild` | Rebuild image lalu up |
| `force-recreate` | Force recreate container |
| `reload` | Zero-downtime config reload (Nginx: `nginx -s reload`) |
| `down` | Matikan dan hapus container |
| `stop` | Stop tanpa remove container |
| `volume` | Manage / recreate volume |

### Jalankan Monitoring

```bash
# Step 1: Exporters
./run.sh
# Pilih: run.devops.exporter.sh
# Pilih service: node_exporter, redis-exporter, mariadb-exporter, nginx-exporter, cadvisor, promtail

# Step 2: Monitoring stack
./run.sh
# Pilih: run.devops.sh
# Pilih service: prometheus, loki, grafana
```

### Jalankan Portainer

```bash
./run.sh
# Pilih: run.portainer.sh
```

---

## Akses Layanan

> Sesuaikan dengan nilai `APP_URL` dan domain lain di `.env`.

| Layanan | URL Default |
|---|---|
| Aplikasi | `https://myapp.test` |
| MinIO Console | `https://s3-console.myapp.test` |
| phpMyAdmin | `https://pma.myapp.test` |
| Grafana | `https://monitoring.myapp.test` |
| Portainer | `https://localhost:9443` |
| Step CA | `https://localhost:9000` |
| Prometheus | `http://localhost:9090` |

---

## Fitur Aplikasi Bawaan

| Fitur | Keterangan |
|---|---|
| Auth Lengkap | Login, Register, Password Reset, Email Verify, Confirm Password |
| RBAC | Role `superadmin`, `admin`, `user` via middleware `EnsureRole` |
| Real-time Notifications | WebSocket via Reverb, mark read / read-all |
| File Upload | Upload ke MinIO/S3 via `useS3Upload` hook |
| Profile Management | Edit info, ganti password, hapus akun |
| Dashboard | Charts, stat cards, filter periode |
| Excel Export | via Maatwebsite Excel |
| Queue Worker | Async job processing via Redis |
| Scheduler | Cron tasks via `schedule:work` |

---

## SSL Certificate Strategy

| Env | Metode | Script |
|---|---|---|
| Development | Step CA (self-signed, trusted lokal) | `run.step-ca.sh` → `run.dev.ssl.sh` → `run.dev.ssl.ca.sh` |
| Production | Let's Encrypt (trusted publik) | Lihat `infra/LETSENCRYPT.md` |

File SSL yang di-generate disimpan di root project dengan prefix `gen-`:
- `gen-<app-name>.crt` — certificate
- `gen-<app-name>.key` — private key
- `gen-<app-name>.csr` — certificate signing request
- `gen-<app-name>-rootCA.pem` — root CA certificate

---

## Quick Commands Cheatsheet

```bash
# === SETUP (jalankan sekali) ===
./setup.sh                           # Menu interaktif setup scripts
# pilih A untuk run semua sekaligus

# === RUN APP ===
./run.sh                             # Menu interaktif run scripts

# === DOCKER MANUAL ===
docker compose up -d                 # Jalankan semua service main app
docker compose down                  # Matikan semua service
docker compose logs -f server        # Lihat log Laravel

# === MONITORING MANUAL ===
docker compose -f infra/docker-compose.devops.yml up -d
docker compose -f infra/docker-compose.devops.exporter.yml up -d

# === STEP CA MANUAL ===
docker compose -f infra/docker-compose.step-ca.yml up -d
docker logs -f ${APP_SLUG}-step-ca

# === ARTISAN ===
docker exec -it ${APP_SLUG}-server php artisan migrate
docker exec -it ${APP_SLUG}-server php artisan db:seed
docker exec -it ${APP_SLUG}-server php artisan queue:restart
docker exec -it ${APP_SLUG}-server php artisan tinker
```

---

## Notes

- Semua service memiliki resource limit CPU/Memory via `deploy.resources.limits` — set di `.env.devops`
- Log rotation: max `5MB × 2 file` per container (json-file driver)
- Docker network bersifat `external` — dibuat manual atau otomatis oleh run script
- Variable `APP_SLUG` digunakan sebagai prefix nama container, volume, dan network
- Setup scripts bisa dijalankan individual atau semua sekaligus (`./setup.sh` → `A`)
- Run scripts memiliki checkbox interaktif: pilih service spesifik tanpa edit compose file

---

> Further reading:
> - `infra/STEP-CA.md` — SSL development dengan Step CA
> - `infra/LETSENCRYPT.md` — SSL production dengan Let's Encrypt
> - `infra/ENV-FILE-CONFIG.md` — Panduan lengkap environment variables