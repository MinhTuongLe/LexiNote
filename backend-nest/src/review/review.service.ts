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
    });

    return reviews.map(r => ({
      ...r,
      lastReviewed: r.lastReviewed ? Number(r.lastReviewed) : null,
      nextReview: r.nextReview ? Number(r.nextReview) : null,
      createdAt: Number(r.createdAt),
      updatedAt: Number(r.updatedAt),
      word: {
        ...r.word,
        createdAt: Number(r.word.createdAt),
        updatedAt: Number(r.word.updatedAt),
      },
    }));
  }

  async updateSRS(userId: number, reviewId: number, quality: number) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, word: { ownerId: userId } },
      include: { word: true },
    });

    if (!review) throw new NotFoundException('Review session not found');

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

    return {
      ...updated,
      createdAt: Number(updated.createdAt),
      updatedAt: Number(updated.updatedAt),
      lastReviewed: updated.lastReviewed ? Number(updated.lastReviewed) : null,
      nextReview: updated.nextReview ? Number(updated.nextReview) : null,
    };
  }

  async resetBulk(userId: number, wordIds: number[]) {
    const reviews = await this.prisma.review.findMany({
      where: {
        wordId: { in: wordIds },
        word: { ownerId: userId },
      },
    });

    const reviewIds = reviews.map(r => r.id);

    if (reviewIds.length > 0) {
      await this.prisma.review.updateMany({
        where: { id: { in: reviewIds } },
        data: {
          nextReview: BigInt(Date.now()),
          lastReviewed: 0,
          interval: 0,
          easeFactor: 2.5,
          correctCount: 0,
          wrongCount: 0,
        },
      });
      return { success: true, count: reviewIds.length };
    }

    return { success: true, count: 0 };
  }
}
