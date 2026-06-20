const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'willson-kenedy') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto' }]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Upload single image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Delete image from Cloudinary
exports.deleteImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'imageUrl is required in request body' });
    }

    // Extract public_id from Cloudinary URL
    // URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/willson-kenedy/filename.jpg
    const urlParts = imageUrl.split('/upload/');
    if (urlParts.length !== 2) {
      return res.status(400).json({ message: 'Invalid Cloudinary URL format' });
    }

    // Remove version number if present (v1234567890/)
    let publicId = urlParts[1];
    if (publicId.startsWith('v')) {
      publicId = publicId.substring(publicId.indexOf('/') + 1);
    }

    // Remove file extension
    publicId = publicId.split('.')[0];

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found or already deleted' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};