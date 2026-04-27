import { Module } from '@nestjs/common';
import { WordService } from './word.service';
import { WordController } from './word.controller';
import { SettingsModule } from '../settings/settings.module';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [SettingsModule, ReviewModule],
  providers: [WordService],
  controllers: [WordController],
  exports: [WordService]
})
export class WordModule {}
