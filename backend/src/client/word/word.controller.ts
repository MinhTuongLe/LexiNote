import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WordService } from './word.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { AiExtractDto } from './dto/ai-extract.dto';
import { WordQueryDto } from './dto/word-query.dto';
import {
  BulkDeleteWordsDto,
  BulkImportWordsDto,
} from './dto/bulk-word-actions.dto';
import { ParseIntPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Words')
@Controller('words') // Under /api prefix -> /api/words
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Post('ai-extract')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Extract vocabulary from English text' })
  async aiExtract(@Body() body: AiExtractDto) {
    return this.wordService.extractVocabulary(body.text, body.maxWords);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new word' })
  async create(@Request() req: any, @Body() body: CreateWordDto) {
    return this.wordService.create(req.user.userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List all words for current user' })
  async find(@Request() req: any, @Query() query: WordQueryDto) {
    return this.wordService.find(req.user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single word detail' })
  async findOne(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.wordService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a word' })
  async update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateWordDto,
  ) {
    return this.wordService.update(req.user.userId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a word' })
  async destroy(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.wordService.destroy(req.user.userId, id);
  }

  @Post('delete-bulk')
  @ApiOperation({ summary: 'Bulk delete words' })
  async destroyBulk(@Request() req: any, @Body() body: BulkDeleteWordsDto) {
    return this.wordService.destroyBulk(req.user.userId, body.wordIds);
  }

  @Post('import')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Bulk import words' })
  async importBulk(@Request() req: any, @Body() body: BulkImportWordsDto) {
    return this.wordService.importBulk(req.user.userId, body.words);
  }
}
