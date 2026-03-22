import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WordModule } from './word/word.module';
import { ReviewModule } from './review/review.module';
import { MetaController } from './meta/meta.controller';
import { SettingsModule } from './settings/settings.module';

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
  ],
  controllers: [MetaController],
  providers: [],
})
export class AppModule {}
