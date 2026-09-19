import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  renderVerificationEmailTemplate,
  renderForgotPasswordTemplate,
  renderAdminPasswordResetTemplate,
  renderWelcomeNewUserTemplate,
  renderPasswordChangedTemplate,
  renderAccountStatusChangedTemplate,
  renderAccountDeletedTemplate,
  renderUserRoleUpdatedTemplate,
  renderSessionsRevokedTemplate,
} from './mail.templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<number | string>('SMTP_PORT', 587));
    const user = this.configService.get<string>('SMTP_USER');
    const rawPass = this.configService.get<string>('SMTP_PASS');
    const pass = rawPass ? rawPass.replace(/\s+/g, '') : '';
    const rawSecure = this.configService.get<string | boolean>('SMTP_SECURE', false);
    const secure = String(rawSecure).toLowerCase() === 'true' || port === 465;
    
    this.fromEmail =
      this.configService.get<string>('MAIL_FROM') ||
      '"LexiNote App" <no-reply@lexinote.app>';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.logger.log(`📧 SMTP Transporter initialized using ${host}:${port} (secure: ${secure})`);
    } else {
      this.logger.warn(
        `⚠️ SMTP configuration missing (SMTP_HOST/SMTP_USER/SMTP_PASS). Email service will operate in CONSOLE LOG fallback mode.`,
      );
    }
  }

  async sendMail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromEmail,
          to,
          subject,
          text: text || html.replace(/<[^>]*>?/gm, ''),
          html,
        });
        this.logger.log(`📧 Email sent successfully to ${to} (Subject: "${subject}")`);
        return true;
      } catch (error) {
        this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`, error.stack);
        // Fall back to console logging so workflow isn't completely blocked
        this.logFallback(to, subject, html);
        return false;
      }
    } else {
      this.logFallback(to, subject, html);
      return true;
    }
  }

  private logFallback(to: string, subject: string, html: string) {
    this.logger.log(
      `---------------- EMAIL CONSOLE FALLBACK ----------------\n` +
        `To: ${to}\n` +
        `Subject: ${subject}\n` +
        `Content: ${html.replace(/<[^>]*>?/gm, ' ').slice(0, 300)}...\n` +
        `-------------------------------------------------------`,
    );
  }

  /**
   * Send Account Email Verification OTP Code
   */
  async sendAccountVerificationCode(to: string, fullName: string, verificationCode: string) {
    const subject = '🔐 [LexiNote] Xác thực địa chỉ email tài khoản mới';
    const html = renderVerificationEmailTemplate(fullName, verificationCode);
    return this.sendMail(to, subject, html);
  }

  /**
   * Send Forgot Password Verification OTP / Code
   */
  async sendForgotPasswordCode(to: string, fullName: string, resetCode: string) {
    const subject = '🔑 [LexiNote] Mã khôi phục mật khẩu tài khoản';
    const html = renderForgotPasswordTemplate(fullName, resetCode);
    return this.sendMail(to, subject, html);
  }

  /**
   * Send Admin Password Reset Notification
   */
  async sendAdminPasswordResetNotification(to: string, fullName: string, newDefaultPassword: string) {
    const subject = '🛡️ [LexiNote] Quản trị viên đã thiết lập lại mật khẩu tài khoản của bạn';
    const html = renderAdminPasswordResetTemplate(fullName, newDefaultPassword);
    return this.sendMail(to, subject, html);
  }

  /**
   * Send Welcome Email to New User Created by Admin
   */
  async sendWelcomeNewUserEmail(to: string, fullName: string, rawPassword: string) {
    const subject = '🎉 [LexiNote] Chào mừng bạn! Thông tin tài khoản được khởi tạo thành công';
    const html = renderWelcomeNewUserTemplate(fullName, to, rawPassword);
    return this.sendMail(to, subject, html);
  }

  /**
   * Send Security Notice when User Changes Password
   */
  async sendPasswordChangedNotification(to: string, fullName: string) {
    const subject = '🛡️ [LexiNote] Cảnh báo bảo mật: Mật khẩu vừa được thay đổi';
    const html = renderPasswordChangedTemplate(fullName);
    return this.sendMail(to, subject, html);
  }

  /**
   * Send Account Status Changed (Deactivated / Reactivated) Notification
   */
  async sendAccountStatusChangedNotification(to: string, fullName: string, isActive: boolean) {
    const subject = isActive
      ? '🎉 [LexiNote] Thông báo: Tài khoản của bạn đã được kích hoạt lại'
      : '🚨 [LexiNote] Cảnh báo: Tài khoản của bạn đã bị tạm khóa';
    const html = renderAccountStatusChangedTemplate(fullName, isActive);
    return this.sendMail(to, subject, html);
  }

  /**
   * Send Account Deleted Notification
   */
  async sendAccountDeletedNotification(to: string, fullName: string) {
    const subject = '🗑️ [LexiNote] Thông báo: Tài khoản của bạn đã được xóa khỏi hệ thống';
    const html = renderAccountDeletedTemplate(fullName);
    return this.sendMail(to, subject, html);
  }

  /**
   * Send User Role Updated Notification
   */
  async sendUserRoleUpdatedNotification(to: string, fullName: string, newRole: string) {
    const subject = '🎖️ [LexiNote] Thông báo: Quyền hạn tài khoản của bạn đã được cập nhật';
    const html = renderUserRoleUpdatedTemplate(fullName, newRole);
    return this.sendMail(to, subject, html);
  }

  /**
   * Send Sessions Revoked Notification
   */
  async sendSessionsRevokedNotification(to: string, fullName: string) {
    const subject = '🔐 [LexiNote] Cảnh báo: Tất cả phiên đăng nhập từ xa vừa bị thu hồi';
    const html = renderSessionsRevokedTemplate(fullName);
    return this.sendMail(to, subject, html);
  }

  /**
   * Generate rendered HTML preview for email templates
   */
  getTemplatePreview(type: string, fullName = 'Nguyễn Văn A', sampleCodeOrPass = '123456') {
    switch (type) {
      case 'verification':
        return {
          subject: '🔐 [LexiNote] Xác thực địa chỉ email tài khoản mới',
          html: renderVerificationEmailTemplate(fullName, sampleCodeOrPass),
        };
      case 'forgot_password':
        return {
          subject: '🔑 [LexiNote] Mã khôi phục mật khẩu tài khoản',
          html: renderForgotPasswordTemplate(fullName, sampleCodeOrPass),
        };
      case 'welcome':
        return {
          subject: '🎉 [LexiNote] Chào mừng bạn! Thông tin tài khoản được khởi tạo thành công',
          html: renderWelcomeNewUserTemplate(fullName, 'user@example.com', sampleCodeOrPass),
        };
      case 'password_changed':
        return {
          subject: '🛡️ [LexiNote] Cảnh báo bảo mật: Mật khẩu vừa được thay đổi',
          html: renderPasswordChangedTemplate(fullName),
        };
      case 'status_changed':
        return {
          subject: '🚨 [LexiNote] Cảnh báo: Tài khoản của bạn đã bị tạm khóa',
          html: renderAccountStatusChangedTemplate(fullName, false),
        };
      case 'account_deleted':
        return {
          subject: '🗑️ [LexiNote] Thông báo: Tài khoản của bạn đã được xóa khỏi hệ thống',
          html: renderAccountDeletedTemplate(fullName),
        };
      case 'role_updated':
        return {
          subject: '🎖️ [LexiNote] Thông báo: Quyền hạn tài khoản của bạn đã được cập nhật',
          html: renderUserRoleUpdatedTemplate(fullName, 'ADMIN'),
        };
      case 'sessions_revoked':
        return {
          subject: '🔐 [LexiNote] Cảnh báo: Tất cả phiên đăng nhập từ xa vừa bị thu hồi',
          html: renderSessionsRevokedTemplate(fullName),
        };
      case 'admin_reset':
      default:
        return {
          subject: '🛡️ [LexiNote] Quản trị viên đã thiết lập lại mật khẩu tài khoản của bạn',
          html: renderAdminPasswordResetTemplate(fullName, sampleCodeOrPass),
        };
    }
  }
}
