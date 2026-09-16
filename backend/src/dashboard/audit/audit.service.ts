import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateAuditLogDto {
  actorId?: number;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(dto: CreateAuditLogDto) {
    try {
      if ((this.prisma as any).auditLog) {
        return await (this.prisma as any).auditLog.create({
          data: {
            actorId: dto.actorId,
            actorEmail: dto.actorEmail,
            action: dto.action,
            targetType: dto.targetType,
            targetId: dto.targetId ? String(dto.targetId) : null,
            details: dto.details ?? {},
            ipAddress: dto.ipAddress || '127.0.0.1',
          },
        });
      }
    } catch (e) {
      console.error('Failed to log audit event:', e);
    }
  }

  async getAuditLogs(page = 1, limit = 20, search?: string, action?: string, targetType?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

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
      if ((this.prisma as any).auditLog) {
        const [logs, total] = await Promise.all([
          (this.prisma as any).auditLog.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
          }),
          (this.prisma as any).auditLog.count({ where }),
        ]);

        return {
          data: logs.map((l: any) => ({
            ...l,
            createdAt: l.createdAt ? l.createdAt.toString() : Date.now().toString(),
          })),
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      }
    } catch (e) {
      // Fallback empty if table not migrated yet
    }

    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
    };
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
      data: archives.map(a => ({
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
    const record = await this.prisma.archive.findUnique({ where: { id: archiveId } });
    if (!record || !record.originalRecord) return null;

    const data: any = record.originalRecord;
    const model = record.fromModel;

    if (model === 'Word') {
      await this.prisma.word.create({
        data: {
          word: data.word,
          meaningVi: data.meaningVi,
          example: data.example,
          type: data.type || 'noun',
          ownerId: data.ownerId,
        },
      });
    } else if (model === 'User') {
      await this.prisma.user.create({
        data: {
          email: data.email,
          password: data.password || 'restored_password_placeholder',
          fullName: data.fullName,
          avatar: data.avatar,
          role: data.role || 'MEMBER',
          isActive: data.isActive ?? true,
          isEmailVerified: data.isEmailVerified ?? false,
        },
      });
    }

    await this.prisma.archive.delete({ where: { id: archiveId } });

    await this.logAction({
      action: 'ARCHIVE_RESTORE',
      targetType: model ? model.toUpperCase() : 'UNKNOWN',
      targetId: String(archiveId),
      details: { fromModel: model, originalRecord: data },
    });

    return { success: true, restoredModel: model };
  }

  async deleteArchiveRecord(archiveId: number) {
    const deleted = await this.prisma.archive.delete({ where: { id: archiveId } });
    await this.logAction({
      action: 'ARCHIVE_PERMANENT_DELETE',
      targetType: 'ARCHIVE',
      targetId: String(archiveId),
    });
    return deleted;
  }
}
