# Good Luck Hair Salon – Full-Stack System Architecture

A production-ready web application and management platform for **Good Luck Hair Salon**, supporting men's grooming, beard styling, traditional therapeutic massage, and flexible in-salon or home service appointment reservations.

---

## 1. Project Architecture

The codebase is organized into clear client and server tiers:

```
├── server/                                # Backend Architecture
│   ├── src/
│   │   ├── config/                        # Salon business rules & environment config
│   │   │   └── businessConfig.ts
│   │   ├── controllers/                   # HTTP Request Handlers
│   │   │   ├── adminController.ts
│   │   │   ├── appointmentController.ts
│   │   │   ├── availabilityController.ts
│   │   │   └── serviceController.ts
│   │   ├── db/                            # Database schema & repository layer
│   │   │   ├── dbClient.ts                # Concurrency-safe in-memory & PostgreSQL adapter
│   │   │   └── schema.sql                 # Production PostgreSQL DDL schema & seeds
│   │   ├── middleware/                    # Security, auth, & validation
│   │   │   ├── authMiddleware.ts          # Admin secret verification
│   │   │   ├── errorHandler.ts            # Sanitized customer error responses
│   │   │   └── validationMiddleware.ts    # Indian 10-digit mobile, date/time & payload checks
│   │   ├── routes/                        # Express API Routes (/api/*)
│   │   │   ├── adminRoutes.ts
│   │   │   ├── appointmentRoutes.ts
│   │   │   ├── availabilityRoutes.ts
│   │   │   ├── serviceRoutes.ts
│   │   │   └── index.ts
│   │   ├── services/                      # Domain Business Logic & Availability Engine
│   │   │   ├── adminService.ts
│   │   │   ├── appointmentService.ts      # 14-step booking validation with atomic locks
│   │   │   ├── availabilityService.ts     # Multi-chair duration & break availability engine
│   │   │   └── serviceManagementService.ts
│   │   ├── tests/                         # Engine test suite
│   │   │   └── availabilityEngine.test.ts
│   │   ├── types/                         # Backend TypeScript definitions
│   │   │   └── index.ts
│   │   ├── utils/                         # Date/time math, references, and API helpers
│   │   │   ├── apiResponse.ts
│   │   │   ├── dateUtils.ts
│   │   │   └── referenceGenerator.ts
│   │   ├── app.ts                         # Express application factory
│   │   └── server.ts                      # Standalone backend server entry
│   └── ...
├── src/                                   # Frontend Application (React 19 + Vite)
│   ├── api/                               # Frontend API Client Layer
│   │   └── client.ts                      # Resilient HTTP client with fallback simulation
│   ├── components/                        # UI Components (Hero, Services, BookingModal, etc.)
│   ├── pages/                             # Public Client Pages
│   │   ├── HomePage.tsx
│   │   ├── ServicesPage.tsx
│   │   ├── BookingPage.tsx                # 6-step appointment reservation flow
│   │   └── admin/                         # Salon Operations Management Suite
│   │       ├── AdminAppointmentsPage.tsx  # Searchable bookings ledger & status controls
│   │       ├── AdminDashboardPage.tsx     # Today's agenda, metrics & active chairs
│   │       ├── AdminLayout.tsx            # Navigation frame & operations shell
│   │       ├── AdminLoginPage.tsx         # Secret key authorization
│   │       ├── AdminServicesPage.tsx      # Price, duration, & home-service toggles
│   │       └── AdminSettingsPage.tsx      # Operational hours & break configuration
│   ├── types/                             # Shared client interfaces
│   └── App.tsx                            # Client router and state coordinator
├── server.ts                              # Full-stack entry point (Express + Vite Middleware)
├── .env.example                           # Safe environment configuration template
└── README.md
```

---

## 2. Business Rules & Configuration

The salon's operating rules are centrally maintained in `server/src/config/businessConfig.ts` and dynamic database records in `business_settings`:

