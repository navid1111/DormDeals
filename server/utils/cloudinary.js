const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary
 * @param {Buffer|Object} file - The image file (Multer file or Buffer)
 * @param {string} folder - The folder in Cloudinary (default: 'dormdeals')
 * @returns {Promise<{public_id: string, url: string}>}
 */
const uploadImage = async (file, folder = 'dormdeals') => {
  try {
    if (!file || !file.buffer) {
      throw new Error('File buffer missing. Make sure Multer is using memoryStorage and files are sent as multipart/form-data.');
    }
    // Always use file.buffer (Multer memory storage)
    const fileStream = new Readable({
      read() {
        this.push(file.buffer);
        this.push(null); // Signal end of stream
      },
    });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) {
            reject(new Error('Image upload failed: ' + error.message));
          } else resolve(result);
        }
      );
      fileStream.pipe(uploadStream);
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    throw new Error('Failed to upload image: ' + error.message);
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} public_id - The public ID of the image
 * @returns {Promise<void>}
 */
const deleteImage = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    throw new Error('Failed to delete image');
  }
};

module.exports = {
  uploadImage,
  deleteImage
};