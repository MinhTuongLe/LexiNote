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
} from '@nestjs/common';
import { DashboardWordsService } from './words.service';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboard Words')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('words')
export class DashboardWordsController {
  constructor(private readonly wordsService: DashboardWordsService) {}

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
  @ApiOperation({ summary: 'Add a relation (synonym/antonym/collocation) to a word' })
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
