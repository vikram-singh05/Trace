import { Request, Response, NextFunction } from 'express';
import * as ClaimService from '../services/claim.service';
import type { CreateClaimInput, UpdateClaimStatusInput } from '../validators/claim.validator';

export const createClaim = async (
  req: Request<{}, {}, CreateClaimInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const claim = await ClaimService.createClaim(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      data: { claim },
    });
  } catch (error) {
    next(error);
  }
};

export const getClaimsForItem = async (
  req: Request<{ itemId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const claims = await ClaimService.getClaimsForItem(
      req.params.itemId,
      req.user!.userId,
      req.user!.role
    );
    res.status(200).json({
      success: true,
      data: { claims },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyClaims = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const claims = await ClaimService.getMyClaims(req.user!.userId);
    res.status(200).json({
      success: true,
      data: { claims },
    });
  } catch (error) {
    next(error);
  }
};

export const updateClaimStatus = async (
  req: Request<{ id: string }, {}, UpdateClaimStatusInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const claim = await ClaimService.updateClaimStatus(
      req.params.id,
      req.user!.userId,
      req.user!.role,
      req.body
    );
    res.status(200).json({
      success: true,
      message: `Claim ${req.body.status.toLowerCase()} successfully`,
      data: { claim },
    });
  } catch (error) {
    next(error);
  }
};
