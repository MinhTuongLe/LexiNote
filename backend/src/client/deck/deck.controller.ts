import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeckService } from './deck.service';
import { DeckQueryDto } from './dto/deck-query.dto';
import { ImportDeckDto } from './dto/import-deck.dto';

@ApiTags('Decks')
@Controller('decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Get('curated')
  @ApiOperation({ summary: 'List curated vocabulary decks' })
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
    return this.deckService.importToLibrary(id, request.user.userId, body.words);
  }
}
