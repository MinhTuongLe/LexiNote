import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BatchApproveDto } from './dto/batch-approve.dto';
import { ModerationQueryDto } from './dto/moderation-query.dto';
import { ModerationService } from './moderation.service';

@ApiTags('Dashboard Moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get words pending moderation' })
  getPending(@Query() query: ModerationQueryDto) {
    return this.moderationService.getPending(query);
  }

  @Post('batch-approve')
  @ApiOperation({ summary: 'Approve words in bulk' })
  batchApprove(@Body() body: BatchApproveDto) {
    return this.moderationService.batchApprove(body.wordIds);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a moderated word' })
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.moderationService.approve(id);
  }
}
