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

    return reviews.map((r: any) => this.formatReview(r));
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

  async getStudyStats(userId: number, year?: number, month?: number) {
    const wordCount = await this.prisma.word.count({ where: { ownerId: userId } });
    
    const reviews = await this.prisma.review.findMany({
      where: { word: { ownerId: userId } },
      include: { word: true },
    });

    const streak = await this.getStreak(userId);
    const weeklyActivity = await this.getActivityData(userId, year, month);
    
    let masteredCount = 0;
    let learningCount = 0;
    let newCount = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalEaseFactor = 0;
    
    const typesMap = new Map<string, any>();

    reviews.forEach((r: any) => {
      const type = r.word.type || 'other';
      if (!typesMap.has(type)) {
        typesMap.set(type, { type, total: 0, mastered: 0, learning: 0, new: 0 });
      }
      const typeStats = typesMap.get(type);
      typeStats.total++;

      if (r.correctCount >= 5 && r.interval >= 21) {
        masteredCount++;
        typeStats.mastered++;
      } else if (r.correctCount > 0) {
        learningCount++;
        typeStats.learning++;
      } else {
        newCount++;
        typeStats.new++;
      }

      totalCorrect += r.correctCount;
      totalWrong += r.wrongCount;
      totalEaseFactor += r.easeFactor;
    });

    const totalReviewed = reviews.filter((r: any) => r.lastReviewed !== null).length;
    const accuracy = (totalCorrect + totalWrong) > 0 
      ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) 
      : 0;
    const averageEaseFactor = reviews.length > 0 ? totalEaseFactor / reviews.length : 2.5;

    let totalTimeSpentMinutes = Math.round(((totalCorrect + totalWrong) * 5) / 60);

    let weakestWords = [...reviews]
      .filter(r => r.wrongCount > 0)
      .sort((a, b) => b.wrongCount - a.wrongCount)
      .slice(0, 5)
      .map((r: any) => ({ word: r.word.word, meaning: r.word.meaningVi, wrongCount: r.wrongCount }));

    // Mock fallback remains the same for UI demo
    if (totalReviewed === 0 && wordCount === 0) {
      return {
        streak: 12,
        weeklyActivity: weeklyActivity, // Use the generated activity
        totalReviewed: 208,
        masteredCount: 120,
        learningCount: 65,
        newCount: 23,
        typesBreakdown: [
          { type: 'noun', total: 100, mastered: 60, learning: 30, new: 10 },
          { type: 'verb', total: 60, mastered: 40, learning: 15, new: 5 },
          { type: 'adj', total: 48, mastered: 20, learning: 20, new: 8 }
        ],
        averageEaseFactor: 2.6,
        accuracy: 88,
        totalTimeSpentMinutes: 145,
        weakestWords: [
          { word: 'Labyrinth', meaning: 'Mê cung', wrongCount: 14 },
          { word: 'Ephemeral', meaning: 'Phù du', wrongCount: 11 },
          { word: 'Defenestration', meaning: 'Ném qua cửa sổ', wrongCount: 8 },
          { word: 'Serendipity', meaning: 'May mắn bất ngờ', wrongCount: 5 },
          { word: 'Oblivion', meaning: 'Sự quên lãng', wrongCount: 4 }
        ]
      };
    }

    return {
      streak,
      weeklyActivity,
      totalReviewed,
      masteredCount,
      learningCount,
      newCount,
      typesBreakdown: Array.from(typesMap.values()),
      averageEaseFactor,
      accuracy,
      totalTimeSpentMinutes,
      weakestWords,
    };
  }

  async getStreak(userId: number): Promise<number> {
    const reviews = await this.prisma.review.findMany({
      where: { 
        word: { ownerId: userId },
        lastReviewed: { not: null }
      },
      select: { lastReviewed: true },
      orderBy: { lastReviewed: 'desc' }
    });

    if (reviews.length === 0) return 0;

    const dates = reviews.map(r => {
      const d = new Date(Number(r.lastReviewed));
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    });

    const uniqueDates = Array.from(new Set(dates));
    
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const yesterdayMidnight = todayMidnight - 86400000;

    if (uniqueDates[0] < yesterdayMidnight) return 0;

    let streak = 0;
    let expectedDate = uniqueDates[0];

    for (const date of uniqueDates) {
      if (date === expectedDate) {
        streak++;
        expectedDate -= 86400000;
      } else {
        break;
      }
    }

    return streak;
  }

  async getActivityData(userId: number, year?: number, month?: number): Promise<{ date: string, count: number }[]> {
    const targetDate = (year !== undefined && month !== undefined) 
      ? new Date(year, month, 1) 
      : new Date();
    
    let startDate: Date;
    let endDate: Date;

    if (year !== undefined && month !== undefined) {
      // Return full month
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 1);
    } else {
      // Default: Current Week (Monday to Sunday)
      const dayOfWeek = targetDate.getDay();
      const diffToMon = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
      startDate = new Date(targetDate);
      startDate.setDate(targetDate.getDate() - diffToMon);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 7 * 86400000);
    }

    const daysCount = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
    const activityDays = Array.from({ length: daysCount }).map((_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return d;
    });

    // Optimization: Fetch all reviews in range and group them manually
    // This is much faster than N queries
    const reviewsInRange = await this.prisma.review.findMany({
      where: {
        word: { ownerId: userId },
        lastReviewed: {
          gte: BigInt(startDate.getTime()),
          lt: BigInt(endDate.getTime()),
        }
      },
      select: { lastReviewed: true }
    });

    const countsMap = new Map<string, number>();
    reviewsInRange.forEach((r: any) => {
      const dateStr = new Date(Number(r.lastReviewed)).toISOString().split('T')[0];
      countsMap.set(dateStr, (countsMap.get(dateStr) || 0) + 1);
    });

    return activityDays.map((d: Date) => {
      const dateStr = d.toISOString().split('T')[0];
      return {
        date: dateStr,
        count: countsMap.get(dateStr) || 0
      };
    });
  }
}
