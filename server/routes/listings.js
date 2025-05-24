const express = require('express');
const {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  submitBid
} = require('../controller/listingController');

const { protect, requireEmailVerification } = require('../middleware/auth');

const router = express.Router();

// Base routes
router.route('/')
  .post(protect, requireEmailVerification, createListing)
  .get(getListings);

router.route('/:id')
  .get(getListing)
  .put(protect, requireEmailVerification, updateListing)
  .delete(protect, requireEmailVerification, deleteListing);

// Bid routes
router.route('/:id/bids')
  .post(protect, requireEmailVerification, submitBid);

module.exports = router;