import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReviewService } from '../review/review.service';

const ACHIEVEMENTS = [
  {
    id: 'beginner',
    title: 'Lexi Beginner',
    desc: 'Add your first 10 vocabulary words',
    target: 10,
  },
  {
    id: 'streak',
    title: 'Streak Master',
    desc: 'Reach a 7-day study streak',
    target: 7,
  },
  {
    id: 'mastery',
    title: 'Memory Wizard',
    desc: 'Master 20 words with 100% SRS memory',
    target: 20,
  },
  {
    id: 'accuracy',
    title: 'Sharpshooter',
    desc: 'Achieve 80% or higher overall accuracy',
    target: 80,
  },
] as const;

type AchievementId = (typeof ACHIEVEMENTS)[number]['id'];

@Injectable()
export class AchievementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reviewService: ReviewService,
  ) {}

  async getAchievements(userId: number) {
    const progress = await this.getProgress(userId);
    const unlocks = await this.prisma.achievementUnlock.findMany({
      where: { userId },
    });
    const unlockById = new Map(
      unlocks.map((unlock) => [unlock.achievementId, unlock]),
    );

    const achievements = ACHIEVEMENTS.map((achievement) => {
      const unlock = unlockById.get(achievement.id);
      return {
        id: achievement.id,
        title: achievement.title,
        desc: achievement.desc,
        unlocked: Boolean(unlock),
        unlockedAt: unlock
          ? new Date(Number(unlock.unlockedAt)).toISOString()
          : null,
        progress: progress[achievement.id],
        target: achievement.target,
      };
    });

    return {
      unlockedCount: achievements.filter((achievement) => achievement.unlocked)
        .length,
      totalBadges: achievements.length,
      achievements,
    };
  }

  async unlock(userId: number, achievementId: string) {
    const achievement = this.findAchievement(achievementId);
    const progress = await this.getProgress(userId);
    if (progress[achievement.id] < achievement.target) {
      throw new BadRequestException('Achievement target has not been reached');
    }

    const unlock = await this.prisma.achievementUnlock.upsert({
      where: {
        userId_achievementId: { userId, achievementId: achievement.id },
      },
      create: { userId, achievementId: achievement.id },
      update: {},
    });

    return {
      success: true,
      achievementId: achievement.id,
      unlockedAt: new Date(Number(unlock.unlockedAt)).toISOString(),
    };
  }

  private async getProgress(
    userId: number,
  ): Promise<Record<AchievementId, number>> {
    const [wordCount, reviews, streak] = await Promise.all([
      this.prisma.word.count({ where: { ownerId: userId } }),
      this.prisma.review.findMany({
        where: { word: { ownerId: userId } },
        select: { correctCount: true, wrongCount: true, interval: true },
      }),
      this.reviewService.getStreak(userId),
    ]);

    const masteredWords = reviews.filter(
      (review) => review.correctCount >= 4 && review.interval >= 14,
    ).length;
    const totalCorrect = reviews.reduce(
      (total, review) => total + review.correctCount,
      0,
    );
    const totalWrong = reviews.reduce(
      (total, review) => total + review.wrongCount,
      0,
    );
    const accuracy =
      totalCorrect + totalWrong > 0
        ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
        : 0;

    return {
      beginner: wordCount,
      streak,
      mastery: masteredWords,
      accuracy,
    };
  }

  private findAchievement(achievementId: string) {
    const achievement = ACHIEVEMENTS.find((item) => item.id === achievementId);
    if (!achievement) {
      throw new BadRequestException(`Unknown achievement: ${achievementId}`);
    }
    return achievement;
  }
}
