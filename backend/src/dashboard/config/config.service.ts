import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DashboardConfigService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getSystemConfig() {
    const database = await this.getDatabaseMetrics();
    const config = await this.getOrCreateConfig();

    return {
      isMaintenanceMode: config.isMaintenanceMode,
      isRegistrationOpen: config.isRegistrationOpen,
      config: {
        isMaintenanceMode: config.isMaintenanceMode,
        isRegistrationOpen: config.isRegistrationOpen,
        rateLimit: config.rateLimit,
        corsEnabled: config.corsEnabled,
        autoBackup: config.autoBackup,
        debugMode: config.debugMode,
      },
      infrastructure: {
        baseUrl:
          this.configService.get<string>('API_BASE_URL') ||
          'http://localhost:1337/api',
        environment:
          this.configService.get<string>('NODE_ENV') || 'development',
        gzip: true,
        version: '1.0.4-node_alpha',
      },
      security: {
        rateLimit: config.rateLimit,
        cors:
          this.configService.get<string>('ALLOWED_ORIGINS')?.split(',') || [],
        corsEnabled: config.corsEnabled,
        autoBackup: config.autoBackup,
        debugMode: config.debugMode,
        jwtExpires: '7d',
      },
      database,
    };
  }

  async updateConfig(data: Record<string, unknown>) {
    const current = await this.getOrCreateConfig();
    const next = await (this.prisma as any).systemConfig.update({
      where: { id: current.id },
      data: {
        isMaintenanceMode:
          typeof data.isMaintenanceMode === 'boolean'
            ? data.isMaintenanceMode
            : current.isMaintenanceMode,
        isRegistrationOpen:
          typeof data.isRegistrationOpen === 'boolean'
            ? data.isRegistrationOpen
            : current.isRegistrationOpen,
        rateLimit:
          typeof data.rateLimit === 'number' && data.rateLimit > 0
            ? Math.floor(data.rateLimit)
            : current.rateLimit,
        corsEnabled:
          typeof data.corsEnabled === 'boolean'
            ? data.corsEnabled
            : current.corsEnabled,
        autoBackup:
          typeof data.autoBackup === 'boolean'
            ? data.autoBackup
            : current.autoBackup,
        debugMode:
          typeof data.debugMode === 'boolean'
            ? data.debugMode
            : current.debugMode,
        updatedAt: BigInt(Date.now()),
      },
    });

    return {
      success: true,
      message: 'System configuration updated successfully.',
      config: this.serializeConfig(next),
    };
  }

  async getFlags() {
    const config = await this.getOrCreateConfig();
    return {
      isMaintenanceMode: config.isMaintenanceMode,
      isRegistrationOpen: config.isRegistrationOpen,
    };
  }

  async purgeExpiredTokens() {
    const result = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: BigInt(Date.now()) } },
    });
    return {
      success: true,
      deletedCount: result.count,
      message: `Purged ${result.count} expired refresh tokens from the database.`,
    };
  }

  async cleanOrphanedRecords() {
    const wordRows = await this.prisma.word.findMany({ select: { id: true } });
    const wordIds = wordRows.map((word) => word.id);
    const [relations, reviews] = await this.prisma.$transaction([
      wordIds.length
        ? this.prisma.wordRelation.deleteMany({
            where: { wordId: { notIn: wordIds } },
          })
        : this.prisma.wordRelation.deleteMany(),
      wordIds.length
        ? this.prisma.review.deleteMany({
            where: { wordId: { notIn: wordIds } },
          })
        : this.prisma.review.deleteMany(),
    ]);

    return {
      success: true,
      cleanedRelationsCount: relations.count,
      cleanedReviewsCount: reviews.count,
      message: 'Orphaned relation records cleaned successfully.',
    };
  }

  private async getOrCreateConfig() {
    return (this.prisma as any).systemConfig.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    });
  }

  private serializeConfig(config: {
    isMaintenanceMode: boolean;
    isRegistrationOpen: boolean;
    rateLimit: number;
    corsEnabled: boolean;
    autoBackup: boolean;
    debugMode: boolean;
  }) {
    return {
      isMaintenanceMode: config.isMaintenanceMode,
      isRegistrationOpen: config.isRegistrationOpen,
      rateLimit: config.rateLimit,
      corsEnabled: config.corsEnabled,
      autoBackup: config.autoBackup,
      debugMode: config.debugMode,
    };
  }

  private async checkDbHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async getDatabaseMetrics() {
    try {
      const [sizeRows, connectionRows] = await Promise.all([
        this.prisma.$queryRaw<Array<{ size_bytes: bigint }>>`
          SELECT pg_database_size(current_database()) AS size_bytes
        `,
        this.prisma.$queryRaw<Array<{ active_connections: bigint }>>`
          SELECT count(*) AS active_connections
          FROM pg_stat_activity
          WHERE datname = current_database()
        `,
      ]);
      return {
        status: 'Operational',
        shards: 1,
        activeConnections: Number(connectionRows[0]?.active_connections || 0),
        sizeMb: Number(
          (Number(sizeRows[0]?.size_bytes || 0n) / 1024 / 1024).toFixed(1),
        ),
      };
    } catch {
      return {
        status: 'Disrupted',
        shards: 1,
        activeConnections: 0,
        sizeMb: 0,
      };
    }
  }
}
