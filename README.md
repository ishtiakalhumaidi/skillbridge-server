<div align="center">

# 🎓 SkillBridge — Server

**Tutor-Student Marketplace API — Atomic Booking Transactions, Stripe Payments, and Real-Time Rating Aggregation**

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-5-000000?logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-22-635BFF?logo=stripe)](https://stripe.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.4-000000)](https://www.better-auth.com/)

</div>

---

## 📋 Overview

SkillBridge Server is the API layer for a tutor-student marketplace platform. Built with **Node.js**, **Express.js**, and **TypeScript**, it implements a **decoupled authentication architecture** where Better Auth manages credentials and sessions while Prisma handles business logic. The backend features **atomic booking transactions** with concurrent slot locking, **Stripe checkout + webhook-driven payment confirmation**, **automated tutor rating aggregation**, and a **multi-file Prisma schema** organized by domain.

> 🔗 **Frontend Repo:** [skillbridge-client](https://github.com/ishtiakalhumaidi/skillbridge-client)  
> 🔗 **Live Website:** [SkillBridge](https://skillbridge-iah.vercel.app/)
> 🔗 **API Base:** [https://skillbridge-server-xi.vercel.app](https://skillbridge-server-xi.vercel.app/)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **⚛️ Atomic Booking Transactions** | Prisma `$transaction` locks availability slots during booking creation — prevents double-booking race conditions by checking `isBooked` flag and updating it atomically within the same transaction |
| **💳 Stripe Checkout + Webhook Confirmation** | Creates checkout sessions with booking metadata, verifies webhook signatures cryptographically, and updates booking status from `PENDING` → `CONFIRMED` + `PAID` only after Stripe confirms payment |
| **⭐ Automated Rating Aggregation** | Post-review creation triggers a Prisma `aggregate` query that recalculates the tutor's average rating across all reviews and updates the `ratingAvg` field in a single transaction |
| **🔐 Better Auth with Prisma Adapter** | Session-based auth with custom user fields (`role`, `phone`, `status`), Google OAuth with offline access, and database hooks that reject banned users at session creation time |
| **🛡️ Banned User Prevention at Session Layer** | Database hook on `session.create` checks user `status === "banned"` BEFORE the session is persisted — prevents banned accounts from obtaining fresh tokens even if they know valid credentials |
| **🎭 Role-Based Route Middleware** | Enum-driven `auth(...roles)` middleware that validates Better Auth sessions and enforces `STUDENT` / `TUTOR` / `ADMIN` access control at the route level |
| **📊 Pagination & Sorting Utility** | Reusable `paginationSortingHelper` that normalizes `page`/`limit`/`skip`/`sortBy`/`sortOrder` across all list endpoints with sensible defaults |
| **🔍 Multi-Criteria Tutor Search** | Dynamic Prisma `AND` conditions supporting name search (via User relation), category filtering (via TutorSubject junction), and featured flag toggling |
| **📅 Availability Slot Management** | Tutors define recurring time slots by day-of-week; unbooked slots are exposed for student browsing with ascending time ordering |
| **🌐 Dynamic CORS Origin Validation** | Regex-based origin matching supporting localhost, production domains, and wildcard Vercel preview deployments (`*.vercel.app`) |
| **🧾 Multi-File Prisma Schema** | 8 domain-organized schema files (auth, tutor, availability, booking, category, review, tutorSubject) with the `prismaSchemaFolder` preview feature |
| **🌱 Admin Seeding Pipeline** | `seed:admin` script creates the default admin via the Better Auth API, then elevates the role via direct Prisma update with email verification |

---

## 🛠️ Tech Stack

**Core**
- [Node.js](https://nodejs.org/) — Runtime
- [Express.js](https://expressjs.com/) — Web framework
- [TypeScript](https://www.typescriptlang.org/) — Type safety

**Database**
- [Prisma](https://www.prisma.io/) — ORM with multi-file schema
- [PostgreSQL](https://www.postgresql.org/) — Relational database
- [@prisma/adapter-pg](https://www.prisma.io/docs/orm/overview/databases/postgresql) — Native PostgreSQL driver adapter

**Authentication**
- [Better Auth](https://www.better-auth.com/) — Session-based auth framework
- [Prisma Adapter](https://www.better-auth.com/docs/adapters/prisma) — Database integration

**Payments**
- [Stripe](https://stripe.com/) — Checkout sessions & webhook processing

**Utilities**
- [CORS](https://www.npmjs.com/package/cors) — Cross-origin middleware
- [dotenv](https://www.npmjs.com/package/dotenv) — Environment variables

**Build**
- [tsup](https://tsup.egoist.dev/) — Zero-config TypeScript bundler
- [tsx](https://tsx.is/) — TypeScript execution for dev

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 20`
- PostgreSQL `>= 14`
- Stripe account (for payments)
- Google OAuth credentials (for social login)

### Installation

```bash
# Clone the repository
git clone https://github.com/ishtiakalhumaidi/skillbridge-server.git
cd skillbridge-server

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the admin user (server must be running)
npm run seed:admin

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skillbridge?schema=public"

# Better Auth
BETTER_AUTH_SECRET=your_random_secret
BETTER_AUTH_URL=http://localhost:5000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> ⚠️ **Never commit `.env` to version control.**

### Stripe Webhook Local Testing

```bash
# Forward Stripe webhooks to your local server
stripe listen --forward-to http://localhost:5000/api/v1/payments/webhook
```

### Build for Production

```bash
# Using tsup
npm run build:tsup

# Start production server
npm start
```

---

## 📁 Project Structure

```
skillbridge-server/
├── prisma/
│   ├── schema/
│   │   ├── schema.prisma          # Prisma config (generator + datasource)
│   │   ├── auth.prisma            # User, Session, Account, Verification
│   │   ├── tutor.prisma           # Tutor profile model
│   │   ├── availability.prisma    # Time slot model
│   │   ├── booking.prisma         # Booking transaction model
│   │   ├── category.prisma        # Subject categories
│   │   ├── review.prisma          # Post-session reviews
│   │   └── tutorSubject.prisma    # Many-to-many junction
│   └── migrations/                # Prisma migration history
├── src/
│   ├── server.ts                  # Bootstrap + database connection
│   ├── app.ts                     # Express app configuration
│   ├── lib/
│   │   ├── auth.ts                # Better Auth configuration
│   │   ├── prisma.ts              # Prisma client singleton
│   │   └── stripe.ts              # Stripe client initialization
│   ├── middleware/
│   │   ├── auth.ts                # Role-based session validation
│   │   └── globalErrorHandler.ts  # Consistent error response formatting
│   ├── helpers/
│   │   └── paginationSortingHelper.ts  # Reusable list query builder
│   ├── modules/                   # 8 business modules
│   │   ├── admin/
│   │   ├── availability/
│   │   ├── booking/               # Atomic transaction logic
│   │   ├── category/
│   │   ├── payment/               # Stripe checkout + webhooks
│   │   ├── review/                # Rating aggregation
│   │   ├── tutor/                 # Search + profile management
│   │   └── tutorSubject/
│   └── scripts/
│       └── seedAdmin.ts           # Admin creation pipeline
├── api/                           # Vercel serverless output
├── vercel.json                    # Vercel deployment config
├── tsup.config.ts                 # Bundler configuration
├── package.json
└── README.md
```

---

## 📡 API Endpoints

### Auth (Better Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `ALL` | `/api/auth/*` | Better Auth endpoints (login, register, callback, session, etc.) |

### Tutors
| Method | Endpoint | Access |
|--------|----------|--------|
| `POST` | `/api/v1/tutors` | TUTOR |
| `GET` | `/api/v1/tutors` | Public |
| `GET` | `/api/v1/tutors/:id` | Public |
| `PATCH` | `/api/v1/tutors` | TUTOR |

### Categories
| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/api/v1/categories` | Public |
| `POST` | `/api/v1/categories` | ADMIN |

### Tutor Subjects
| Method | Endpoint | Access |
|--------|----------|--------|
| `POST` | `/api/v1/tutor-subjects` | TUTOR |

### Availability
| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/api/v1/availability/tutor/:id` | Public |
| `POST` | `/api/v1/availability` | TUTOR |

### Bookings
| Method | Endpoint | Access |
|--------|----------|--------|
| `POST` | `/api/v1/bookings` | STUDENT |
| `GET` | `/api/v1/bookings/my-bookings` | Any |
| `PATCH` | `/api/v1/bookings/:id/status` | Student/Tutor |
| `PATCH` | `/api/v1/bookings/:id/meeting-link` | TUTOR |

### Reviews
| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/api/v1/reviews/tutor/:id` | Public |
| `POST` | `/api/v1/reviews` | STUDENT |

### Payments
| Method | Endpoint | Access |
|--------|----------|--------|
| `POST` | `/api/v1/payments/checkout` | Any |
| `POST` | `/api/v1/payments/webhook` | Stripe |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/api/v1/admin/stats` | ADMIN |
| `GET` | `/api/v1/admin/users` | ADMIN |
| `PATCH` | `/api/v1/admin/users/:id/status` | ADMIN |

---

## 🔑 Key Architectural Decisions

### 1. Atomic Booking with Slot Locking
The booking creation uses a Prisma `$transaction` to prevent race conditions:

```typescript
return await prisma.$transaction(async (tx) => {
  const slot = await tx.availability.findUniqueOrThrow({
    where: { id: payload.availabilityId },
  });

  if (slot.isBooked) {
    throw new Error("This time slot has already been booked.");
  }

  const booking = await tx.booking.create({ /* ... */ });

  await tx.availability.update({
    where: { id: slot.id },
    data: { isBooked: true },
  });

  return booking;
});
```

The `findUniqueOrThrow` + `isBooked` check + `update` all happen within the same database transaction. If two students request the same slot simultaneously, only one transaction succeeds — the other rolls back with a clear error message.

### 2. Stripe Webhook-Driven State Machine
Payment flow follows a strict state machine:

1. **Booking Created** → Status: `PENDING`, PaymentStatus: `UNPAID`
2. **Checkout Session Created** → Stripe metadata contains `bookingId`
3. **Student Pays** → Stripe fires `checkout.session.completed` webhook
4. **Webhook Verified** → Signature checked with `stripe.webhooks.constructEvent()`
5. **Booking Confirmed** → Status: `CONFIRMED`, PaymentStatus: `PAID`

The webhook endpoint uses `express.raw({ type: "application/json" })` registered **before** `express.json()` to preserve the raw payload for cryptographic verification.

### 3. Automated Rating Aggregation
When a student submits a review, the system recalculates the tutor's average rating in the same transaction:

```typescript
return await prisma.$transaction(async (tx) => {
  const review = await tx.review.create({ /* ... */ });

  const aggregations = await tx.review.aggregate({
    where: { tutorId: booking.tutorId },
    _avg: { rating: true },
  });

  await tx.tutor.update({
    where: { id: booking.tutorId },
    data: { ratingAvg: aggregations._avg.rating || payload.rating },
  });

  return review;
});
```

This ensures the tutor's displayed rating is always consistent with the review dataset — no stale averages or manual recalculation needed.

### 4. Banned User Prevention at Session Creation
Better Auth's `databaseHooks` intercept session creation:

```typescript
databaseHooks: {
  session: {
    create: {
      before: async (session) => {
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
        });
        if (user?.status === "banned") {
          throw new APIError("UNAUTHORIZED", {
            message: "Your account has been suspended.",
          });
        }
        return { data: session };
      },
    },
  },
}
```

This prevents a critical security gap: even if a banned user has valid credentials, they cannot obtain a new session token. The check happens at the database layer, not the route layer.

### 5. Decoupled Auth Architecture
Better Auth manages ONLY authentication (users, sessions, OAuth accounts, verification tokens). Business logic (tutor profiles, bookings, reviews) lives in separate Prisma models with foreign keys to the auth `User` table. This separation:

- Allows swapping auth providers without touching business logic
- Keeps the auth schema clean and maintainable
- Enables the `User` table to carry custom fields (`role`, `phone`, `status`) without polluting Better Auth's core models

### 6. Dynamic CORS with Regex Origin Matching
The CORS configuration supports multiple environments dynamically:

```typescript
const isAllowed =
  allowedOrigins.includes(origin) ||
  /^https:\/\/.*\.vercel\.app$/.test(origin);
```

This allows Vercel preview deployments (`project-xyz.vercel.app`) to access the API without manually updating the origin whitelist for every new deployment.

### 7. Multi-File Prisma Schema Organization
The schema is split into 8 files using Prisma's `prismaSchemaFolder` preview feature:

- `schema.prisma` — Generator and datasource configuration
- `auth.prisma` — Better Auth models (User, Session, Account, Verification)
- `tutor.prisma` — Tutor business profile
- `availability.prisma` — Time slot definitions
- `booking.prisma` — Booking transactions with status enum
- `category.prisma` — Subject taxonomy
- `review.prisma` — Post-session feedback
- `tutorSubject.prisma` — Many-to-many junction table

This makes schema changes reviewable by domain and prevents merge conflicts when multiple developers work on different modules.

---

## 🗺️ Roadmap

- [ ] **Rate Limiting** — Add `express-rate-limit` on auth and booking endpoints
- [ ] **API Documentation** — OpenAPI/Swagger spec from route definitions
- [ ] **Testing Suite** — Jest + Supertest for service and controller coverage
- [ ] **Redis Caching** — Cache tutor listings and category data
- [ ] **WebSockets** — Socket.io for real-time booking notifications
- [ ] **Email Notifications** — Post-booking confirmation and reminder emails
- [ ] **Calendar Sync** — Google Calendar API integration for tutor availability
- [ ] **Refund Handling** — Stripe refund webhook processing for canceled bookings
- [ ] **Analytics** — Tutor earnings reports and student engagement metrics
- [ ] **Background Jobs** — Queue for email sending and report generation

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**🎓 Bridge the gap between learning and mastery**

Crafted by [Ishtiak Al Humaidi](https://github.com/ishtiakalhumaidi)

</div>
