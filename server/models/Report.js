const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reported: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for the report'],
    enum: ['inappropriate_content', 'scam', 'harassment', 'false_information', 'other']
  },
  details: {
    type: String,
    maxlength: [500, 'Details cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Report', ReportSchema);