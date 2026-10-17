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

  async importToLibrary(
    deckId: number,
    userId: number,
    selectedWords?: string[],
  ) {
    const deck = await (this.prisma as any).deck.findUnique({
      where: { id: deckId },
      include: { words: true },
    });
    if (!deck) throw new NotFoundException('Deck not found.');

    const normalizedSelection = selectedWords?.map((word) =>
      word.toLowerCase(),
    );
    const words = normalizedSelection?.length
      ? deck.words.filter((word: any) =>
          normalizedSelection.includes(word.word.toLowerCase()),
        )
      : deck.words;

    const requestedWords = words.map((deckWord: any) => deckWord.word);
    const existingWords = await this.prisma.word.findMany({
      where: { ownerId: userId, word: { in: requestedWords } },
      select: { word: true },
    });
    const existingWordSet = new Set(existingWords.map(({ word }) => word));
    const wordsToImport = words.filter(
      (deckWord: any) => !existingWordSet.has(deckWord.word),
    );

    const result = await this.prisma.$transaction(async (tx) => {
      if (wordsToImport.length === 0) {
        return { importedCount: 0, skippedCount: words.length };
      }

      const created = await (tx as any).word.createManyAndReturn({
        data: wordsToImport.map((deckWord: any) => ({
          word: deckWord.word,
          meaningVi: deckWord.meaningVi,
          type: deckWord.type,
          phonetic: deckWord.phonetic,
          example: deckWord.example,
          audioUrl: deckWord.audioUrl,
          ownerId: userId,
        })),
        select: { id: true },
      });
      await tx.review.createMany({
        data: created.map(({ id }: { id: number }) => ({
          wordId: id,
          nextReview: BigInt(Date.now()),
        })),
      });
      return {
        importedCount: created.length,
        skippedCount: words.length - created.length,
      };
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

  async update(id: number, data: Partial<CreateDeckDto>) {
    const existing = await (this.prisma as any).deck.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Deck not found.');

    const updated = await this.prisma.$transaction(async (tx) => {
      if (data.words) {
        await (tx as any).deckWord.deleteMany({ where: { deckId: id } });
      }
      return (tx as any).deck.update({
        where: { id },
        data: {
          ...(data.title !== undefined ? { title: data.title.trim() } : {}),
          ...(data.description !== undefined
            ? { description: data.description?.trim() || null }
            : {}),
          ...(data.category !== undefined ? { category: data.category } : {}),
          ...(data.level !== undefined ? { level: data.level } : {}),
          ...(data.coverImage !== undefined
            ? { coverImage: data.coverImage || null }
            : {}),
          ...(data.words
            ? {
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
              }
            : {}),
        },
        include: { words: true },
      });
    });
    return { success: true, data: updated };
  }

  async remove(id: number) {
    const existing = await (this.prisma as any).deck.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Deck not found.');
    await (this.prisma as any).deck.delete({ where: { id } });
    return { success: true, id };
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
