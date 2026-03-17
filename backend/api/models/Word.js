/**
 * Word.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    word: {
      type: 'string',
      required: true,
      unique: true,
      description: 'The English word.'
    },

    meaningVi: {
      type: 'string',
      required: true,
      columnName: 'meaning_vi',
      description: 'Vietnamese meaning.'
    },

    example: {
      type: 'string',
      description: 'Example sentence.'
    },

    type: {
      type: 'string',
      isIn: ['noun', 'verb', 'adj', 'adv', 'phrasal_verb', 'idiom', 'phrase', 'noun_phrase', 'other'],
      defaultsTo: 'noun'
    },

    owner: {
      model: 'user',
      required: true
    },

    // Associations
    relations: {
      collection: 'wordrelation',
      via: 'word'
    },

    reviews: {
      collection: 'review',
      via: 'word'
    }

  },

};
