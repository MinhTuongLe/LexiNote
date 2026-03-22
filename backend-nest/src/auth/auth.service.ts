import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { VALID_WORD_TYPES } from '../word/word.constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  async login(user: any) {
    if (!user.isEmailVerified) {
      throw new ForbiddenException({
        message: 'Please verify your email to login! 📧',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    const payload = { id: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken(user.id);

    // Hash and store refresh token in DB
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(user.id, { refreshToken: hashedRefresh });

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

  async refresh(refreshToken: string) {
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

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type! ❌');
    }

    const userId = decoded.id;
    if (!userId) throw new UnauthorizedException('Invalid token payload! ❌');

    const user = await this.userService.findOneById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('User not found or session expired! 🏜️');
    }

    const isValidRefresh = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValidRefresh) {
      // Possible token reuse attack - invalidate session
      await this.userService.update(user.id, { refreshToken: null });
      throw new UnauthorizedException('Session invalidated. Please login again! 🔒');
    }

    const payload = { id: user.id, email: user.email };
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.generateRefreshToken(user.id);

    const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);
    await this.userService.update(user.id, { refreshToken: hashedRefresh });

    return {
      user: this.sanitizeUser(user),
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
    const refreshToken = this.generateRefreshToken(updatedUser.id);
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(updatedUser.id, { refreshToken: hashedRefresh });

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
      refreshToken: null // Invalidate sessions on password change
    });

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

  async logout(userId: number) {
    await this.userService.update(userId, { refreshToken: null });
    return { message: 'Logged out successfully! 👋' };
  }

  private generateRefreshToken(userId: number) {
    return this.jwtService.sign(
      { id: userId, type: 'refresh' },
      { expiresIn: '7d' }, // 7d as per original settings
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
