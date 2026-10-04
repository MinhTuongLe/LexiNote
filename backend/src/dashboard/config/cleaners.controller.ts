import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DashboardConfigService } from './config.service';

@ApiTags('Dashboard Cleaners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('cleaners')
export class CleanersController {
  constructor(private readonly configService: DashboardConfigService) {}

  @Post('expired-tokens')
  @ApiOperation({ summary: 'Purge expired refresh tokens' })
  purgeExpiredTokens() {
    return this.configService.purgeExpiredTokens();
  }

  @Post('orphaned-records')
  @ApiOperation({ summary: 'Clean orphaned relation and review records' })
  cleanOrphanedRecords() {
    return this.configService.cleanOrphanedRecords();
  }
}
