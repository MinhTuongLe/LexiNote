import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { VALID_WORD_TYPES } from '../word/word.constants';

import { PrismaService } from '../prisma/prisma.service';

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
      throw new UnauthorizedException('Email không tồn tại! 📧');
    }
    
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu không chính xác! ❌');
    }

    const { password, ...result } = user;
    return result;
  }

  async login(user: any, request?: any) {
    if (!user.isEmailVerified) {
      throw new ForbiddenException({
        message: 'Please verify your email to login! 📧',
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
      throw new BadRequestException('Missing required fields! 🐰');
    }

    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters! 🔑');
    }

    const existing = await this.userService.findOneByEmail(email.toLowerCase().trim());
    if (existing) {
      throw new BadRequestException('E-mail already registered! 😿');
    }

    const newUser = await this.userService.create({
      email: email.toLowerCase().trim(),
      password,
      fullName: fullName.trim(),
      isEmailVerified: false,
    });

    console.info(`👤 New user registered: ${newUser.email} (unverified). Use MASTER_VERIFY_CODE to verify.`);

    return {
      message: 'Account created! Please contact admin for verification code. 🔑',
      email: newUser.email,
    };
  }

  async refresh(refreshToken: string, request?: any) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required! 🔄');
    }

    let decoded: any;
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token! ❌');
    }

    if (decoded.type !== 'refresh' || !decoded.sid) {
      throw new UnauthorizedException('Invalid token structure! ❌');
    }

    const session = await this.prisma.refreshToken.findUnique({
      where: { id: decoded.sid },
      include: { user: true },
    });

    if (!session || !session.user) {
      throw new UnauthorizedException('Session expired or user not found! 🏜️');
    }

    if (session.expiresAt < BigInt(Date.now())) {
      await this.prisma.refreshToken.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Session expired! ⏰');
    }

    const isValidRefresh = await bcrypt.compare(refreshToken, session.hashedToken);
    if (!isValidRefresh) {
      // Possible token reuse attack - invalidate EVERY session for security
      await this.prisma.refreshToken.deleteMany({ where: { userId: session.userId } });
      throw new UnauthorizedException('Security alert: Potential token theft. All sessions invalidated! 🔒');
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
    if (!user) throw new NotFoundException('User not found! 🏜️');
    if (user.isEmailVerified) throw new BadRequestException('E-mail is already verified! ✨');

    const masterCode = this.configService.get('MASTER_VERIFY_CODE');
    const isMasterCode = masterCode && token === masterCode;

    if (!isMasterCode) {
      // Logic for verification code verification (if implemented)
      // Original code skip this if master mode.
      if (!user.emailVerificationExpires || Number(user.emailVerificationExpires) < Date.now()) {
        throw new BadRequestException('Verification code has expired! Please request a new one. ⏰');
      }
      
      const isValid = user.emailVerificationToken ? await bcrypt.compare(token, user.emailVerificationToken) : false;
      if (!isValid) throw new BadRequestException('Invalid verification code! ❌');
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
      message: 'Account verified successfully! 🎉',
      user: this.sanitizeUser(updatedUser),
      token: accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email: string) {
    if (!email) throw new BadRequestException('E-mail is required! 📧');

    const user = await this.userService.findOneByEmail(email.toLowerCase().trim());
    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'If an account with that email exists, a reset code has been generated! 📬',
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
      message: 'Reset code generated! Please use the master verification code to reset. 🔑',
    };
  }

  async resetPassword(data: any) {
    const { email, resetToken, newPassword } = data;
    if (!email || !resetToken || !newPassword) {
      throw new BadRequestException('E-mail, reset code, and new password are required! 🔑');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters! 🔑');
    }

    const user = await this.userService.findOneByEmail(email.toLowerCase().trim());
    if (!user || !user.resetPasswordToken) {
      throw new BadRequestException('Invalid reset request! ❌');
    }

    if (user.resetPasswordExpires && Number(user.resetPasswordExpires) < Date.now()) {
      await this.userService.update(user.id, {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
      throw new BadRequestException('Reset code has expired! Please request a new one. ⏰');
    }

    const isValidToken = await bcrypt.compare(resetToken, user.resetPasswordToken);
    if (!isValidToken) {
      throw new BadRequestException('Invalid reset code! ❌');
    }

    // Update password (hashing handled in UserService)
    await this.userService.update(user.id, {
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Password reset successfully! You can now login. 🎉' };
  }

  async changePassword(userId: number, data: any) {
    const { currentPassword, newPassword } = data;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current and new password required! 🔑');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters! 🔑');
    }

    const user = await this.userService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect! ❌');
    }

    await this.userService.update(userId, { 
      password: newPassword,
    });

    // Invalidate ALL sessions on password change for security
    await this.prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'Password changed successfully! 🎉' };
  }


  async resendVerification(email: string) {
    if (!email) throw new BadRequestException('E-mail is required! 📧');

    const user = await this.userService.findOneByEmail(email.toLowerCase().trim());
    if (!user) throw new NotFoundException('User not found! 🏜️');

    if (user.isEmailVerified) {
      throw new BadRequestException('E-mail is already verified! ✨');
    }

    console.info(`🔁 Resend verification requested for: ${user.email} (use MASTER_VERIFY_CODE)`);

    return {
      message: 'Please use the verification code provided by the administrator. 🔑',
    };
  }

  async updateProfile(userId: number, data: any) {
    const { fullName, avatar } = data;
    const updateData: any = {};

    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (avatar !== undefined) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Nothing to update! 🤔');
    }

    const updatedUser = await this.userService.update(userId, updateData);
    if (!updatedUser) throw new NotFoundException('User not found');

    return {
      user: this.sanitizeUser(updatedUser),
      message: 'Profile updated successfully! ✨',
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
    return { message: 'Logged out successfully! 👋' };
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
