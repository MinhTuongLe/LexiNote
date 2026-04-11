import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Word, Prisma } from '@prisma/client';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class WordService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  async create(userId: number, data: any) {
    const { word, meaningVi, example, type, synonyms, antonyms } = data;

    // Normalize type
    const validTypes = await this.getValidTypes(userId);
    let normalizedType = (type || 'other').toLowerCase().trim();
    if (normalizedType.includes('/') || normalizedType.includes(',')) {
      normalizedType = normalizedType.split(/[/,]/)[0].trim();
    }
    if (!validTypes.includes(normalizedType)) normalizedType = 'other';

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the word
      const newWord = await tx.word.create({
        data: {
          word,
          meaningVi,
          example,
          type: normalizedType,
          ownerId: userId,
        },
      });

      // 2. Create relations if any
      if (synonyms && synonyms.length > 0) {
        await tx.wordRelation.createMany({
          data: synonyms.map((val: string) => ({
            type: 'synonym',
            value: val,
            wordId: newWord.id,
          })),
        });
      }
      if (antonyms && antonyms.length > 0) {
        await tx.wordRelation.createMany({
          data: antonyms.map((val: string) => ({
            type: 'antonym',
            value: val,
            wordId: newWord.id,
          })),
        });
      }

      // 3. Initialize SRS Review state
      await tx.review.create({
        data: {
          wordId: newWord.id,
          nextReview: BigInt(Date.now()),
          interval: 0,
          easeFactor: 2.5,
        },
      });

      const formattedResult = await tx.word.findUnique({
        where: { id: newWord.id },
        include: { relations: true, reviews: true },
      });

      return this.formatWord(formattedResult);
    });
  }

  private formatWord(word: any) {
    if (!word) return null;
    return {
      ...word,
      id: Number(word.id),
      ownerId: Number(word.ownerId),
      createdAt: Number(word.createdAt),
      updatedAt: Number(word.updatedAt),
      relations: word.relations?.map((rel: any) => ({
        ...rel,
        id: Number(rel.id),
        wordId: Number(rel.wordId),
        createdAt: Number(rel.createdAt),
        updatedAt: Number(rel.updatedAt),
      })),
      reviews: word.reviews?.map((rev: any) => ({
        ...rev,
        id: Number(rev.id),
        wordId: Number(rev.wordId),
        createdAt: Number(rev.createdAt),
        updatedAt: Number(rev.updatedAt),
        lastReviewed: rev.lastReviewed ? Number(rev.lastReviewed) : null,
        nextReview: rev.nextReview ? Number(rev.nextReview) : null,
      })),
    };
  }

  async find(userId: number, filters: any) {
    const { search, type, page, limit } = filters;
    const pageNum = parseInt(page) || 1;
    const limitNum = limit === 'all' ? undefined : (parseInt(limit) || 20);
    const skip = limitNum ? (pageNum - 1) * limitNum : undefined;

    const where: Prisma.WordWhereInput = {
      ownerId: userId,
    };

    if (search) {
      where.OR = [
        { word: { contains: search, mode: 'insensitive' } },
        { meaningVi: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    const [words, total] = await Promise.all([
      this.prisma.word.findMany({
        where,
        include: {
          relations: true,
          reviews: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      this.prisma.word.count({ where }),
    ]);

    // Format BigInt to Number or String for JSON response
    const formattedWords = words.map(w => this.formatWord(w));

    return {
      data: formattedWords,
      meta: {
        total,
        page: pageNum,
        limit: limitNum || total,
        totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
      },
    };
  }

  async findOne(userId: number, id: number) {
    const word = await this.prisma.word.findFirst({
      where: { id, ownerId: userId },
      include: {
        relations: true,
        reviews: true,
      },
    });

    if (!word) throw new NotFoundException('error.word.not_found');

    return this.formatWord(word);
  }

  async update(userId: number, id: number, data: any) {
    const { word, meaningVi, example, type } = data;

    // Normalize type if provided
    let normalizedType = type;
    if (type) {
      const validTypes = await this.getValidTypes(userId);
      normalizedType = type.toLowerCase().trim();
      if (normalizedType.includes('/') || normalizedType.includes(',')) {
        normalizedType = normalizedType.split(/[/,]/)[0].trim();
      }
      if (!validTypes.includes(normalizedType)) normalizedType = 'other';
    }

    const updateData: any = {
      updatedAt: BigInt(Date.now()),
    };
    if (word !== undefined) updateData.word = word;
    if (meaningVi !== undefined) updateData.meaningVi = meaningVi;
    if (example !== undefined) updateData.example = example;
    if (normalizedType !== undefined) updateData.type = normalizedType;

    return this.prisma.$transaction(async (tx) => {
      const updatedWord = await tx.word.updateMany({
        where: { id, ownerId: userId },
        data: updateData,
      });

      if (updatedWord.count === 0) throw new NotFoundException('error.word.not_found');

      // Update relations if provided
      if (data.synonyms !== undefined) {
        await tx.wordRelation.deleteMany({ where: { wordId: id, type: 'synonym' } });
        if (data.synonyms && data.synonyms.length > 0) {
          await tx.wordRelation.createMany({
            data: data.synonyms.map((val: string) => ({
              type: 'synonym',
              value: val,
              wordId: id,
            })),
          });
        }
      }

      if (data.antonyms !== undefined) {
        await tx.wordRelation.deleteMany({ where: { wordId: id, type: 'antonym' } });
        if (data.antonyms && data.antonyms.length > 0) {
          await tx.wordRelation.createMany({
            data: data.antonyms.map((val: string) => ({
              type: 'antonym',
              value: val,
              wordId: id,
            })),
          });
        }
      }

      const result = await tx.word.findUnique({
        where: { id },
        include: { relations: true, reviews: true },
      });

      return this.formatWord(result);
    });
  }

  async destroy(userId: number, id: number) {
    const word = await this.prisma.word.findFirst({
      where: { id, ownerId: userId },
    });

    if (!word) throw new NotFoundException('error.word.not_found');

    return this.prisma.$transaction(async (tx) => {
      await tx.wordRelation.deleteMany({ where: { wordId: id } });
      await tx.review.deleteMany({ where: { wordId: id } });
      const deleted = await tx.word.delete({ where: { id } });
      return this.formatWord(deleted);
    });
  }

  async destroyBulk(userId: number, wordIds: number[]) {
    if (!wordIds || !wordIds.length) {
      throw new BadRequestException('error.word.no_ids');
    }

    const words = await this.prisma.word.findMany({
      where: {
        id: { in: wordIds },
        ownerId: userId,
      },
      select: { id: true },
    });

    const verifiedWordIds = words.map((w) => w.id);

    if (verifiedWordIds.length > 0) {
      return this.prisma.$transaction(async (tx) => {
        await tx.wordRelation.deleteMany({ where: { wordId: { in: verifiedWordIds } } });
        await tx.review.deleteMany({ where: { wordId: { in: verifiedWordIds } } });
        const result = await tx.word.deleteMany({ where: { id: { in: verifiedWordIds } } });
        return { success: true, count: result.count };
      });
    }

    return { success: true, count: 0 };
  }

  async importBulk(userId: number, words: any[]) {
    // Process in chunks to avoid overwhelming the database connection pool
    const chunkSize = 50;
    let importedCount = 0;
    const validTypes = await this.getValidTypes(userId);

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize);
      
      const chunkPromises = chunk.map(async (data) => {
        const { word, meaningVi, example, type } = data;

        // Simple duplicate check by word for THIS user
        const existing = await this.prisma.word.findFirst({
          where: { word, ownerId: userId },
        });
        if (existing) return null;

        let normalizedType = (type || 'other').toLowerCase().trim();
        if (normalizedType.includes('/') || normalizedType.includes(',')) {
          normalizedType = normalizedType.split(/[/,]/)[0].trim();
        }
        if (!validTypes.includes(normalizedType)) normalizedType = 'other';

        return this.prisma.$transaction(async (tx) => {
          const nw = await tx.word.create({
            data: {
              word,
              meaningVi,
              example: example || '',
              type: normalizedType,
              ownerId: userId,
            },
          });

          await tx.review.create({
            data: {
              wordId: nw.id,
              nextReview: BigInt(Date.now()),
              interval: 0,
              easeFactor: 2.5,
            },
          });

          return nw;
        });
      });

      const results = await Promise.all(chunkPromises);
      importedCount += results.filter(Boolean).length;
    }

    return { imported: importedCount };
  }

  async getDashboardStats(userId: number) {
    const now = BigInt(Date.now() + 10 * 60 * 1000); // 10 min buffer for precision loss
    
    const [totalWords, dueReviewsCount, recentWords] = await Promise.all([
      this.prisma.word.count({ where: { ownerId: userId } }),
      this.prisma.review.count({
        where: {
          nextReview: { lte: now },
          word: { ownerId: userId },
        },
      }),
      this.prisma.word.findMany({
        where: { ownerId: userId },
        include: {
          relations: true,
          reviews: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 3,
      }),
    ]);

    const formattedRecentWords = recentWords.map(w => ({
      ...w,
      createdAt: Number(w.createdAt),
      updatedAt: Number(w.updatedAt),
      relations: w.relations.map(rel => ({
        ...rel,
        createdAt: Number(rel.createdAt),
        updatedAt: Number(rel.updatedAt),
      })),
      reviews: w.reviews.map(rev => ({
        ...rev,
        createdAt: Number(rev.createdAt),
        updatedAt: Number(rev.updatedAt),
        lastReviewed: rev.lastReviewed ? Number(rev.lastReviewed) : null,
        nextReview: rev.nextReview ? Number(rev.nextReview) : null,
      })),
    }));

    return {
      totalWords,
      dueReviewsCount,
      recentWords: formattedRecentWords,
    };
  }

  private async getValidTypes(userId: number): Promise<string[]> {
    return this.settingsService.getValidTypes(userId);
  }
}
