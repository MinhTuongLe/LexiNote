import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as dns from 'dns';

// Force IPv4 resolution first in Node.js to prevent IPv6 connection timeouts on Cloud hosts (Render/AWS)
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  // Ignore if not supported in older node environments
}

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
  private fallbackSslTransporter: nodemailer.Transporter | null = null;
  private fromEmail: string;
  private brevoApiKey: string | null = null;
  private smtpHost = '';
  private smtpPort = 587;

  constructor(private configService: ConfigService) {
    const rawBrevoKey = this.configService.get<string>('BREVO_API_KEY');
    this.brevoApiKey = rawBrevoKey ? rawBrevoKey.trim() : null;

    this.smtpHost = this.configService.get<string>('SMTP_HOST') || '';
    this.smtpPort = Number(this.configService.get<number | string>('SMTP_PORT', 587));
    const host = this.smtpHost;
    const port = this.smtpPort;
    const user = this.configService.get<string>('SMTP_USER');
    const rawPass = this.configService.get<string>('SMTP_PASS');
    const pass = rawPass ? rawPass.replace(/["'\s]/g, '') : '';
    const rawSecure = this.configService.get<string | boolean>('SMTP_SECURE', false);
    const secure = String(rawSecure).toLowerCase() === 'true' || port === 465;

    const rawFrom = this.configService.get<string>('MAIL_FROM');
    this.fromEmail = rawFrom
      ? rawFrom.replace(/^['"]+|['"]+$/g, '')
      : '"LexiNote App" <mt09122002@gmail.com>';

    if (this.brevoApiKey) {
      this.logger.log(`🚀 MailService initialized with Brevo HTTPS API (Port 443 - Unrestricted delivery)`);
    } else if (host && user && pass) {
      const transportOptions: SMTPTransport.Options = {
        host,
        port,
        secure,
        auth: { user, pass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000,
        dnsTimeout: 8000,
        tls: {
          rejectUnauthorized: false,
        },
      };
      this.transporter = nodemailer.createTransport(transportOptions);
      this.logger.log(`📧 SMTP Transporter initialized using ${host}:${port} (secure: ${secure})`);

      if (port !== 465) {
        const fallbackOptions: SMTPTransport.Options = {
          host: host.includes('gmail') ? 'smtp.gmail.com' : host,
          port: 465,
          secure: true,
          auth: { user, pass },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 8000,
          dnsTimeout: 8000,
          tls: {
            rejectUnauthorized: false,
          },
        };
        this.fallbackSslTransporter = nodemailer.createTransport(fallbackOptions);
      }
    } else {
      this.logger.warn(
        `⚠️ BREVO_API_KEY missing. Email service will operate in CONSOLE LOG fallback mode.`,
      );
    }
  }

  async sendMail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    // 1. Try Brevo HTTPS API first (Allows sending to ANY email recipient without domain verification, 300 mails/day)
    if (this.brevoApiKey) {
      try {
        let senderName = 'LexiNote App';
        let senderEmail = (this.configService.get<string>('SENDER_EMAIL') || 'mt09122002@gmail.com').trim();

        if (this.configService.get<string>('MAIL_FROM')) {
          const match = this.fromEmail.match(/^"?([^"<]+)"?\s*<([^>]+)>/);
          if (match) {
            if (match[1]?.trim()) senderName = match[1].trim();
            if (match[2]?.trim()) senderEmail = match[2].trim();
          } else if (this.fromEmail.includes('@')) {
            senderEmail = this.fromEmail.replace(/["'\s]/g, '');
          }
        }

        const sendBrevo = async (email: string) => {
          return fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'api-key': this.brevoApiKey || '',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              sender: {
                name: senderName,
                email,
              },
              to: [{ email: to }],
              subject,
              htmlContent: html,
              textContent: text || html.replace(/<[^>]*>?/gm, ''),
            }),
          });
        };

        let response = await sendBrevo(senderEmail);

        if (response.ok) {
          this.logger.log(`📧 Email sent successfully via Brevo HTTPS API to ${to} (Subject: "${subject}")`);
          return true;
        }

        const errData = (await response.json().catch(() => ({}))) as { message?: string; code?: string };
        this.logger.error(`❌ Brevo API Error (${response.status}): ${JSON.stringify(errData)}`);

        // If sender email is rejected, retry with alternative sender email
        const altEmail = senderEmail === 'mt09122002@gmail.com' ? 'leminhtuong091202@gmail.com' : 'mt09122002@gmail.com';
        this.logger.warn(`🔄 Retrying Brevo API with alternative sender "${altEmail}"...`);

        response = await sendBrevo(altEmail);
        if (response.ok) {
          this.logger.log(`📧 Email sent successfully via Brevo HTTPS API to ${to} using sender "${altEmail}"`);
          return true;
        }

        const retryErr = (await response.json().catch(() => ({}))) as { message?: string };
        this.logger.error(`❌ Brevo API Retry Error (${response.status}): ${JSON.stringify(retryErr)}`);
      } catch (err: unknown) {
        const error = err as { message?: string };
        this.logger.error(`❌ Brevo API Request Failed: ${error?.message}`);
      }
    }

    // 2. Try Nodemailer Primary SMTP Transporter
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
      } catch (err: unknown) {
        const error = err as { message?: string; stack?: string };
        this.logger.error(`❌ Primary SMTP failed (${error.message}) on ${this.smtpHost}:${this.smtpPort}.`);

        // Fallback to Port 465 SSL if Port 587 timed out on Render
        if (this.fallbackSslTransporter) {
          this.logger.warn(`🔄 Retrying email delivery via SSL Port 465 (smtp.gmail.com:465)...`);
          try {
            await this.fallbackSslTransporter.sendMail({
              from: this.fromEmail,
              to,
              subject,
              text: text || html.replace(/<[^>]*>?/gm, ''),
              html,
            });
            this.logger.log(`✅ Email successfully sent using fallback SSL Port 465 to ${to}`);
            // Promote fallback SSL to primary for future requests
            this.transporter = this.fallbackSslTransporter;
            this.fallbackSslTransporter = null;
            return true;
          } catch (sslErr: unknown) {
            const sslError = sslErr as { message?: string };
            this.logger.error(`❌ Fallback SSL Port 465 also failed: ${sslError.message}`);
          }
        }

        this.logFallback(to, subject, html);
        return false;
      }
    }

    // 3. Fallback to Console Log
    this.logFallback(to, subject, html);
    return true;
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
