const express = require('express');
const {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  getMe,
  logout,
  adminLogin
} = require('../controller/authController');
const { protect } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');


const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', validateLogin, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/admin-login', adminLogin);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;