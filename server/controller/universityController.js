const University = require('../models/University');

// Get all universities
const getAllUniversities = async (req, res) => {
  try {
    const universities = await University.find().select('name _id');
    
    res.status(200).json({
      success: true,
      count: universities.length,
      data: universities
    });
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching universities'
    });
  }
};

// Get university by ID
const getUniversityById = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: university
    });
  } catch (error) {
    console.error('Error fetching university:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching university'
    });
  }
};

// Create new university
const createUniversity = async (req, res) => {
  try {
    // Check for admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can create universities'
      });
    }
    
    const university = await University.create(req.body);
    
    res.status(201).json({
      success: true,
      data: university
    });
  } catch (error) {
    console.error('Error creating university:', error);
    
    // Handle duplicate university name
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'University with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating university'
    });
  }
};

// Update university
const updateUniversity = async (req, res) => {
  try {
    // Check for admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can update universities'
      });
    }
    
    const university = await University.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: university
    });
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating university'
    });
  }
};

// Delete university
const deleteUniversity = async (req, res) => {
  try {
    // Check for admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete universities'
      });
    }
    
    const university = await University.findById(req.params.id);
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }
    
    // Instead of deleting, just mark as inactive
    university.isActive = false;
    await university.save();
    
    res.status(200).json({
      success: true,
      message: 'University successfully deactivated'
    });
  } catch (error) {
    console.error('Error deleting university:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting university'
    });
  }
};

module.exports = {
  getAllUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity
};