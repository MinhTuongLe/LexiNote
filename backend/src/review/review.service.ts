import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async getDueWords(userId: number) {
    const now = BigInt(Date.now());
    
    const reviews = await this.prisma.review.findMany({
      where: {
        nextReview: { lte: now },
        word: { ownerId: userId },
      },
      include: {
        word: true,
      },
      orderBy: {
        nextReview: 'asc', // Priority to oldest overdue
      },
      take: 100, // Hard limit to prevent RAM exhaustion and payload blowout on massive backlogs
    });

    return reviews.map(r => this.formatReview(r));
  }

  private formatReview(review: any) {
    if (!review) return null;
    const formatted: any = {
      ...review,
      id: Number(review.id),
      wordId: Number(review.wordId),
      createdAt: Number(review.createdAt),
      updatedAt: Number(review.updatedAt),
      lastReviewed: review.lastReviewed ? Number(review.lastReviewed) : null,
      nextReview: review.nextReview ? Number(review.nextReview) : null,
    };

    if (review.word) {
      formatted.word = {
        ...review.word,
        id: Number(review.word.id),
        ownerId: Number(review.word.ownerId || review.word.owner), // Support owner or ownerId
        createdAt: Number(review.word.createdAt),
        updatedAt: Number(review.word.updatedAt),
      };
    }
    return formatted;
  }

  async updateSRS(userId: number, reviewId: number, quality: number) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, word: { ownerId: userId } },
      include: { word: true },
    });

    if (!review) throw new NotFoundException('error.review.not_found');

    let { interval, easeFactor, correctCount, wrongCount } = review;

    // SM-2 Logic
    if (quality >= 3) {
      if (correctCount === 0) interval = 1;
      else if (correctCount === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);
      
      correctCount++;
      easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (easeFactor < 1.3) easeFactor = 1.3;
    } else {
      correctCount = 0;
      interval = 1;
      wrongCount++;
    }

    const nextReview = BigInt(Date.now() + (interval * 24 * 60 * 60 * 1000));

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        interval,
        easeFactor,
        correctCount,
        wrongCount,
        nextReview,
        lastReviewed: BigInt(Date.now()),
      },
    });

    return this.formatReview(updated);
  }

  async resetBulk(userId: number, wordIds: number[]) {
    // 1. Verify all wordIds belong to the user
    const words = await this.prisma.word.findMany({
      where: {
        id: { in: wordIds },
        ownerId: userId,
      },
      select: { id: true },
    });

    const verifiedIds = words.map(w => w.id);

    if (verifiedIds.length === 0) {
      return { success: true, count: 0 };
    }

    // 2. Start transaction: Reset progress by deleting and recreating fresh SRS records
    return this.prisma.$transaction(async (tx) => {
      // Remove existing review records for these words
      await tx.review.deleteMany({
        where: { wordId: { in: verifiedIds } },
      });

      // Create fresh starting points (due 1h ago to bypass float precision loss)
      await tx.review.createMany({
        data: verifiedIds.map(id => ({
          wordId: id,
          nextReview: BigInt(Date.now() - 3600000),
          interval: 0,
          easeFactor: 2.5,
          correctCount: 0,
          wrongCount: 0,
        })),
      });

      return { success: true, count: verifiedIds.length };
    });
  }
}
