import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ModerationFlagReason, ModerationStatus, Prisma } from '@prisma/client';
import { ImportWordsDto } from './dto/import-words.dto';

@Injectable()
export class DashboardWordsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getAllWords(
    page = 1,
    limit = 20,
    search?: string,
    type?: string,
    ownerId?: number,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.WordWhereInput = {};

    if (search) {
      where.OR = [
        { word: { contains: search, mode: 'insensitive' } },
        { meaningVi: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const [words, total] = await Promise.all([
      this.prisma.word.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: { id: true, fullName: true, email: true },
          },
          reviews: true,
          relations: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.word.count({ where }),
    ]);

    return {
      data: words.map((w) => ({
        ...w,
        createdAt: w.createdAt.toString(),
        updatedAt: w.updatedAt.toString(),
        relations: (w.relations || []).map((rel) => ({
          ...rel,
          createdAt: rel.createdAt.toString(),
          updatedAt: rel.updatedAt.toString(),
        })),
        reviews: w.reviews.map((r) => ({
          ...r,
          lastReviewed: r.lastReviewed ? r.lastReviewed.toString() : null,
          nextReview: r.nextReview.toString(),
          createdAt: r.createdAt.toString(),
          updatedAt: r.updatedAt.toString(),
        })),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async importWords(ownerId: number, dto: ImportWordsDto) {
    const parsedWords = dto.rawWords
      .split(/[,;\r\n]+/)
      .map((word) => word.trim())
      .filter(Boolean);
    const words = [...new Set(parsedWords)];
    if (words.length === 0) {
      throw new BadRequestException('rawWords must contain at least one word');
    }
    const duplicateCount = parsedWords.length - words.length;
    const existing = await this.prisma.word.findMany({
      where: { ownerId, word: { in: words } },
      select: { word: true },
    });
    const existingWords = new Set(existing.map((word) => word.word));
    const importedWords: { id: number; word: string }[] = [];

    for (const word of words) {
      if (existingWords.has(word)) continue;

      try {
        const created = await this.prisma.word.create({
          data: {
            word,
            meaningVi: '',
            type: dto.type?.trim() || 'noun',
            ownerId,
            moderationStatus: ModerationStatus.PENDING,
            flagReason: ModerationFlagReason.MISSING_EXAMPLE,
          },
          select: { id: true, word: true },
        });
        importedWords.push(created);
        existingWords.add(word);
      } catch (error) {
        if (!this.isUniqueConstraintError(error)) throw error;
      }
    }

    await this.auditService.logAction({
      action: 'WORD_IMPORT',
      targetType: 'WORD',
      details: {
        ownerId,
        importedCount: importedWords.length,
        skippedCount: duplicateCount + words.length - importedWords.length,
        autoEnrichRequested: dto.autoEnrich === true,
      },
    });

    return {
      success: true,
      importedCount: importedWords.length,
      skippedCount: duplicateCount + words.length - importedWords.length,
      importedWords,
    };
  }

  async exportWords(search?: string, type?: string) {
    const where: Prisma.WordWhereInput = {};
    if (search) {
      where.OR = [
        { word: { contains: search, mode: 'insensitive' } },
        { meaningVi: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;

    const words = await this.prisma.word.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        word: true,
        meaningVi: true,
        example: true,
        type: true,
        moderationStatus: true,
        flagReason: true,
        createdAt: true,
        owner: { select: { id: true, fullName: true, email: true } },
      },
    });

    return words.map((word) => ({
      id: word.id,
      word: word.word,
      meaningVi: word.meaningVi,
      example: word.example,
      type: word.type,
      moderationStatus: word.moderationStatus,
      flagReason: word.flagReason,
      createdAt: new Date(Number(word.createdAt)).toISOString(),
      ownerId: word.owner.id,
      ownerName: word.owner.fullName,
      ownerEmail: word.owner.email,
    }));
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  async deleteWord(id: number) {
    const word = await this.prisma.word.findUnique({ where: { id } });
    if (word) {
      await this.prisma.archive.create({
        data: {
          fromModel: 'Word',
          originalRecord: word as unknown as Prisma.InputJsonValue,
          originalRecordId: { id },
        },
      });
    }

    const deleted = await this.prisma.word.delete({
      where: { id },
    });

    await this.auditService.logAction({
      action: 'WORD_DELETE',
      targetType: 'WORD',
      targetId: String(id),
      details: { word: word?.word, meaningVi: word?.meaningVi },
    });

    return deleted;
  }

  async updateWord(
    id: number,
    data: { meaningVi?: string; type?: string; example?: string },
  ) {
    const updated = await this.prisma.word.update({
      where: { id },
      data: {
        ...(data.meaningVi !== undefined && { meaningVi: data.meaningVi }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.example !== undefined && { example: data.example }),
      },
      include: {
        relations: true,
      },
    });

    await this.auditService.logAction({
      action: 'WORD_UPDATE',
      targetType: 'WORD',
      targetId: String(id),
      details: data as Record<string, unknown>,
    });

    return updated;
  }

  async addRelation(wordId: number, type: string, value: string) {
    const relation = await this.prisma.wordRelation.create({
      data: {
        wordId,
        type,
        value,
      },
    });

    await this.auditService.logAction({
      action: 'WORD_RELATION_CREATE',
      targetType: 'WORD_RELATION',
      targetId: String(relation.id),
      details: { wordId, type, value },
    });

    return {
      ...relation,
      createdAt: relation.createdAt.toString(),
      updatedAt: relation.updatedAt.toString(),
    };
  }

  async deleteRelation(relationId: number) {
    const relation = await this.prisma.wordRelation.delete({
      where: { id: relationId },
    });

    await this.auditService.logAction({
      action: 'WORD_RELATION_DELETE',
      targetType: 'WORD_RELATION',
      targetId: String(relationId),
      details: {
        wordId: relation.wordId,
        type: relation.type,
        value: relation.value,
      },
    });

    return relation;
  }
}
