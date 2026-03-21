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

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-bunny-key';

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

      // Create user — marked as unverified, awaiting master code
      const newUser = await User.create({
        email: email.toLowerCase().trim(),
        password,
        fullName: fullName.trim(),
        isEmailVerified: false
      }).fetch();

      sails.log.info(`👤 New user registered: ${newUser.email} (unverified). Use MASTER_VERIFY_CODE to verify.`);

      return res.status(201).json({
        message: 'Account created! Please contact admin for verification code. 🔑',
        email: newUser.email
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

      // With MASTER_VERIFY_CODE mode: no token generation needed, master code is used directly
      const masterCode = process.env.MASTER_VERIFY_CODE;
      if (masterCode) {
        // Store master code hash so resetPassword can verify it
        const hashedMaster = await bcrypt.hash(masterCode, 10);
        await User.updateOne({ id: user.id }).set({
          resetPasswordToken: hashedMaster,
          resetPasswordExpires: Date.now() + 30 * 60 * 1000 // 30 mins for master code
        });
        sails.log.info(`🔑 [MASTER_CODE] Forgot password requested for ${user.email}. Use MASTER_VERIFY_CODE to reset.`);
      } else {
        // Normal flow: generate random token
        const resetToken = crypto.randomInt(100000, 999999).toString();
        const resetExpires = Date.now() + 5 * 60 * 1000;
        const hashedToken = await bcrypt.hash(resetToken, 10);
        await User.updateOne({ id: user.id }).set({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: resetExpires
        });
        sails.log.info(`🔑 Reset token generated for ${user.email}: ${resetToken} (no email service configured)`);
      }

      return res.json({
        message: 'Reset code generated! Please use the master verification code to reset. 🔑'
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

      // Check expiry — skip if master code mode is active
      const masterCode = process.env.MASTER_VERIFY_CODE;
      const isMasterCode = masterCode && token === masterCode;

      if (!isMasterCode) {
        // Normal flow: check expiry and verify hashed token
        if (!user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
          return res.badRequest({ message: 'Verification code has expired! Please request a new one. ⏰' });
        }

        const isValid = await bcrypt.compare(token, user.emailVerificationToken);
        if (!isValid) {
          return res.badRequest({ message: 'Invalid verification code! ❌' });
        }
      } else {
        sails.log.info(`🔑 [MASTER_CODE] Account verified via master code for ${user.email}`);
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

      // No email sending — just confirm to user to use MASTER_VERIFY_CODE
      sails.log.info(`🔁 Resend verification requested for: ${user.email} (use MASTER_VERIFY_CODE)`);

      return res.json({
        message: 'Please use the verification code provided by the administrator. 🔑'
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
