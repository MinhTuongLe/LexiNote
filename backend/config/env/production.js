/**
 * Production environment settings
 * (sails.config.*)
 *
 * What you see below is a quick outline of the built-in settings you need
 * to configure your Sails app for production.  The configuration in this file
 * is only used in your production environment, i.e. when you lift your app using:
 *
 * ```
 * NODE_ENV=production node app
 * ```
 *
 * > If you're using git as a version control solution for your Sails app,
 * > this file WILL BE COMMITTED to your repository by default, unless you add
 * > it to your .gitignore file.  If your repository will be publicly viewable,
 * > don't add private/sensitive data (like API secrets / db passwords) to this file!
 *
 * For more best practices and tips, see:
 * https://sailsjs.com/docs/concepts/deployment
 */

module.exports = {


  /**************************************************************************
  *                                                                         *
  * Tell Sails what database(s) it should use in production.                *
  *                                                                         *
  * (https://sailsjs.com/config/datastores)                                 *
  *                                                                         *
  **************************************************************************/
  datastores: {
    default: {
      adapter: 'sails-postgresql',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Essential for Supabase/Neon on Render
    },
  },

  models: {
    migrate: 'safe',
  },



  /**************************************************************************
  *                                                                         *
  * Always disable "shortcut" blueprint routes.                             *
  *                                                                         *
  * > You'll also want to disable any other blueprint routes if you are not *
  * > actually using them (e.g. "actions" and "rest") -- but you can do     *
  * > that in `config/blueprints.js`, since you'll want to disable them in  *
  * > all environments (not just in production.)                            *
  *                                                                         *
  ***************************************************************************/
  blueprints: {
    shortcuts: false,
  },



  /***************************************************************************
  *                                                                          *
  * Configure your security settings for production.                         *
  *                                                                          *
  * IMPORTANT:                                                               *
  * If web browsers will be communicating with your app, be sure that        *
  * you have CSRF protection enabled.  To do that, set `csrf: true` over     *
  * in the `config/security.js` file (not here), so that CSRF app can be     *
  * tested with CSRF protection turned on in development mode too.           *
  *                                                                          *
  ***************************************************************************/
  security: {
    cors: {
      allRoutes: true,
      allowOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
      allowCredentials: false,
      allowHeaders: 'content-type, authorization, x-requested-with'
    },
  },

  session: {
    cookie: {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    },
  },

  http: {
    cache: 365.25 * 24 * 60 * 60 * 1000, // One year
    trustProxy: true, // Required for Render/PaaS to handle HTTPS correctly
  },

  custom: {
    baseUrl: process.env.BASE_URL || 'https://lexinote-api.onrender.com',
    internalEmailAddress: 'support@lexinote.com',
    jwtSecret: process.env.JWT_SECRET,
  },



};
