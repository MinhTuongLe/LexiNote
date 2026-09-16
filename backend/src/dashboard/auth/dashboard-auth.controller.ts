import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from '../../client/auth/auth.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Dashboard Auth')
@Controller('auth')
export class DashboardAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login for dashboard' })
  async login(
    @Body() loginDto: { email: string; password: string },
    @Req() req: Record<string, unknown>,
  ) {
    const user = (await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    )) as { id: number; email: string; role: Role };

    // Explicitly check for ADMIN role
    if (user.role !== Role.ADMIN) {
      throw new UnauthorizedException('error.auth.not_admin_access');
    }

    return this.authService.login(user, req);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('me')
  @ApiOperation({ summary: 'Get current admin profile' })
  getProfile(@Req() req: { user: Record<string, unknown> }) {
    return req.user;
  }
}
