import { Module } from '@nestjs/common';
import { MetaController } from './meta.controller';
import { WordModule } from '../client/word/word.module';
import { AuthModule } from '../client/auth/auth.module';

@Module({
  imports: [WordModule, AuthModule],
  controllers: [MetaController],
})
export class MetaModule {}
