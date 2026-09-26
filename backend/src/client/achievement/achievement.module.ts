import { Module } from '@nestjs/common';
import { ReviewModule } from '../review/review.module';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';

@Module({
  imports: [ReviewModule],
  controllers: [AchievementController],
  providers: [AchievementService],
})
export class AchievementModule {}
