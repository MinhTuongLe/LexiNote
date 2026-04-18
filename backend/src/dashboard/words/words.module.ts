import { Module } from '@nestjs/common';
import { DashboardWordsController } from './words.controller';
import { DashboardWordsService } from './words.service';

@Module({
  controllers: [DashboardWordsController],
  providers: [DashboardWordsService],
})
export class DashboardWordsModule {}
