# VisitFlow

## Local-tourist discovery and one-day itinerary planning

VisitFlow is a full-stack web application for discovering verified destinations along Sri Lanka's Eastern Corridor and building a practical one-day travel plan. It combines a searchable destination catalogue, interactive maps, destination details, guest planning, registered-user itineraries, and an administrator console for maintaining catalogue data.

This repository is prepared as a university software engineering project. The implementation is organised so that a student, examiner, or new contributor can understand the system from the user interface through the API and database.

## Project at a glance

| Area | Implementation |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Laravel 11, PHP 8.2+, REST-style JSON API |
| Database | MySQL 8 with Laravel migrations and Eloquent models |
| Authentication | Laravel Sanctum bearer tokens with admin authorisation middleware |
| Maps | Leaflet with OpenStreetMap tiles and attribution |
| Media | Validated destination photographs with local storage fallback and optional Cloudinary integration |
| Development | Separate frontend and backend applications |

## Why VisitFlow was developed

Travellers often find destination information scattered across unrelated websites, social posts, and map services. VisitFlow brings the core planning tasks into one focused workflow:

1. Browse destinations by category and distance.
2. Inspect verified descriptions, coordinates, opening hours, photographs, and map locations.
3. Add destinations to a temporary trip plan without signing in.
4. Register or sign in to save the itinerary to an account.
5. Allow authorised administrators to maintain places, categories, users, media, and audit records.

## Main user journeys

### Visitor

- Browse the destination catalogue.
- Search by place name or description.
- Filter by category and distance.
- Open a destination detail page.
- View photographs, coordinates, opening information, and the route map.
- Add destinations to a temporary itinerary stored in the browser.

### Registered user

- Register or sign in.
- Synchronise a guest plan after authentication.
- Create and manage personal itineraries.
- Reorder stops, add notes, and plan visit times.
- View or delete owned itineraries.

### Administrator

- View dashboard metrics.
- Create, edit, archive, and restore destinations.
- Manage categories and prevent invalid category deletion.
- Inspect users and update roles or active status.
- Upload and delete validated destination photographs.
- Review the append-only audit trail.

## System architecture

```text
Browser
  |
  | React SPA / JSON requests
  v
Laravel API (backend/)
  |
  +--> MySQL database
  |
  +--> Local media storage or Cloudinary
  |
  +--> OpenStreetMap tiles through Leaflet
```

The frontend and backend are intentionally separate applications. The frontend is a Vite-built single-page application. The backend exposes authenticated and public API routes and owns validation, authorisation, persistence, and audit logging.

## Repository structure

```text
Travel/
├── backend/
│   ├── app/
│   │   ├── Console/Commands/       # maintenance commands
│   │   ├── Http/Controllers/       # API controllers
│   │   ├── Http/Middleware/        # request authorisation
│   │   ├── Models/                  # Eloquent models
│   │   └── Services/                # external-service integrations
│   ├── database/
│   │   ├── migrations/              # database schema history
│   │   └── seeders/                 # demo catalogue and accounts
│   ├── routes/api.php               # API route definitions
│   └── tests/                       # feature and unit tests
├── frontend/
│   ├── src/components/              # reusable interface components
│   ├── src/context/                 # auth, theme, and itinerary state
│   ├── src/pages/                   # routed application screens
│   ├── src/services/api.ts          # frontend API client
│   └── src/utils/                   # distance and route helpers
├── DEPLOYMENT.md                    # production deployment guide
└── README.md                        # this document
```

## Local setup

### Prerequisites

- PHP 8.2 or later.
- Composer.
- Node.js 18 or later and npm.
- MySQL 8 or a compatible MySQL server.
- PHP extensions: `pdo_mysql`, `gd`, and `fileinfo`.

### 1. Configure the database

Create a MySQL database named `visitflow`, then configure `backend/.env` from the example file:

```powershell
cd backend
Copy-Item .env.example .env
php artisan key:generate
```

Set the database values in `backend/.env` as appropriate for the local machine:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=visitflow
DB_USERNAME=root
DB_PASSWORD=
```

`DB_DATABASE=visitflow` means that Laravel connects to the MySQL database whose name is `visitflow`. It is not a username or a password.

### 2. Install and prepare the backend

```powershell
cd backend
composer install
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

The API is available at `http://127.0.0.1:8000/api`.

### 3. Install and run the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://localhost:5173` in a browser. The frontend uses `VITE_API_URL` when it is defined; otherwise it defaults to `http://127.0.0.1:8000/api`.

## Demo accounts

These accounts are created by the development seeder and are intended only for local demonstration.

