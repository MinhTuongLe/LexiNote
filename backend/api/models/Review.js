/**
 * Review.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    lastReviewed: {
      type: 'number', // timestamp
      columnName: 'last_reviewed'
    },

    nextReview: {
      type: 'number', // timestamp
      columnName: 'next_review'
    },

    interval: {
      type: 'number',
      defaultsTo: 0
    },

    easeFactor: {
      type: 'number',
      columnName: 'ease_factor',
      defaultsTo: 2.5
    },

    correctCount: {
      type: 'number',
      columnName: 'correct_count',
      defaultsTo: 0
    },

    wrongCount: {
      type: 'number',
      columnName: 'wrong_count',
      defaultsTo: 0
    },

    // Associations
    word: {
      model: 'word',
      required: true
    }

  },

};
