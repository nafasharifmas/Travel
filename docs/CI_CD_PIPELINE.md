# Visitflow CI/CD Pipeline Documentation

This project features a fully automated Continuous Integration (CI) and Continuous Delivery/Deployment (CD) pipeline powered by **GitHub Actions**.

---

## 1. Architecture Overview

```
                      ┌───────────────────────────────────────┐
                      │ Push / Pull Request (main, develop,   │
                      │ feature/**, feat/**, fix/**)          │
                      └──────────────────┬────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │        Frontend CI        │                   │        Backend CI         │
   │  - Node.js 20             │                   │  - PHP 8.2                │
   │  - npm ci (cached)        │                   │  - composer install       │
   │  - oxlint linter          │                   │  - PHP syntax check (lint)│
   │  - tsc typecheck          │                   │  - In-memory SQLite DB    │
   │  - Vite production build  │                   │  - 12 Feature & Unit tests│
   │  - Upload dist artifact   │                   │    (85 assertions)        │
   └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         │
                                   Both pass (Green)
                                         │
                                         ▼
                 ┌───────────────────────────────────────────────┐
                 │       Continuous Delivery (CD) / Release      │
                 │   - Verified production build packaging       │
                 │   - Generate tarball release bundle           │
                 │   - Optional Vercel / Cloud deployment hook   │
                 └───────────────────────────────────────────────┘
```

---

## 2. GitHub Actions Workflows

### 2.1 Continuous Integration (`.github/workflows/ci.yml`)
- **Triggers**: Every `push` to `main`, `master`, `develop`, `feature/**`, `feat/**`, `fix/**` and every `pull_request` targeting `main`, `master`, `develop`.
- **Concurrency**: Automatically cancels obsolete in-flight runs when newer commits are pushed to the same branch.
- **Frontend Job**:
  - Sets up Node.js 20 with cached npm dependencies.
  - Runs fast AST linting (`oxlint`).
  - Validates strict TypeScript types (`npm run typecheck`).
  - Compiles the production SPA bundle (`npm run build`).
  - Retains the compiled frontend artifacts for 7 days.
- **Backend Job**:
  - Sets up PHP 8.2 with all essential extensions (`pdo_sqlite`, `bcmath`, `fileinfo`, `gd`, `intl`, `mbstring`).
  - Validates `composer.json` and `composer.lock`.
  - Caches Composer packages.
  - Verifies PHP syntax across all project PHP files.
  - Runs the full PHPUnit test suite against an in-memory SQLite database (`:memory:`), executing 12 tests and 85 assertions with zero external database dependencies.

### 2.2 Continuous Delivery & Packaging (`.github/workflows/deploy.yml`)
- **Triggers**: `push` to `main` branch or manual trigger (`workflow_dispatch`).
- **Gating**: Requires the CI workflow to succeed before triggering release packaging.
- **Packaging**: Packages production frontend assets (`dist/`) and production backend code into a timestamped release bundle artifact.
- **Vercel Deployment (Optional)**: Automatically triggers if `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets are added to the repository.

### 2.3 Dependabot (`.github/dependabot.yml`)
- Automatically monitors `npm`, `composer`, and `github-actions` dependencies weekly for security advisories and updates.

---

## 3. Local CI Validation

Run the exact same CI pipeline locally before committing and pushing:

### Windows (PowerShell):
```powershell
powershell -File scripts/ci-local.ps1
```

### Linux / macOS (Bash):
```bash
./scripts/ci-local.sh
```

---

## 4. GitHub Secrets (Optional for CD)

| Secret Name | Purpose | Required For |
|---|---|---|
| `VERCEL_TOKEN` | Vercel Deployment Token | Automated frontend deployment |
| `VERCEL_ORG_ID` | Vercel Organization ID | Automated frontend deployment |
| `VERCEL_PROJECT_ID` | Vercel Project ID | Automated frontend deployment |
| `VITE_API_URL` | Production API Endpoint | Build-time frontend configuration |
