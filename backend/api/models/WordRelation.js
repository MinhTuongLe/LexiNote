/**
 * WordRelation.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    type: {
      type: 'string',
      isIn: ['synonym', 'antonym'],
      required: true
    },

    value: {
      type: 'string',
      required: true
    },

    // Associations
    word: {
      model: 'word',
      required: true
    }

  },

};
