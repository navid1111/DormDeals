const express = require('express');
const { 
  getAllUniversities, 
  getUniversityById, 
  createUniversity, 
  updateUniversity, 
  deleteUniversity 
} = require('../controller/universityController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

const router = express.Router();

// Public route - Get all universities
router.get('/', getAllUniversities);

// Public route - Get university by ID
router.get('/:id', getUniversityById);

// Protected routes - Admin only
router.post('/', protect, isAdmin, createUniversity);
router.put('/:id', protect, isAdmin, updateUniversity);
router.delete('/:id', protect, isAdmin, deleteUniversity);

module.exports = router;