| Rule | Current Value | Notes |
| :--- | :--- | :--- |
| **Weekly Schedule** | Open 7 Days | Full schedule Monday through Sunday |
| **Standard Hours** | 9:00 AM – 9:00 PM | Mon–Fri & Sun (24h: `09:00` - `21:00`) |
| **Afternoon Break** | 2:00 PM – 3:00 PM | Mon–Fri & Sun (24h: `14:00` - `15:00`) |
| **Saturday Schedule** | 9:00 AM – 2:00 PM | Saturday Half Day (`14:00` closing time) |
| **Concurrent Capacity**| 2 Chairs / Staff | Parallel appointments prevented if both busy |
| **Payment Options** | Cash & UPI | Paid in-person after service completion |
| **Home Service** | Configurable per service | Restricted to services marked `homeServiceAvailable` |

---

## 3. PostgreSQL Database Setup & Schema

### Schema Definition (`server/src/db/schema.sql`)

The database contains four primary relational tables:

1. `services`: Catalog of cuts, trims, and massage packages with prices, durations, and home visit flags.
2. `staff`: Active barbers and groomers (2 chairs default).
3. `business_settings`: Dynamic operational hours, break windows, and capacity limits.
4. `appointments`: Complete booking records with references (`GLS-XXXX`), customer info, date, time slots, assigned staff, and status.

### Status Enums & Types
* **Appointment Statuses:** `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`
* **Location Types:** `SALON`, `HOME`

### Database Migration

To provision PostgreSQL:
```bash
# Connect to your PostgreSQL database instance
psql -U postgres -d goodluck_salon -f server/src/db/schema.sql
```

When running in development or before live database provisioning, the backend automatically uses its high-performance in-memory repository with identical relational semantics and seed records.

---

## 4. API Endpoints Overview

All backend endpoints are prefixed with `/api`.

### Services
* `GET /api/services` – List all active services (or all services with `?activeOnly=false`).
* `GET /api/services/:id` – Retrieve single service details.
* `POST /api/services` – Create a new service *(Admin token required)*.
* `PUT /api/services/:id` – Update price, duration, or active status *(Admin token required)*.
* `DELETE /api/services/:id` – Remove service *(Admin token required)*.

### Availability Engine
* `GET /api/availability?serviceId=:id&date=YYYY-MM-DD&locationType=SALON|HOME`
  Calculates real-time slot availability accounting for:
  - Salon opening & closing hours
  - Saturday early 2:00 PM closure
  - Afternoon break exclusion (2:00 PM – 3:00 PM)
  - Service duration boundaries
  - 2-chair concurrency and overlapping bookings

### Appointments
* `POST /api/appointments` – Create a new appointment with full 14-step validation and race-condition prevention.
* `GET /api/appointments` – List appointments with optional `?date=`, `?status=`, or `?locationType=` filters.
* `GET /api/appointments/:id` – Get appointment by ID.
* `GET /api/appointments/ref/:reference` – Lookup booking by reference code (e.g. `GLS-8492`).
* `PATCH /api/appointments/:id/status` – Update appointment status (`CONFIRMED`, `COMPLETED`, `CANCELLED`).

### Admin Management *(Guarded by `x-admin-token` or `Authorization: Bearer <key>`)*
* `GET /api/admin/dashboard` – Operational metrics, today's schedule agenda, and active chair count.
* `GET /api/admin/appointments` – Complete searchable bookings ledger.
* `PATCH /api/admin/appointments/:id/status` – Status transitions.
* `GET /api/admin/customers` – Aggregated client directory and visit histories.
* `GET /api/admin/services` & `PUT /api/admin/services/:id` – Service catalog management.
* `GET /api/admin/settings` & `PUT /api/admin/settings` – Operating hours and break times.

---

## 5. Development & Running

### Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment variables:
* `PORT`: Listening port (default `3000`).
* `NODE_ENV`: `development` or `production`.
* `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://user:pass@localhost:5432/goodluck_salon`).
* `ADMIN_API_KEY`: Secret key for administrator portal authorization.

### Development Commands

```bash
# Start full-stack server (Express API + Vite client)
npm run dev

# Run availability and business engine test suite
npm run test:engine

# Lint & type-check
npm run lint

# Production build
npm run build
```

---

## 6. Admin Portal Access

The Salon Operations Portal is integrated into the web client and accessible at:
* **URL:** `/#/admin` (or via the *"Staff & Admin Portal"* link in the footer)
* **Default Dev Key:** `goodluck-admin-secret-key-change-in-production` (one-click autofill button included on the login screen).
