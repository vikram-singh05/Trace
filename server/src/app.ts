import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// ── Security Headers ─────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────
// credentials: true is required to allow HTTP-only cookies cross-origin
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// ── Health Check ─────────────────────────────────────────────────
// Registered before the rate limiter intentionally: load balancers and
// uptime monitors poll this frequently and must never be rate-limited,
// or a busy-but-healthy server can get pulled from rotation.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Rate Limiting ────────────────────────────────────────────────
// Global rate limiter: 500 requests per 15 minutes per IP.
// This is intentionally generous — each page load triggers multiple API calls.
// Auth-sensitive endpoints (login, register, verify-otp, resend-otp) have their
// own stricter limiters in auth.routes.ts.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again in 15 minutes.',
    },
  },
});
app.use(limiter);

// ── Body Parsers ─────────────────────────────────────────────────
// Cap body size to prevent a single request from exhausting memory.
// Image uploads go through multer (see upload.routes), not JSON, so 1mb
// is comfortably above any legitimate JSON payload this API accepts.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ── API Routes ───────────────────────────────────────────────────
import authRouter from './routes/auth.routes';
import itemRouter from './routes/item.routes';
import categoryRouter from './routes/category.routes';
import claimRouter from './routes/claim.routes';
import notificationRouter from './routes/notification.routes';
import adminRouter from './routes/admin.routes';
import chatRouter from './routes/chat.routes';
import reportRouter from './routes/report.routes';
import uploadRouter from './routes/upload.routes';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/claims', claimRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/reports', reportRouter);
app.use('/api/v1/upload', uploadRouter);

// Future routes — uncommented as each phase is completed:
// app.use('/api/v1/users',         usersRouter);

// ── 404 Handler ──────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found.' },
  });
});

// ── Global Error Handler ─────────────────────────────────────────
// Must be registered last
app.use(errorHandler);

export default app;
