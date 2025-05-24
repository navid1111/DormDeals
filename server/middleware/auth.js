const jwt = require('jsonwebtoken');
const User = require('../models/Users');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.id).populate('university');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Require email verification
const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address to access this feature'
    });
  }
  next();
};

// Require profile completion
const requireCompleteProfile = (req, res, next) => {
  if (!req.user.isProfileComplete) {
    return res.status(403).json({
      success: false,
      message: 'Please complete your profile to access this feature'
    });
  }
  next();
};

// Require verification status
const requireVerification = (req, res, next) => {
  if (req.user.verificationStatus !== 'verified') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending verification. Please wait for admin approval.'
    });
  }
  next();
};

module.exports = {
  protect,
  requireEmailVerification,
  requireCompleteProfile,
  requireVerification
};