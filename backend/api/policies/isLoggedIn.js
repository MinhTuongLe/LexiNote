/**
 * isLoggedIn
 *
 * @description :: Policy to check if user is logged in via JWT
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-bunny-key';

module.exports = async function (req, res, proceed) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization required! 🔒' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    return proceed();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token! ❌' });
  }
};
