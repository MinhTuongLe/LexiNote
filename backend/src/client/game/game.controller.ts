import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GameSessionDto } from './dto/game-session.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { GameService } from './game.service';

@ApiTags('Client Games')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('session')
  @ApiOperation({ summary: 'Record a minigame session' })
  recordSession(
    @Request() req: { user: { userId: number } },
    @Body() body: GameSessionDto,
  ) {
    return this.gameService.recordSession(req.user.userId, body);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get this week’s minigame leaderboard' })
  getLeaderboard(@Query() query: LeaderboardQueryDto) {
    return this.gameService.getLeaderboard(
      query.gameType || GameType.MATCH_GAME,
      query.limit,
    );
  }
}
