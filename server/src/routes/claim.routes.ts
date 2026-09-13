import { Router } from 'express';
import * as ClaimController from '../controllers/claim.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { createClaimSchema, updateClaimStatusSchema } from '../validators/claim.validator';

const router = Router();

// All claim routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/claims
 * Submit a claim for an item
 */
router.post('/', validate(createClaimSchema), ClaimController.createClaim);

/**
 * GET /api/v1/claims/me
 * Get current user's claims
 */
router.get('/me', ClaimController.getMyClaims);

/**
 * GET /api/v1/claims/item/:itemId
 * Get all claims for a specific item (restricted to item owner/admin in service)
 */
router.get('/item/:itemId', ClaimController.getClaimsForItem);

/**
 * PATCH /api/v1/claims/:id/status
 * Approve or reject a claim (restricted to item owner/admin in service)
 */
router.patch('/:id/status', validate(updateClaimStatusSchema), ClaimController.updateClaimStatus);

export default router;
