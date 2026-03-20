/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  '*': 'isLoggedIn',

  'AuthController': {
    'register': ['rateLimit'],
    'login': ['rateLimit'],
    'refresh': true, // Refresh token is its own auth
    'forgotPassword': ['rateLimit'],
    'resetPassword': ['rateLimit'],
    'verifyEmail': ['rateLimit'], // Allow public access to verify
    'resendVerification': ['rateLimit'], // Allow public access to resend
    'me': 'isLoggedIn',
    'updateProfile': 'isLoggedIn',
    'changePassword': 'isLoggedIn',
    'logoutServer': 'isLoggedIn',
  },

};
