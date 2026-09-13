# Trace 🎒

A secure, full-stack campus lost-and-found platform built for the university community.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, TanStack Query |
| Backend | Node.js, Express.js, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | JWT via HTTP-only cookies |
| Real-time | Socket.io |
| File Storage | ImageKit |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | Vercel (client) · Render (server) |

## Project Structure

```
CampusFind/
├── client/     # React + Vite frontend
└── server/     # Express + TypeScript backend
```

## Getting Started

### Prerequisites
- Node.js v18+
- A PostgreSQL database (Supabase recommended)
- An ImageKit account (image uploads)
- A Gmail account with an App Password (email delivery)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/campusfind.git
cd campusfind
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Fill in your values in /client/.env and /server/.env
```

### 3. Start the backend
```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```

### 4. Start the frontend
```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Features

- 📋 Report lost and found items with images
- 🔍 Browse and search all reports
- 🤖 Automatic item matching with confidence scores
- 📬 Claim found items with proof submission
- 🔔 Real-time notifications via Socket.io
- 📧 Email alerts for claim status changes
- 🛡️ Admin panel for moderation
- 🔒 Secure JWT auth with HTTP-only cookies
