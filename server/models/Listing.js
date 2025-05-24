const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Books', 'Electronics', 'Furniture', 'Clothing', 'Services', 'Other']
  },
  listingType: {
    type: String,
    required: [true, 'Please specify if this is an item or service'],
    enum: ['item', 'service']
  },
  pricingType: {
    type: String,
    required: [true, 'Please select a pricing type'],
    enum: ['fixed', 'bidding', 'hourly', 'free']
  },
  price: {
    type: Number,
    required: function() {
      return this.pricingType !== 'free';
    }
  },
  condition: {
    type: String,
    required: function() {
      return this.listingType === 'item';
    },
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
  },
  images: [{
    type: String
  }],
  visibilityMode: {
    type: String,
    required: [true, 'Please select visibility mode'],
    enum: ['university', 'all'],
    default: 'university'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'deleted', 'expired'],
    default: 'pending'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  bids: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: {
      type: Number,
      required: true
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 30); // Listings expire after 30 days
      return date;
    }
  }
});

// Create index for search
ListingSchema.index({ title: 'text', description: 'text' });

// Update the updated timestamp before saving
ListingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Listing', ListingSchema);