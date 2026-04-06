import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WordModule } from './word/word.module';
import { ReviewModule } from './review/review.module';
import { MetaController } from './meta/meta.controller';
import { SettingsModule } from './settings/settings.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

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
      limit: 100, // Increased to 100 per minute for normal app behavior, 10 was too strict
    }]),
  ],
  controllers: [MetaController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
