# VisitFlow — System Architecture Document

**Project:** VisitFlow — Curated Sri Lanka Day Visit Planning Web Application  
**Institution:** University of Moratuwa  
**Architecture Paradigm:** Decoupled Multi-Tier Client-Server Architecture (RESTful API & Single Page Application)  
**Document Version:** 1.0 (Production & Academic Baseline)  

---

## 1. Architectural Overview & Design Principles

VisitFlow is engineered as a decoupled, multi-tier web application designed to solve the problem of fragmented tourist information and disjointed route planning in Sri Lanka's tourism sector. The system follows clean architecture principles, separating concerns across presentation, domain logic, spatial geometry, and persistent storage.

```mermaid
graph TD
    subgraph ClientTier["1. Presentation Tier (Client)"]
        SPA["React 19 + TypeScript SPA"]
        Leaflet["Leaflet Interactive Spatial Map Engine"]
        Context["Context State (Auth, Itinerary, Theme)"]
    end

    subgraph APITier["2. Application & API Gateway Tier"]
        Nginx["Web Server / Reverse Proxy"]
        Router["Laravel 11 RESTful Routing Engine"]
        AuthMiddleware["Sanctum Bearer Token & Role Guards"]
    end

    subgraph ServiceTier["3. Domain & Business Logic Tier"]
        PlacesController["Catalogue & Spatial Filtering Engine"]
        ItinService["Itinerary & Route Optimization Service"]
        AuditService["Append-Only Security Audit Engine"]
        SettingsService["Platform Configuration Engine"]
    end

    subgraph DataTier["4. Persistence & Cloud Infrastructure"]
        MySQL[("Relational Database (MySQL / SQLite)")]
        Cloudinary[("Cloudinary CDN & Asset Storage")]
        LocalDisk[("Public Storage Driver")]
    end

    SPA <-->|"RESTful JSON over HTTPS"| Router
    Router --> AuthMiddleware
    AuthMiddleware --> PlacesController
    AuthMiddleware --> ItinService
    AuthMiddleware --> AuditService
    AuthMiddleware --> SettingsService

    PlacesController -->|"Haversine Spatial Calculations"| MySQL
    ItinService -->|"Normalized Transactions"| MySQL
    AuditService -->|"Immutable Event Logs"| MySQL
    SettingsService -->|"Key-Value Repository & Cache"| MySQL

    PlacesController -.->|"Asset Delivery"| Cloudinary
    PlacesController -.->|"Fallback Storage"| LocalDisk
```

### Core Architectural Principles
- **Separation of Concerns (SoC):** Strict demarcation between client-side routing, stateful user sessions, business rule enforcement, and relational persistence.
- **Stateless RESTful Communication:** Zero server-side session stickiness; client requests authenticate using cryptographic Bearer tokens (Laravel Sanctum).
- **Spatial Geometry First:** Built-in spherical trigonometry (Haversine Formula) dynamically bounds places within operational operational discovery envelopes (e.g., 25 km radius).
- **Graceful Offline/Guest Degradation:** Unauthenticated visitors can plan routes in-memory (`localStorage`), which transparently synchronize to persistent user records upon authentication.
- **Defensive Auditability:** Append-only audit trail captures every state-mutating administrative action with IP address and JSON payload snapshots.

---

## 2. Multi-Tier Component Breakdown

```mermaid
flowchart LR
    subgraph Frontend["Frontend Tier (React + Vite)"]
        direction TB
        UI["Tailwind CSS v4 UI Components"]
        RouterFE["React Router v7"]
        Store["State Providers (Itinerary, Auth)"]
        APIClient["Axios-based API Service Layer"]
        UI --> RouterFE --> Store --> APIClient
    end

    subgraph Network["Boundary"]
        HTTPS["HTTPS / JSON API"]
    end

    subgraph Backend["Backend Tier (Laravel 11)"]
        direction TB
        Kernel["HTTP Kernel & CORS Middleware"]
        Controllers["Resource & Domain Controllers"]
        Eloquent["Eloquent ORM Models & Scopes"]
        Sanctum["Sanctum Token Auth Provider"]
        Kernel --> Sanctum --> Controllers --> Eloquent
    end

    subgraph Storage["Persistence Tier"]
        DB[(MySQL Database)]
        Media[(Cloudinary / Local Storage)]
    end

    APIClient <==> HTTPS <==> Kernel
    Eloquent <--> DB
    Controllers <--> Media
```

### 2.1 Presentation Tier (Frontend)
- **Framework & Language:** React 19, TypeScript 5.8, bundled with Vite 8.
- **Styling Architecture:** Custom design token system leveraging Tailwind CSS, using an Oceanic & Charcoal palette (`ivory-100`, `navy-950`, `turquoise-500`, `gold-500`).
- **Interactive Mapping:** Leaflet spatial rendering canvas (`react-leaflet` / Leaflet L.map) consuming OpenStreetMap raster tiles, rendering high-contrast SVG map pins, clustering, and route connection polylines.
- **State Management Architecture:**
  - `AuthContext`: Manages user credentials, role hierarchy (`guest`, `user`, `admin`), login states, and token persistence.
  - `ItineraryContext`: Handles optimistic one-day route builders, real-time stop reordering, drag/drop mutations, and local-storage syncing.
  - `ThemeContext`: Class-based dark/light mode engine avoiding first-paint flashes.
