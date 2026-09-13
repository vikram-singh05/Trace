import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import type { CreateClaimInput, UpdateClaimStatusInput } from '../validators/claim.validator';
import { ClaimStatus } from '@prisma/client';
import * as NotificationService from './notification.service';

export const createClaim = async (userId: string, input: CreateClaimInput) => {
  // 1. Verify the item exists, is still ACTIVE, and isn't the user's own report.
  const item = await prisma.item.findUnique({
    where: { id: input.itemId },
    include: { verificationQuestions: true },
  });

  if (!item || item.deletedAt) {
    throw new AppError('Item not found', 404, 'ITEM_NOT_FOUND');
  }
  if (item.status !== 'ACTIVE') {
    throw new AppError('This item is no longer active', 400, 'ITEM_NOT_ACTIVE');
  }
  if (item.reporterId === userId) {
    throw new AppError('You cannot claim your own reported item', 400, 'CANNOT_CLAIM_OWN_ITEM');
  }

  // 2. LOST items skip the whole approval step. Clicking "I found this" opens a
  //    secure chat with the owner immediately, so the claim is created already
  //    APPROVED together with its Conversation. The item stays ACTIVE and other
  //    finders' claims are left untouched, so several finders can each reach the
  //    owner independently. Re-submitting is idempotent: an existing PENDING
  //    claim (e.g. legacy data) is promoted, and an existing APPROVED one just
  //    returns its already-open chat.
  if (item.type === 'LOST') {
    const existing = await prisma.claim.findFirst({
      where: { itemId: input.itemId, claimantId: userId, status: { in: ['PENDING', 'APPROVED'] } },
      include: { conversation: { select: { id: true } } },
    });

    if (existing) {
      return prisma.$transaction(async (tx) => {
        if (existing.status !== 'APPROVED') {
          await tx.claim.update({ where: { id: existing.id }, data: { status: 'APPROVED' } });
        }
        // Conversation.claimId is unique, so only create one if it's missing.
        if (!existing.conversation) {
          await tx.conversation.create({ data: { claimId: existing.id } });
        }
        return tx.claim.findUnique({
          where: { id: existing.id },
          include: { answers: true, conversation: { select: { id: true } } },
        });
      });
    }

    const claim = await prisma.$transaction(async (tx) => {
      const created = await tx.claim.create({
        data: {
          itemId: input.itemId,
          claimantId: userId,
          proofText: input.proofText || "",
          proofImageUrls: input.proofImageUrls || [],
          status: 'APPROVED',
          // LOST items carry no verification questions; the finder's description
          // lives in proofText, so no answers are recorded.
          answers: { create: [] },
        },
      });
      await tx.conversation.create({ data: { claimId: created.id } });
      return tx.claim.findUnique({
        where: { id: created.id },
        include: { answers: true, conversation: { select: { id: true } } },
      });
    });

    // Tell the owner someone found their item and a chat is now open.
    await NotificationService.createNotification({
      userId: item.reporterId,
      type: 'CLAIM_FILED',
      message: `Someone found your lost item: ${item.title}. Open Messages to chat with them.`,
      relatedItemId: item.id,
      emailSubject: 'Someone Found Your Lost Item - Trace',
      emailHtml: `<div style="font-family:sans-serif;padding:20px;">
                    <h2>Good news — someone found your item! 🎉</h2>
                    <p>A member has responded to your lost report: <strong>${item.title}</strong>.</p>
                    <p>Log in and open <strong>Messages</strong> to chat with them and arrange getting it back.</p>
                  </div>`,
    });

    return claim;
  }

  // 3. FOUND items keep the approve-then-chat flow. Block only a *concurrent*
  //    pending claim. A user whose earlier claim was REJECTED is allowed to
  //    submit a fresh one (e.g. with better proof) — the DB no longer enforces
  //    one-claim-per-item, so re-claims succeed here.
  const existingClaim = await prisma.claim.findFirst({
    where: { itemId: input.itemId, claimantId: userId, status: 'PENDING' },
  });
  if (existingClaim) {
    throw new AppError('You already have a pending claim for this item', 400, 'CLAIM_EXISTS');
  }

  // Prepare and validate answers against the item's verification questions.
  const answersData = input.answers.map((ans) => {
    const question = item.verificationQuestions.find((q) => q.id === ans.questionId);
    if (!question) {
      throw new AppError(`Invalid question ID: ${ans.questionId}`, 400, 'INVALID_QUESTION');
    }
    return {
      questionId: ans.questionId,
      answerText: ans.answer, // Store what they answered for the owner to review
    };
  });

  const totalQuestions = item.verificationQuestions.length;
  // If they didn't answer all questions, throw error
  if (input.answers.length !== totalQuestions) {
     throw new AppError('You must answer all verification questions', 400, 'INCOMPLETE_ANSWERS');
  }

  // Create the claim (PENDING — no conversation until the owner approves).
  const claim = await prisma.claim.create({
    data: {
      itemId: input.itemId,
      claimantId: userId,
      proofText: input.proofText || "",
      proofImageUrls: input.proofImageUrls || [],
      answers: {
        create: answersData.map(a => ({
          questionId: a.questionId,
          answer: a.answerText,
        })),
      },
    },
    include: {
      answers: true,
    },
  });

  // Send notification to the item owner
  await NotificationService.createNotification({
    userId: item.reporterId,
    type: 'CLAIM_FILED',
    message: `Someone has submitted a claim for your found item: ${item.title}`,
    relatedItemId: item.id,
    emailSubject: 'New Claim on Your Found Item - Trace',
    emailHtml: `<div style="font-family:sans-serif;padding:20px;">
                  <h2>New Claim Submitted 📝</h2>
                  <p>Someone has claimed your item: <strong>${item.title}</strong>.</p>
                  <p>Log in to review their answers to your verification questions.</p>
                </div>`,
  });

  return claim;
};

