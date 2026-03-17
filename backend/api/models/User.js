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

  // Custom method to check password
  comparePassword: async function (password, user) {
    return await bcrypt.compare(password, user.password);
  }

};
