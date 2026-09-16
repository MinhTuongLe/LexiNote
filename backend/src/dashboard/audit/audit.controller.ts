import { Controller, Get, Post, Delete, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboard Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Get system audit trail logs' })
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
  ) {
    return this.auditService.getAuditLogs(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      action,
      targetType,
    );
  }

  @Get('archives')
  @ApiOperation({ summary: 'Get archived database records' })
  async getArchiveLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getArchiveLogs(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post('archives/:id/restore')
  @ApiOperation({ summary: 'Restore archived record back to live database' })
  async restoreArchive(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.restoreArchiveRecord(id);
  }

  @Delete('archives/:id')
  @ApiOperation({ summary: 'Permanently delete archived record' })
  async deleteArchive(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.deleteArchiveRecord(id);
  }
}
