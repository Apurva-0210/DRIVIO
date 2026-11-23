# DRIVIO — Intercity Bus Travel & Fleet Network OS

> Unified intercity coach fleet management, real-time GPS telemetry, counter ticketing, and digital passenger boarding pass platform.

---

## 📌 Overview

**DRIVIO** is a production-grade full-stack transit management platform connecting intercity bus fleet operations, station counters, coach drivers, and passengers:

- **Executive & Operational Command**: Real-time fleet health, route throughput, fuel/FASTag expense tracking, and driver compliance monitoring.
- **Station Counter Ticketing**: Counter terminal for rapid cash/UPI ticket generation and manifest reconciliation.
- **Driver Duty Console**: Real-time vehicle telematics, route waypoints, and passenger boarding checklists.
- **Customer Experience & Loyalty**: Real-time seat reservation, verified digital boarding passes with high-res QR codes and barcodes, 300 DPI PDF download, and DRIVIO Miles Club points tracking.
- **Seat Privacy & Admin Quota Engine**: Complete isolation where customer seat maps mask quota-locked seats as standard occupied bookings.

---

## 🚀 Quick Start

### 1. Local Run (Unified Single Service)
Run both backend API and frontend on a single port:

```bash
# Install dependencies for both backend and frontend
npm run install:all

# Build optimized React frontend bundle
npm run build

# Start production server
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

---

### 2. Docker Deployment

#### Option A: Unified Container (Single Port)
```bash
docker build -t drivio-app .
docker run -d -p 5000:5000 --name drivio-app drivio-app
```
Open **[http://localhost:5000](http://localhost:5000)**

#### Option B: Docker Compose (Microservices with PostgreSQL 15 & Nginx)
```bash
docker compose up -d --build
```
- **Frontend (Nginx)**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **PostgreSQL 15**: `localhost:5432`

---

## 🔑 Default Portal Credentials

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@drivio.com` | `admin123` | `/admin/dashboard` |
| **Fleet Operations Manager** | `manager@drivio.com` | `manager123` | `/manager/dashboard` |
| **Commercial Coach Driver** | `driver@drivio.com` | `driver123` | `/driver/dashboard` |
| **Station Counter Agent** | `agent@drivio.com` | `agent123` | `/agent/dashboard` |
| **Passenger / Customer** | `customer@drivio.com` | `customer123` | `/my-bookings` |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router 6, Bootstrap 5, Lucide Icons, html2canvas, jsPDF, QRCodeSVG
- **Backend**: Node.js, Express, Socket.IO, PostgreSQL (with resilient in-memory fallback engine), Helmet, JWT, Rate Limiting
- **Deployment**: Docker, Docker Compose, Nginx, Render Blueprint (`render.yaml`), Procfile

---

## 📄 License
UNLICENSED — All rights reserved.
