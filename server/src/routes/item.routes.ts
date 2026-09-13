import { Router } from 'express';
import * as ItemController from '../controllers/item.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { createItemSchema, updateItemSchema, queryItemSchema } from '../validators/item.validator';

const router = Router();

/**
 * GET /api/v1/items
 * Public/Protected: depending on requirements, let's keep it protected for campus exclusivity.
 * (Optional: remove `authenticate` if you want public browsing).
 */
router.get(
  '/',
  authenticate,
  validate(queryItemSchema, 'query'),
  ItemController.getItems
);

/**
 * GET /api/v1/items/me
 * Protected: Get current user's items.
 */
router.get(
  '/me',
  authenticate,
  validate(queryItemSchema, 'query'),
  ItemController.getMyItems
);

/**
 * GET /api/v1/items/:id
 * Protected: Get specific item details.
 */
router.get(
  '/:id',
  authenticate,
  ItemController.getItemById
);

/**
 * POST /api/v1/items
 * Protected: Create a new report.
 */
router.post(
  '/',
  authenticate,
  validate(createItemSchema),
  ItemController.createItem
);

/**
 * PATCH /api/v1/items/:id
 * Protected: Update an existing report (Owner or Admin).
 */
router.patch(
  '/:id',
  authenticate,
  validate(updateItemSchema),
  ItemController.updateItem
);

/**
 * DELETE /api/v1/items/:id
 * Protected: Soft delete a report (Owner or Admin).
 */
router.delete(
  '/:id',
  authenticate,
  ItemController.deleteItem
);

export default router;
