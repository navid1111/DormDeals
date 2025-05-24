const Meetup = require('../models/Meetup');
const Listing = require('../models/Listing');
const User = require('../models/Users');

// Propose a meetup
const proposeMeetup = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { location, customLocation, proposedTime } = req.body;

    // Validate listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Determine buyer and seller
    let buyer, seller;
    const listingOwner = listing.owner.toString();
    
    if (req.user.id === listingOwner) {
      // The listing owner is proposing a meetup to a potential buyer
      if (!req.body.buyerId) {
        return res.status(400).json({
          success: false,
          message: 'Buyer ID is required when seller proposes a meetup'
        });
      }
      buyer = req.body.buyerId;
      seller = req.user.id;
    } else {
      // A potential buyer is proposing a meetup
      buyer = req.user.id;
      seller = listingOwner;
    }

    // Check if a valid meetup location or custom location is provided
    if (!location && (!customLocation || !customLocation.name || !customLocation.coordinates)) {
      return res.status(400).json({
        success: false,
        message: 'Either a meetup location ID or custom location details are required'
      });
    }

    // Create the meetup
    const meetup = await Meetup.create({
      listing: listingId,
      buyer,
      seller,
      location: location || null,
      customLocation: location ? null : {
        name: customLocation.name,
        coordinates: {
          type: 'Point',
          coordinates: [
            parseFloat(customLocation.coordinates[0]), 
            parseFloat(customLocation.coordinates[1])
          ]
        },
        description: customLocation.description || ''
      },
      proposedTime,
      proposedBy: req.user.id,
      notes: req.body.notes || ''
    });

    await meetup.populate([
      { path: 'buyer', select: 'firstName lastName profilePicture' },
      { path: 'seller', select: 'firstName lastName profilePicture' },
      { path: 'location', select: 'name description coordinates' },
      { path: 'listing', select: 'title images' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Meetup proposed successfully',
      data: meetup
    });
  } catch (error) {
    console.error('Propose meetup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error proposing meetup',
      error: error.message
    });
  }
};

// Respond to a meetup proposal (accept/reject)
const respondToMeetup = async (req, res) => {
  try {
    const { meetupId } = req.params;
    const { response } = req.body;

    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Response must be either "accepted" or "rejected"'
      });
    }

    // Find the meetup
    const meetup = await Meetup.findById(meetupId);
    if (!meetup) {
      return res.status(404).json({
        success: false,
        message: 'Meetup not found'
      });
    }

    // Check if user is authorized to respond
    if (meetup.proposedBy.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot respond to your own meetup proposal'
      });
    }

    // Check if user is involved in the meetup
    if (
      meetup.buyer.toString() !== req.user.id &&
      meetup.seller.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this meetup'
      });
    }

    // Update meetup status
    meetup.status = response;
    meetup.updatedAt = Date.now();
    await meetup.save();

    await meetup.populate([
      { path: 'buyer', select: 'firstName lastName profilePicture' },
      { path: 'seller', select: 'firstName lastName profilePicture' },
      { path: 'location', select: 'name description coordinates' },
      { path: 'listing', select: 'title images' }
    ]);

    res.status(200).json({
      success: true,
      message: `Meetup ${response}`,
      data: meetup
    });
  } catch (error) {
    console.error('Respond to meetup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error responding to meetup',
      error: error.message
    });
  }
};

// Get user's meetups
const getUserMeetups = async (req, res) => {
  try {
    const { status } = req.query;

    // Build query
    const query = {
      $or: [{ buyer: req.user.id }, { seller: req.user.id }]
    };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Get meetups
    const meetups = await Meetup.find(query)
      .populate('listing', 'title images price')
      .populate('buyer', 'firstName lastName profilePicture')
      .populate('seller', 'firstName lastName profilePicture')
      .populate('location', 'name coordinates')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: meetups.length,
      data: meetups
    });
  } catch (error) {
    console.error('Get user meetups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user meetups'
    });
  }
};

// Get details of a specific meetup
const getMeetup = async (req, res) => {
  try {
    const meetup = await Meetup.findById(req.params.id)
      .populate('listing', 'title description images price category')
      .populate('buyer', 'firstName lastName profilePicture')
      .populate('seller', 'firstName lastName profilePicture')
      .populate('location', 'name description coordinates photos');

    if (!meetup) {
      return res.status(404).json({
        success: false,
        message: 'Meetup not found'
      });
    }

    // Ensure user is part of the meetup
    if (
      meetup.buyer._id.toString() !== req.user.id &&
      meetup.seller._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this meetup'
      });
    }

    res.status(200).json({
      success: true,
      data: meetup
    });
  } catch (error) {
    console.error('Get meetup details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting meetup details'
    });
  }
};

// Confirm safety of meetup location
const confirmSafety = async (req, res) => {
  try {
    const { meetupId } = req.params;

    const meetup = await Meetup.findById(meetupId);
    if (!meetup) {
      return res.status(404).json({
        success: false,
        message: 'Meetup not found'
      });
    }

    // Check if user is buyer or seller
    if (meetup.buyer.toString() === req.user.id) {
      meetup.safetyConfirmation.buyer = true;
    } else if (meetup.seller.toString() === req.user.id) {
      meetup.safetyConfirmation.seller = true;
    } else {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to confirm safety for this meetup'
      });
    }

    await meetup.save();

    res.status(200).json({
      success: true,
      message: 'Safety confirmation updated',
      data: meetup.safetyConfirmation
    });
  } catch (error) {
    console.error('Confirm safety error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error confirming safety'
    });
  }
};

module.exports = {
  proposeMeetup,
  respondToMeetup,
  getUserMeetups,
  getMeetup,
  confirmSafety
};