import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WordModule } from './word/word.module';
import { ReviewModule } from './review/review.module';
import { MetaController } from './meta/meta.controller';
import { SettingsModule } from './settings/settings.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    WordModule,
    ReviewModule,
    SettingsModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers: [MetaController],
  providers: [],
})
export class AppModule {}
