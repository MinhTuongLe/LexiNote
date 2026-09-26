import { BadRequestException, Injectable } from '@nestjs/common';
import { GameType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GameSessionDto } from './dto/game-session.dto';

interface LeaderboardEntry {
  user: { id: number; fullName: string; avatar: string | null };
  bestScore: number;
  bestTimeSeconds: number;
}

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async recordSession(userId: number, dto: GameSessionDto) {
    const wordIds = [...new Set(dto.wordIds)];
    const ownedWordCount = await this.prisma.word.count({
      where: { id: { in: wordIds }, ownerId: userId },
    });
    if (ownedWordCount !== wordIds.length) {
      throw new BadRequestException(
        'One or more words do not belong to the user',
      );
    }

    const previousBest = await this.prisma.gameSession.findFirst({
      where: { userId, gameType: dto.gameType },
      orderBy: [{ score: 'desc' }, { timeSpentSeconds: 'asc' }],
      select: { score: true, timeSpentSeconds: true },
    });
    const newPersonalBest =
      previousBest === null ||
      dto.score > previousBest.score ||
      (dto.score === previousBest.score &&
        dto.timeSpentSeconds < previousBest.timeSpentSeconds);

    const session = await this.prisma.$transaction(async (tx) => {
      const created = await tx.gameSession.create({
        data: {
          userId,
          gameType: dto.gameType,
          score: dto.score,
          timeSpentSeconds: dto.timeSpentSeconds,
          wordIds: wordIds as Prisma.InputJsonValue,
        },
      });
      await tx.review.updateMany({
        where: { wordId: { in: wordIds }, word: { ownerId: userId } },
        data: {
          lastReviewed: BigInt(Date.now()),
          correctCount: { increment: 1 },
        },
      });
      return created;
    });

    return {
      success: true,
      sessionId: session.id,
      newPersonalBest,
    };
  }

  async getLeaderboard(gameType: GameType = GameType.MATCH_GAME, limit = 10) {
    const startOfWeek = this.getStartOfWeek();
    const sessions = await this.prisma.gameSession.findMany({
      where: {
        gameType,
        createdAt: {
          gte: BigInt(startOfWeek.getTime()),
          lte: BigInt(Date.now()),
        },
      },
      include: {
        user: { select: { id: true, fullName: true, avatar: true } },
      },
    });

    const bestByUser = new Map<number, LeaderboardEntry>();
    for (const session of sessions) {
      const current: LeaderboardEntry = {
        user: session.user,
        bestScore: session.score,
        bestTimeSeconds: session.timeSpentSeconds,
      };
      const previous = bestByUser.get(session.userId);
      if (!previous || this.isBetter(current, previous)) {
        bestByUser.set(session.userId, current);
      }
    }

    return [...bestByUser.values()]
      .sort((left, right) => {
        if (right.bestScore !== left.bestScore) {
          return right.bestScore - left.bestScore;
        }
        return left.bestTimeSeconds - right.bestTimeSeconds;
      })
      .slice(0, limit)
      .map((entry, index) => ({ rank: index + 1, ...entry }));
  }

  private isBetter(current: LeaderboardEntry, previous: LeaderboardEntry) {
    return (
      current.bestScore > previous.bestScore ||
      (current.bestScore === previous.bestScore &&
        current.bestTimeSeconds < previous.bestTimeSeconds)
    );
  }

  private getStartOfWeek(): Date {
    const today = new Date();
    const day = today.getUTCDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    const start = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    start.setUTCDate(start.getUTCDate() - daysSinceMonday);
    return start;
  }
}
