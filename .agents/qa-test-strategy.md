# QA Test Strategy: DRIVIO Platform

> Version: 1.0 | Date: 2026-11-23 | Scope: Backend REST/WebSocket APIs & Frontend React Portal

---

## 1. Test Pyramid Distribution
- **Unit Tests (70%)**:
  - Pricing and fare calculations (`routes/fare.js`).
  - GPS distance, bearing, and speed validation (`routes/gps.js`).
  - Auth token signing, verification, and role guard middleware (`middleware/auth.js`).
  - Frontend component utility helpers and validation functions.
- **Integration Tests (20%)**:
  - Express API route tests with Supertest against mocked/isolated PostgreSQL instances.
  - CRUD operations on Vehicles, Routes, Schedules, and Bookings.
  - Concurrency checks for seat locking during simultaneous booking attempts.
- **End-to-End (E2E) Smoke & Regression Tests (10%)**:
  - Playwright automated browser tests covering the 5 Critical User Journeys (Search & Book, Live Tracking, Driver Dispatch, Admin Scheduling, Corporate Charter).

---

## 2. Quality Gates & Thresholds
| Stage | Gate Requirement | Enforcement Tool | Action on Failure |
|-------|------------------|------------------|-------------------|
| **Pre-Commit / PR** | Static analysis & zero build errors | Webpack / ESLint / Jest | PR Blocked |
| **Unit & Integration** | 100% test pass rate for all critical routes | Jest + Supertest | Build Blocked |
| **API Contract & Schema** | All endpoints return uniform JSON format | Supertest assertions | Warning / Non-blocking in dev |
| **E2E Smoke Tests** | Pass rate >= 95% on core flows | Playwright | Deploy Blocked |

---

## 3. Entry & Exit Criteria
- **Entry Criteria**:
  - Backend starts cleanly on port 5001 (or configured PORT).
  - Frontend builds with 0 syntax or compilation errors (`npm run build`).
  - Database schema migrations / `setup_db.js` applied.
- **Exit Criteria**:
  - Zero Critical / Blocker bugs in booking, authentication, or live tracking.
  - Zero unhandled server crashes on invalid client inputs or database disconnects.
  - All automated regression suites pass.
