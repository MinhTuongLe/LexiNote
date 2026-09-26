import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { toCsv } from '../../common/export/csv.util';
import { AnalyticsExportQueryDto } from './dto/analytics-export-query.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@ApiTags('Dashboard Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get main dashboard stats' })
  getSummary() {
    return this.analyticsService.getSummary();
  }

  @Get('chart')
  @ApiOperation({ summary: 'Get usage chart data' })
  getChart(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getTrafficStats(
      query.range,
      query.startDate,
      query.endDate,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export analytics report' })
  async exportChart(
    @Query() query: AnalyticsExportQueryDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const points = await this.analyticsService.getTrafficStats(
      query.range,
      query.startDate,
      query.endDate,
    );
    response.header('Content-Type', 'text/csv; charset=utf-8');
    response.header(
      'Content-Disposition',
      `attachment; filename="lexinote_export_analytics_${Date.now()}.csv"`,
    );
    return toCsv(['date', 'activeUsers', 'newWords', 'reviewsCount'], points);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent system activity' })
  getActivity() {
    return this.analyticsService.getRecentActivity();
  }
}
