// Admin middleware to check for admin privileges

// Check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'university-admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }
  next();
};

// Check if user is a global admin
const isGlobalAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Global admin privileges required'
    });
  }
  next();
};

// Check if user is university admin for specific university
const isUniversityAdmin = (req, res, next) => {
  if (req.user.role !== 'university-admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: University admin privileges required'
    });
  }
  next();
};

module.exports = {
  isAdmin,
  isGlobalAdmin,
  isUniversityAdmin
};