const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token
const generateJWTToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate random token for email verification
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate password reset token
const generateResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  return {
    token: resetToken,
    hashedToken: hashedToken
  };
};

module.exports = {
  generateJWTToken,
  generateVerificationToken,
  generateResetToken
};