import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsRange } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const now = Date.now();
    const [
      userCount,
      wordCount,
      activeSessions,
      totalReviews,
      reviewAggregate,
      hardestReviews,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.word.count(),
      this.prisma.refreshToken.count({
        where: { expiresAt: { gt: BigInt(now) } },
      }),
      this.prisma.review.count(),
      this.prisma.review.aggregate({
        _sum: {
          correctCount: true,
          wrongCount: true,
        },
        _avg: {
          easeFactor: true,
        },
      }),
      this.prisma.review.findMany({
        take: 5,
        where: { wrongCount: { gt: 0 } },
        orderBy: { wrongCount: 'desc' },
        include: {
          word: {
            select: { id: true, word: true, meaningVi: true, type: true },
          },
        },
      }),
    ]);

    const totalCorrect = reviewAggregate._sum.correctCount || 0;
    const totalWrong = reviewAggregate._sum.wrongCount || 0;
    const totalAnswers = totalCorrect + totalWrong;
    const retentionRate =
      totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 85;
    const avgEaseFactor = reviewAggregate._avg.easeFactor
      ? parseFloat(reviewAggregate._avg.easeFactor.toFixed(2))
      : 2.5;

    return {
      totalUsers: userCount,
      totalWords: wordCount,
      activeSessions,
      totalReviews,
      userChange: '+12.5%',
      wordChange: '+5.2%',
      srsStats: {
        totalCorrect,
        totalWrong,
        retentionRate,
        avgEaseFactor,
        hardestWords: hardestReviews.map((r) => ({
          id: r.word.id,
          word: r.word.word,
          meaningVi: r.word.meaningVi,
          type: r.word.type,
          correctCount: r.correctCount,
          wrongCount: r.wrongCount,
          easeFactor: r.easeFactor,
        })),
      },
    };
  }

  async getTrafficStats(
    range: AnalyticsRange = '7d',
    startDate?: string,
    endDate?: string,
  ) {
    const window = this.resolveDateWindow(range, startDate, endDate);
    const [newWords, reviews] = await Promise.all([
      this.prisma.word.findMany({
        where: {
          createdAt: { gte: window.startMs, lt: window.endMs },
        },
        select: { createdAt: true },
      }),
      this.prisma.review.findMany({
        where: {
          lastReviewed: { gte: window.startMs, lt: window.endMs },
        },
        select: {
          lastReviewed: true,
          correctCount: true,
          wrongCount: true,
          word: { select: { ownerId: true } },
        },
      }),
    ]);

    const points = new Map<
      string,
      {
        activeUsers: Set<number>;
        newWords: number;
        reviewsCount: number;
      }
    >();
    for (const date of window.dates) {
      points.set(this.toDateKey(date), {
        activeUsers: new Set<number>(),
        newWords: 0,
        reviewsCount: 0,
      });
    }

    for (const word of newWords) {
      const point = points.get(
        this.toDateKey(new Date(Number(word.createdAt))),
      );
      if (point) point.newWords += 1;
    }

    for (const review of reviews) {
      if (review.lastReviewed === null) continue;
      const point = points.get(
        this.toDateKey(new Date(Number(review.lastReviewed))),
      );
      if (!point) continue;
      point.activeUsers.add(review.word.ownerId);
      point.reviewsCount += review.correctCount + review.wrongCount;
    }

    return window.dates.map((date) => {
      const point = points.get(this.toDateKey(date));
      return {
        date: this.toDateKey(date),
        activeUsers: point?.activeUsers.size || 0,
        newWords: point?.newWords || 0,
        reviewsCount: point?.reviewsCount || 0,
      };
    });
  }

  private resolveDateWindow(
    range: AnalyticsRange,
    startDate?: string,
    endDate?: string,
  ) {
    const today = this.startOfUtcDay(new Date());
    let start: Date;
    let end: Date;

    if (startDate || endDate) {
      if (!startDate || !endDate) {
        throw new BadRequestException(
          'startDate and endDate are required together',
        );
      }
      start = this.parseDate(startDate, 'startDate');
      end = this.addDays(this.parseDate(endDate, 'endDate'), 1);
      if (end <= start) {
        throw new BadRequestException('endDate must be on or after startDate');
      }
    } else {
      const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[range];
      start = this.addDays(today, -(days - 1));
      end = this.addDays(today, 1);
    }

    const dates: Date[] = [];
    for (let date = start; date < end; date = this.addDays(date, 1)) {
      dates.push(date);
    }

    return {
      dates,
      startMs: BigInt(start.getTime()),
      endMs: BigInt(end.getTime()),
    };
  }

  private parseDate(value: string, field: string): Date {
    const date = this.startOfUtcDay(new Date(value));
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${field} must be a valid ISO date`);
    }
    return date;
  }

  private startOfUtcDay(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  private toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  async getRecentActivity() {
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    });

    return recentUsers.map((user) => ({
      id: user.id,
      message: `New Member: ${user.fullName}`,
      sub: user.email,
      time: this.getRelativeTime(user.createdAt),
      color: 'border-[#009ef7]',
      bg: 'bg-[#009ef7]',
    }));
  }

  private getRelativeTime(epoch: bigint) {
    const diff = Date.now() - Number(epoch);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }
}
