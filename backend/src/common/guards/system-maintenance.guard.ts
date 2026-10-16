import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DashboardConfigService } from '../../dashboard/config/config.service';

@Injectable()
export class SystemMaintenanceGuard implements CanActivate {
  constructor(private readonly configService: DashboardConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ url?: string; method?: string }>();
    const url = request.url || '';

    if (request.method === 'OPTIONS' || url.includes('/v1/dashboard')) {
      return true;
    }

    try {
      const { isMaintenanceMode } = await this.configService.getFlags();
      if (isMaintenanceMode) {
        throw new ServiceUnavailableException(
          'System is currently undergoing scheduled maintenance. Please check back later.',
        );
      }
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
    }

    return true;
  }
}
