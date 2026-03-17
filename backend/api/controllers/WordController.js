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
      
      // Normalize type
      const validTypes = ['noun', 'verb', 'adj', 'adv', 'phrasal_verb', 'idiom', 'phrase', 'noun_phrase', 'other'];
      let normalizedType = (type || 'other').toLowerCase().trim();
      if (normalizedType.includes('/') || normalizedType.includes(',')) {
        normalizedType = normalizedType.split(/[/,]/)[0].trim();
      }
      if (!validTypes.includes(normalizedType)) normalizedType = 'other';

      // 1. Create the word
      const newWord = await Word.create({
        word,
        meaningVi,
        example,
        type: normalizedType,
        owner: req.userId
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
   * Update an existing word
   */
  update: async function (req, res) {
    try {
      const { id } = req.params;
      const { word, meaningVi, example, type } = req.body;

      // Ensure ownership
      const existingWord = await Word.findOne({ id, owner: req.userId });
      if (!existingWord) return res.notFound();

      // Normalize type if provided
      let normalizedType = type;
      if (type) {
        const validTypes = ['noun', 'verb', 'adj', 'adv', 'phrasal_verb', 'idiom', 'phrase', 'noun_phrase', 'other'];
        normalizedType = type.toLowerCase().trim();
        if (normalizedType.includes('/') || normalizedType.includes(',')) {
          normalizedType = normalizedType.split(/[/,]/)[0].trim();
        }
        if (!validTypes.includes(normalizedType)) normalizedType = 'other';
      }

      const updatedWord = await Word.updateOne({ id, owner: req.userId })
        .set({
          word,
          meaningVi,
          example,
          type: normalizedType
        });

      return res.json(updatedWord);
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * List words with filters and search
   */
  find: async function (req, res) {
    try {
      const { search, type } = req.query;
      let query = { owner: req.userId };

      if (search) {
        query.or = [
          { word: { contains: search }, owner: req.userId },
          { meaningVi: { contains: search }, owner: req.userId }
        ];
      }

      if (type) {
        query.type = type;
      }

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
      const word = await Word.findOne({ id: req.params.id, owner: req.userId })
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
      const word = await Word.findOne({ id: req.params.id, owner: req.userId });
      if (!word) return res.notFound();

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
        // Simple duplicate check by word for THIS user
        const existing = await Word.findOne({ word: data.word, owner: req.userId });
        if (existing) continue;

        const validTypes = ['noun', 'verb', 'adj', 'adv', 'phrasal_verb', 'idiom', 'phrase', 'noun_phrase', 'other'];
        let normalizedType = (data.type || 'other').toLowerCase().trim();
        
        if (normalizedType.includes('/') || normalizedType.includes(',')) {
          normalizedType = normalizedType.split(/[/,]/)[0].trim();
        }
        
        if (!validTypes.includes(normalizedType)) normalizedType = 'other';

        const newWord = await Word.create({
          word: data.word,
          meaningVi: data.meaningVi,
          example: data.example || '',
          type: normalizedType,
          owner: req.userId
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
