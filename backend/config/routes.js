/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  // Health Check
  'GET /': 'MetaController.health',

  // Dashboard Stats
  'GET /api/dashboard': 'WordController.getDashboardStats',


  // Word API
  'POST /api/words': 'WordController.create',
  'GET /api/words': 'WordController.find',
  'GET /api/words/:id': 'WordController.findOne',
  'PATCH /api/words/:id': 'WordController.update',
  'DELETE /api/words/:id': 'WordController.destroy',
  'POST /api/words/delete-bulk': 'WordController.destroyBulk',
  'POST /api/words/import': 'WordController.importBulk',

  // Review (SRS) API
  'GET /api/reviews/due': 'ReviewController.getDueWords',
  'POST /api/reviews/update': 'ReviewController.updateSRS',
  'POST /api/reviews/reset': 'ReviewController.resetBulk',

  // Auth API
  'POST /api/auth/register': 'AuthController.register',
  'POST /api/auth/login': 'AuthController.login',
  'GET /api/auth/me': 'AuthController.me',
  'POST /api/auth/refresh': 'AuthController.refresh',
  'PATCH /api/auth/profile': 'AuthController.updateProfile',
  'POST /api/auth/change-password': 'AuthController.changePassword',
  'POST /api/auth/forgot-password': 'AuthController.forgotPassword',
  'POST /api/auth/reset-password': 'AuthController.resetPassword',
  'POST /api/auth/logout': 'AuthController.logoutServer',

};
