import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { VALID_WORD_TYPES } from '../word/word.constants';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new UnauthorizedException('error.auth.email_not_found');
    }
    
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('error.auth.wrong_password');
    }

    const { password, ...result } = user;
    return result;
  }

  async login(user: any, request?: any) {
    if (!user.isEmailVerified) {
      throw new ForbiddenException({
        message: 'error.auth.unverified_email',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    const payload = { id: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Create a new session in DB
    const refreshTokenRecord = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        hashedToken: '', // Placeholder
        userAgent: request?.headers?.['user-agent'] || null,
        ipAddress: request?.ip || null,
        expiresAt: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const refreshToken = this.generateRefreshToken(user.id, refreshTokenRecord.id);
    const hashedToken = await bcrypt.hash(refreshToken, 10);

    // Update with real hashed token
    await this.prisma.refreshToken.update({
      where: { id: refreshTokenRecord.id },
      data: { hashedToken },
    });

    return {
      user: this.sanitizeUser(user),
      token: accessToken,
      refreshToken,
    };
  }

  async register(registrationData: any) {
    const { email, password, fullName } = registrationData;

    if (!email || !password || !fullName) {
      throw new BadRequestException('error.auth.missing_fields');
    }

    if (password.length < 6) {
      throw new BadRequestException('error.auth.password_too_short');
    }

    const existing = await this.userService.findOneByEmail(email.toLowerCase().trim());
    if (existing) {
      throw new BadRequestException('error.auth.email_exists');
    }

    const newUser = await this.userService.create({
      email: email.toLowerCase().trim(),
      password,
      fullName: fullName.trim(),
      isEmailVerified: false,
    });

    console.info(`👤 New user registered: ${newUser.email} (unverified). Use MASTER_VERIFY_CODE to verify.`);

    return {
      message: 'success.auth.registered',
      email: newUser.email,
    };
  }

  async refresh(refreshToken: string, request?: any) {
    if (!refreshToken) {
      throw new BadRequestException('error.auth.refresh_required');
    }

    let decoded: any;
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (err) {
      throw new UnauthorizedException('error.auth.invalid_refresh');
    }

    if (decoded.type !== 'refresh' || !decoded.sid) {
      throw new UnauthorizedException('error.auth.invalid_token_structure');
    }

    const session = await this.prisma.refreshToken.findUnique({
      where: { id: decoded.sid },
      include: { user: true },
    });

    if (!session || !session.user) {
      throw new UnauthorizedException('error.auth.session_expired_not_found');
    }

    if (session.expiresAt < BigInt(Date.now())) {
      await this.prisma.refreshToken.delete({ where: { id: session.id } });
      throw new UnauthorizedException('error.auth.session_expired');
    }

    const isValidRefresh = await bcrypt.compare(refreshToken, session.hashedToken);
    if (!isValidRefresh) {
      // Possible token reuse attack - invalidate EVERY session for security
      await this.prisma.refreshToken.deleteMany({ where: { userId: session.userId } });
      throw new UnauthorizedException('error.auth.token_theft');
    }

    const payload = { id: session.user.id, email: session.user.email };
    const newAccessToken = this.jwtService.sign(payload);
    
    // Rotate refresh token
    const newRefreshToken = this.generateRefreshToken(session.user.id, session.id);
    const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);

    await this.prisma.refreshToken.update({
      where: { id: session.id },
      data: { 
        hashedToken: hashedRefresh,
        userAgent: request?.headers?.['user-agent'] || session.userAgent,
        ipAddress: request?.ip || session.ipAddress,
        expiresAt: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: this.sanitizeUser(session.user),
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async verifyEmail(email: string, token: string) {
    const user = await this.userService.findOneByEmail(email.toLowerCase().trim());
    if (!user) throw new NotFoundException('error.auth.user_not_found');
    if (user.isEmailVerified) throw new BadRequestException('error.auth.already_verified');

    const masterCode = this.configService.get('MASTER_VERIFY_CODE');
    const isMasterCode = masterCode && token === masterCode;

    if (!isMasterCode) {
      // Logic for verification code verification (if implemented)
      // Original code skip this if master mode.
      if (!user.emailVerificationExpires || Number(user.emailVerificationExpires) < Date.now()) {
        throw new BadRequestException('error.auth.verification_expired');
      }
      
      const isValid = user.emailVerificationToken ? await bcrypt.compare(token, user.emailVerificationToken) : false;
      if (!isValid) throw new BadRequestException('error.auth.invalid_verification');
    }

    // Update user to verified
    const updatedUser = await this.userService.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    const payload = { id: updatedUser.id, email: updatedUser.email };
    const accessToken = this.jwtService.sign(payload);
    
    // Create new session upon verification
    const refreshTokenRecord = await this.prisma.refreshToken.create({
      data: {
        userId: updatedUser.id,
        hashedToken: '',
        expiresAt: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const refreshToken = this.generateRefreshToken(updatedUser.id, refreshTokenRecord.id);
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.prisma.refreshToken.update({
      where: { id: refreshTokenRecord.id },
      data: { hashedToken: hashedRefresh },
    });

    return {
      message: 'success.auth.verified',
      user: this.sanitizeUser(updatedUser),
      token: accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email: string) {
    if (!email) throw new BadRequestException('error.auth.email_required');

    const user = await this.userService.findOneByEmail(email.toLowerCase().trim());
    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'message.auth.reset_code_masked',
      };
    }

    const masterCode = this.configService.get('MASTER_VERIFY_CODE');
    if (masterCode) {
      const hashedMaster = await bcrypt.hash(masterCode, 10);
      await this.userService.update(user.id, {
        resetPasswordToken: hashedMaster,
        resetPasswordExpires: BigInt(Date.now() + 30 * 60 * 1000), // 30 mins
      });
      console.info(`🔑 [MASTER_CODE] Forgot password requested for ${user.email}. Use MASTER_VERIFY_CODE to reset.`);
    } else {
      const resetToken = crypto.randomInt(100000, 999999).toString();
      const resetExpires = Date.now() + 5 * 60 * 1000;
      const hashedToken = await bcrypt.hash(resetToken, 10);
      await this.userService.update(user.id, {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: BigInt(resetExpires),
      });
      console.info(`🔑 Reset token generated for ${user.email}: ${resetToken} (no email service)`);
    }

    return {
      message: 'success.auth.reset_code_generated',
    };
  }

  async resetPassword(data: any) {
    const { email, resetToken, newPassword } = data;
    if (!email || !resetToken || !newPassword) {
      throw new BadRequestException('error.auth.current_new_password_required');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters! 🔑');
    }

    const user = await this.userService.findOneByEmail(email.toLowerCase().trim());
    if (!user || !user.resetPasswordToken) {
      throw new BadRequestException('error.auth.invalid_reset_request');
    }

    if (user.resetPasswordExpires && Number(user.resetPasswordExpires) < Date.now()) {
      await this.userService.update(user.id, {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
      throw new BadRequestException('error.auth.reset_expired');
    }

    const isValidToken = await bcrypt.compare(resetToken, user.resetPasswordToken);
    if (!isValidToken) {
      throw new BadRequestException('error.auth.invalid_reset_code');
    }

    // Update password (hashing handled in UserService)
    await this.userService.update(user.id, {
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'success.auth.password_reset' };
  }

  async changePassword(userId: number, data: any) {
    const { currentPassword, newPassword } = data;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('error.auth.current_new_password_required');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters! 🔑');
    }

    const user = await this.userService.findOneById(userId);
    if (!user) throw new NotFoundException('error.auth.user_not_found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('error.auth.wrong_current_password');
    }

    await this.userService.update(userId, { 
      password: newPassword,
    });

    // Invalidate ALL sessions on password change for security
    await this.prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'success.auth.password_changed' };
  }


  async resendVerification(email: string) {
    if (!email) throw new BadRequestException('error.auth.email_required');

    const user = await this.userService.findOneByEmail(email.toLowerCase().trim());
    if (!user) throw new NotFoundException('error.auth.user_not_found');

    if (user.isEmailVerified) {
      throw new BadRequestException('error.auth.already_verified');
    }

    console.info(`🔁 Resend verification requested for: ${user.email} (use MASTER_VERIFY_CODE)`);

    return {
      message: 'success.auth.resend_verification',
    };
  }

  async updateProfile(userId: number, data: any) {
    const { fullName, avatar } = data;
    const updateData: any = {};

    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (avatar !== undefined) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('error.auth.nothing_to_update');
    }

    const updatedUser = await this.userService.update(userId, updateData);
    if (!updatedUser) throw new NotFoundException('error.auth.user_not_found');

    return {
      user: this.sanitizeUser(updatedUser),
      message: 'success.auth.profile_updated',
    };
  }

  async logout(userId: number, currentToken?: string) {
    if (currentToken) {
      // Logout from specific device
      try {
        const decoded: any = this.jwtService.decode(currentToken);
        if (decoded?.sid) {
          await this.prisma.refreshToken.delete({ where: { id: decoded.sid } });
        }
      } catch (e) {
        // Just clear all if decode fails
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
      }
    } else {
      // Logout from ALL devices
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    return { message: 'success.auth.logged_out' };
  }

  private generateRefreshToken(userId: number, sessionId: number) {
    return this.jwtService.sign(
      { id: userId, sid: sessionId, type: 'refresh' },
      { expiresIn: '7d' },
    );
  }

  private sanitizeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      settings: user.settings,
    };
  }
}
