/**
 * ReviewController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  /**
   * Get words due for review today
   */
  getDueWords: async function (req, res) {
    try {
      const now = Date.now();
      
      // Get all words owned by user
      const userWords = await Word.find({ owner: req.userId }).select(['id']);
      const wordIds = userWords.map(w => w.id);

      const reviews = await Review.find({
        nextReview: { '<=': now },
        word: wordIds
      }).populate('word');

      return res.json(reviews);
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * Update SRS state after a review session
   */
  updateSRS: async function (req, res) {
    try {
      const { reviewId, quality } = req.body;
      
      const review = await Review.findOne({ id: reviewId }).populate('word');
      if (!review || review.word.owner !== req.userId) {
        return res.notFound({ message: 'Review session not found! 🕵️‍♂️' });
      }

      let { interval, easeFactor, correctCount, wrongCount } = review;

      // SM-2 Basic Logic
      if (quality >= 3) {
        if (correctCount === 0) interval = 1;
        else if (correctCount === 1) interval = 6;
        else interval = Math.round(interval * easeFactor);
        
        correctCount++;
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;
      } else {
        correctCount = 0;
        interval = 1;
        wrongCount++;
      }

      const nextReview = Date.now() + (interval * 24 * 60 * 60 * 1000);

      const updatedReview = await Review.updateOne({ id: reviewId }).set({
        interval,
        easeFactor,
        correctCount,
        wrongCount,
        nextReview,
        lastReviewed: Date.now()
      });

      return res.json(updatedReview);
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * Reset review progress for multiple words
   */
  resetBulk: async function (req, res) {
    try {
      const { wordIds } = req.body;
      if (!wordIds || !wordIds.length) return res.badRequest('No word IDs provided');

      const numericWordIds = wordIds.map(id => parseInt(id, 10));

      // Ensure all words belong to the user
      const words = await Word.find({ 
        id: numericWordIds, 
        owner: req.userId 
      }).select(['id']);
      
      const verifiedWordIds = words.map(w => w.id);

      if (verifiedWordIds.length > 0) {
        const reviews = await Review.find({ word: verifiedWordIds });
        const reviewIds = reviews.map(r => r.id);
        
        await Review.update({ id: reviewIds }).set({
          nextReview: Date.now(),
          lastReviewed: 0,
          interval: 0,
          easeFactor: 2.5,
          correctCount: 0,
          wrongCount: 0
        });
        
        return res.json({ success: true, count: verifiedWordIds.length });
      }

      return res.json({ success: true, count: 0 });
    } catch (err) {
      return res.serverError(err);
    }
  }

};