export const getClaimsForItem = async (itemId: string, userId: string, userRole: string) => {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  
  if (!item) {
    throw new AppError('Item not found', 404, 'ITEM_NOT_FOUND');
  }

  // Only the owner or an admin can view claims on an item
  if (item.reporterId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Not authorized to view claims for this item', 403, 'FORBIDDEN');
  }

  const claims = await prisma.claim.findMany({
    where: { itemId },
    include: {
      claimant: {
        select: { id: true, name: true, avatarUrl: true, email: true },
      },
      answers: {
        include: {
          question: { select: { question: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return claims;
};

export const getMyClaims = async (userId: string) => {
  const claims = await prisma.claim.findMany({
    where: { claimantId: userId },
    include: {
      item: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return claims;
};

export const updateClaimStatus = async (claimId: string, userId: string, userRole: string, input: UpdateClaimStatusInput) => {
  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: { item: true },
  });

  if (!claim) {
    throw new AppError('Claim not found', 404, 'CLAIM_NOT_FOUND');
  }

  // Only the item owner or admin can approve/reject claims
  if (claim.item.reporterId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Not authorized to update this claim', 403, 'FORBIDDEN');
  }

  // LOST-item claims are auto-approved at creation (the chat opens immediately),
  // so they must never travel the approve/reject → resolve path, which would
  // wrongly mark the still-active LOST item RESOLVED and reject other finders.
  if (claim.item.type === 'LOST') {
    throw new AppError('This claim is auto-approved and cannot be approved or rejected', 400, 'LOST_CLAIM_AUTO_APPROVED');
  }

  if (claim.status !== 'PENDING') {
    throw new AppError('This claim has already been processed', 400, 'CLAIM_ALREADY_PROCESSED');
  }

  // Use a transaction for the atomic DB writes only. Notifications/email are
  // dispatched AFTER commit so the pooled connection and row locks aren't held
  // open during notification work — previously the SMTP round-trip ran inside
  // this transaction.
  await prisma.$transaction(async (tx) => {
    // 1. Update the specific claim
    await tx.claim.update({
      where: { id: claimId },
      data: { status: input.status },
    });

    if (input.status === 'APPROVED') {
      // 2. Mark the item as RESOLVED
      await tx.item.update({
        where: { id: claim.itemId },
        data: { status: 'RESOLVED' },
      });

      // 3. Reject all other pending claims for this item
      await tx.claim.updateMany({
        where: {
          itemId: claim.itemId,
          id: { not: claimId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      // 4. Create a chat conversation for the reporter and claimant
      await tx.conversation.create({
        data: {
          claimId: claimId,
        },
      });
    }
  });

  // Side-effects run after the transaction commits. createNotification isolates
  // its own failures and sends email fire-and-forget, so it never blocks or
  // rolls back the claim/item updates above.
  if (input.status === 'APPROVED') {
    // Notify claimant of approval
    await NotificationService.createNotification({
      userId: claim.claimantId,
      type: 'CLAIM_APPROVED',
      message: `Your claim for ${claim.item.title} was APPROVED!`,
      relatedItemId: claim.itemId,
      emailSubject: 'Claim Approved! 🎉 - Trace',
      emailHtml: `<div style="font-family:sans-serif;padding:20px;">
                    <h2>Claim Approved! 🎉</h2>
                    <p>Good news! Your claim for <strong>${claim.item.title}</strong> was approved.</p>
                    <p>Check your dashboard for details on how to coordinate pickup with the finder.</p>
                  </div>`,
    });
  } else {
    // Notify claimant of rejection
    await NotificationService.createNotification({
      userId: claim.claimantId,
      type: 'CLAIM_REJECTED',
      message: `Your claim for ${claim.item.title} was declined.`,
      relatedItemId: claim.itemId,
    });
  }

  // Fetch updated claim to return
  return prisma.claim.findUnique({
    where: { id: claimId },
    include: { claimant: { select: { name: true, email: true } } }, // To help owner contact them
  });
};
