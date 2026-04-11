import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './client/auth/auth.module';
import { UserModule } from './client/user/user.module';
import { WordModule } from './client/word/word.module';
import { ReviewModule } from './client/review/review.module';
import { MetaModule } from './meta/meta.module';
import { SettingsModule } from './client/settings/settings.module';
import { AnalyticsModule } from './dashboard/analytics/analytics.module';
import { ManagementModule } from './dashboard/management/management.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    // Client
    AuthModule,
    UserModule,
    WordModule,
    ReviewModule,
    SettingsModule,
    // Dashboard
    AnalyticsModule,
    ManagementModule,
    MetaModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    RouterModule.register([
      {
        path: 'v1/client',
        children: [
          { path: '/', module: AuthModule },
          { path: '/', module: UserModule },
          { path: '/', module: WordModule },
          { path: '/', module: ReviewModule },
          { path: '/', module: SettingsModule },
          { path: '/', module: MetaModule },
        ],
      },
      {
        path: 'v1/dashboard',
        children: [
          { path: '/', module: AnalyticsModule },
          { path: '/', module: ManagementModule },
        ],
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
