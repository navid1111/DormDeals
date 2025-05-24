const User = require('../models/Users');
const University = require('../models/University');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('university', 'name code location')
      .select('-phoneNumber -dateOfBirth'); // Hide private info for other users

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'firstName', 'lastName', 'bio', 'department', 
      'program', 'yearOfStudy', 'graduationYear'
    ];
    
    const updates = {};
    
    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('university');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check profile completion after update
    user.checkProfileCompletion();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Get users from same university
const getUniversityUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, program, yearOfStudy } = req.query;
    
    // Build filter query
    const filter = {
      university: req.user.university._id,
      isEmailVerified: true,
      verificationStatus: 'verified',
      isActive: true,
      _id: { $ne: req.user.id } // Exclude current user
    };

    if (department) filter.department = new RegExp(department, 'i');
    if (program) filter.program = program;
    if (yearOfStudy) filter.yearOfStudy = parseInt(yearOfStudy);

    const users = await User.find(filter)
      .select('-phoneNumber -dateOfBirth -email') // Hide private info
      .populate('university', 'name code')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get university users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching university users'
    });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchFilter = {
      university: req.user.university._id,
      isEmailVerified: true,
      verificationStatus: 'verified',
      isActive: true,
      _id: { $ne: req.user.id },
      $or: [
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') },
        { department: new RegExp(query, 'i') },
        { studentId: new RegExp(query, 'i') }
      ]
    };

    const users = await User.find(searchFilter)
      .select('-phoneNumber -dateOfBirth -email')
      .populate('university', 'name code')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(searchFilter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
};

// Get all universities (for registration)
const getUniversities = async (req, res) => {
  try {
    const universities = await University.find({ isActive: true })
      .select('name code emailDomain location')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        universities
      }
    });
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching universities'
    });
  }
};

// Deactivate user account
const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isActive: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating account'
    });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  getUniversityUsers,
  searchUsers,
  getUniversities,
  deactivateAccount
};