# Visitflow — Production Deployment Guide

Two deployables: the **Laravel API** (`backend/`) and the **React SPA** (`frontend/`).
The frontend is a static build that calls the API, so **deploy the backend first**
and have its public HTTPS URL ready before building the frontend.

```
Browser ──▶ Vercel (frontend SPA, static)
                 │  fetch(VITE_API_URL)
                 ▼
           Laravel API (HTTPS)  ──>  MySQL + persistent media storage
```

---

## 1. Backend (Laravel API)

Any PHP host works (Railway, Render, Fly.io, a VPS with Nginx + PHP-FPM, etc.).

### 1.1 Configure environment

```bash
cp backend/.env.production.example backend/.env
php artisan key:generate
```

Fill in every `CHANGE_ME` value. The production-critical ones:

| Variable | Value |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | Public HTTPS URL of the API, e.g. `https://visitflow-api.example.com` |
| `DB_*` | Managed MySQL host/credentials (not `127.0.0.1`) |
| `CORS_ALLOWED_ORIGINS` | The Vercel frontend origin, e.g. `https://visitflow.vercel.app` |
| `SESSION_DOMAIN` / `SESSION_SECURE_COOKIE` | API domain / `true` (behind HTTPS) |
| `FILESYSTEM_DISK` | `s3` (object storage) or `local` **with a persistent volume** |

> **Media persistence:** uploads land on the backend filesystem. On ephemeral
> container hosting they are **lost on every redeploy/restart** unless you use
> object storage (`FILESYSTEM_DISK=s3` + `AWS_*`) or mount a persistent volume
> at `storage/app`. Decide this before going live.

### 2. Migrate & seed

```bash
php artisan migrate --force
php artisan db:seed --force          # seeds the verified catalogue + admin user
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3. Queue worker

The default `QUEUE_CONNECTION=database` needs a running worker:

```bash
php artisan queue:work --tries=3
```

Run it as a supervised process (systemd / platform worker dyno), not a one-off.

### 4. Verify

```bash
curl -I https://your-production-api-domain/api/places   # expect 200
```

---

## 5. Frontend (Vercel)

### 5.1 Create the project

1. In Vercel, **Add New → Project** and import `nafasharifmas/Travel`.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite** (auto-detected). Build: `npm run build`, output `dist`.
4. `frontend/vercel.json` already configures the SPA rewrite and asset caching.

### 5.2 Set the production API URL

Add an Environment Variable for **Production** (and Preview if desired):

```
VITE_API_URL = https://your-production-api-domain/api
```

This is baked in at **build time** — a redeploy is required after changing it.

### 5.3 Deploy

Trigger a deploy, then check a deep link (e.g. `/places/<slug>`) resolves rather
than 404-ing — the `vercel.json` rewrite handles that.

### 5.4 Close the loop on the backend

Add the final Vercel origin to `CORS_ALLOWED_ORIGINS` on the API and reload config:

```bash
php artisan config:clear && php artisan config:cache
```

---

## 6. Environment variables that matter

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Vercel | API base URL baked into the SPA build |
| `APP_URL` | Backend | Public API URL for generated links |
| `CORS_ALLOWED_ORIGINS` | Backend | Browser origins allowed to call the API |
| `SANCTUM_STATEFUL_DOMAINS` | Backend | Cookie-based SPA auth domains (optional — the app uses Bearer tokens) |
| `FILESYSTEM_DISK` + `AWS_*` | Backend | Persistent media storage |
| `DB_*` | Backend | Managed MySQL connection |

---

## 7. Tests (before shipping)

Backend feature tests need a dedicated test database:

```sql
CREATE DATABASE visitflow_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
cd backend && php artisan test
```

The suite currently fails before assertions with
`SQLSTATE[HY000] [1049] Unknown database 'visitflow_testing'` until that
database exists (see `backend/phpunit.xml`).

---

## 8. Go-live checklist

- [ ] Backend deployed and `/api/places` returns 200 over HTTPS
- [ ] `APP_DEBUG=false` and a real `APP_KEY` set
- [ ] `migrate --force` + `db:seed --force` run
- [ ] Queue worker running
- [ ] Persistent media storage configured (S3 or persistent volume)
- [ ] `CORS_ALLOWED_ORIGINS` set to the Vercel origin (not `*`)
- [ ] `VITE_API_URL` set in Vercel → production build succeeds
- [ ] Deep links (e.g. `/places/<slug>`) resolve
- [ ] `visitflow_testing` database created and `php artisan test` green
- [ ] `frontend/vercel.json` present and SPA rewrite verified
