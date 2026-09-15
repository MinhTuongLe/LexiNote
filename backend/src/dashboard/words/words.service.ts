import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardWordsService {
  constructor(private prisma: PrismaService) {}

  async getAllWords(page = 1, limit = 20, search?: string, type?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { word: { contains: search, mode: 'insensitive' } },
        { meaningVi: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const [words, total] = await Promise.all([
      this.prisma.word.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: { fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.word.count({ where }),
    ]);

    return {
      data: words.map(w => ({
        ...w,
        createdAt: w.createdAt.toString(),
        updatedAt: w.updatedAt.toString(),
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
    // Audit trace should happen here in a real scenario
    return this.prisma.word.delete({
      where: { id },
    });
  }

  async updateWord(id: number, data: any) {
    return this.prisma.word.update({
      where: { id },
      data: {
        meaningVi: data.meaningVi,
        type: data.type,
      },
    });
  }
}
