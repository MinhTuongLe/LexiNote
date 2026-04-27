import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews') // Under /api prefix -> /api/reviews
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('due')
  @ApiOperation({ summary: 'Get due words for review' })
  async getDueWords(@Request() req: any) {
    return this.reviewService.getDueWords(req.user.userId);
  }

  @Post('update')
  @ApiOperation({ summary: 'Update SRS after session' })
  async updateSRS(@Request() req: any, @Body() body: any) {
    return this.reviewService.updateSRS(req.user.userId, body.reviewId, body.quality);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset progress for multiple words' })
  async resetBulk(@Request() req: any, @Body() body: any) {
    return this.reviewService.resetBulk(req.user.userId, body.wordIds);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get study statistics and streak' })
  async getStats(@Request() req: any) {
    return this.reviewService.getStudyStats(req.user.userId);
  }
}
