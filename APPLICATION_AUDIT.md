# DRIVIO Platform: Comprehensive Application Audit Report

**Document ID**: AUDIT-2026-11-23  
**Auditor**: Integrated Senior Software Engineering & QA Organization  
**Product**: DRIVIO (FleetEase) Web & REST/WebSocket Platform  
**Repository Working Directory**: `/Users/apurva/Downloads/FleetEase-main`  
**Current Date**: 2026-11-23  

---

## 1. Project Directory & Architecture Overview
DRIVIO is an intercity bus fleet management, live telematics tracking, and online/offline passenger ticketing platform. The repository is organized as a decoupled monorepo:

```
FleetEase-main/
├── fleetease-backend/            # Node.js + Express + Socket.IO + PostgreSQL (pg)
│   ├── routes/                  # 26 REST route files
│   ├── middleware/              # JWT Auth & error handling
│   ├── utils/                   # PDF generation, seed scripts, CORS, barcode
│   ├── __tests__/               # Jest unit and API test suites
│   ├── db.js                    # PostgreSQL pool connection
│   └── server.js                # Core HTTP, Socket.IO & Express routing orchestrator
├── fleetease-web/                # React 18 SPA (React Router v6, Tailwind CSS, Lucide)
│   ├── src/
│   │   ├── components/          # Reusable UI (Navbar, Footer, SeatMap, DrivioLogo, Toast)
│   │   ├── pages/               # 28 pages across 5 user roles (Customer, Admin, Driver, Agent, Manager)
│   │   ├── utils/               # Axios API client, theme tokens, Socket.IO client
│   │   └── styles/              # Global variables & DRIVIO design tokens
└── .agents/                     # QA Skills, test strategy, and project context
```

---

## 2. Technology Stack & Dependencies

### Frontend (`fleetease-web`)
- **Core**: React 18.2.0, React DOM 18.2.0, React Router DOM 6.16.0
- **UI & Styling**: Tailwind CSS 3.4.17, Vanilla CSS custom properties (`utils/theme.css`, `styles/theme.css`), Lucide React icons
- **Data & Realtime**: Axios 1.6.8, Socket.IO Client 4.7.2
- **Maps**: Leaflet 1.9.4, React-Leaflet 4.2.1, Google Maps Places API loader
- **Charts**: ECharts 5 (loaded via dynamic CDN)

### Backend (`fleetease-backend`)
- **Server Framework**: Express 4.19.2, Node.js HTTP server
- **Realtime**: Socket.IO 4.7.5
- **Database**: PostgreSQL with `pg` 8.12.0 Pool
- **Security & Middleware**: `jsonwebtoken` 9.0.2, `bcrypt` 5.1.1, `helmet` 8.1.0, `cors` 2.8.5, `express-rate-limit` 8.2.1, `express-validator` 7.3.0
- **Document Generation**: `pdfkit` 0.15.0, `bwip-js` 4.3.2

---

## 3. Database Schema & Data Models
Database schema is managed via `setup_db.js`. Key tables:
1. `users`: Stores user identity, bcrypt hashed passwords, role enum (`admin`, `manager`, `driver`, `agent`, `customer`, `company_admin`), phone, license number/expiry, and agent codes.
2. `vehicles`: Vehicle registration number, seating capacity, layout type, vehicle status (`available`, `active`, `maintenance`), and `assigned_driver_id`.
3. `routes`: Origin (`source`), destination, intercity distance in km, fare per km.
4. `route_stops`: Intermediate transit halts with sequence order and estimated arrival times.
5. `schedules`: Scheduled bus trips linked to `route_id` and `vehicle_id`, departure/arrival timestamps, bus number, bus type, and operational status.
6. `bookings` & `booking_seats`: Passenger reservations, seat labels (`L1A`, `U2B`), booking timestamps, pickup/drop locations, and passenger manifests.
7. `vehicle_locations`: GPS telemetry logs (`latitude`, `longitude`, `speed_kmph`, `fuel_level`, `heading_degrees`, `accuracy_meters`).
8. `corporate_bookings`: B2B charter inquiries, itineraries, bus types, and approval states.
9. `offline_bookings`: Counter sales conducted by field agents (`cash` or `qr`).
10. `fuel_bills`, `toll_bills`, `permit_bills`: Expense bookkeeping.

---

