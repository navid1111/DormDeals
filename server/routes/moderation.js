const express = require('express');
const {
  moderateListing,
  handleReport,
  reviewReport,
  addReview,
  getUserReviews
} = require('../controller/moderationController');

const { protect } = require('../middleware/auth');
const { isAdmin, isGlobalAdmin } = require('../middleware/admin');

const router = express.Router();

// Admin routes for moderation
router.put('/listings/:id', protect, isAdmin, moderateListing);
router.put('/reports/:id', protect, isAdmin, reviewReport);

// User routes for reports and reviews
router.post('/report', protect, handleReport);
router.post('/review', protect, addReview);
router.get('/reviews/:userId', getUserReviews);

module.exports = router;