- **CRM Shell (Admin Console):** Standalone full-viewport administration workspace with KPI metric monitors, catalogue tables, taxonomy trees, media attachment modules, user permission toggles, and system telemetry cards.

### 2.2 Application & Logic Tier (Backend)
- **Framework:** Laravel 11 running on PHP 8.2+.
- **Routing & Controllers:**
  - **Public APIs:** `/api/places` (spatial search, keywords, category filtering), `/api/categories`, `/api/itineraries` (user CRUD & route sharing).
  - **Authentication APIs:** `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/user`.
  - **Admin APIs (`/api/admin/*`):** Guarded endpoints for places CRUD, soft-delete archival, photo validation, user role escalation/deactivation, audit trail inspection, system health probes, and platform settings.
- **Haversine Distance Engine:**
  Evaluates geographical proximity directly in the query pipeline:
  $$\text{Distance} = 6371 \times 2 \times \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lng}}{2}\right)}\right)$$
- **Automated SQLite Compatibility Layer:** Registered PDO trigonometric functions (`acos`, `cos`, `sin`, `radians`, `least`, `greatest`) ensuring 100% test parity between development SQLite in-memory databases and production MySQL environments.

### 2.3 Persistence Tier
- **Database:** Relational MySQL engine with foreign key constraints, indexes on spatial columns (`latitude`, `longitude`), unique slugs, and soft-delete markers (`deleted_at`).
- **Asset Storage:** Dual-driver media subsystem defaulting to local disk (`storage/app/public`) with seamless switchability to Cloudinary CDN for optimized WebP delivery and automatic thumbnail generation.

---

## 3. Data Flow & Dynamic Interactions

### 3.1 Tourist Discovery & Spatial Query Flow

```mermaid
sequenceDiagram
    autonumber
    actor Tourist as Tourist (Browser)
    participant Client as React SPA (Discovery Page)
    participant API as Laravel Places API
    participant Spatial as Haversine Spatial Engine
    participant DB as Relational Database

    Tourist->>Client: Open Explore / Enter Search ("Sigiriya", Category: "Heritage")
    Client->>API: GET /api/places?search=Sigiriya&category_id=4&lat=7.87&lng=80.77&radius=25
    API->>Spatial: Apply radial bounding box & Haversine formula
    Spatial->>DB: SELECT * FROM places WHERE deleted_at IS NULL AND distance <= 25km
    DB-->>API: Return matching place records + category relationships
    API-->>Client: 200 OK (JSON Array of validated attractions)
    Client->>Client: Render Attraction Grid + Update Leaflet Map Markers
    Client-->>Tourist: Display interactive map pins and attraction cards
```

### 3.2 Guest-to-Authenticated Itinerary Synchronization

```mermaid
sequenceDiagram
    autonumber
    actor Tourist as Guest User
    participant LocalStore as Browser localStorage
    participant App as React App
    participant AuthAPI as Authentication API
    participant ItinAPI as Itinerary API
    participant DB as MySQL DB

    Tourist->>App: Add Attraction to Day Plan (as Unregistered Guest)
    App->>LocalStore: Cache temporary stops in 'visitflow_temp_itinerary'
    Tourist->>App: Click "Save Plan" -> Prompt Sign In
    Tourist->>AuthAPI: POST /api/auth/login (email, password)
    AuthAPI->>DB: Verify credentials & issue Sanctum Bearer Token
    AuthAPI-->>App: 200 OK { token, user }
    App->>LocalStore: Retrieve cached 'visitflow_temp_itinerary'
    App->>ItinAPI: POST /api/itineraries (payload + Authorization: Bearer <token>)
    ItinAPI->>DB: Insert into itineraries & itinerary_places
    DB-->>ItinAPI: Itinerary #14 created
    ItinAPI-->>App: 201 Created (Persistent Itinerary)
    App->>LocalStore: Clear temporary guest itinerary cache
    App-->>Tourist: Toast: "Itinerary saved to your account"
```

### 3.3 Administrative Mutation & Audit Trail Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Admin as System Administrator
    participant Console as Admin Console (SPA)
    participant Middleware as EnsureUserIsAdmin Guard
    participant Controller as PlaceController (Admin)
    participant Audit as AuditLog Pipeline
    participant DB as Database

    Admin->>Console: Click "Archive Place" / "Update Settings"
    Console->>Middleware: PUT /api/admin/places/{id}/archive (Bearer Token)
    Middleware->>Middleware: Verify user.role === 'admin'
    alt Non-Admin
        Middleware-->>Console: 403 Forbidden
    else Verified Admin
        Middleware->>Controller: Proceed with action
        Controller->>DB: Soft delete / update record
        Controller->>Audit: Dispatch audit event (actor_id, action, payload, ip)
        Audit->>DB: INSERT INTO audit_logs (actor_id, action, subject, payload, ip)
        DB-->>Controller: Confirmed
        Controller-->>Console: 200 OK { message: "Place archived" }
        Console-->>Admin: Update UI table & bump live audit counter
    end
