# DRIVIO Design System Specification

**Version**: 2.0.0  
**Design Director**: Senior UI/UX Architect & Design Systems Engineer  
**Brand Standards Reference**: DRIVIO Official Palette & Emblem Specification  

---

## 1. Brand Identity & Principles
DRIVIO is an intercity mobility and fleet management platform engineered for trust, precision, speed, and real-time situational awareness.

### Core Visual Principles
1. **Restraint Over Decoration**: Eliminate unnecessary gradients, glassmorphism, or non-functional visual noise. Let clean typography, tabular data, and high-contrast indicators guide the operator.
2. **Tactile Hierarchy**: Use consistent elevations, subtle border contrasts, and intentional color accents to prioritize actionable tasks (booking seats, tracking vehicles, dispatching drivers).
3. **Operational Clarity**: High legibility in day and low-light environments, with tabular numerals for prices, seat codes, timestamps, and GPS telemetry.

---

## 2. Color System & Tokens

### 2.1 Primitive Colors
| Token Name | Hex Code | Purpose / Usage |
|---|---|---|
| `--drivio-navy` | `#101B35` | Primary brand background, navbar, header badges, ticket banners |
| `--drivio-electric` | `#246BFD` | Primary interactive color, focus rings, call-to-actions, active state |
| `--drivio-cyan` | `#19C5E8` | Secondary brand accent, GPS route paths, progress indicators |
| `--drivio-light-grey` | `#E6E9F2` | Background surfaces, input borders, disabled states |
| `--drivio-dark` | `#0A0F1D` | Deep slate contrast, dark mode ground |
| `--drivio-white` | `#FFFFFF` | Card surface, modal surface, elevated layers |

### 2.2 Semantic Colors
| Semantic Token | Value / Mapping | Usage |
|---|---|---|
| `--color-bg-canvas` | `#F8FAFC` | Main application background |
| `--color-bg-surface` | `#FFFFFF` | Cards, table containers, popovers |
| `--color-text-primary` | `#0F172A` | Primary headings, prominent labels, titles |
| `--color-text-secondary`| `#334155` | Body copy, table values, form labels |
| `--color-text-muted` | `#64748B` | Helper captions, metadata, placeholder text |
| `--color-border-subtle` | `#E2E8F0` | Card borders, dividers, subtle separators |
| `--color-border-focus` | `#246BFD` | Form inputs in active/focus state |
| `--color-status-success`| `#10B981` | Confirmed bookings, available vehicles, active drivers |
| `--color-status-warning`| `#F59E0B` | Pending approvals, maintenance schedules, held seats |
| `--color-status-danger` | `#EF4444` | Cancelled trips, unavailable buses, emergency alerts |

---

## 3. Typography Hierarchy
- **Primary Display Font**: `Montserrat, system-ui, -apple-system, sans-serif` (geometric, modern, authoritative)
- **Primary Body Font**: `Inter, system-ui, -apple-system, sans-serif` (balanced, highly legible at micro sizes)
- **Data & Telemetry**: `tabular-nums` for all pricing, vehicle IDs, speeds, and arrival clocks.

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `Display Hero` | `2.5rem (40px)` | 800 (Bold) | `1.15` | Landing Hero, Key Metric displays |
| `Heading 1 (H1)`| `1.75rem (28px)`| 700 (Bold) | `1.25` | Page Headers, Portal Dashboard Titles |
| `Heading 2 (H2)`| `1.375rem (22px)`| 600 (Semibold)| `1.30` | Section Titles, Modal Headers |
| `Heading 3 (H3)`| `1.125rem (18px)`| 600 (Semibold)| `1.35` | Card Titles, Filter Headers |
| `Body Standard` | `0.9375rem (15px)`| 400 (Regular) | `1.50` | Default body copy, table cell content |
| `Body Small` | `0.8125rem (13px)`| 400 / 500 | `1.45` | Helper text, secondary descriptions |
| `Micro / Caption`| `0.6875rem (11px)`| 600 (Bold) | `1.20` | Badges, tags, seat numbers |

---

## 4. Spacing, Elevation & Border Radius

### Spacing Scale
- `space-1`: `4px`
- `space-2`: `8px`
- `space-3`: `12px`
- `space-4`: `16px`
- `space-5`: `20px`
- `space-6`: `24px`
- `space-8`: `32px`
- `space-12`: `48px`
- `space-16`: `64px`

### Border Radius
- `radius-sm`: `4px` (Inputs, table rows, badges)
- `radius-md`: `8px` (Standard buttons, dropdown menus, cards)
- `radius-lg`: `12px` (Modals, prominent containers, hero search)
- `radius-full`: `9999px` (Pill badges, avatars, circular markers)

### Elevation & Shadows
- `shadow-xs`: `0 1px 2px rgba(16, 27, 53, 0.05)`
- `shadow-sm`: `0 1px 3px rgba(16, 27, 53, 0.08), 0 1px 2px rgba(16, 27, 53, 0.04)`
- `shadow-md`: `0 4px 6px -1px rgba(16, 27, 53, 0.08), 0 2px 4px -1px rgba(16, 27, 53, 0.04)`
- `shadow-lg`: `0 10px 15px -3px rgba(16, 27, 53, 0.1), 0 4px 6px -2px rgba(16, 27, 53, 0.05)`

---

## 5. Component Standards

### 5.1 Buttons
- **Primary (`btn-primary` / `btn-accent`)**: Solid Electric Blue `#246BFD` with white text. Focus outline 2px Cyan.
- **Secondary (`btn-secondary`)**: Neutral Light Grey `#E6E9F2` border with Midnight Navy text.
- **Danger (`btn-danger`)**: Soft red `#FEF2F2` background with `#DC2626` text, transitioning to solid red on hover.
- **Ghost / Link**: Zero background, underlined on hover, Electric Blue text.

### 5.2 Forms & Inputs
- Standard height: `42px` (mobile touch target minimum `44px`).
- Subtle 1px border `#CBD5E1`.
- Transition 150ms ease-in-out on focus: `border-color: #246BFD`, `box-shadow: 0 0 0 3px rgba(36, 107, 253, 0.15)`.

### 5.3 Badges & Status Chips
- High contrast, soft background + dark text combination for readability:
  - Active / Confirmed: `bg-emerald-50 text-emerald-700 border-emerald-200`
  - In Transit / Pending: `bg-amber-50 text-amber-700 border-amber-200`
  - Cancelled / Danger: `bg-rose-50 text-rose-700 border-rose-200`

### 5.4 Seat Map Conventions
- **Available Seat**: White background, Electric Blue border, subtle hover elevation.
- **Selected Seat**: Solid Electric Blue background, white checkmark / text.
- **Booked / Taken Seat**: Light Grey `#E2E8F0` background, muted `#94A3B8` label, non-interactive cursor.
- **Upper / Lower Deck Toggle**: Segmented pill control.

---

## 6. Accessibility & Motion Rules
- **Color Contrast**: All text elements adhere strictly to WCAG 2.2 AA (minimum 4.5:1 for normal text, 3:1 for large text).
- **Focus Rings**: Never remove `outline: none` without providing an explicit, high-contrast replacement ring.
- **Reduced Motion**: All transitions and map updates respect `@media (prefers-reduced-motion: reduce)`.
