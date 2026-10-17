import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error(
        'JWT_SECRET must be configured with at least 32 characters',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOneById(payload.id);
    if (!user || !user.isActive)
      throw new UnauthorizedException('error.auth.account_inactive');

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      settings: user.settings,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
