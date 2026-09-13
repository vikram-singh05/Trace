import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import * as NotificationService from './notification.service';

interface MatchCandidate {
  id: string;
  reporterId: string;
  title: string;
  description: string;
  color: string | null;
  brand: string | null;
  location: string;
  dateOccurred: Date;
  tags: string[];
}

/**
 * Triggered asynchronously after an item is created.
 * Scans the database for potential matches and creates Match records.
 */
export const findMatchesFor = async (newItemId: string) => {
  try {
    const newItem = await prisma.item.findUnique({
      where: { id: newItemId },
    });

    if (!newItem || newItem.status !== 'ACTIVE' || newItem.deletedAt) return;

    // We only match against ACTIVE items of the opposite type in the SAME category
    const oppositeType = newItem.type === 'LOST' ? 'FOUND' : 'LOST';
    
    const candidates = await prisma.item.findMany({
      where: {
        type: oppositeType,
        categoryId: newItem.categoryId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: {
        id: true,
        reporterId: true,
        title: true,
        description: true,
        color: true,
        brand: true,
        location: true,
        dateOccurred: true,
        tags: true,
      },
    });

    for (const candidate of candidates) {
      const { score, reasons } = calculateMatchScore(newItem, candidate);

      // Threshold for a "match" is 40 points
      if (score >= 40) {
        // Link the match so that `lostItemId` and `foundItemId` are correctly assigned
        const lostItemId = newItem.type === 'LOST' ? newItem.id : candidate.id;
        const foundItemId = newItem.type === 'FOUND' ? newItem.id : candidate.id;

        // Create the match record (upsert to avoid duplicates if re-run)
        await prisma.match.upsert({
          where: {
            lostItemId_foundItemId: {
              lostItemId,
              foundItemId,
            },
          },
          update: {
            score,
            reasons,
          },
          create: {
            lostItemId,
            foundItemId,
            score,
            reasons,
          },
        });
        
        // Phase 8 - Trigger notification for both owners
        const lostOwnerId = newItem.type === 'LOST' ? newItem.reporterId : candidate.reporterId;
        const foundOwnerId = newItem.type === 'FOUND' ? newItem.reporterId : candidate.reporterId;

        // Notify LOST item owner
        await NotificationService.createNotification({
          userId: lostOwnerId,
          type: 'MATCH_FOUND',
          message: `A potential match was found for your LOST item!`,
          relatedItemId: lostItemId,
          emailSubject: 'Potential Match Found - Trace',
          emailHtml: `<div style="font-family:sans-serif;padding:20px;background:#f8fafc;border-radius:10px;">
                        <h2 style="color:#0f172a;">Potential Match Found! 🎉</h2>
                        <p style="color:#334155;line-height:1.6;">Great news! We found a potential match for the item you reported lost. The system scored this match at <strong>${score}%</strong>.</p>
                        <p style="color:#334155;line-height:1.6;">Log in to your Trace dashboard and check the item details to see if it's yours!</p>
                      </div>`,
        });

        // Notify FOUND item owner
        await NotificationService.createNotification({
          userId: foundOwnerId,
          type: 'MATCH_FOUND',
          message: `Your FOUND item matches a lost report!`,
          relatedItemId: foundItemId,
        });
      }
    }
  } catch (error) {
    console.error('Error in match.service.findMatchesFor:', error);
  }
};

/**
 * Heuristic scoring logic: Max 100 points
 */
function calculateMatchScore(itemA: any, itemB: any): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Date Logic: FOUND date should generally be >= LOST date (with 24h grace period for timezone/memory errors)
  const lostDate = itemA.type === 'LOST' ? itemA.dateOccurred : itemB.dateOccurred;
  const foundDate = itemA.type === 'FOUND' ? itemA.dateOccurred : itemB.dateOccurred;
  
  const lostTime = new Date(lostDate).getTime();
  const foundTime = new Date(foundDate).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (foundTime < lostTime - oneDayMs) {
    // It was found before it was lost -> physically impossible, hard reject (score 0)
    return { score: 0, reasons: [] };
  } else {
    reasons.push('Timeline aligns');
  }

  // 1. Brand match (30 pts)
  if (itemA.brand && itemB.brand) {
    if (itemA.brand.toLowerCase().includes(itemB.brand.toLowerCase()) || 
        itemB.brand.toLowerCase().includes(itemA.brand.toLowerCase())) {
      score += 30;
      reasons.push('Brand matches');
    }
  }

  // 2. Color match (20 pts)
  if (itemA.color && itemB.color) {
    if (itemA.color.toLowerCase().includes(itemB.color.toLowerCase()) || 
        itemB.color.toLowerCase().includes(itemA.color.toLowerCase())) {
      score += 20;
      reasons.push('Color matches');
    }
  }

  // 3. Location proximity (20 pts)
  // Substring match is basic; could be improved with geocoding in the future
  if (itemA.location && itemB.location) {
    const locA = itemA.location.toLowerCase();
    const locB = itemB.location.toLowerCase();
    if (locA.includes(locB) || locB.includes(locA)) {
      score += 20;
      reasons.push('Location is similar');
    }
  }

  // 4. Keyword overlap in Title and Tags (30 pts max)
  const getWords = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  
  const wordsA = new Set([
    ...getWords(itemA.title), 
    ...(itemA.tags || []).map((t: string) => t.toLowerCase())
  ]);
  const wordsB = new Set([
    ...getWords(itemB.title), 
    ...(itemB.tags || []).map((t: string) => t.toLowerCase())
  ]);

  let overlap = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) overlap++;
  }

  if (overlap > 0) {
    const keywordPoints = Math.min(30, overlap * 10); // 10 pts per matching keyword up to 30
    score += keywordPoints;
    reasons.push(`${overlap} keyword(s) matched`);
  }

  // Bonus: If it's a perfect match on Brand, Color, AND Location, bump it to 100
  if (score >= 70 && overlap > 0) {
    score = 100;
  }

  return { score, reasons };
}