| Role | Email | Password | Access |
| --- | --- | --- | --- |
| Administrator | `admin@visitflow.com` | `Admin123!` | Admin dashboard, catalogue, users, media, audit trail |
| Registered user | `alex@example.com` | `Password123!` | Personal itinerary management |
| Visitor | No account required | Not applicable | Public catalogue and temporary itinerary |

Do not reuse these credentials in a deployed environment.

## API overview

### Public routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/places` | Browse and filter destinations |
| GET | `/api/places/{idOrSlug}` | View one destination |
| GET | `/api/categories` | List active categories |
| GET | `/api/media/{id}/view` | View stored media |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |

### Authenticated routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/auth/user` | Read the current user |
| POST | `/api/auth/logout` | Revoke the current token |
| GET/POST | `/api/itineraries` | List or create owned itineraries |
| GET/PUT/DELETE | `/api/itineraries/{id}` | Read, update, or delete an owned itinerary |
| POST | `/api/itineraries/sync-guest` | Convert a guest plan into an account itinerary |

### Administrator routes

Administrator endpoints are protected by Sanctum authentication and the `admin` middleware. They cover dashboard metrics, places, categories, users, media, and audit logs. The complete route definitions are in [`backend/routes/api.php`](backend/routes/api.php).

## Functional requirements traceability

| ID | Requirement | Evidence in the project |
| --- | --- | --- |
| FR-01 | Public discovery | Catalogue, detail pages, descriptions, photographs, and maps |
| FR-02 | Search and filtering | Keyword search, category filters, distance and sorting controls |
| FR-03 | Interactive map | Leaflet map, markers, popups, route line, and attribution |
| FR-04 | Guest itinerary | Browser-persisted itinerary context and trip drawer |
| FR-05 | Authentication | Register, login, logout, Sanctum token handling |
| FR-06 | User itineraries | Ownership-aware create, read, update, and delete operations |
| FR-07 | Itinerary details | Ordered stops, visit times, and notes |
| FR-08 | Place administration | Create, update, archive, and restore workflows |
| FR-09 | Category administration | Category CRUD with reference protection |
| FR-10 | User administration | Role and active-status management with audit records |
| FR-11 | Media management | MIME/type/size validation and protected upload/delete routes |
| FR-12 | Authorisation | Admin middleware around privileged API routes |
| FR-13 | Validation | Server-side request validation with JSON error responses |
| FR-14 | Attribution | OpenStreetMap attribution on map surfaces and footer |

## Verification and quality checks

Frontend build:

```powershell
cd frontend
npm.cmd run build
```

Backend tests:

```powershell
cd backend
php artisan test
```

The backend test suite uses the `visitflow_testing` database. Create that database before running the tests if it does not exist. A successful frontend build confirms TypeScript compilation and Vite bundling; it does not replace browser-based functional testing.

Recommended manual checks:

- Open `/explore` and verify catalogue loading, filtering, and map behaviour.
- Open a destination detail page and verify the `Add to Trip` action.
- Add the same destination twice and confirm no duplicate stop is created.
- Sign in and verify guest-plan synchronisation.
- Open `/admin` and verify administrator-only access.
- Upload an accepted image and reject an invalid type or file larger than 5 MB.
- Verify the API returns JSON for validation and server errors.

## Deployment

The production deployment separates the Laravel API from the static frontend:

- Deploy the backend with a managed MySQL database, HTTPS, correct CORS configuration, and persistent media storage.
- Deploy the frontend from the `frontend` directory as a Vite project.
- Set `VITE_API_URL` to the public API URL before building the frontend.
- Configure `APP_DEBUG=false` and a real production `APP_KEY`.
- Use persistent object storage or a persistent volume for uploaded media.

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the full deployment checklist and environment configuration.

## Data and security notes

- Never commit `.env` files, API secrets, database passwords, or production credentials.
- Use HTTPS in production.
- Keep `APP_DEBUG=false` in production so exception details are not exposed.
- Restrict `CORS_ALLOWED_ORIGINS` to the deployed frontend origin.
- Treat the demo credentials in this README as local-only values.
- OpenStreetMap tiles and destination photographs must retain their required attribution.

## Limitations and future improvements

- Routing distances are application estimates and should not be treated as live navigation instructions.
- Media availability depends on the configured storage provider and network connectivity.
- The current catalogue is focused on the Eastern Corridor and can be expanded through the admin console.
- A future version could add live road routing, richer itinerary scheduling, automated image processing, and broader automated browser testing.

## Project author

VisitFlow was developed as a student full-stack software engineering project by **Nafasharifmas**.

## Licence

This project is intended for academic and demonstration use. Review third-party licences and attribution requirements before public redistribution or commercial deployment.
