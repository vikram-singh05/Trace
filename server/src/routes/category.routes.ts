import { Router } from 'express';
import * as CategoryController from '../controllers/category.controller';

const router = Router();

// Public route: anyone can fetch categories
router.get('/', CategoryController.getCategories);

export default router;
