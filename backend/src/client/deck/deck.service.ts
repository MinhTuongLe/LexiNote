import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeckDto } from '../../dashboard/decks/dto/create-deck.dto';

@Injectable()
export class DeckService {
  constructor(private readonly prisma: PrismaService) {}

  async listCurated(category?: string, search?: string) {
    const decks = await (this.prisma as any).deck.findMany({
      where: {
        isCurated: true,
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { _count: { select: { words: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: decks.map((deck: any) => this.serializeSummary(deck)),
    };
  }

  async getById(id: number) {
    const deck = await (this.prisma as any).deck.findUnique({
      where: { id },
      include: { words: { orderBy: { word: 'asc' } } },
    });
    if (!deck) throw new NotFoundException('Deck not found.');

    return {
      success: true,
      data: {
        id: deck.id,
        title: deck.title,
        description: deck.description,
        category: deck.category,
        level: deck.level,
        coverImage: deck.coverImage,
        isCurated: deck.isCurated,
        words: deck.words.map((word: any) => ({
          word: word.word,
          meaningVi: word.meaningVi,
          type: word.type,
          phonetic: word.phonetic,
          example: word.example,
          audioUrl: word.audioUrl,
        })),
      },
    };
  }

  async importToLibrary(deckId: number, userId: number, selectedWords?: string[]) {
    const deck = await (this.prisma as any).deck.findUnique({
      where: { id: deckId },
      include: { words: true },
    });
    if (!deck) throw new NotFoundException('Deck not found.');

    const normalizedSelection = selectedWords?.map((word) => word.toLowerCase());
    const words = normalizedSelection?.length
      ? deck.words.filter((word: any) =>
          normalizedSelection.includes(word.word.toLowerCase()),
        )
      : deck.words;

    const result = await this.prisma.$transaction(async (tx) => {
      let importedCount = 0;
      let skippedCount = 0;
      for (const deckWord of words) {
        const existing = await tx.word.findUnique({
          where: { word_ownerId: { word: deckWord.word, ownerId: userId } },
        });
        if (existing) {
          skippedCount += 1;
          continue;
        }
        const created = await tx.word.create({
          data: {
            word: deckWord.word,
            meaningVi: deckWord.meaningVi,
            type: deckWord.type,
            phonetic: deckWord.phonetic,
            example: deckWord.example,
            audioUrl: deckWord.audioUrl,
            ownerId: userId,
          },
        });
        await tx.review.create({
          data: { wordId: created.id, nextReview: BigInt(Date.now()) },
        });
        importedCount += 1;
      }
      return { importedCount, skippedCount };
    });

    return {
      success: true,
      ...result,
      message: `Successfully imported ${result.importedCount} words to your vocabulary library.`,
    };
  }

  async create(data: CreateDeckDto, creatorId: number) {
    const deck = await (this.prisma as any).deck.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim(),
        category: data.category || 'GENERAL',
        level: data.level || 'Intermediate',
        coverImage: data.coverImage || null,
        isCurated: true,
        creatorId,
        words: {
          create: data.words.map((word) => ({
            word: word.word.trim(),
            meaningVi: word.meaningVi.trim(),
            type: word.type || 'noun',
            phonetic: word.phonetic,
            example: word.example,
            audioUrl: word.audioUrl,
          })),
        },
      },
      include: { words: true },
    });
    return {
      success: true,
      data: {
        ...deck,
        createdAt: Number(deck.createdAt),
        updatedAt: Number(deck.updatedAt),
        words: deck.words,
      },
    };
  }

  private serializeSummary(deck: {
    id: number;
    title: string;
    description: string | null;
    category: string;
    level: string | null;
    coverImage: string | null;
    isCurated: boolean;
    _count: { words: number };
  }) {
    return {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      category: deck.category,
      level: deck.level,
      coverImage: deck.coverImage,
      wordCount: deck._count.words,
      isCurated: deck.isCurated,
    };
  }
}
