const User = require('../models/Users');
const Listing = require('../models/Listing');
const Report = require('../models/Report');
const Review = require('../models/Review');

// Approve or reject a listing
const moderateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, message } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"'
      });
    }
    
    const listing = await Listing.findById(id);
    
    if (!listing) {
      return res.status(404).json({
        success: false, 
        message: 'Listing not found'
      });
    }
    
    // Check if user is authorized to moderate this listing
    // University admins can only moderate listings from their university
    if (req.user.role === 'university-admin' && 
        listing.university.toString() !== req.user.adminUniversity.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to moderate listings from your university'
      });
    }
    
    // Update listing status
    listing.status = action === 'approve' ? 'active' : 'rejected';
    
    // Add moderation data
    listing.moderationData = {
      moderatedBy: req.user.id,
      moderatedAt: Date.now(),
      message: message || ''
    };
    
    await listing.save();
    
    res.status(200).json({
      success: true,
      message: `Listing ${action}d successfully`,
      data: listing
    });
  } catch (error) {
    console.error('Moderation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during moderation'
    });
  }
};

// Handle user reports
const handleReport = async (req, res) => {
  try {
    // Create new report
    const report = await Report.create({
      reporter: req.user.id,
      ...req.body
    });
    
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting report'
    });
  }
};

// Review a report
const reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, details } = req.body;
    
    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Check if the report is for a listing from the admin's university
    if (report.listing) {
      const listing = await Listing.findById(report.listing);
      if (req.user.role === 'university-admin' && 
          listing && listing.university.toString() !== req.user.adminUniversity.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only review reports from your university'
        });
      }
    }
    
    report.status = status;
    report.reviewedBy = req.user.id;
    report.resolvedAt = Date.now();
    if (details) report.adminNotes = details;
    
    await report.save();
    
    res.status(200).json({
      success: true,
      message: 'Report reviewed successfully',
      data: report
    });
  } catch (error) {
    console.error('Review report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reviewing report'
    });
  }
};

// Add a transaction review
const addReview = async (req, res) => {
  try {
    const { rating, comment, reviewedUser, listing } = req.body;
    
    // Check if the reviewer participated in the transaction
    const targetListing = await Listing.findById(listing);
    if (!targetListing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Check if user is the buyer or seller
    const isSeller = targetListing.owner.toString() === req.user.id;
    const isBuyer = targetListing.owner.toString() === reviewedUser;
    
    if (!isSeller && !isBuyer) {
      return res.status(403).json({
        success: false,
        message: 'You can only review transactions you participated in'
      });
    }
    
    // Create the review
    const review = await Review.create({
      reviewer: req.user.id,
      reviewedUser,
      listing,
      rating,
      comment
    });
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Add review error:', error);
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this transaction'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while submitting review'
    });
  }
};

// Get user reviews
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reviews = await Review.find({ reviewedUser: userId })
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('listing', 'title');
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating,
      data: reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
};

module.exports = {
  moderateListing,
  handleReport,
  reviewReport,
  addReview,
  getUserReviews
};