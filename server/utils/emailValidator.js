const University = require('../models/University');

// Validate university email domain
const validateUniversityEmail = async (email) => {
  try {
    if (!email) {
      return { isValid: false, university: null };
    }
    
    const domain = email.split('@')[1];
    if (!domain) {
      return { isValid: false, university: null };
    }

    const university = await University.findOne({ 
      domains: { $in: [domain.toLowerCase()] },
      active: true 
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