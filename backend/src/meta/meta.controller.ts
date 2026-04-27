import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WordService } from '../word/word.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Meta')
@Controller() // Under /api prefix -> /api
export class MetaController {
  constructor(private readonly wordService: WordService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  health() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats' })
  async getDashboardStats(@Request() req: any) {
    return this.wordService.getDashboardStats(req.user.userId);
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('seed-stats')
  @ApiOperation({ summary: 'Seed fake stats data for user' })
  async seedStats(@Request() req: any) {
    return this.wordService.seedStatsData(req.user.userId);
  }
}
