import { Module } from '@nestjs/common';
import { DashboardAuthController } from './dashboard-auth.controller';
import { AuthModule } from '../../client/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DashboardAuthController],
  providers: [],
})
export class DashboardAuthModule {}
