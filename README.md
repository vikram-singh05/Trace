<![CDATA[<div align="center">

# Trace 🔎

**A secure, full-stack campus lost‑and‑found platform built for the university community.**

Report lost items. Claim found ones. Get matched automatically.
Chat securely. Reunite with your stuff.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socketdotio&logoColor=white)](https://socket.io/)

</div>

---

## ✨ Features

### Core Platform
- **📋 Report Lost & Found Items** — Submit detailed reports with multi-image uploads, categories, brand, color, location, date, and custom tags
- **🔍 Browse & Search** — Filter items by type (lost/found), category, status, and keyword search with paginated results
- **✏️ Edit & Manage Reports** — Update your own reports with full edit capabilities

### Smart Matching Engine
- **🤖 Automatic Matching** — Heuristic scoring algorithm (0–100%) that cross-references brand, color, location, keyword overlap, and timeline plausibility
- **📊 Confidence Scores** — Each match includes a breakdown of why it scored the way it did (e.g., "Brand matches", "2 keyword(s) matched", "Timeline aligns")
- **🚫 Impossible Match Rejection** — Automatically filters out items found *before* they were reported lost (with a 24h grace window)

### Verification & Claims
- **❓ Verification Questions** — Finders set secret questions (e.g., "What's in the front pocket?"); claimants must answer all before submitting
- **📝 Proof Submission** — Claimants provide written descriptions and optional proof images to support their claim
- **🔄 Dual Claim Workflows**:
  - **Found items** → traditional approve/reject flow with verification questions; approved claims auto-resolve the item and reject competing claims
  - **Lost items** → instant auto-approval that opens a secure chat immediately, so multiple finders can help simultaneously
- **🔁 Re-Claim Support** — Previously rejected claimants can resubmit with better proof

### Real-Time Communication
- **💬 Secure Chat System** — 1-on-1 conversations between item reporters and approved claimants, with Socket.io-powered real-time messaging
- **🔒 Server-Side Authorization** — Every message is validated against conversation membership; the receiver is derived server-side (never trust the client)
- **🗑️ Per-User Chat Deletion** — Either party can "delete" a thread from their inbox without affecting the other's history; new messages resurface it
- **📏 Message Length Limits** — 5,000-character cap per message enforced server-side

### Notifications
- **🔔 Real-Time Push** — Socket.io-powered instant notifications for matches, claims, approvals, rejections, and moderation actions
- **📧 Email Alerts** — Transactional emails via Gmail SMTP (Nodemailer) for high-priority events like match discoveries, claim approvals, and new claims
- **🔕 Read/Unread Management** — Mark individual or all notifications as read; unread count badge via optimized DB index

### Admin & Moderation
- **🛡️ Admin Dashboard** — Platform-wide statistics (total users, active items, resolved items, total matches) at a glance
- **👥 User Management** — Paginated user list with search, ban/unban controls, and per-user item/claim counts
- **📦 Item Moderation** — Soft-delete, restore, or hard-delete any item; paginated item list with reporter info and claim counts
- **🚩 User Reporting** — Report users for chat abuse, scams, inappropriate behavior, or other reasons; linked to specific conversations for context
- **📋 Report Review** — Admin review pipeline with pending/reviewed/dismissed statuses

### Authentication & Security
- **🔐 JWT via HTTP-Only Cookies** — Tokens are never exposed to JavaScript; secure, same-site, HTTP-only cookies prevent XSS token theft
- **📧 Email OTP Verification** — 6-digit OTP sent on registration with 10-minute expiry, resend capability, and brute-force lockout after 5 failed attempts
- **🛡️ Deep Email Validation** — MX record checks, disposable email blocking, typo detection, and regex validation on registration
- **⚡ Rate Limiting** — Global limiter (500 req/15 min) plus stricter per-endpoint limits on auth routes
- **🪖 Helmet** — Security headers enabled by default
- **🧹 Input Validation** — Zod schemas on all endpoints; Multer for safe file uploads
- **🚪 Role-Based Access** — `STUDENT` and `ADMIN` roles with route guards on both client and server
- **🗑️ Soft Deletes** — User and item deletions are reversible; banned/deactivated accounts are blocked at login

### User Experience
- **🌙 Dark Mode** — System-aware theme with manual toggle, persisted via context
- **⚡ Code Splitting** — Lazy-loaded routes via `React.lazy()` + `Suspense` for fast initial loads
- **🎞️ Framer Motion Animations** — Smooth transitions and micro-animations throughout the UI
- **📱 Responsive Design** — Tailwind CSS v4 with mobile-first layouts
- **📈 Analytics Charts** — Dashboard visualizations via Recharts
- **📅 Date Picker** — React DatePicker for precise date-of-occurrence input
- **⚠️ Error Boundary** — Graceful crash recovery with a global React error boundary
- **🔄 Smart Caching** — TanStack Query with 30s stale time, conditional retry logic (no retry on 401/403/404), and background refetch on window focus

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS 4, React Router 7, TanStack Query 5 |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express 4, TypeScript |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | JWT (HTTP-only cookies) + Email OTP |
| **Validation** | Zod + deep-email-validator |
| **Real-Time** | Socket.io 4 |
| **File Storage** | ImageKit (via Multer) |
| **Email** | Nodemailer (Gmail SMTP) |
| **Security** | Helmet, express-rate-limit, bcryptjs |
| **Linting** | oxlint |
| **Deployment** | Vercel (client) · Render (server) |

---

## 📁 Project Structure

```
Trace/
├── client/                     # React + Vite frontend
│   └── src/
│       ├── api/                # Axios API layer (auth, items, claims, chat, admin, …)
│       ├── components/         # Reusable UI (admin, chat, claims, layout, notifications)
│       ├── context/            # AuthContext, ThemeContext
│       ├── hooks/              # useNotifications, useModalAnimation
│       ├── pages/
│       │   ├── Landing.tsx     # Public landing page
│       │   ├── auth/           # Login, Register (with OTP verification)
│       │   ├── dashboard/      # Dashboard, MyReports, MyClaims
│       │   ├── items/          # BrowseItems, ItemDetail, ReportItem, EditItem
│       │   ├── chat/           # Messages (real-time conversations)
│       │   ├── admin/          # AdminDashboard (stats, users, items, reports)
│       │   └── legal/          # PrivacyPolicy, TermsOfService, Security
│       ├── routes/             # AppRouter (lazy-loaded), ProtectedRoute guards
│       └── types/              # Shared TypeScript types
│
└── server/                     # Express + TypeScript backend
    ├── prisma/
    │   ├── schema.prisma       # 12 models, 6 enums, optimized indexes
    │   └── seed.ts             # Database seeding script
    ├── scripts/                # Utility scripts
    └── src/
        ├── config/             # Environment, Prisma client
        ├── controllers/        # Route handlers (auth, item, claim, chat, admin, …)
        ├── middlewares/        # authenticate, requireRole, validate, errorHandler
        ├── routes/             # Express routers with per-route rate limiting
        ├── services/           # Business logic (auth, item, claim, match, notification, admin)
        ├── types/              # Shared TypeScript types
        ├── utils/              # AppError, JWT, ImageKit, Mailer
        └── validators/         # Zod validation schemas
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** database ([Supabase](https://supabase.com/) recommended)
- **ImageKit** account for image uploads ([imagekit.io](https://imagekit.io/))
- **Gmail** account with an [App Password](https://myaccount.google.com/apppasswords) for email delivery (optional — omit to log emails to console)

### 1. Clone the repository

```bash
git clone https://github.com/vikram-singh05/Trace.git
cd Trace
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Then fill in your values in /client/.env and /server/.env
```

See [`.env.example`](.env.example) for all required and optional variables with inline documentation.

### 3. Start the backend

```bash
cd server
npm install
npx prisma migrate dev    # Apply database migrations
npx prisma db seed        # (Optional) Seed with sample data
npm run dev               # Starts on http://localhost:5000
```

### 4. Start the frontend

```bash
cd client
npm install
npm run dev               # Starts on http://localhost:5173
```

### Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (client or server) |
| `npm run build` | Production build |
| `npx prisma studio` | Visual database browser |
| `npx prisma migrate dev` | Apply pending migrations |
| `npx prisma db seed` | Run the seed script |

---

## 🔌 API Overview

All endpoints are prefixed with `/api/v1`. Authentication is via HTTP-only cookie (`token`).

| Route | Description |
|---|---|
| `/auth` | Register, login, logout, OTP verify, resend OTP, get profile |
| `/items` | CRUD for lost/found items, browse with filters |
| `/categories` | List item categories |
| `/claims` | Submit, review, approve/reject claims |
| `/chat` | Conversations and message history |
| `/notifications` | List, read, mark-all-read |
| `/admin` | Stats, user management, item moderation |
| `/reports` | Submit and review user reports |
| `/upload` | ImageKit upload authentication |
| `/health` | Health check (excluded from rate limiting) |

---

## 📊 Database Schema

12 models across 4 domains:

| Domain | Models |
|---|---|
| **Users** | `User` (with OTP, soft delete, ban) |
| **Items** | `Item`, `Category`, `VerificationQuestion`, `Match` |
| **Claims** | `Claim`, `ClaimAnswer` |
| **Communication** | `Conversation`, `Message`, `Notification` |
| **Moderation** | `UserReport` |

---

## 🛡️ Security Highlights

- Passwords hashed with **bcrypt** (12 rounds)
- JWT tokens stored in **HTTP-only, secure, same-site cookies** — never in `localStorage`
- **OTP brute-force protection** — account locks after 5 failed attempts
- **Rate limiting** on all routes, with stricter limits on auth endpoints
- **Zod validation** on every request body
- **Helmet** security headers
- **CORS** restricted to the configured client origin
- **Soft deletes** — data is recoverable, never truly lost
- **Server-side chat authorization** — prevents cross-conversation message injection

---

## 📄 License

This project is for educational and portfolio purposes.

---

<div align="center">
  <sub>Built with ☕ and persistence.</sub>
</div>
]]>