```

---

## 4. Entity-Relationship Architecture (Database Schema)

```mermaid
erDiagram
    USERS ||--o{ ITINERARIES : "creates"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    CATEGORIES ||--o{ PLACES : "classifies"
    PLACES ||--o{ PLACE_MEDIA : "owns"
    PLACES ||--o{ ITINERARY_PLACES : "included_in"
    ITINERARIES ||--o{ ITINERARY_PLACES : "contains"

    USERS {
        bigint id PK
        string name
        string email UK
        string password
        string role "admin | user"
        boolean is_active
        timestamp created_at
    }

    CATEGORIES {
        bigint id PK
        string name
        string slug UK
        string description
        string icon
        string color
    }

    PLACES {
        bigint id PK
        bigint category_id FK
        string name
        string slug UK
        text description
        text travel_tips
        string address
        decimal latitude
        decimal longitude
        string opening_hours
        string contact_info
        boolean is_verified
        timestamp deleted_at "Soft Delete"
    }

    PLACE_MEDIA {
        bigint id PK
        bigint place_id FK
        string file_path
        string file_type
        boolean is_primary
        integer sort_order
    }

    ITINERARIES {
        bigint id PK
        bigint user_id FK
        string title
        text description
        date visit_date
        boolean is_public
    }

    ITINERARY_PLACES {
        bigint id PK
        bigint itinerary_id FK
        bigint place_id FK
        integer order_index
        string custom_notes
    }

    AUDIT_LOGS {
        bigint id PK
        bigint actor_id FK
        string action
        string subject_type
        bigint subject_id
        json payload
        string ip_address
        timestamp created_at
    }

    SETTINGS {
        bigint id PK
        string key UK
        text value
        string type "string | number | boolean | json"
        string group "general | map | security | media | email"
        string label
    }
```

---

## 5. Security & Governance Architecture

1. **Authentication:** 
   - Stateful token-based authentication via **Laravel Sanctum**. Tokens are hashed (`SHA-256`) and stored in the database.
   - All protected client requests transmit the Bearer token via the HTTP `Authorization` header.
2. **Authorization Guards:**
   - Role-Based Access Control (`role: 'admin' | 'user'`).
   - `EnsureUserIsAdmin` middleware rejects non-privileged access attempts with HTTP `403 Forbidden` and logs security anomalies.
3. **Input Validation & Sanitization:**
   - Strict Laravel Form Requests (`StorePlaceRequest`, `UpdateSettingsRequest`).
   - Coordinate clamping ensuring latitudes ($5.9^\circ \text{N}$ to $9.9^\circ \text{N}$) and longitudes ($79.6^\circ \text{E}$ to $82.0^\circ \text{E}$) fall strictly within Sri Lankan geographical territory.
4. **Data Protection:**
   - Passwords hashed using standard `Bcrypt` with dynamic salt rounds.
   - Database credentials, API tokens, and secret keys managed through `.env` environment isolation (excluded from version control).
   - Sensitive fields in system settings (`mail_password`, `api_keys`) masked (`••••••••`) before API serialization.

---

## 6. Continuous Integration & Delivery (CI/CD) Architecture

```mermaid
flowchart TD
    subgraph Development["1. Developer Workspace"]
        Code["Code Changes (Branch: feature/*)"]
        LocalCI["powershell scripts/ci-local.ps1"]
        Code --> LocalCI
    end

    subgraph GitHubActions["2. Continuous Integration Pipeline (GitHub Actions)"]
        Trigger["Push / Pull Request to main or feature/*"]
        
        subgraph FrontendJob["Frontend Verification Job"]
            NodeSetup["Setup Node.js 24"]
            Lint["Oxlint Static Code Analysis"]
            Typecheck["tsc --noEmit & vite build"]
        end

        subgraph BackendJob["Backend Verification Job"]
            PHPSetup["Setup PHP 8.2 + SQLite Extensions"]
            Composer["composer install --prefer-dist"]
            PHPUnit["Run PHPUnit (12 Tests, 85 Assertions)"]
        end

        Trigger --> FrontendJob
        Trigger --> BackendJob
    end

    subgraph Delivery["3. Continuous Delivery & Production"]
        Release["Create Artifact / Docker Container"]
        Deploy["Automated Host Deployment"]
        FrontendJob & BackendJob --> Release --> Deploy
    end

    LocalCI -->|"git push origin"| Trigger
```

VisitFlow incorporates a continuous integration and automated testing pipeline:
- **Linting & Hygiene:** High-speed Oxlint scans JavaScript/TypeScript files in sub-second times.
- **Frontend Compiles:** Strict TypeScript validation (`tsc -b`) and Vite production bundling.
- **Backend Test Suite:** 12 automated unit and feature test suites (85 assertions) running in an isolated SQLite in-memory database verifying authentication guards, guest synchronization, travel tips validation, radius boundary clamps, and soft deletion constraints.
- **Continuous Validation:** Every pull request and push to the remote repository runs through GitHub Actions, guaranteeing zero regressions before merging.
