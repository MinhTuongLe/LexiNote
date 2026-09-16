import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ManagementService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getAllUsers(page = 1, limit = 10, search?: string, isActive?: boolean) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {
      role: 'MEMBER',
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
      data: users.map((u) => ({
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

    const formattedWords = words.map((w) => ({
      ...w,
      createdAt: w.createdAt.toString(),
      updatedAt: w.updatedAt.toString(),
      reviews: w.reviews.map((r) => ({
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

    words.forEach((w) => {
      w.reviews.forEach((r) => {
        totalCorrect += r.correctCount;
        totalWrong += r.wrongCount;
        totalEase += r.easeFactor;
        if (r.correctCount + r.wrongCount > 0) {
          reviewedCount += 1;
        }
      });
    });

    const totalAnswers = totalCorrect + totalWrong;
    const retentionRate =
      totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    const avgEaseFactor =
      reviewedCount > 0
        ? parseFloat((totalEase / reviewedCount).toFixed(2))
        : 2.5;

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

  async getUserSessions(userId: number) {
    const sessions = await this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((s) => ({
      ...s,
      createdAt: s.createdAt.toString(),
      expiresAt: s.expiresAt.toString(),
      isExpired: Number(s.expiresAt) < Date.now(),
    }));
  }

  async revokeSession(sessionId: number) {
    const token = await this.prisma.refreshToken.findUnique({
      where: { id: sessionId },
    });
    if (!token) return null;

    const result = await this.prisma.refreshToken.delete({
      where: { id: sessionId },
    });
    await this.auditService.logAction({
      action: 'SESSION_REVOKE',
      targetType: 'USER_SESSION',
      targetId: String(token.userId),
      details: {
        sessionId,
        ipAddress: token.ipAddress,
        userAgent: token.userAgent,
      },
    });
    return result;
  }

  async revokeAllUserSessions(userId: number) {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    await this.auditService.logAction({
      action: 'USER_REVOKE_ALL_SESSIONS',
      targetType: 'USER',
      targetId: String(userId),
      details: { revokedCount: result.count },
    });
    return result;
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });
    await this.auditService.logAction({
      action: 'USER_UPDATE',
      targetType: 'USER',
      targetId: String(id),
      details: data as Record<string, unknown>,
    });
    return updated;
  }

  async createUser(data: { fullName: string; email: string }) {
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: 'hashed_password_placeholder',
        role: 'MEMBER',
        isActive: true,
      },
    });
    await this.auditService.logAction({
      action: 'USER_CREATE',
      targetType: 'USER',
      targetId: String(user.id),
      details: { email: user.email, fullName: user.fullName },
    });
    return user;
  }

  async toggleStatus(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    await this.auditService.logAction({
      action: 'USER_TOGGLE_STATUS',
      targetType: 'USER',
      targetId: String(id),
      details: {
        previousStatus: user.isActive,
        newStatus: updated.isActive,
        email: user.email,
      },
    });

    return updated;
  }

  async toggleEmailVerified(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isEmailVerified: !user.isEmailVerified },
    });

    await this.auditService.logAction({
      action: 'USER_TOGGLE_VERIFY',
      targetType: 'USER',
      targetId: String(id),
      details: {
        previousState: user.isEmailVerified,
        newState: updated.isEmailVerified,
        email: user.email,
      },
    });

    return updated;
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user) {
      await this.prisma.archive.create({
        data: {
          originalRecord: user as unknown as Prisma.InputJsonValue,
          originalRecordId: { id },
        },
      });
    }

    const deleted = await this.prisma.user.delete({
      where: { id },
    });

    await this.auditService.logAction({
      action: 'USER_DELETE',
      targetType: 'USER',
      targetId: String(id),
      details: { email: user?.email },
    });

    return deleted;
  }
}