## 4. Authentication, Authorization & Roles
- **Token Mechanism**: Standard JSON Web Tokens (JWT) signed with `JWT_SECRET` and 1-day expiration.
- **Role-Based Access Control (RBAC)**:
  - Enforced server-side via `middleware/auth.js` (`auth(['admin'])`, `auth(['driver'])`, etc.).
  - Enforced client-side via `ProtectedRoute.jsx` and `RoleRedirect.jsx`.

---

## 5. Audit Findings: Bugs, Bottlenecks & Weaknesses

### Category A: Critical Routing & Server Bugs
1. **Unmounted `routes/driver.js`**: `server.js` fails to import and mount `driver.js`. The entire Driver Portal (`/driver/assignments`, `/driver/vehicle`, `/driver/assignments/:id/seats`) fails with 404.
2. **Unmounted `routes/fastag.js`**: `server.js` omits `fastag.js`. The Admin Tolls page fails with 404.
3. **Missing Route `/admin/seats/:schedule_id`**: Admin schedules page calls `/admin/seats/:id`, but the backend only registered `/seats/:id`.
4. **Unimplemented Driver Trip Lifecycle Routes**: Frontend `Driver/Trips.jsx` and `Driver/Tracker.jsx` call `POST /trips/:id/start`, `POST /trips/:id/end`, and `POST /trips/:id/emergency`, but none of these routes exist on the backend.
5. **Dead Forgot / Reset Password Routes**: Frontend has `ForgotPassword.jsx` and `ResetPassword.jsx`, but neither route is configured in `App.js`. Clicking "Forgot password?" redirects to `/`.
6. **Corporate Redirect Dead End**: Submitting a corporate charter request navigates to `/company/charter/requests`, which is missing in `App.js` (registered as `/company/requests`).

### Category B: Database & Runtime Crashes
7. **PostGIS SQL Crash on GPS Update**: `routes/gps.js` attempts to execute `ST_SetSRID(ST_MakePoint(...))` on `vehicles.last_location`, but neither PostGIS nor `last_location` exists in the schema.
8. **Invalid Column `driver_user_id`**: `routes/users.js` and `routes/manager.js` attempt to verify driver assignments via `WHERE driver_user_id=$1`, while the schema column is `assigned_driver_id`. Any attempt to delete a user crashes with a 500 error.
9. **Unhandled Client Exception in `routes/schedules.js`**: On database connection failure, `client` is undefined, causing `client.query('ROLLBACK')` to throw an unhandled `TypeError`.
10. **White Screen Crash on Malformed Token**: `App.js` and `ProtectedRoute.jsx` run `atob(token.split('.')[1])` without `try/catch`. Any malformed or expired token crashes the entire React application to a blank screen.

### Category C: Security & Data Privacy Vulnerabilities
11. **Customer Booking Data Exposure**: `GET /api/v1/bookings` in `routes/bookings.js` has no authentication check, leaking all passenger booking records to anonymous requests.
12. **Payment Signature Verification Bypass**: In `routes/payments.js`, if `razorpay_signature` is omitted from the request body, `verified` remains `true`, allowing payment spoofing.
13. **Inconsistent JWT Secrets**: `routes/auth.js` defaults to `'changeme'`, while `routes/contact.js` defaults to `'secret'`.

### Category D: UI/UX & Responsive Issues
14. **Empty Route Search List**: `routes/trips.js` returns `{ success: true, data: [...] }`, but `BookingSearch.jsx` expects `rRes.data` to be an array, causing route search dropdowns to always evaluate to empty arrays.
15. **Socket.IO Rejection on Live Bus Tracking**: `server.js` requires a JWT token for all socket connections. Unauthenticated passengers viewing `/track-bus` are rejected with `Authentication error`.
16. **Legacy Branding Leftovers**: `utils/pdfInvoice.js` references "Fleetease Mobility Pvt. Ltd.", `care@fleetease.in`, and missing `fleetease-logo.png`.
17. **Vehicle Status Lockout**: Vehicles created with status `'available'` cannot be returned to `'available'` after maintenance because `PUT /vehicles/:id/status` rejects any value not in `['active','maintenance','unavailable']`.
18. **Unfinished Admin Refunds Page**: `Admin/Refunds.jsx` renders an empty placeholder banner.

---

## 6. Audit Verdict & Action Plan
The core architecture is solid, but critical wiring, schema alignment, and security fixes must be applied immediately to transform DRIVIO into a commercially viable, production-grade system.
