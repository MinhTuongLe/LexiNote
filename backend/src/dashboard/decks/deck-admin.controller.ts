import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DeckService } from '../../client/deck/deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';

@ApiTags('Dashboard Decks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('decks')
export class DeckAdminController {
  constructor(private readonly deckService: DeckService) {}

  @Post()
  @ApiOperation({ summary: 'Create a curated vocabulary deck' })
  create(
    @Body() body: CreateDeckDto,
    @Request() request: { user: { userId: number } },
  ) {
    return this.deckService.create(body, request.user.userId);
  }
}
