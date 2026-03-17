/**
 * WordController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  /**
   * Create a new word with its relations
   */
  create: async function (req, res) {
    try {
      const { word, meaningVi, example, type, synonyms, antonyms } = req.body;

      // 1. Create the word
      const newWord = await Word.create({
        word,
        meaningVi,
        example,
        type
      }).fetch();

      // 2. Create relations if any
      if (synonyms && synonyms.length > 0) {
        await Promise.all(synonyms.map(val => WordRelation.create({ type: 'synonym', value: val, word: newWord.id })));
      }
      if (antonyms && antonyms.length > 0) {
        await Promise.all(antonyms.map(val => WordRelation.create({ type: 'antonym', value: val, word: newWord.id })));
      }

      // 3. Initialize SRS Review state for this word
      await Review.create({
        word: newWord.id,
        nextReview: Date.now(), // Due immediately
        interval: 0,
        easeFactor: 2.5
      });

      return res.status(201).json(newWord);
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * List words with filters and search
   */
  find: async function (req, res) {
    try {
      const { search, type, status } = req.query;
      let query = {};

      if (search) {
        query.or = [
          { word: { contains: search } },
          { meaningVi: { contains: search } }
        ];
      }

      if (type) {
        query.type = type;
      }

      // Note: Logic for 'status' (learned, learning, new) might involve joining with Review
      // For MVP, let's keep it simple
      const words = await Word.find(query).populate('relations').populate('reviews');
      return res.json(words);
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * Get a single word detail
   */
  findOne: async function (req, res) {
    try {
      const word = await Word.findOne({ id: req.params.id })
        .populate('relations')
        .populate('reviews');
      
      if (!word) return res.notFound();
      return res.json(word);
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * Delete a word and its associated data
   */
  destroy: async function (req, res) {
    try {
      // Sails cascade handles relationships if configured, but let's be safe
      await WordRelation.destroy({ word: req.params.id });
      await Review.destroy({ word: req.params.id });
      await Word.destroyOne({ id: req.params.id });
      
      return res.ok();
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * Bulk import words
   */
  importBulk: async function (req, res) {
    try {
      const { words } = req.body;
      const createdWords = [];

      for (const data of words) {
        // Simple duplicate check by word
        const existing = await Word.findOne({ word: data.word });
        if (existing) continue;

        const newWord = await Word.create({
          word: data.word,
          meaningVi: data.meaningVi,
          example: data.example || '',
          type: data.type || 'noun',
        }).fetch();

        await Review.create({
          word: newWord.id,
          nextReview: Date.now(),
          interval: 0,
          easeFactor: 2.5
        });

        createdWords.push(newWord);
      }

      return res.json({ imported: createdWords.length });
    } catch (err) {
      return res.serverError(err);
    }
  }

};
