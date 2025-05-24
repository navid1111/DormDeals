const express = require('express');
const {
  proposeMeetup,
  respondToMeetup,
  getUserMeetups,
  getMeetup,
  confirmSafety
} = require('../controller/meetupController');

const { protect, requireEmailVerification } = require('../middleware/auth');

const router = express.Router();

// Routes for meetups
router.post('/listing/:listingId', protect, requireEmailVerification, proposeMeetup);
router.put('/:meetupId/respond', protect, requireEmailVerification, respondToMeetup);
router.get('/my', protect, requireEmailVerification, getUserMeetups);
router.get('/:id', protect, requireEmailVerification, getMeetup);
router.put('/:meetupId/safety', protect, requireEmailVerification, confirmSafety);

module.exports = router;