import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AchievementService } from './achievement.service';

@ApiTags('Client Achievements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user/achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get()
  @ApiOperation({ summary: 'Get achievement progress for current user' })
  getAchievements(@Request() req: { user: { userId: number } }) {
    return this.achievementService.getAchievements(req.user.userId);
  }

  @Post(':id/unlock')
  @ApiOperation({ summary: 'Unlock an earned achievement' })
  unlock(
    @Request() req: { user: { userId: number } },
    @Param('id') achievementId: string,
  ) {
    return this.achievementService.unlock(req.user.userId, achievementId);
  }
}
