const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'University name is required'],
    trim: true
  },
  shortName: {
    type: String,
    required: [true, 'University short name is required'],
    trim: true
  },
  domains: {
    type: [String],
    required: [true, 'Email domains are required'],
    validate: [arr => Array.isArray(arr) && arr.length > 0, 'At least one domain is required']
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('University', universitySchema);