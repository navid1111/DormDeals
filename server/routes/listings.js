const express = require('express');
const {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  submitBid
} = require('../controller/listingController');

const {
  uploadListingImages,
  deleteListingImage
} = require('../controller/imageController');

const { protect, requireEmailVerification } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Base routes
router.route('/')
  .post(protect, requireEmailVerification, upload.array('images', 5), createListing)
  .get(getListings);

router.route('/:id')
  .get(getListing)
  .put(protect, requireEmailVerification, updateListing)
  .delete(protect, requireEmailVerification, deleteListing);

// Image routes
router.route('/:id/images')
  .post(protect, requireEmailVerification, upload.array('images', 5), uploadListingImages);

router.route('/:id/images/:imageIndex')
  .delete(protect, requireEmailVerification, deleteListingImage);

// Bid routes
router.route('/:id/bids')
  .post(protect, requireEmailVerification, submitBid);

module.exports = router;