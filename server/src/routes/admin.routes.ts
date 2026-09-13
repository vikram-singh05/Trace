import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';
import { authenticate } from '../middlewares/authenticate';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.get('/items', AdminController.getItems);
router.patch('/items/:id/moderate', AdminController.moderateItem);

export default router;
