import { Module } from '@nestjs/common';
import { DashboardConfigController } from './config.controller';
import { DashboardConfigService } from './config.service';

@Module({
  controllers: [DashboardConfigController],
  providers: [DashboardConfigService],
})
export class DashboardConfigModule {}
