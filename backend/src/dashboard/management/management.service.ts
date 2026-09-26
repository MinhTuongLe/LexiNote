import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../../common/mail/mail.service';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ManagementService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private mailService: MailService,
  ) {}

  async getAllUsers(page = 1, limit = 10, search?: string, isActive?: boolean) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};

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

  async exportUsers(isActive?: boolean, role?: Role) {
    const where: Prisma.UserWhereInput = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (role) where.role = role;

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        words: {
          select: {
            reviews: {
              select: { correctCount: true, wrongCount: true },
            },
          },
        },
      },
    });

    return users.map((user) => {
      const totalReviews = user.words.reduce(
        (total, word) =>
          total +
          word.reviews.reduce(
            (wordTotal, review) =>
              wordTotal + review.correctCount + review.wrongCount,
            0,
          ),
        0,
      );

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: new Date(Number(user.createdAt)).toISOString(),
        wordCount: user.words.length,
        reviewsCount: totalReviews,
      };
    });
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
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const result = await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    await this.auditService.logAction({
      action: 'USER_REVOKE_ALL_SESSIONS',
      targetType: 'USER',
      targetId: String(userId),
      details: { revokedCount: result.count },
    });
    if (user) {
      await this.mailService.sendSessionsRevokedNotification(
        user.email,
        user.fullName,
      );
    }
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

  async createUser(data: {
    fullName: string;
    email: string;
    password?: string;
    role?: Role;
  }) {
    const rawPassword = data.password || '123456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const user = await this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'MEMBER',
        isActive: true,
        isEmailVerified: true,
      },
    });

    await this.auditService.logAction({
      action: 'USER_CREATE',
      targetType: 'USER',
      targetId: String(user.id),
      details: { email: user.email, fullName: user.fullName, role: user.role },
    });

    // Send Welcome Email with default credentials to new user
    await this.mailService.sendWelcomeNewUserEmail(
      user.email,
      user.fullName,
      rawPassword,
    );

    return user;
  }

  async resetPassword(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const defaultPassword = '123456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Update password
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Revoke all active sessions / refresh tokens
    const revoked = await this.prisma.refreshToken.deleteMany({
      where: { userId: id },
    });

    await this.auditService.logAction({
      action: 'USER_RESET_PASSWORD',
      targetType: 'USER',
      targetId: String(id),
      details: {
        email: user.email,
        defaultPasswordSet: true,
        revokedSessionsCount: revoked.count,
      },
    });

    // Send email notification to user
    await this.mailService.sendAdminPasswordResetNotification(
      user.email,
      user.fullName,
      defaultPassword,
    );

    return {
      message:
        'Password reset successfully to default (123456). Active sessions revoked.',
      defaultPassword,
      revokedSessionsCount: revoked.count,
    };
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

    // Send status change email notification
    await this.mailService.sendAccountStatusChangedNotification(
      updated.email,
      updated.fullName,
      updated.isActive,
    );

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

    if (user) {
      await this.mailService.sendAccountDeletedNotification(
        user.email,
        user.fullName,
      );
    }

    return deleted;
  }

  async updateUserRole(id: number, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    await this.auditService.logAction({
      action: 'USER_UPDATE_ROLE',
      targetType: 'USER',
      targetId: String(id),
      details: {
        previousRole: user.role,
        newRole: updated.role,
        email: user.email,
      },
    });

    await this.mailService.sendUserRoleUpdatedNotification(
      updated.email,
      updated.fullName,
      updated.role,
    );

    return updated;
  }

  getMailPreview(type: string, fullName?: string, sampleCodeOrPass?: string) {
    return this.mailService.getTemplatePreview(
      type,
      fullName,
      sampleCodeOrPass,
    );
  }
}
