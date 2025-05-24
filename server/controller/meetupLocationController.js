const MeetupLocation = require('../models/MeetupLocation');
const University = require('../models/University');

// Add a new meetup location
const createMeetupLocation = async (req, res) => {
  try {
    // Only admins can create official locations
    if (req.body.isOfficial && req.user.role !== 'admin' && req.user.role !== 'university-admin') {
      req.body.isOfficial = false;
    }

    // Set coordinates properly for GeoJSON
    if (req.body.latitude && req.body.longitude) {
      req.body.coordinates = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
      };
    }

    // Add the user as creator
    req.body.createdBy = req.user.id;

    // Create the location
    const meetupLocation = await MeetupLocation.create(req.body);

    res.status(201).json({
      success: true,
      data: meetupLocation
    });
  } catch (error) {
    console.error('Create meetup location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating meetup location',
      error: error.message
    });
  }
};

// Get all meetup locations for a university
const getUniversityLocations = async (req, res) => {
  try {
    const { universityId } = req.params;

    // Check if the university exists
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    // Get locations
    const locations = await MeetupLocation.find({ university: universityId });

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('Get university locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting university locations'
    });
  }
};

// Get nearby meetup locations
const getNearbyLocations = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 1000 } = req.query; // maxDistance in meters

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude'
      });
    }

    // Find locations within the specified radius
    const locations = await MeetupLocation.find({
      coordinates: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(20);

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('Get nearby locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting nearby locations'
    });
  }
};

// Get single meetup location
const getMeetupLocation = async (req, res) => {
  try {
    const location = await MeetupLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Meetup location not found'
      });
    }

    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Get meetup location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting meetup location'
    });
  }
};

module.exports = {
  createMeetupLocation,
  getUniversityLocations,
  getNearbyLocations,
  getMeetupLocation
};