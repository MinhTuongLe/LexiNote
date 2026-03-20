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
      const { search, type, page, limit } = req.query;
      let query = { owner: req.userId };

      if (search) {
        query.or = [
          { word: { contains: search }, owner: req.userId },
          { meaningVi: { contains: search }, owner: req.userId }
        ];
      }

      if (type && type !== 'all') {
        query.type = type;
      }

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      const skip = (pageNum - 1) * limitNum;

      const baseQuery = Word.find(query).populate('relations').populate('reviews').sort('createdAt DESC');
      
      let words;
      let total;

      if (limit === 'all') {
        words = await baseQuery;
        total = words.length;
      } else {
        words = await baseQuery.skip(skip).limit(limitNum);
        total = await Word.count(query);
      }

      return res.json({
        data: words,
        meta: {
          total,
          page: pageNum,
          limit: limit === 'all' ? total : limitNum,
          totalPages: limit === 'all' ? 1 : Math.ceil(total / limitNum)
        }
      });
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
   * Delete multiple words and associated data
   */
  destroyBulk: async function (req, res) {
    try {
      const { wordIds } = req.body;
      if (!wordIds || !wordIds.length) return res.badRequest('No word IDs provided');

      const numericWordIds = wordIds.map(id => parseInt(id, 10));

      const words = await Word.find({ 
        id: numericWordIds, 
        owner: req.userId 
      }).select(['id']);
      
      const verifiedWordIds = words.map(w => w.id);

      if (verifiedWordIds.length > 0) {
        await WordRelation.destroy({ word: verifiedWordIds });
        await Review.destroy({ word: verifiedWordIds });
        await Word.destroy({ id: verifiedWordIds });
        
        return res.json({ success: true, count: verifiedWordIds.length });
      }

      return res.json({ success: true, count: 0 });
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
  },

  /**
   * Get dashboard stats
   */
  getDashboardStats: async function(req, res) {
    try {
      // 1. Total Words
      const totalWords = await Word.count({ owner: req.userId });

      // 2. Due Reviews
      const userWords = await Word.find({ owner: req.userId }).select(['id']);
      const wordIds = userWords.map(w => w.id);
      
      const dueReviewsCount = await Review.count({
        nextReview: { '<=': Date.now() },
        word: wordIds
      });

      // 3. Recent Words (top 3)
      const recentWords = await Word.find({ owner: req.userId })
        .populate('relations')
        .populate('reviews')
        .sort('createdAt DESC')
        .limit(3);

      return res.json({
        totalWords,
        dueReviewsCount,
        recentWords
      });
    } catch (err) {
      return res.serverError(err);
    }
  }

};
