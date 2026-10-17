import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsRange } from './dto/analytics-query.dto';
import { formatPercentageChange } from './analytics.utils';
import { buildWordClustersFromCounts } from './cluster.utils';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const [
      userCount,
      wordCount,
      activeSessions,
      totalReviews,
      reviewAggregate,
      hardestReviews,
      currentUsers,
      previousUsers,
      currentWords,
      previousWords,
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
        take: 10,
        where: { wrongCount: { gt: 0 } },
        orderBy: { wrongCount: 'desc' },
        include: {
          word: {
            select: { id: true, word: true, meaningVi: true, type: true },
          },
        },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: BigInt(now - weekMs), lt: BigInt(now) } },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: BigInt(now - weekMs * 2),
            lt: BigInt(now - weekMs),
          },
        },
      }),
      this.prisma.word.count({
        where: { createdAt: { gte: BigInt(now - weekMs), lt: BigInt(now) } },
      }),
      this.prisma.word.count({
        where: {
          createdAt: {
            gte: BigInt(now - weekMs * 2),
            lt: BigInt(now - weekMs),
          },
        },
      }),
    ]);

    const totalCorrect = reviewAggregate._sum.correctCount || 0;
    const totalWrong = reviewAggregate._sum.wrongCount || 0;
    const totalAnswers = totalCorrect + totalWrong;
    const retentionRate =
      totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    const avgEaseFactor = reviewAggregate._avg.easeFactor
      ? parseFloat(reviewAggregate._avg.easeFactor.toFixed(2))
      : 2.5;

    return {
      totalUsers: userCount,
      totalWords: wordCount,
      activeSessions,
      totalReviews,
      userChange: formatPercentageChange(currentUsers, previousUsers),
      wordChange: formatPercentageChange(currentWords, previousWords),
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
    const [newWords, reviews, newUsers] = await Promise.all([
      this.prisma.$queryRaw<Array<{ day: string; count: number }>>`
        SELECT
          to_char(
            to_timestamp("createdAt"::double precision / 1000) AT TIME ZONE 'UTC',
            'YYYY-MM-DD'
          ) AS day,
          COUNT(*)::int AS count
        FROM "word"
        WHERE "createdAt" >= ${window.startMs}
          AND "createdAt" < ${window.endMs}
        GROUP BY 1
      `,
      this.prisma.$queryRaw<
        Array<{ day: string; active_users: number; reviews_count: number }>
      >`
        SELECT
          to_char(
            to_timestamp(r."last_reviewed"::double precision / 1000) AT TIME ZONE 'UTC',
            'YYYY-MM-DD'
          ) AS day,
          COUNT(DISTINCT w."owner")::int AS active_users,
          COALESCE(SUM(r."correct_count" + r."wrong_count"), 0)::int AS reviews_count
        FROM "review" r
        INNER JOIN "word" w ON w.id = r."word"
        WHERE r."last_reviewed" >= ${window.startMs}
          AND r."last_reviewed" < ${window.endMs}
        GROUP BY 1
      `,
      this.prisma.$queryRaw<Array<{ day: string; count: number }>>`
        SELECT
          to_char(
            to_timestamp("createdAt"::double precision / 1000) AT TIME ZONE 'UTC',
            'YYYY-MM-DD'
          ) AS day,
          COUNT(*)::int AS count
        FROM "user"
        WHERE "createdAt" >= ${window.startMs}
          AND "createdAt" < ${window.endMs}
        GROUP BY 1
      `,
    ]);

    const points = new Map<
      string,
      {
        activeUsers: number;
        newUsers: number;
        newWords: number;
        reviewsCount: number;
      }
    >();
    for (const date of window.dates) {
      points.set(this.toDateKey(date), {
        activeUsers: 0,
        newUsers: 0,
        newWords: 0,
        reviewsCount: 0,
      });
    }

    for (const word of newWords) {
      const point = points.get(word.day);
      if (point) point.newWords += word.count;
    }

    for (const user of newUsers) {
      const point = points.get(user.day);
      if (point) point.newUsers += user.count;
    }

    for (const review of reviews) {
      const point = points.get(review.day);
      if (!point) continue;
      point.activeUsers = review.active_users;
      point.reviewsCount = review.reviews_count;
    }

    return window.dates.map((date) => {
      const point = points.get(this.toDateKey(date));
      const key = this.toDateKey(date);
      const newWordsCount = point?.newWords || 0;
      return {
        date: key,
        name: key.slice(5).replace('-', '/'),
        words: newWordsCount,
        newWords: newWordsCount,
        activeUsers: point?.activeUsers || 0,
        newUsers: point?.newUsers || 0,
        reviewsCount: point?.reviewsCount || 0,
      };
    });
  }

  getServerHealth() {
    const memory = process.memoryUsage();
    const heapUsedMB = this.toMb(memory.heapUsed);
    const heapTotalMB = this.toMb(memory.heapTotal);
    const rssMB = this.toMb(memory.rss);
    return {
      success: true,
      data: {
        memory: {
          heapUsedMB,
          heapTotalMB,
          rssMB,
          usagePercentage:
            heapTotalMB > 0
              ? Number(((heapUsedMB / heapTotalMB) * 100).toFixed(1))
              : 0,
        },
        uptimeSeconds: Math.floor(process.uptime()),
        uptimeFormatted: this.formatUptime(process.uptime()),
        nodeVersion: process.version,
        platform: process.platform,
        timestamp: Date.now(),
      },
    };
  }

  async getWordClusters() {
    const groupedWords = await this.prisma.word.groupBy({
      by: ['type'],
      _count: { _all: true },
    });
    return buildWordClustersFromCounts(
      groupedWords.map(({ type, _count }) => ({
        type,
        count: _count._all,
      })),
    );
  }

  private toMb(bytes: number) {
    return Number((bytes / 1024 / 1024).toFixed(1));
  }

  private formatUptime(seconds: number) {
    const totalSeconds = Math.floor(seconds);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainder = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${remainder}s`;
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
      if (end.getTime() - start.getTime() > 366 * 24 * 60 * 60 * 1000) {
        throw new BadRequestException('Analytics range cannot exceed 366 days');
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
