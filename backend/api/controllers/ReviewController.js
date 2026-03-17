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
      const reviews = await Review.find({
        nextReview: { '<=': now }
      }).populate('word');

      return res.json(reviews);
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * Update SRS state after a review session
   * Action: user chose Easy, Medium, or Hard
   */
  updateSRS: async function (req, res) {
    try {
      const { reviewId, quality } = req.body; // quality: 1 (Hard), 3 (Medium), 5 (Easy)
      
      const review = await Review.findOne({ id: reviewId });
      if (!review) return res.notFound();

      let { interval, easeFactor, correctCount, wrongCount } = review;

      // SM-2 Basic Logic
      if (quality >= 3) {
        // Correct response
        if (correctCount === 0) {
          interval = 1;
        } else if (correctCount === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
        correctCount++;
        
        // Update Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;
      } else {
        // Incorrect response
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

      // Ensure wordIds are integers
      const numericWordIds = wordIds.map(id => parseInt(id, 10));

      // Find review records for these words to update by their own primary IDs
      const reviews = await Review.find({ word: numericWordIds });
      
      if (reviews.length > 0) {
        const reviewIds = reviews.map(r => r.id);
        await Review.update({ id: reviewIds }).set({
          nextReview: Date.now(),
          lastReviewed: 0,
          interval: 0,
          easeFactor: 2.5,
          correctCount: 0,
          wrongCount: 0
        });
      }

      return res.json({ success: true, count: reviews.length });
    } catch (err) {
      return res.serverError(err);
    }
  }

};
