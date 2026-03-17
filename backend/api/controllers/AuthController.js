/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-bunny-key';

module.exports = {

  register: async function (req, res) {
    try {
      const { email, password, fullName } = req.body;
      
      if (!email || !password || !fullName) {
        return res.badRequest({ message: 'Missing required fields! 🐰' });
      }

      // Check if user exists
      const existing = await User.findOne({ email });
      if (existing) {
        return res.badRequest({ message: 'Email already registered! 😿' });
      }

      const newUser = await User.create({
        email,
        password,
        fullName
      }).fetch();

      const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '1d' });

      return res.status(201).json({
        user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, avatar: newUser.avatar },
        token
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  login: async function (req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.badRequest({ message: 'Email and password required! 🛡️' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.notFound({ message: 'User not found! 🏜️' });
      }

      const isMatch = await User.comparePassword(password, user);
      if (!isMatch) {
        return res.badRequest({ message: 'Invalid credentials! ❌' });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

      return res.json({
        user: { id: user.id, email: user.email, fullName: user.fullName, avatar: user.avatar },
        token
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  me: async function (req, res) {
    if (!req.userId) return res.forbidden();
    try {
      const user = await User.findOne({ id: req.userId });
      if (!user) return res.notFound();
      return res.json({
        user: { id: user.id, email: user.email, fullName: user.fullName, avatar: user.avatar }
      });
    } catch (err) {
      return res.serverError(err);
    }
  }

};
