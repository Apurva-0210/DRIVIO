# DRIVIO Platform: Master Defect Register

**Status**: 20 Identified / 20 Remediated & Verified  
**Date**: 2026-11-23  

---

| Defect ID | Severity | Component | Description & Root Cause | Remediation Applied | Verification Status |
|---|---|---|---|---|---|
| **DEF-001** | **CRITICAL** | `server.js` | Driver routes unmounted; all driver API calls returned 404. | Imported & mounted `routes/driver.js` under `/api/v1/driver`. | **VERIFIED FIXED** |
| **DEF-002** | **CRITICAL** | `server.js` | FASTag & Tolls routes unmounted; Admin Tolls page failed. | Imported & mounted `routes/fastag.js` under `/api/v1/fastag`. | **VERIFIED FIXED** |
| **DEF-003** | **CRITICAL** | `routes/gps.js` | PostGIS `ST_SetSRID` crashed on PostgreSQL without extension. | Guarded vehicle geometry update; telemetry logged reliably. | **VERIFIED FIXED** |
| **DEF-004** | **CRITICAL** | `routes/users.js`, `routes/manager.js` | `driver_user_id` query column mismatch crashed user deletions with 500 error. | Renamed query filter to schema column `assigned_driver_id`. | **VERIFIED FIXED** |
| **DEF-005** | **CRITICAL** | `routes/schedules.js` | Unhandled `client.query('ROLLBACK')` when client acquisition failed. | Guarded client rollback and release in try/catch/finally. | **VERIFIED FIXED** |
| **DEF-006** | **CRITICAL** | `App.js` | `ForgotPassword` & `ResetPassword` unrouted; redirected users to `/`. | Fixed JSX syntax in both files and mounted routes in `App.js`. | **VERIFIED FIXED** |
| **DEF-007** | **CRITICAL** | `App.js`, `ProtectedRoute.jsx` | Uncaught `atob()` decoding error crashed app on corrupt token. | Wrapped token decoding in safe try/catch blocks with null fallback. | **VERIFIED FIXED** |
| **DEF-008** | **HIGH** | `routes/bookings.js` | Unauthenticated booking list endpoint leaked customer records. | Enforced RBAC check (`auth(['admin','manager','customer'])`). | **VERIFIED FIXED** |
| **DEF-009** | **HIGH** | `routes/payments.js` | Missing signature accepted as valid in Razorpay verification. | Enforced signature existence and cryptographic HMAC validation. | **VERIFIED FIXED** |
| **DEF-010** | **HIGH** | `BookingSearch.jsx` | Object response treated as array; route dropdowns stayed empty. | Normalized extraction to `rRes.data?.data || rRes.data`. | **VERIFIED FIXED** |
| **DEF-011** | **HIGH** | `server.js` | `/api/v1/admin/seats/:id` missing; returned 404 in Admin Schedules. | Mounted alias route pointing to `adminSeatsHandler`. | **VERIFIED FIXED** |
| **DEF-012** | **HIGH** | `routes/trips.js` | Missing `/start`, `/end`, and `/emergency` trip endpoints. | Implemented trip lifecycle routes and WebSocket alert dispatcher. | **VERIFIED FIXED** |
| **DEF-013** | **HIGH** | `server.js`, `TrackBus.jsx` | Socket.IO dropped unauthenticated passenger tracking sockets. | Allowed public guest connection mode on WebSocket server. | **VERIFIED FIXED** |
| **DEF-014** | **HIGH** | `Company/Charter.jsx` | Redirected to `/company/charter/requests` which was unmapped. | Added route alias in `App.js` redirecting to `/company/requests`. | **VERIFIED FIXED** |
| **DEF-015** | **MEDIUM** | `routes/vehicles.js` | Status whitelist excluded `'available'`, locking vehicles in maintenance. | Added `'available'` to status whitelist array. | **VERIFIED FIXED** |
| **DEF-016** | **MEDIUM** | `routes/manager.js` | Missing manager dashboard stats & recent bookings endpoints. | Implemented `/dashboard/stats` and `/bookings/recent`. | **VERIFIED FIXED** |
| **DEF-017** | **MEDIUM** | `utils/pdfInvoice.js` | Generated PDFs with legacy "Fleetease" branding and broken logo link. | Updated to DRIVIO corporate identity and fixed customer query ID. | **VERIFIED FIXED** |
| **DEF-018** | **MEDIUM** | `Driver/Tracker.jsx` | Driver back button navigated to non-existent `/driver` path. | Fixed navigation target to `/driver/dashboard`. | **VERIFIED FIXED** |
| **DEF-019** | **MEDIUM** | `Admin/Refunds.jsx` | Empty placeholder banner on refunds page. | Implemented complete refunds reconciliation table & action UI. | **VERIFIED FIXED** |
| **DEF-020** | **LOW** | `FleetHealth.jsx`, `Agent/Dashboard.jsx` | Unhandled non-array API responses risked runtime `.map()` crashes. | Added defensive `Array.isArray()` guards before rendering. | **VERIFIED FIXED** |
