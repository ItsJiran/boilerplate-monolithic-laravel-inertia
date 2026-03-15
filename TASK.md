# DevOps & Configuration Standardization Tasks

## 1. Standardization of URL vs Domain Definitions
**Objective:** Eliminate ambiguity between "URL" (with protocol) and "Domain" (host only) to prevent configuration conflicts in Nginx and App integration.

- [ ] **Analyze & Refactor `config.json` & `.env.example`**
    - [ ] Rename variables to follow strict convention:
        - `*_DOMAIN`: Hostname only (e.g., `api.myapp.com`, `myapp.com`). Used for Nginx `server_name`, Cookies, etc.
        - `*_URL`: Full URL with protocol (e.g., `https://api.myapp.com`). Used for API calls, Redirects, CORS.
        - `*_SCHEME`: Protocol (e.g., `http` or `https`).
    - [ ] **Specific Changes needed:**
        - Check `API_URL`, `REVERB_URL`, `S3_URL` in `config.json`. Currently, they appear to be domains (missing `https://`).
        - Decision: Either add `https://` to them, or rename them to `API_DOMAIN`, `REVERB_DOMAIN`, etc., and derive the URL in the `.env` generation step.
    - [ ] Update `config.json` structure to reflect these changes.
    - [ ] Update `.env.example` to align with new variable names.

## 2. Integration & Verification
**Objective:** Ensure the new variable definitions propagate correctly to the Application and Third-Party services.

- [ ] **Update `setup-env.sh`**
    - [ ] Ensure the script correctly maps the new JSON keys to `.env` variables.
    - [ ] Add validation: Warn if a `_URL` variable is missing `http://` or `https://`.
- [ ] **Verify Application Config (`config/*.php`)**
    - [ ] Check `config/app.php`, `config/sanctum.php`, `config/cors.php`, `config/filesystems.php`.
    - [ ] Ensure they use the correct `env('VAR_DOMAIN')` or `env('VAR_URL')` based on need.
        - *Example:* Sanctum stateful domains need `_DOMAIN`. S3 disk endpoint usually needs full `_URL`.

## 3. Dynamic Nginx & Load Balancer Setup Script
**Objective:** Generate valid Nginx configurations dynamically based on enabled services to avoid "bentrok" (conflicts) and invalid upstream errors.

- [ ] **Create `scripts/setup/setup-nginx.sh`**
    - [ ] **Input Arguments:** Accept flags for services to generate, e.g., `--enable-minio`, `--enable-pma`, `--enable-reverb`.
    - [ ] **Template Processing:**
        - Use `envsubst` or sed to replace `${VAR_DOMAIN}` placeholders in templates with actual values from `.env`.
    - [ ] **Modular Templates:** Split the large `default.conf.lb.template` into smaller chunks if necessary, or use conditional logic in the script to construct the final file.
    - [ ] **Output:** Generate `infra/nginx/default.conf` (or inside `conf.d/`).

## 4. Cleanup Utilities
**Objective:** Provide a way to reset the environment for clean testing.

- [ ] **Create `scripts/utils/cleanup-generated.sh`**
    - [ ] Remove generated `.env` files (`.env`, `.env.backend`, `.env.devops`).
    - [ ] Remove generated Nginx configs (`infra/nginx/*.conf`).
    - [ ] (Optional) Clear `storage/` logs or temp files if needed.

## 5. Deployment Workflow Validation
- [ ] Update `deploy.sh` or `WORKFLOW-CONFIG.md` to include `setup-nginx.sh` execution before starting containers.

## 6. Modular Deployment Scripts (Micro Scripts)
**Objective:** Break deployment logic into composable scripts so CI/CD workflows can combine only the required steps per service.

- [ ] Define modular deployment structure in `scripts/deploy/`, for example:
    - [ ] `scripts/deploy/steps/10-prepare-env.sh`
    - [ ] `scripts/deploy/steps/20-pull-image.sh`
    - [ ] `scripts/deploy/steps/30-setup-nginx.sh`
    - [ ] `scripts/deploy/steps/40-migrate.sh`
    - [ ] `scripts/deploy/steps/50-up-services.sh`
    - [ ] `scripts/deploy/steps/60-healthcheck.sh`
- [ ] Add orchestrator wrapper script, e.g. `scripts/deploy/deploy.pipeline.sh`, that accepts step combinations.
- [ ] Ensure every step is idempotent and can run independently.
- [ ] Add CI examples in workflow docs to show how to compose step variants for different targets.
