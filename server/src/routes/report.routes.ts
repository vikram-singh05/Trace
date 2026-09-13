import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

// User routes
router.post('/', authenticate, reportController.createReport);

// Admin routes
router.get('/', authenticate, requireRole('ADMIN'), reportController.getReports);
router.patch('/:id/status', authenticate, requireRole('ADMIN'), reportController.updateReportStatus);

export default router;
