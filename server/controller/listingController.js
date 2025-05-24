const Listing = require('../models/Listing');
const User = require('../models/Users');

// Create new listing
const createListing = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not found or not authenticated'
      });
    }
    
    // Check if req.body exists and has required fields

    
    // Validate required fields before attempting to create
    const requiredFields = ['title', 'description', 'category', 'listingType', 'pricingType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Check price if not free
    if (req.body.pricingType !== 'free' && !req.body.price) {
      return res.status(400).json({
        success: false,
        message: 'Price is required for non-free listings'
      });
    }
    
    // Check condition if item
    if (req.body.listingType === 'item' && !req.body.condition) {
      return res.status(400).json({
        success: false,
        message: 'Condition is required for item listings'
      });
    }
    
    // Add user and university to request body
    req.body.owner = req.user.id;
    req.body.university = req.user.university;
    
    // Set default status
    req.body.status = 'pending';
    
    // Create listing
    const listing = await Listing.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during listing creation',
      error: error.message
    });
  }
};

// Get all listings with filters
const getListings = async (req, res) => {
  try {
    let query = {};
    
    // Build filter object based on query parameters
    
    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Listing type filter (item or service)
    if (req.query.listingType) {
      query.listingType = req.query.listingType;
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }
    
    // Condition filter for items
    if (req.query.condition) {
      query.condition = req.query.condition;
    }
    
    // University filter - if "my university" is requested, filter by user's university
    if (req.query.university === 'my') {
      query.university = req.user.university;
    } else if (req.query.university) {
      query.university = req.query.university;
    }
    
    // Visibility filter - ensure users only see listings they're allowed to see
    if (req.query.visibilityMode !== 'all' && req.user) {
      // If visibility is set to 'university', show only listings from user's university
      if (req.query.visibilityMode === 'university') {
        query.university = req.user.university;
      }
    }
    
    // Status filter - default to active listings only
    query.status = req.query.status || 'active';
    
    // Search by keyword in title or description
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    
    // Execute query
    const listings = await Listing.find(query)
      .populate('owner', 'firstName lastName profileImage verificationStatus')
      .populate('university', 'name shortName')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Listing.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: listings.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: listings
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listings'
    });
  }
};

// Get single listing by ID
const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'firstName lastName profileImage verificationStatus')
      .populate('university', 'name shortName');
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Get single listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listing'
    });
  }
};

// Update listing
const updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Make sure user owns the listing
    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }
    
    // Prevent certain fields from being updated
    delete req.body.owner;
    delete req.body.university;
    delete req.body.status;
    
    // Update listing
    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating listing'
    });
  }
};

// Delete listing
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Make sure user owns the listing
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }
    
    // Soft delete - change status to deleted
    listing.status = 'deleted';
    await listing.save();
    
    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting listing'
    });
  }
};

// Submit bid on listing
const submitBid = async (req, res) => {
  try {
    const { amount, message } = req.body;
    
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Check if listing supports bidding
    if (listing.pricingType !== 'bidding') {
      return res.status(400).json({
        success: false,
        message: 'This listing does not support bidding'
      });
    }
    
    // Check if user is bidding on their own listing
    if (listing.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bid on your own listing'
      });
    }
    
    // Create new bid
    const bid = {
      user: req.user.id,
      amount,
      message
    };
    
    // Add bid to listing
    listing.bids.push(bid);
    await listing.save();
    
    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      data: bid
    });
  } catch (error) {
    console.error('Submit bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting bid'
    });
  }
};

module.exports = {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  submitBid
};