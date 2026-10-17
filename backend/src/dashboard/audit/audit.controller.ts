import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { toCsv } from '../../common/export/csv.util';
import { ExportAuditQueryDto } from './dto/export-audit-query.dto';
import {
  AuditListQueryDto,
  ArchiveListQueryDto,
} from './dto/audit-list-query.dto';

@ApiTags('Dashboard Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs/export')
  @ApiOperation({ summary: 'Export system audit logs' })
  async exportLogs(
    @Query() query: ExportAuditQueryDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const logs = await this.auditService.exportAuditLogs(
      query.search,
      query.action,
      query.targetType,
    );
    response.header('Content-Type', 'text/csv; charset=utf-8');
    response.header(
      'Content-Disposition',
      `attachment; filename="lexinote_export_audit_${Date.now()}.csv"`,
    );
    return toCsv(
      [
        'id',
        'actorId',
        'actorEmail',
        'action',
        'targetType',
        'targetId',
        'details',
        'ipAddress',
        'createdAt',
      ],
      logs,
    );
  }

  @Get('archives/export')
  @ApiOperation({ summary: 'Export archived database records' })
  async exportArchives(@Res({ passthrough: true }) response: FastifyReply) {
    const archives = await this.auditService.exportArchiveLogs();
    response.header('Content-Type', 'text/csv; charset=utf-8');
    response.header(
      'Content-Disposition',
      `attachment; filename="lexinote_export_archives_${Date.now()}.csv"`,
    );
    return toCsv(
      ['id', 'fromModel', 'originalRecordId', 'originalRecord', 'createdAt'],
      archives,
    );
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get system audit trail logs' })
  async getAuditLogs(@Query() query: AuditListQueryDto) {
    return this.auditService.getAuditLogs(
      query.page,
      query.limit,
      query.search,
      query.action,
      query.targetType,
    );
  }

  @Get('archives')
  @ApiOperation({ summary: 'Get archived database records' })
  async getArchiveLogs(@Query() query: ArchiveListQueryDto) {
    return this.auditService.getArchiveLogs(query.page, query.limit);
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
