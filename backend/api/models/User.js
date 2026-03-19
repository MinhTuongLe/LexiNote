/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const bcrypt = require('bcryptjs');

module.exports = {

  attributes: {
    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
    },
    password: {
      type: 'string',
      required: true,
      description: 'Hashed password',
      protect: true, // Do not return in JSON
    },
    fullName: {
      type: 'string',
      required: true,
      columnName: 'full_name'
    },
    avatar: {
      type: 'string',
      defaultsTo: '🐰'
    },

    // Refresh token (hashed) for token rotation
    refreshToken: {
      type: 'string',
      allowNull: true,
      columnName: 'refresh_token'
    },

    // Password reset fields
    resetPasswordToken: {
      type: 'string',
      allowNull: true,
      columnName: 'reset_password_token'
    },
    resetPasswordExpires: {
      type: 'number',
      allowNull: true,
      columnName: 'reset_password_expires'
    },

    // Associations
    words: {
      collection: 'word',
      via: 'owner'
    }
  },

  // Lifecycle callback: hash password before creating user
  beforeCreate: async function (values, next) {
    if (!values.password) return next();
    try {
      const salt = await bcrypt.genSalt(10);
      values.password = await bcrypt.hash(values.password, salt);
      return next();
    } catch (err) {
      return next(err);
    }
  },

  // Lifecycle callback: hash password before updating user (for password change)
  beforeUpdate: async function (values, next) {
    if (!values.password) return next();
    try {
      const salt = await bcrypt.genSalt(10);
      values.password = await bcrypt.hash(values.password, salt);
      return next();
    } catch (err) {
      return next(err);
    }
  },

  // Custom method to check password
  comparePassword: async function (password, user) {
    return await bcrypt.compare(password, user.password);
  }

};
