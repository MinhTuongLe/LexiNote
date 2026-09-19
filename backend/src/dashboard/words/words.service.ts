import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Prisma } from '@prisma/client';

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
      details: { wordId: relation.wordId, type: relation.type, value: relation.value },
    });

    return relation;
  }
}
