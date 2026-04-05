import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { WordService } from './word.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';

@ApiTags('Words')
@Controller('words') // Under /api prefix -> /api/words
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new word' })
  async create(@Request() req: any, @Body() body: CreateWordDto) {
    return this.wordService.create(req.user.userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List all words for current user' })
  async find(@Request() req: any, @Query() query: any) {
    return this.wordService.find(req.user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single word detail' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.wordService.findOne(req.user.userId, parseInt(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a word' })
  async update(@Request() req: any, @Param('id') id: string, @Body() body: UpdateWordDto) {
    return this.wordService.update(req.user.userId, parseInt(id), body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a word' })
  async destroy(@Request() req: any, @Param('id') id: string) {
    return this.wordService.destroy(req.user.userId, parseInt(id));
  }

  @Post('delete-bulk')
  @ApiOperation({ summary: 'Bulk delete words' })
  async destroyBulk(@Request() req: any, @Body('wordIds') wordIds: number[]) {
    return this.wordService.destroyBulk(req.user.userId, wordIds);
  }

  @Post('import')
  @ApiOperation({ summary: 'Bulk import words' })
  async importBulk(@Request() req: any, @Body('words') words: any[]) {
    return this.wordService.importBulk(req.user.userId, words);
  }
}
