const mongoose = require('mongoose');

const MeetupLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: [true, 'University is required']
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  locationType: {
    type: String,
    enum: ['landmark', 'building', 'outdoorSpace', 'library', 'foodCourt', 'other'],
    required: [true, 'Location type is required']
  },
  isOfficial: {
    type: Boolean,
    default: false // Whether it's an official university-verified location
  },
  safetyRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  photos: [{
    type: String // URLs to photos
  }],
  openingHours: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a 2dsphere index for geospatial queries
MeetupLocationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('MeetupLocation', MeetupLocationSchema);