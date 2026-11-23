# QA Test Plan: DRIVIO Sprint 1

> Scope: Full-System Static Code Audit, Vulnerability & Bug Discovery, and Critical Flow Validation

---

## 1. Scope & Objectives
1. Perform deep static analysis and bug discovery across all 26 backend route files and frontend pages.
2. Identify:
   - Database connection resilience bugs.
   - SQL injection / unescaped parameter risks.
   - Missing authentication/authorization checks.
   - Broken frontend imports, dead code, and unhandled null/undefined states.
   - Brand inconsistencies or broken asset paths.
3. Deliver a prioritized, actionable bug inventory to the user for triage before reviewing the user's upcoming error list.

---

## 2. Test Execution Matrix
| Component | Area | Test Type | Status | Priority |
|-----------|------|-----------|--------|----------|
| Backend | `server.js` | Exports & Startup Resilience | Verified Fixed | P0 |
| Backend | `routes/gps.js` | Unit tests & DB connection pooling | Verified (6/6 passing) | P0 |
| Backend | `routes/auth.js` | JWT handling & route exports | Under Audit | P0 |
| Backend | `routes/bookings.js` | Seat locking & transaction safety | Under Audit | P0 |
| Backend | `routes/adminSummary.js` | SQL query safety & aggregations | Under Audit | P1 |
| Backend | `routes/schedules.js` | Schedule conflict detection | Under Audit | P1 |
| Backend | `routes/vehicles.js` | Vehicle CRUD & status validation | Under Audit | P1 |
| Frontend | Compilation & Bundling | `npm run build` | Verified (0 errors) | P0 |
| Frontend | `TrackBus.jsx` | GPS map rendering & fallback | Verified Fixed | P1 |
| Frontend | `Routes.jsx` | API imports & data handling | Verified Fixed | P1 |
| Frontend | `BookingSeat.jsx` | Dynamic seat grid & state | Under Audit | P1 |
| Frontend | Admin & Driver Portals | Role route guards & error handling | Under Audit | P2 |
