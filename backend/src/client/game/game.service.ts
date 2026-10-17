import { BadRequestException, Injectable } from '@nestjs/common';
import { GameType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GameSessionDto } from './dto/game-session.dto';

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
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const sessions = await this.prisma.$queryRaw<
      Array<{
        user_id: number;
        full_name: string;
        avatar: string | null;
        score: number;
        time_spent_seconds: number;
      }>
    >`
      with best_per_user as (
        select distinct on (gs.user_id)
          gs.user_id,
          u.full_name,
          u.avatar,
          gs.score,
          gs.time_spent_seconds
        from game_session gs
        inner join "user" u on u.id = gs.user_id
        where gs.game_type = ${gameType}
          and gs.created_at >= ${BigInt(startOfWeek.getTime())}
          and gs.created_at <= ${BigInt(Date.now())}
        order by gs.user_id, gs.score desc, gs.time_spent_seconds asc, gs.created_at asc
      )
      select *
      from best_per_user
      order by score desc, time_spent_seconds asc, user_id asc
      limit ${safeLimit}
    `;

    return sessions
      .map((session) => ({
        user: {
          id: session.user_id,
          fullName: session.full_name,
          avatar: session.avatar,
        },
        bestScore: session.score,
        bestTimeSeconds: session.time_spent_seconds,
      }))
      .map((entry, index) => ({ rank: index + 1, ...entry }));
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
