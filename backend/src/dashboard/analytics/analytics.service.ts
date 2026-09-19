import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const now = Date.now();
    const [userCount, wordCount, activeSessions, totalReviews, reviewAggregate, hardestReviews] =
      await Promise.all([
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

  async getTrafficStats() {
    // Generate last 7 days chart data
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    const chartData = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        const count = await this.prisma.word.count({
          where: {
            createdAt: {
              gte: BigInt(date.getTime()),
              lt: BigInt(nextDate.getTime()),
            },
          },
        });

        return {
          name: days[date.getDay()],
          words: count,
        };
      }),
    );

    return chartData;
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
