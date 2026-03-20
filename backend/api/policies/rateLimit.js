/**
 * rateLimit
 *
 * @module      :: Policy
 * @description :: Simple in-memory rate limiter to protect auth endpoints.
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

// Memory store: { 'path:IP' : { count: number, resetTime: number } }
const requestCounts = new Map();

// Clear old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

module.exports = async function (req, res, proceed) {
  try {
    // Configurable windows
    const isReset = req.path && (
      req.path.includes('reset-password') || 
      req.path.includes('forgot-password') ||
      req.path.includes('verify-email') ||
      req.path.includes('resend-verification')
    );
    // 15 minutes window
    const windowMs = 15 * 60 * 1000;
    // Stricter limits for password reset (5 attempts) vs general login (15 attempts)
    const maxRequests = isReset ? 5 : 15;
    
    // Get IP (use standard express headers) - More robust detection
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 
               (req.socket ? req.socket.remoteAddress : '') || 
               (req.connection ? req.connection.remoteAddress : '') || 
               'unknown';
               
    const key = `${req.path || 'unknown'}:${ip}`;

    const now = Date.now();
    let record = requestCounts.get(key);

    if (!record || now > record.resetTime) {
      // Fresh window
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      requestCounts.set(key, record);
      return proceed();
    }

    // Same window
    record.count++;
    if (record.count > maxRequests) {
      sails.log.warn(`Rate limit triggered for ${ip} on ${req.path}`);
      return res.status(429).json({
        message: 'Too many requests! Please try again later. 🐢'
      });
    }

    requestCounts.set(key, record);
    return proceed();
  } catch (err) {
    sails.log.error('Rate Limit Policy Error:', err);
    // In case of error in the limiter, we allow the request to proceed 
    // rather than blocking the entire app with a 500.
    return proceed();
  }
};
