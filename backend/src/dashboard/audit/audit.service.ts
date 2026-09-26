import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreateAuditLogDto {
  actorId?: number;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

interface ArchivedWordPayload {
  word: string;
  meaningVi: string;
  example?: string;
  type?: string;
  ownerId: number;
}

interface ArchivedUserPayload {
  email: string;
  password?: string;
  fullName: string;
  avatar?: string;
  role?: Prisma.UserCreateInput['role'];
  isActive?: boolean;
  isEmailVerified?: boolean;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(dto: CreateAuditLogDto) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          actorId: dto.actorId,
          actorEmail: dto.actorEmail,
          action: dto.action,
          targetType: dto.targetType,
          targetId: dto.targetId ? String(dto.targetId) : null,
          details: (dto.details as Prisma.InputJsonValue) ?? {},
          ipAddress: dto.ipAddress || '127.0.0.1',
        },
      });
    } catch (e) {
      console.error('Failed to log audit event:', e);
    }
  }

  async getAuditLogs(
    page = 1,
    limit = 20,
    search?: string,
    action?: string,
    targetType?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.AuditLogWhereInput = {};

    if (search) {
      where.OR = [
        { actorEmail: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { targetId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (action && action !== 'ALL') {
      where.action = action;
    }

    if (targetType && targetType !== 'ALL') {
      where.targetType = targetType;
    }

    try {
      const [logs, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.auditLog.count({ where }),
      ]);

      return {
        data: logs.map((l) => ({
          ...l,
          createdAt: l.createdAt
            ? l.createdAt.toString()
            : Date.now().toString(),
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch {
      // Fallback empty if table query fails
    }

    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    };
  }

  async exportAuditLogs(search?: string, action?: string) {
    const where: Prisma.AuditLogWhereInput = {};
    if (search) {
      where.OR = [
        { actorEmail: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { targetId: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (action && action !== 'ALL') where.action = action;

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((log) => ({
      id: log.id,
      actorId: log.actorId,
      actorEmail: log.actorEmail,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      details: log.details,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt
        ? new Date(Number(log.createdAt)).toISOString()
        : null,
    }));
  }

  async getArchiveLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [archives, total] = await Promise.all([
      this.prisma.archive.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.archive.count(),
    ]);

    return {
      data: archives.map((a) => ({
        ...a,
        createdAt: a.createdAt ? a.createdAt.toString() : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async restoreArchiveRecord(archiveId: number) {
    const record = await this.prisma.archive.findUnique({
      where: { id: archiveId },
    });
    if (!record || !record.originalRecord) return null;

    const rawData = record.originalRecord;
    const model = record.fromModel;

    if (model === 'Word') {
      const wordData = rawData as unknown as ArchivedWordPayload;
      await this.prisma.word.create({
        data: {
          word: wordData.word,
          meaningVi: wordData.meaningVi,
          example: wordData.example,
          type: wordData.type || 'noun',
          ownerId: wordData.ownerId,
        },
      });
    } else if (model === 'User') {
      const userData = rawData as unknown as ArchivedUserPayload;
      await this.prisma.user.create({
        data: {
          email: userData.email,
          password: userData.password || 'restored_password_placeholder',
          fullName: userData.fullName,
          avatar: userData.avatar,
          role: userData.role || 'MEMBER',
          isActive: userData.isActive ?? true,
          isEmailVerified: userData.isEmailVerified ?? false,
        },
      });
    }

    await this.prisma.archive.delete({ where: { id: archiveId } });

    await this.logAction({
      action: 'ARCHIVE_RESTORE',
      targetType: model ? model.toUpperCase() : 'UNKNOWN',
      targetId: String(archiveId),
      details: {
        fromModel: model,
        originalRecord: rawData as Record<string, unknown>,
      },
    });

    return { success: true, restoredModel: model };
  }

  async deleteArchiveRecord(archiveId: number) {
    const deleted = await this.prisma.archive.delete({
      where: { id: archiveId },
    });
    await this.logAction({
      action: 'ARCHIVE_PERMANENT_DELETE',
      targetType: 'ARCHIVE',
      targetId: String(archiveId),
    });
    return deleted;
  }
}
