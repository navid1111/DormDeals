const { uploadImage } = require('../utils/cloudinary');

/**
 * Upload images for a listing
 * @route POST /api/v1/listings/:id/images
 * @access Private
 */
const uploadListingImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    // Maximum 5 images per listing
    if (req.files.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 images allowed per listing'
      });
    }

    const listingId = req.params.id;
    const uploadPromises = [];
    
    // Upload each image to Cloudinary
    for (const file of req.files) {
      const uploadPromise = uploadImage(file, `dormdeals/listings/${listingId}`);
      uploadPromises.push(uploadPromise);
    }

    // Wait for all uploads to complete
    const uploadedImages = await Promise.all(uploadPromises);
    
    // Extract the URLs from the results
    const imageUrls = uploadedImages.map(image => image.url);

    // Find the listing and add the image URLs
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if the user is the owner of the listing
    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing'
      });
    }

    // Add new images to existing ones
    listing.images = [...listing.images, ...imageUrls];
    await listing.save();

    res.status(200).json({
      success: true,
      data: {
        images: listing.images
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading images',
      error: error.message
    });
  }
};

/**
 * Delete an image from a listing
 * @route DELETE /api/v1/listings/:id/images/:imageIndex
 * @access Private
 */
const deleteListingImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    
    // Find the listing
    const listing = await Listing.findById(id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Check if the user is the owner of the listing
    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing'
      });
    }
    
    // Check if the image index is valid
    const index = parseInt(imageIndex);
    if (index < 0 || index >= listing.images.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image index'
      });
    }
    
    // Remove the image URL from the array
    const imageUrl = listing.images[index];
    listing.images.splice(index, 1);
    await listing.save();
    
    // Extract public_id from Cloudinary URL to delete the image
    // Example: https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/dormdeals/listings/123/image.jpg
    const urlParts = imageUrl.split('/');
    const publicIdParts = urlParts.slice(urlParts.indexOf('upload') + 1);
    const publicId = publicIdParts.join('/').split('.')[0]; // Remove file extension
    
    // Delete from Cloudinary (don't wait for it to complete)
    deleteImage(publicId).catch(err => 
      console.error(`Failed to delete image from Cloudinary: ${err.message}`)
    );
    
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting image',
      error: error.message
    });
  }
};

module.exports = {
  uploadListingImages,
  deleteListingImage
};