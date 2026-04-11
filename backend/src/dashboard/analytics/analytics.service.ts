import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getGeneralStats() {
    const [userCount, wordCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.word.count(),
    ]);

    return {
      totalUsers: userCount,
      totalWords: wordCount,
      timestamp: Date.now(),
    };
  }
}
