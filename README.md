# SkillBridge 🎓 - Backend API

> "Connect with Expert Tutors, Learn Anything"

This is the backend server for **SkillBridge**, a full-stack web application that connects learners with expert tutors. Built with a robust and decoupled architecture, it handles role-based authentication, complex booking transactions, tutor scheduling, and platform administration.

## 🔗 Project Links

- **Frontend GitHub Repository:**
- **Live Website:** 
- **Backend Live API:** 

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Better Auth (Decoupled User Architecture)

---

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Distinct permissions for `STUDENT`, `TUTOR`, and `ADMIN`.
- **Decoupled Auth Architecture:** User credentials and sessions are securely managed by Better Auth, cleanly separated from business logic (Tutor profiles, Bookings, etc.).
- **Tutor Management:** Tutors can create profiles, set hourly rates, and manage their taught subjects (Categories).
- **Availability Engine:** Tutors can generate specific time slots for students to book.
- **Transactional Bookings:** Uses Prisma `$transaction` to ensure a time slot cannot be double-booked by concurrent requests.
- **Automated Review System:** Students can review completed sessions, automatically recalculating and updating the tutor's aggregate rating.
- **Admin Dashboard:** Platform owners can view system-wide statistics, monitor bookings, and ban/suspend users.

---

## 🗄️ Database Models Overview

- **User & Account:** Managed by Better Auth.
- **Tutor:** Business profile linked to a User.
- **Category:** Subjects available for tutoring (e.g., "Web Development", "Mathematics").
- **TutorSubject:** Many-to-many bridge table connecting Tutors to Categories.
- **Availability:** Time slots managed by Tutors.
- **Booking:** The core transaction between a Student and a Tutor's Availability slot.
- **Review:** Post-session feedback and ratings.

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites

Ensure you have **Node.js** and **PostgreSQL** installed on your machine.

### 2. Clone the Repository

```bash
git clone https://github.com/ishtiakalhumaidi/skillbridge-server.git
cd skillbridge-server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Environment Variables

Create a .env file in the root directory and add the following variables:

```bash
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/skillbridge?schema=public"

# Better Auth Required Variables
BETTER_AUTH_SECRET="generate-a-random-secret-key-here"
BETTER_AUTH_URL="http://localhost:5000"
```

### 5. Database Setup & Migrations

Because this project uses the prismaSchemaFolder preview feature, ensure your schema files are inside prisma/schema/, then run:

```bash
npx prisma db push
# OR
npx prisma migrate dev
```

### 6. Seed the Admin User

To access the Admin Dashboard, generate the default admin account.  
Make sure your server is running in another terminal tab before running this script.

```bash
npm run seed:admin
```

**Default Admin Credentials**

- Email: admin@skillbridge.com
- Password: admin1234

### 7. Start the Server

```bash
npm run dev
```

The server will start on:

```
http://localhost:5000
```

---

## 📡 Core API Routes

| Resource       | Endpoint                                                            | Access           |
| -------------- | ------------------------------------------------------------------- | ---------------- |
| Auth           | `/api/auth/*`                                                       | Public / User    |
| Tutors         | `GET /api/v1/tutors`<br>`POST /api/v1/tutors`                       | Public / Tutor   |
| Categories     | `GET /api/v1/categories`<br>`POST /api/v1/categories`               | Public / Admin   |
| Tutor Subjects | `POST /api/v1/tutor-subjects`                                       | Tutor            |
| Availability   | `GET /api/v1/availability/tutor/:id`<br>`POST /api/v1/availability` | Public / Tutor   |
| Bookings       | `POST /api/v1/bookings`<br>`GET /api/v1/bookings/my-bookings`       | Student / User   |
| Reviews        | `GET /api/v1/reviews/tutor/:id`<br>`POST /api/v1/reviews`           | Public / Student |
| Admin          | `GET /api/admin/stats`<br>`GET /api/admin/users`                    | Admin            |

---

## 👨‍💻 Author

**Ishtiak Al Humaidi**

GitHub  
https://github.com/ishtiakalhumaidi

LinkedIn  
https://linkedin.com/in/ishtiakalhumaidi

Portfolio  
https://ishtiak.vercel.app

---

## ⭐ Support

If you like this project consider giving it a star on GitHub.
