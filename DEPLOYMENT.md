# DRIVIO Transit OS — Production Deployment Guide

This repository contains the complete, production-ready full-stack application for **DRIVIO** (Intercity Bus Fleet Operations & Digital Ticketing Platform).

The app is architected with multiple turnkey deployment configurations:
1. **Unified Full-Stack Deployment** (Single-service Node.js / Docker on 1 port)
2. **Microservices Deployment** (Docker Compose with Nginx + Express + PostgreSQL)
3. **PaaS Deployments** (Render, Railway, Heroku, AWS App Runner, Google Cloud Run)

---

## 1. Quick Start: 1-Command Local Production Run

You can run the entire platform on a single port without Docker:

```bash
# 1. Install all dependencies (backend + frontend)
npm run install:all

# 2. Build the optimized React frontend bundle
npm run build

# 3. Start the unified production server (serves API & Frontend at port 5000)
npm start
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 2. Option A: Single Unified Docker Container (Recommended)

Builds the entire React frontend and Express backend into one hardened, lightweight Alpine image with automated healthchecks:

```bash
# Build the production image
docker build -t drivio-transit-os .

# Run the container
docker run -d -p 5000:5000 --name drivio-app drivio-transit-os
```

- Accessible at: `http://localhost:5000`
- Health check: `http://localhost:5000/api/v1/health`

---

## 3. Option B: Docker Compose (Microservices with PostgreSQL)

Runs separate isolated containers for the Backend API, Nginx frontend reverse proxy, and PostgreSQL 15 database:

```bash
# Build and launch all services in detached mode
docker compose up -d --build

# View service logs
docker compose logs -f

# Stop all services
docker compose down
```

### Services launched:
| Service | Container | Internal / Host Port | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | `drivio-frontend` | `3000:80` | High-performance Nginx web server & reverse proxy |
| **Backend** | `drivio-backend` | `5000:5000` | Express REST API & Socket.IO real-time telemetry |
| **Database** | `drivio-db` | `5432:5432` | PostgreSQL 15 Alpine with persistent storage volume |

Access the app at [http://localhost:3000](http://localhost:3000).

---

## 4. Option C: 1-Click Render Deployment (`render.yaml`)

This repository includes a configured [render.yaml](file:///Users/apurva/Downloads/FleetEase-main/render.yaml) Blueprint:

1. Push this repository to GitHub or GitLab.
2. In your Render Dashboard, click **New > Blueprint**.
3. Select your repository. Render will automatically provision:
   - **PostgreSQL Database** (`drivio-db`)
   - **Unified Web Service** (`drivio-transit-os`) running the auto-build script and Express backend on port 10000.

---

## 5. Option D: Railway / Heroku Deployment

A [Procfile](file:///Users/apurva/Downloads/FleetEase-main/Procfile) is provided in the repository root:

```procfile
web: node fleetease-backend/server.js
```

### Deploying to Railway:
```bash
railway init
railway up
```

Railway automatically detects the root `package.json`, runs `npm run build`, and launches via `Procfile`.

---

## 6. Environment Variables Reference

Copy `.env.example` to `.env` to customize runtime configurations:

```ini
# Server Settings
NODE_ENV=production
PORT=5000

# Security
JWT_SECRET=your_jwt_secret_32_characters_minimum
COOKIE_SECRET=your_cookie_encryption_secret

# Database Configuration (PostgreSQL)
# Either full URL:
# DATABASE_URL=postgres://user:pass@host:5432/dbname?sslmode=require
# Or discrete parameters:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=fleetease
DB_SSL=false

# CORS (Allowed origins, or * in production behind same origin)
CORS_ORIGIN=*

# Client Flags (Leave blank for auto-origin detection)
REACT_APP_API_URL=
REACT_APP_SOCKET_URL=
```

> [!NOTE]
> If PostgreSQL is not configured, the backend automatically activates DRIVIO's built-in resilient in-memory database with pre-seeded data, ensuring zero setup friction.

---

## 7. Verified Seed Credentials

| Role | Email | Password | Primary Portal |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@drivio.com` | `admin123` | `/admin/dashboard` |
| **Fleet Manager** | `manager@drivio.com` | `manager123` | `/manager/dashboard` |
| **Commercial Driver** | `driver@drivio.com` | `driver123` | `/driver/dashboard` |
| **Station Agent** | `agent@drivio.com` | `agent123` | `/agent/dashboard` |
| **Passenger / Customer**| `customer@drivio.com` | `customer123` | `/my-bookings` |

---

## 8. Verification & Health Monitoring

- **Health Check Endpoint**: `GET /api/v1/health`
  Returns JSON:
  ```json
  {
    "status": "success",
    "message": "DRIVIO API server is running",
    "uptime": 1687,
    "database": { "status": "connected", "error": null },
    "version": "1.0.0"
  }
  ```
- **Live Corridor Schedules**: `GET /api/v1/schedules`
- **Dynamic SPA Deep Links**: Non-API routes automatically fall back to the optimized React application shell.
