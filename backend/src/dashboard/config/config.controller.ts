import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { DashboardConfigService } from './config.service';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboard Config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('config')
export class DashboardConfigController {
  constructor(private readonly configService: DashboardConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get current system configuration' })
  getConfig() {
    return this.configService.getSystemConfig();
  }

  @Patch()
  @ApiOperation({ summary: 'Update system parameters' })
  updateConfig(@Body() body: any) {
    return this.configService.updateConfig(body);
  }
}
