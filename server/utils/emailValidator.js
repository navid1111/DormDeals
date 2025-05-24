const University = require('../models/University');

// Validate university email domain
const validateUniversityEmail = async (email) => {
  try {
    const domain = email.split('@')[1];
    const university = await University.findOne({ 
      emailDomain: domain.toLowerCase(),
      isActive: true 
    });
    
    return {
      isValid: !!university,
      university: university
    };
  } catch (error) {
    return {
      isValid: false,
      university: null,
      error: error.message
    };
  }
};

// Extract university info from email
const extractUniversityFromEmail = (email) => {
  const domain = email.split('@')[1];
  return domain.toLowerCase();
};

// Validate email format
const isValidEmailFormat = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

module.exports = {
  validateUniversityEmail,
  extractUniversityFromEmail,
  isValidEmailFormat
};