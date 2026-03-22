import { Controller, Post, Body, Get, UseGuards, Request, Patch, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive tokens' })
  async login(@Body() body: any) {
    // In Nest, we could use a LocalAuthGuard but here we're porting Sails logic
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      return { status: 400, message: 'Invalid credentials! ❌' };
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@Request() req: any) {
    return { user: req.user };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  async refresh(@Body() body: any) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with code' })
  async verifyEmail(@Body() body: any) {
    return this.authService.verifyEmail(body.email, body.token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerification(email);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with code' })
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change-password')
  @ApiOperation({ summary: 'Change password (authenticated)' })
  async changePassword(@Request() req: any, @Body() body: any) {
    return this.authService.changePassword(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req: any, @Body() body: any) {
    return this.authService.updateProfile(req.user.userId, body);
  }
}
