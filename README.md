# Visitflow — Local-Tourist Discovery & One-Day Itinerary Platform

> **SRS Baseline v1.0 Production Implementation**  
> Responsive local-tourist discovery, spatial map clustering, one-day itinerary planning, and auditable admin console.

---

## 🏛️ System Architecture & Tech Stack

- **Tier 1 (Frontend SPA):** React 19 + TypeScript + Vite + Tailwind CSS (`frontend/`)
- **Tier 2 (API Modules):** Laravel 11 (PHP 8.2+) RESTful JSON API (`backend/`)
- **Tier 3 (Persistence & Media):** MySQL 8 (`visitflow` database) + secure local storage
- **External Integration:** Leaflet + OpenStreetMap tiles with verified attribution (`FR-14`)

---

## 🚀 Running the Application

### 1. Prerequisites
- **PHP 8.2+** with `pdo_mysql`, `gd`, `fileinfo` extensions enabled.
- **Node.js 18+** & npm.
- **MySQL Server** running on `127.0.0.1:3306` (Database: `visitflow`, user: `root`, password: empty by default).

### 2. Backend (Laravel API)
```bash
cd backend
# Database migrations & verified seed catalogue (already run)
php artisan migrate --seed

# Start the REST API server on port 8000
php artisan serve --host=127.0.0.1 --port=8000
```
API endpoints will be live at: `http://127.0.0.1:8000/api`

### 3. Frontend (React 19 SPA)
```bash
cd frontend
# Development server with hot reload
npm run dev -- --host 127.0.0.1 --port 5173
```
Visit the application in your browser at: **`http://localhost:5173`**

---

## 🔑 Seed User Accounts & Instant Demo Credentials

| Role | Email | Password | Permissions & Surface |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@visitflow.com` | `Admin123!` | Places CRUD & Archival, Categories, Users, Media upload, Audit trail |
| **Registered User** | `alex@example.com` | `Password123!` | Save, name, reorder, and edit personal day itineraries |
| **Visitor (Guest)** | *No sign-in needed* | *N/A* | Browse catalogue, search, Leaflet maps, temporary session itinerary |

> **Tip:** The sign-in modal in the UI features instant single-click demo autofill pills for Admin and Member accounts.

---

## 📋 Functional Requirements Traceability Matrix

| Requirement ID | Module | Implementation Details |
| :--- | :--- | :--- |
| **FR-01** | Guest Discovery | Unauthenticated visitor can browse catalogue, open place detail, view description, photos, and Leaflet map. |
| **FR-02** | Guest Discovery | Debounced keyword search across place names and descriptions + category filtering chips. |
| **FR-03** | Guest Discovery | Interactive Leaflet / OpenStreetMap map with coordinates, custom category pins, and popups. |
| **FR-04** | Guest Itineraries | Visitor builds a temporary one-day itinerary in session; synced automatically upon registration/sign-in. |
| **FR-05** | Authentication | Sanctum role-scoped token authentication; register, login, profile, and logout session invalidation. |
| **FR-06** | User Itineraries | Registered user can save, name, edit, and delete personal itineraries with strict ownership isolation. |
| **FR-07** | User Itineraries | Ordered stops with sequence numbering, planned visit times, and optional custom notes per stop. |
| **FR-08** | Admin · Places | Curators create, update, archive (soft-delete), and restore places; archived places remain on historical trips. |
| **FR-09** | Admin · Categories | Full taxonomy CRUD; deletion blocked if existing places reference the category. |
| **FR-10** | Admin · Users | Inspect user accounts, change roles, deactivate/activate accounts; all recorded to audit log. |
| **FR-11** | Admin · Media | Photo upload with server-side MIME and size checks (<= 5MB), stored outside the public code tree. |
| **FR-12** | Authorization | Privileged admin endpoints protected with `EnsureAdmin` policy middleware. |
| **FR-13** | Validation | Form inputs validated on server with field-level rejection responses. |
| **FR-14** | Attribution | OpenStreetMap credit and tile policy displayed on all map surfaces and footer. |
| **Launch Catalogue** | Catalogue | Seeded with **12 verified tourist places** with photos and real geographic coordinates (meets $\ge 10$ bar). |

---

## 🧪 Automated Test Verification

Run the test suite at any time:
```bash
# Feature & Unit API tests
cd backend
php artisan test tests/Feature/VisitflowApiTest.php
```
