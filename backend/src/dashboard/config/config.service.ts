import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DashboardConfigService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async getSystemConfig() {
    const dbStatus = await this.checkDbHealth();
    
    return {
      infrastructure: {
        baseUrl: this.configService.get('API_BASE_URL') || 'http://localhost:1337/api',
        environment: this.configService.get('NODE_ENV') || 'development',
        gzip: true,
        version: '1.0.4-node_alpha'
      },
      security: {
        rateLimit: 1000,
        cors: this.configService.get('ALLOWED_ORIGINS')?.split(',') || [],
        jwtExpires: '7d'
      },
      database: {
        status: dbStatus ? 'Operational' : 'Disrupted',
        shards: 1,
        activeConnections: Math.floor(Math.random() * 5) + 1, // Mocking
      }
    };
  }

  async updateConfig(data: any) {
    // In a real app, update environment variables or persist to a settings table
    console.log('Updating system config:', data);
    return { success: true, updated: data };
  }

  private async checkDbHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
