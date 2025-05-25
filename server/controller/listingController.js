const Listing = require('../models/Listing');
const User = require('../models/Users');
const { uploadImage } = require('../utils/cloudinary');

// Create new listing
const createListing = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
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

    // CRITICAL FIX: Upload images FIRST before creating the listing
    let imageUrls = [];
    
    if (req.files && req.files.length > 0) {
      try {
        console.log(`Starting upload of ${req.files.length} images...`);
        
        // Create a temporary folder name for this upload session
        const tempFolderId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const uploadFolder = `dormdeals/listings/${tempFolderId}`;
        
        const uploadPromises = req.files.map(async (file, index) => {
          console.log(`Uploading image ${index + 1}/${req.files.length}...`);
          
          // Validate file before upload
          if (!file.buffer) {
            throw new Error(`File ${index + 1} has no buffer data`);
          }
          
          // Upload to Cloudinary with retry logic
          let uploadAttempts = 0;
          const maxAttempts = 3;
          
          while (uploadAttempts < maxAttempts) {
            try {
              const result = await uploadImage(file, uploadFolder);
              console.log(`Successfully uploaded image ${index + 1}: ${result.url}`);
              return result;
            } catch (uploadError) {
              uploadAttempts++;
              console.error(`Upload attempt ${uploadAttempts} failed for image ${index + 1}:`, uploadError.message);
              
              if (uploadAttempts >= maxAttempts) {
                throw new Error(`Failed to upload image ${index + 1} after ${maxAttempts} attempts: ${uploadError.message}`);
              }
              
              // Wait 1 second before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        });
        
        // Wait for ALL images to upload successfully
        const uploadedImages = await Promise.all(uploadPromises);
        imageUrls = uploadedImages.map(image => image.url);
        
        console.log(`All ${imageUrls.length} images uploaded successfully`);
        
      } catch (imageUploadError) {
        console.error('Image upload failed:', imageUploadError);
        
        // Return error immediately - don't create listing if images fail
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images. Listing not created.',
          error: imageUploadError.message
        });
      }
    }

    // Only create listing AFTER successful image upload (or if no images)
    const listingData = {
      ...req.body,
      owner: req.user.id,
      university: req.user.university,
      status: 'active',
      images: imageUrls // Add uploaded image URLs
    };
    
    console.log('Creating listing with image URLs:', imageUrls);
    
    // Create the listing in database
    const listing = await Listing.create(listingData);
    
    console.log(`Listing created successfully with ID: ${listing._id}`);
    
    // If we used a temporary folder, rename it to use the actual listing ID
    if (imageUrls.length > 0 && imageUrls[0].includes('temp_')) {
      try {
        // Note: This would require additional Cloudinary API calls to rename/move files
        // For now, the temp folder approach works fine
        console.log('Images stored in temporary folder - consider implementing folder rename');
      } catch (renameError) {
        console.warn('Could not rename image folder:', renameError.message);
        // Non-critical error - listing is still created successfully
      }
    }
    
    res.status(201).json({
      success: true,
      data: listing,
      message: `Listing created successfully${imageUrls.length > 0 ? ` with ${imageUrls.length} images` : ''}`
    });
    
  } catch (error) {
    console.error('Create listing error:', error);
    
    // If listing creation fails after images were uploaded, we should ideally clean up
    // the uploaded images, but that would require tracking them
    
    res.status(500).json({
      success: false,
      message: 'Server error creating listing',
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