/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-bunny-key';
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper: generate mail transporter
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  
  // For Gmail, force Port 465 + secure: true to avoid Render's connection timeout on 587
  if (host.includes('gmail')) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Timeout settings to handle cloud network slowness
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
    });
  }

  // Fallback for other providers (manual config)
  return nodemailer.createTransport({
    host: host,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Token durations
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Helper: generate tokens
function generateAccessToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(userId) {
  return jwt.sign({ id: userId, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

// Helper: send verification email
async function sendVerificationEmail(user, token) {
  const subject = '✨ Verify your LexiNote Account!';
  const html = `
    <div style="font-family: sans-serif; padding: 20px; background: #fdfbf7; border-radius: 12px; border: 2px dashed #ffc3a0; max-width: 500px; margin: auto;">
      <h2 style="color: #ff7675; text-align: center;">Welcome to LexiNote! 🐰</h2>
      <p style="font-size: 16px; color: #444;">Click the link below or use the code to verify your email address:</p>
      <div style="background: #fff; border: 2px solid #ff7675; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #ff7675;">${token}</span>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 5 minutes. ⏰</p>
      <hr style="border: 1px dashed #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;

  if (resend) {
    // API Approach (For Render/Production)
    resend.emails.send({
      from: 'LexiNote <onboarding@resend.dev>', // Default for Resend test accounts
      to: user.email,
      subject: subject,
      html: html,
    }).then(() => {
      sails.log.info(`🚀 Verification email sent via Resend API to ${user.email}`);
    }).catch(err => {
      sails.log.error(`❌ Resend API Error for ${user.email}:`, err);
    });
  } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    // SMTP Approach (For Local or manual SMTP)
    const transporter = createTransporter();
    const mailOptions = {
      from: `"LexiNote App 🐰" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: subject,
      html: html,
    };
    transporter.sendMail(mailOptions)
      .then(() => {
        sails.log.info(`📧 Verification email sent via SMTP to ${user.email}`);
      })
      .catch(err => {
        sails.log.error(`❌ SMTP Error for ${user.email}:`, err);
      });
  } else {
    sails.log.warn('⚠️ No email service configured. Simulating email drop:');
    sails.log.info(`====== VERIFICATION EMAIL TO: ${user.email} ======\nSubject: ${subject}\nCode: ${token}\n================================`);
  }
}

// Helper: sanitize user object for response
function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
  };
}

module.exports = {

  /**
   * POST /api/auth/register
   * Create a new account and return tokens
   */
  register: async function (req, res) {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        return res.badRequest({ message: 'Missing required fields! 🐰' });
      }

      if (password.length < 6) {
        return res.badRequest({ message: 'Password must be at least 6 characters! 🔑' });
      }

      // Check if user exists
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.badRequest({ message: 'Email already registered! 😿' });
      }

      // Generate verification token
      const verificationToken = crypto.randomInt(100000, 999999).toString();
      const verificationExpires = Date.now() + 5 * 60 * 1000; // 5 mins

      const newUser = await User.create({
        email: email.toLowerCase().trim(),
        password,
        fullName: fullName.trim(),
        emailVerificationToken: await bcrypt.hash(verificationToken, 10),
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false
      }).fetch();

      // Send verification email (fire and forget to avoid hanging)
      sendVerificationEmail(newUser, verificationToken);

      return res.status(201).json({
        message: 'Account created! Please check your email for verification code. 📬',
        email: newUser.email,
        _devVerificationToken: process.env.NODE_ENV !== 'production' ? verificationToken : undefined
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * POST /api/auth/login
   * Login and return access + refresh tokens
   */
  login: async function (req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.badRequest({ message: 'Email and password required! 🛡️' });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return res.notFound({ message: 'User not found! 🏜️' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.badRequest({ message: 'Invalid credentials! ❌' });
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(403).json({ 
          message: 'Please verify your email to login! 📧',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email
        });
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Store hashed refresh token
      const hashedRefresh = await bcrypt.hash(refreshToken, 10);
      await User.updateOne({ id: user.id }).set({ refreshToken: hashedRefresh });

      return res.json({
        user: sanitizeUser(user),
        token: accessToken,
        refreshToken
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * GET /api/auth/me
   * Get current user info (requires auth)
   */
  me: async function (req, res) {
    if (!req.userId) return res.forbidden();
    try {
      const user = await User.findOne({ id: req.userId });
      if (!user) return res.notFound();
      return res.json({
        user: sanitizeUser(user)
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * POST /api/auth/refresh
   * Issue new access token using refresh token
   */
  refresh: async function (req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.badRequest({ message: 'Refresh token is required! 🔄' });
      }

      // Verify the refresh token JWT
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired refresh token! ❌' });
      }

      if (decoded.type !== 'refresh') {
        return res.status(401).json({ message: 'Invalid token type! ❌' });
      }

      // Find the user
      const user = await User.findOne({ id: decoded.id });
      if (!user || !user.refreshToken) {
        return res.status(401).json({ message: 'User not found or session expired! 🏜️' });
      }

      // Verify the stored hashed refresh token matches
      const isValidRefresh = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValidRefresh) {
        // Possible token reuse attack - invalidate all sessions
        await User.updateOne({ id: user.id }).set({ refreshToken: null });
        return res.status(401).json({ message: 'Session invalidated. Please login again! 🔒' });
      }

      // Token rotation: issue new pair
      const newAccessToken = generateAccessToken(user.id);
      const newRefreshToken = generateRefreshToken(user.id);

      const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);
      await User.updateOne({ id: user.id }).set({ refreshToken: hashedRefresh });

      return res.json({
        user: sanitizeUser(user),
        token: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * PATCH /api/auth/profile
   * Update profile info (name, avatar)
   */
  updateProfile: async function (req, res) {
    if (!req.userId) return res.forbidden();
    try {
      const { fullName, avatar } = req.body;
      const updateData = {};

      if (fullName !== undefined) updateData.fullName = fullName.trim();
      if (avatar !== undefined) updateData.avatar = avatar;

      if (Object.keys(updateData).length === 0) {
        return res.badRequest({ message: 'Nothing to update! 🤔' });
      }

      const updatedUser = await User.updateOne({ id: req.userId }).set(updateData);
      if (!updatedUser) return res.notFound();

      return res.json({
        user: sanitizeUser(updatedUser),
        message: 'Profile updated successfully! ✨'
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * POST /api/auth/change-password
   * Change password (requires current password)
   */
  changePassword: async function (req, res) {
    if (!req.userId) return res.forbidden();
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.badRequest({ message: 'Current and new password required! 🔑' });
      }

      if (newPassword.length < 6) {
        return res.badRequest({ message: 'New password must be at least 6 characters! 🔑' });
      }

      const user = await User.findOne({ id: req.userId });
      if (!user) return res.notFound();

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.badRequest({ message: 'Current password is incorrect! ❌' });
      }

      // Update password (beforeUpdate hook will hash it)
      await User.updateOne({ id: req.userId }).set({ password: newPassword });

      return res.json({ message: 'Password changed successfully! 🎉' });
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * POST /api/auth/forgot-password
   * Generate a password reset token
   */
  forgotPassword: async function (req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.badRequest({ message: 'Email is required! 📧' });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        // Don't reveal if user exists - return success anyway
        return res.json({
          message: 'If an account with that email exists, a reset code has been generated! 📬'
        });
      }

      // Generate reset token (6-digit code for simplicity)
      const resetToken = crypto.randomInt(100000, 999999).toString();
      const resetExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

      // Hash the reset token before storing
      const hashedToken = await bcrypt.hash(resetToken, 10);

      await User.updateOne({ id: user.id }).set({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: resetExpires
      });

      // Send the email with the reset code
      try {
        const subject = '🔒 LexiNote - Password Reset Code';
        const html = `
          <div style="font-family: sans-serif; padding: 20px; background: #fdfbf7; border-radius: 12px; border: 2px dashed #ffc3a0; max-width: 500px; margin: auto;">
            <h2 style="color: #ff7675; text-align: center;">Hello from LexiNote! 🐰</h2>
            <p style="font-size: 16px; color: #444;">We received a request to reset your password. Use the following 6-digit code to complete the process:</p>
            <div style="background: #fff; border: 2px solid #ff7675; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #ff7675;">${resetToken}</span>
            </div>
            <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 5 minutes. ⏰</p>
            <hr style="border: 1px dashed #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        `;

        if (resend) {
          resend.emails.send({
            from: 'LexiNote <onboarding@resend.dev>',
            to: user.email,
            subject: subject,
            html: html,
          }).then(() => {
            sails.log.info(`🚀 Reset email sent via Resend API to ${user.email}`);
          }).catch(err => {
            sails.log.error(`❌ Resend API Error for ${user.email}:`, err);
          });
        } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          const transporter = createTransporter();
          const mailOptions = {
            from: `"LexiNote App 🐰" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: subject,
            html: html,
          };
          transporter.sendMail(mailOptions).catch(err => {
            sails.log.error('❌ Failed to send reset email:', err);
          });
          sails.log.info(`📧 Password reset email attempt triggered for ${email}`);
        } else {
          sails.log.warn('⚠️ No email service configured. Simulating email drop:');
          sails.log.info(`====== EMAIL TO: ${email} ======\nSubject: ${subject}\nCode: ${resetToken}\n================================`);
        }
      } catch (mailErr) {
        sails.log.error('❌ Email setup error:', mailErr);
      }

      return res.json({
        message: 'If an account with that email exists, a reset code has been sent! 📬'
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * POST /api/auth/reset-password
   * Reset password using the reset token
   */
  resetPassword: async function (req, res) {
    try {
      const { email, resetToken, newPassword } = req.body;

      if (!email || !resetToken || !newPassword) {
        return res.badRequest({ message: 'Email, reset code, and new password are required! 🔑' });
      }

      if (newPassword.length < 6) {
        return res.badRequest({ message: 'New password must be at least 6 characters! 🔑' });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user || !user.resetPasswordToken) {
        return res.badRequest({ message: 'Invalid reset request! ❌' });
      }

      // Check if token expired
      if (user.resetPasswordExpires < Date.now()) {
        await User.updateOne({ id: user.id }).set({
          resetPasswordToken: null,
          resetPasswordExpires: null
        });
        return res.badRequest({ message: 'Reset code has expired! Please request a new one. ⏰' });
      }

      // Verify the reset token
      const isValidToken = await bcrypt.compare(resetToken, user.resetPasswordToken);
      if (!isValidToken) {
        return res.badRequest({ message: 'Invalid reset code! ❌' });
      }

      // Update password and clear reset fields
      await User.updateOne({ id: user.id }).set({
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      return res.json({ message: 'Password reset successfully! You can now login. 🎉' });
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * POST /api/auth/verify-email
   * Verify account using the token
   */
  verifyEmail: async function (req, res) {
    try {
      const { email, token } = req.body;

      if (!email || !token) {
        return res.badRequest({ message: 'Email and verification code are required! 🔑' });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return res.notFound({ message: 'User not found! 🏜️' });
      }

      if (user.isEmailVerified) {
        return res.badRequest({ message: 'Email is already verified! ✨' });
      }

      // Check expiry
      if (user.emailVerificationExpires < Date.now()) {
        return res.badRequest({ message: 'Verification code has expired! Please request a new one. ⏰' });
      }

      // Verify token
      const isValid = await bcrypt.compare(token, user.emailVerificationToken);
      if (!isValid) {
        return res.badRequest({ message: 'Invalid verification code! ❌' });
      }

      // Update user
      await User.updateOne({ id: user.id }).set({
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      });

      // Generate tokens so they can log in immediately after verification
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      const hashedRefresh = await bcrypt.hash(refreshToken, 10);
      await User.updateOne({ id: user.id }).set({ refreshToken: hashedRefresh });

      return res.json({
        message: 'Account verified successfully! 🎉',
        user: sanitizeUser({ ...user, isEmailVerified: true }),
        token: accessToken,
        refreshToken
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * POST /api/auth/resend-verification
   * Resend verification email
   */
  resendVerification: async function (req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.badRequest({ message: 'Email is required! 📧' });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return res.notFound({ message: 'User not found! 🏜️' });
      }

      if (user.isEmailVerified) {
        return res.badRequest({ message: 'Email is already verified! ✨' });
      }

      // Generate new token
      const verificationToken = crypto.randomInt(100000, 999999).toString();
      const verificationExpires = Date.now() + 5 * 60 * 1000; // 5 mins

      await User.updateOne({ id: user.id }).set({
        emailVerificationToken: await bcrypt.hash(verificationToken, 10),
        emailVerificationExpires: verificationExpires
      });

      // Send verification email (fire and forget)
      sendVerificationEmail(user, verificationToken);

      return res.json({
        message: 'Verification code resent! Please check your email. 📬',
        _devVerificationToken: process.env.NODE_ENV !== 'production' ? verificationToken : undefined
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * POST /api/auth/logout
   * Invalidate refresh token
   */
  logoutServer: async function (req, res) {
    if (!req.userId) return res.forbidden();
    try {
      await User.updateOne({ id: req.userId }).set({ refreshToken: null });
      return res.json({ message: 'Logged out successfully! 👋' });
    } catch (err) {
      return res.serverError(err);
    }
  }

};
