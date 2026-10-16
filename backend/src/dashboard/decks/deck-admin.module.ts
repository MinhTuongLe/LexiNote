import { Module } from '@nestjs/common';
import { DeckAdminController } from './deck-admin.controller';
import { DeckModule } from '../../client/deck/deck.module';

@Module({
  imports: [DeckModule],
  controllers: [DeckAdminController],
})
export class DeckAdminModule {}

