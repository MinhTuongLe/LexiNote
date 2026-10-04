import { Module } from '@nestjs/common';
import { DashboardConfigController } from './config.controller';
import { DashboardConfigService } from './config.service';
import { CleanersController } from './cleaners.controller';

@Module({
  controllers: [DashboardConfigController, CleanersController],
  providers: [DashboardConfigService],
  exports: [DashboardConfigService],
})
export class DashboardConfigModule {}
