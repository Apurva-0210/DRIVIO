# DRIVIO Component Inventory

**Inventory Scope**: All React Component Modules across `fleetease-web`  
**Design System Compliance**: DRIVIO 2.0 (`#101B35`, `#246BFD`, `#19C5E8`, `#E6E9F2`)  
**Audit Date**: 2026-11-23  

---

## 1. Global & Layout Components

### 1.1 `DrivioLogo`
- **File**: `src/components/DrivioLogo.jsx`
- **Description**: Official SVG emblem representing the stylized 'D' enclosing an illuminated highway roadway, with the geometric DRIVIO wordmark.
- **Props**: `size` (number, default 28), `className` (string), `withText` (boolean, default true), `theme` ('light' | 'dark' | 'auto').
- **Status**: Verified Production-Ready.

### 1.2 `Navbar`
- **File**: `src/components/Navbar.jsx`
- **Description**: Responsive global navigation bar with dynamic role-aware links (Customer, Admin, Driver, Agent, Manager, Corporate), live backend health badge (`Connected` / `Offline`), and profile popover.
- **States**: Mobile collapsed hamburger, active link indicators, authenticated user avatar with role badge.
- **Status**: Verified Production-Ready.

### 1.3 `Footer`
- **File**: `src/components/Footer.jsx`
- **Description**: Corporate footer with brand mission, corridor routes (Patna, Delhi, Mumbai, Bengaluru), legal links, social handles, and contact coordinates.
- **Status**: Verified Production-Ready.

### 1.4 `Sidebar`
- **File**: `src/components/Sidebar.jsx`
- **Description**: Admin & Manager portal drawer navigation with active route highlights, icon indicators, and collapse toggling.
- **Status**: Verified Production-Ready.

### 1.5 `ToastHost` & `toast`
- **File**: `src/components/Toast.jsx`
- **Description**: Centralized notification manager supporting `'success'`, `'error'`, `'info'` and auto-dismiss timeouts with accessible ARIA live-region announcements.
- **Status**: Verified Production-Ready.

### 1.6 `ProtectedRoute` & `RoleRedirect`
- **Files**: `src/components/ProtectedRoute.jsx`, `src/components/RoleRedirect.jsx`
- **Description**: Route guards validating JWT presence, roles, and handling corrupt token edge-cases with automatic safe redirect to `/login`.
- **Status**: Verified Production-Ready.

---

## 2. Interactive Booking & Map Components

### 2.1 `SeatMap`
- **File**: `src/components/SeatMap.jsx`
- **Description**: Interactive multi-deck seating grid supporting 2x2 AC Executive, 2x1 Sleeper, and Luxury configurations. Realtime occupied seats synchronization via WebSockets.
- **States**: Available, Selected, Booked / Held, Upper / Lower deck toggle.
- **Status**: Verified Production-Ready.

### 2.2 `BookingCard` & `ScheduleCard`
- **Files**: `src/components/BookingCard.jsx`, `src/components/ScheduleCard.jsx`
- **Description**: Card components displaying trip departure/arrival times, duration, bus type, amenities, live seat counters, and one-click booking triggers.
- **Status**: Verified Production-Ready.

### 2.3 `TrackBus` Leaflet Map
- **File**: `src/pages/TrackBus.jsx`
- **Description**: Live GPS position mapping with route polyline, stop markers, ETA computation, vehicle metadata, and Socket.IO real-time location stream.
- **Status**: Verified Production-Ready.

---

## 3. Atomic UI Components (`src/components/ui/`)
- `Button`: Variants (`default`, `outline`, `secondary`, `ghost`, `destructive`), size scale (`sm`, `md`, `lg`), focus rings.
- `Card`, `CardHeader`, `CardTitle`, `CardContent`: Consistent elevation and padding.
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`: Accessible role tab controls for dashboard filtering.
- `Select`: Custom styled dropdown with native keyboard navigation.

---

## 4. Role-Specific Portal Pages
- **Admin**: `Dashboard`, `BookingsList`, `Bills`, `Schedules`, `Vehicles`, `Users`, `Tolls`, `Refunds`, `CorporateApprovals`, `Contacts`, `Gallery`.
- **Driver**: `Dashboard`, `Routes`, `Seats`, `Trips`, `LiveTracker`.
- **Agent**: `Dashboard`, `Trips` (Counter ticketing).
- **Manager**: `Fleet`, `Dashboard`.
- **Customer / Corporate**: `BookingSearch`, `BookingSeat`, `BookingCheckout`, `BookingDetails`, `MyBookings`, `Profile`, `Charter`, `CharterRequests`.
