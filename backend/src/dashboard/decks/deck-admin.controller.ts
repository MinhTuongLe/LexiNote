import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DeckService } from '../../client/deck/deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { DeckQueryDto } from '../../client/deck/dto/deck-query.dto';
import { ImportDeckDto } from '../../client/deck/dto/import-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

@ApiTags('Dashboard Decks')
@Controller('decks')
export class DeckAdminController {
  constructor(private readonly deckService: DeckService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a curated vocabulary deck' })
  create(
    @Body() body: CreateDeckDto,
    @Request() request: { user: { userId: number } },
  ) {
    return this.deckService.create(body, request.user.userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a curated vocabulary deck' })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDeckDto) {
    return this.deckService.update(id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a curated vocabulary deck' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deckService.remove(id);
  }

  @Get('curated')
  @ApiOperation({
    summary: 'List curated vocabulary decks (backward compatibility & admin)',
  })
  listCurated(@Query() query: DeckQueryDto) {
    return this.deckService.listCurated(query.category, query.search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a curated vocabulary deck' })
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.deckService.getById(id);
  }

  @Post(':id/import')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Import deck words into the current library' })
  import(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ImportDeckDto,
    @Request() request: { user: { userId: number } },
  ) {
    return this.deckService.importToLibrary(
      id,
      request.user.userId,
      body.words,
    );
  }
}
