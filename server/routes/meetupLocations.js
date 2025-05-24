const express = require('express');
const {
  createMeetupLocation,
  getUniversityLocations,
  getNearbyLocations,
  getMeetupLocation
} = require('../controller/meetupLocationController');

const { protect, requireEmailVerification } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

const router = express.Router();

// Routes for meetup locations
router.post('/', protect, requireEmailVerification, createMeetupLocation);
router.get('/university/:universityId', getUniversityLocations);
router.get('/nearby', getNearbyLocations);
router.get('/:id', getMeetupLocation);

module.exports = router;