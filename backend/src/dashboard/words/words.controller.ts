import {
  Controller,
  Get,
  Delete,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { toCsv } from '../../common/export/csv.util';
import { DashboardWordsService } from './words.service';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExportWordsQueryDto } from './dto/export-words-query.dto';
import { ImportWordsDto } from './dto/import-words.dto';

@ApiTags('Dashboard Words')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('words')
export class DashboardWordsController {
  constructor(private readonly wordsService: DashboardWordsService) {}

  @Post('import')
  @ApiOperation({ summary: 'Import glossary words for moderation' })
  async importWords(
    @Req() req: { user: { id: number } },
    @Body() body: ImportWordsDto,
  ) {
    return this.wordsService.importWords(req.user.id, body);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export glossary items' })
  async exportWords(
    @Query() query: ExportWordsQueryDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const words = await this.wordsService.exportWords(query.search, query.type);
    if (query.format === 'json') return words;

    response.header('Content-Type', 'text/csv; charset=utf-8');
    response.header(
      'Content-Disposition',
      `attachment; filename="lexinote_export_words_${Date.now()}.csv"`,
    );
    return toCsv(
      [
        'id',
        'word',
        'meaningVi',
        'example',
        'type',
        'moderationStatus',
        'flagReason',
        'createdAt',
        'ownerId',
        'ownerName',
        'ownerEmail',
      ],
      words.map((word) => ({
        id: word.id,
        word: word.word,
        meaningVi: word.meaningVi,
        example: word.example,
        type: word.type,
        moderationStatus: word.moderationStatus,
        flagReason: word.flagReason,
        createdAt: word.createdAt,
        ownerId: word.ownerId,
        ownerName: word.ownerName,
        ownerEmail: word.ownerEmail,
      })),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all glossary items' })
  async getWords(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.wordsService.getAllWords(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      type,
      ownerId ? parseInt(ownerId) : undefined,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update word details' })
  async updateWord(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { meaningVi?: string; type?: string; example?: string },
  ) {
    return this.wordsService.updateWord(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a word from global registry' })
  async deleteWord(@Param('id', ParseIntPipe) id: number) {
    return this.wordsService.deleteWord(id);
  }

  @Post(':id/relations')
  @ApiOperation({
    summary: 'Add a relation (synonym/antonym/collocation) to a word',
  })
  async addRelation(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { type: string; value: string },
  ) {
    return this.wordsService.addRelation(id, body.type, body.value);
  }

  @Delete('relations/:relationId')
  @ApiOperation({ summary: 'Delete a word relation' })
  async deleteRelation(@Param('relationId', ParseIntPipe) relationId: number) {
    return this.wordsService.deleteRelation(relationId);
  }
}
