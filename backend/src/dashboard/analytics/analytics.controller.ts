import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Get weekly creation activity' })
  getChart() {
    return this.analyticsService.getTrafficStats();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent system activity' })
  getActivity() {
    return this.analyticsService.getRecentActivity();
  }
}
