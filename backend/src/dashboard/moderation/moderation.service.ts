import { Injectable, NotFoundException } from '@nestjs/common';
import { ModerationFlagReason, ModerationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ModerationQueryDto } from './dto/moderation-query.dto';

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getPending(query: ModerationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: Prisma.WordWhereInput = {
      moderationStatus: ModerationStatus.PENDING,
    };

    if (query.reason && query.reason !== 'ALL') {
      where.flagReason = query.reason;
    }

    if (query.search) {
      where.OR = [
        { word: { contains: query.search, mode: 'insensitive' } },
        { meaningVi: { contains: query.search, mode: 'insensitive' } },
        {
          owner: { fullName: { contains: query.search, mode: 'insensitive' } },
        },
      ];
    }

    const [words, total] = await Promise.all([
      this.prisma.word.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          word: true,
          meaningVi: true,
          type: true,
          example: true,
          flagReason: true,
          createdAt: true,
          owner: { select: { id: true, fullName: true, email: true } },
        },
      }),
      this.prisma.word.count({ where }),
    ]);

    return {
      data: words.map((word) => ({
        ...word,
        createdAt: new Date(Number(word.createdAt)).toISOString(),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async approve(id: number) {
    const word = await this.prisma.word.findUnique({ where: { id } });
    if (!word) throw new NotFoundException(`Word with ID ${id} not found`);

    await this.prisma.word.update({
      where: { id },
      data: {
        moderationStatus: ModerationStatus.APPROVED,
        flagReason: null,
      },
    });
    await this.auditService.logAction({
      action: 'WORD_APPROVE',
      targetType: 'WORD',
      targetId: String(id),
      details: { word: word.word, previousFlagReason: word.flagReason },
    });

    return { success: true, message: 'Word approved successfully', wordId: id };
  }

  async batchApprove(wordIds: number[]) {
    const result = await this.prisma.word.updateMany({
      where: {
        id: { in: wordIds },
        moderationStatus: ModerationStatus.PENDING,
      },
      data: { moderationStatus: ModerationStatus.APPROVED, flagReason: null },
    });

    await this.auditService.logAction({
      action: 'WORD_BATCH_APPROVE',
      targetType: 'WORD',
      details: { wordIds, approvedCount: result.count },
    });

    return { success: true, approvedCount: result.count };
  }
}
