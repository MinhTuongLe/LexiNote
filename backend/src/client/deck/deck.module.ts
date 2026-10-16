import { Module } from '@nestjs/common';
import { DeckController } from './deck.controller';
import { DeckService } from './deck.service';
import { DeckAdminController } from '../../dashboard/decks/deck-admin.controller';

@Module({
  controllers: [DeckController, DeckAdminController],
  providers: [DeckService],
  exports: [DeckService],
})
export class DeckModule {}
