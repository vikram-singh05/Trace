import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as SupportController from '../controllers/support.controller';
import { validate } from '../middlewares/validate';
import { createSupportTicketSchema } from '../validators/support.validator';
import { authenticateOptional } from '../middlewares/authenticate'; // We need to create authenticateOptional

const router = Router();

const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many support requests. Please try again in an hour.',
    },
  },
});

/**
 * POST /api/v1/support
 * Public endpoint to submit a support ticket.
 * Uses authenticateOptional to optionally link the ticket to a user if logged in.
 */
router.post(
  '/',
  supportLimiter,
  authenticateOptional,
  validate(createSupportTicketSchema),
  SupportController.createTicket
);

export default router;
