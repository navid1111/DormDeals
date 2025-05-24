const express = require('express');
const {
  getUserProfile,
  updateProfile,
  getUniversityUsers,
  searchUsers,
  getUniversities,
  deactivateAccount
} = require('../controller/userController');
const { 
  protect, 
  requireEmailVerification, 
  requireCompleteProfile 
} = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/universities', getUniversities);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/profile/:id', getUserProfile);
router.put('/profile', validateProfileUpdate, updateProfile);
router.get('/university-users', requireEmailVerification, getUniversityUsers);
router.get('/search', requireEmailVerification, searchUsers);
router.delete('/deactivate', deactivateAccount);

module.exports = router;