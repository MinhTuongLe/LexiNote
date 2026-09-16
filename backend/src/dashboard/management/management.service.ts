import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ManagementService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(page = 1, limit = 10, search?: string, isActive?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = {
      role: 'MEMBER'
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          avatar: true,
          _count: {
            select: { words: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(u => ({
        ...u,
        createdAt: u.createdAt.toString(),
        wordCount: u._count.words,
        _count: undefined,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
        status: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      createdAt: user.createdAt.toString(),
      updatedAt: user.updatedAt ? user.updatedAt.toString() : null,
    };
  }

  async getUserDetails(id: number) {
    const user = await this.findOne(id);
    if (!user) return null;

    const words = await this.prisma.word.findMany({
      where: { ownerId: id },
      include: {
        reviews: true,
        relations: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedWords = words.map(w => ({
      ...w,
      createdAt: w.createdAt.toString(),
      updatedAt: w.updatedAt.toString(),
      reviews: w.reviews.map(r => ({
        ...r,
        lastReviewed: r.lastReviewed ? r.lastReviewed.toString() : null,
        nextReview: r.nextReview.toString(),
        createdAt: r.createdAt.toString(),
        updatedAt: r.updatedAt.toString(),
      })),
    }));

    // SRS analytics summary for this user
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalEase = 0;
    let reviewedCount = 0;

    words.forEach(w => {
      w.reviews.forEach(r => {
        totalCorrect += r.correctCount;
        totalWrong += r.wrongCount;
        totalEase += r.easeFactor;
        if (r.correctCount + r.wrongCount > 0) {
          reviewedCount += 1;
        }
      });
    });

    const totalAnswers = totalCorrect + totalWrong;
    const retentionRate = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    const avgEaseFactor = reviewedCount > 0 ? parseFloat((totalEase / reviewedCount).toFixed(2)) : 2.5;

    return {
      user,
      stats: {
        totalWords: words.length,
        totalReviewed: reviewedCount,
        totalCorrect,
        totalWrong,
        retentionRate,
        avgEaseFactor,
      },
      words: formattedWords,
    };
  }

  async update(id: number, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async createUser(data: any) {
    return this.prisma.user.create({
      data: {
        ...data,
        password: 'hashed_password_placeholder',
        role: 'MEMBER',
        isActive: true,
      },
    });
  }

  async toggleStatus(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
  }

  async toggleEmailVerified(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    return this.prisma.user.update({
      where: { id },
      data: { isEmailVerified: !user.isEmailVerified },
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
