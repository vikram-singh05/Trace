import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as FeedbackController from '../controllers/feedback.controller';
import { validate } from '../middlewares/validate';
import { createFeedbackSchema, updateFeedbackStatusSchema } from '../validators/feedback.validator';
import { authenticateOptional, authenticate } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
    },
  },
});

// User routes
router.post(
  '/',
  feedbackLimiter,
  authenticateOptional,
  validate(createFeedbackSchema),
  FeedbackController.createFeedback
);

router.get(
  '/me',
  authenticate,
  FeedbackController.getUserFeedbacks
);

// Admin routes
router.get(
  '/',
  authenticate,
  requireRole('ADMIN'),
  FeedbackController.getAllFeedbacks
);

router.get(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  FeedbackController.getFeedback
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole('ADMIN'),
  validate(updateFeedbackStatusSchema),
  FeedbackController.updateFeedback
);

export default router;
